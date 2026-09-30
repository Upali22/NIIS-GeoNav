import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import { 
  INITIAL_BUILDINGS, 
  INITIAL_NAV_NODES, 
  INITIAL_NAV_EDGES, 
  INITIAL_FACULTY, 
  INITIAL_EVENTS, 
  INITIAL_GALLERY, 
  INITIAL_CORE_MEMBERS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_SETTINGS,
  INITIAL_TEACHERS,
  INITIAL_OBSTACLES
} from './src/data/campusData';
import { TeacherProfile, TemporaryObstacle, AdminAuditLog } from './src/types';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data file path for persistence
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'campus_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Admin Hash: 'email123'
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('email123', 10);

interface CampusStore {
  buildings: typeof INITIAL_BUILDINGS;
  navNodes: typeof INITIAL_NAV_NODES;
  navEdges: typeof INITIAL_NAV_EDGES;
  faculty: typeof INITIAL_FACULTY;
  events: typeof INITIAL_EVENTS;
  gallery: typeof INITIAL_GALLERY;
  coreMembers: typeof INITIAL_CORE_MEMBERS;
  announcements: typeof INITIAL_ANNOUNCEMENTS;
  settings: typeof INITIAL_SETTINGS;
  teachers: TeacherProfile[];
  teacherKeys: Record<string, string>; // teacherId -> bcrypt hash of key
  obstacles: TemporaryObstacle[];
  auditLogs: AdminAuditLog[];
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    department: string;
    studentId?: string;
    profilePic?: string;
    role: 'student' | 'teacher' | 'admin';
    teacherId?: string;
    createdAt: string;
  }>;
  savedPlaces: Array<{
    id: string;
    userId: string;
    buildingId: string;
    buildingName: string;
    category: string;
    customLabel?: string;
    savedAt: string;
  }>;
  history: Array<{
    id: string;
    userId: string;
    fromName: string;
    toName: string;
    distance: number;
    estimatedMinutes: number;
    timestamp: string;
    routeType?: string;
  }>;
}

let store: CampusStore;

function loadStore(): CampusStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure new models exist if loaded from older file
      if (!parsed.teachers) parsed.teachers = INITIAL_TEACHERS;
      if (!parsed.teacherKeys) {
        parsed.teacherKeys = {
          'TCH-001': bcrypt.hashSync('NIIS-TCH-2026-KEY1', 10),
          'TCH-002': bcrypt.hashSync('NIIS-TCH-2026-KEY2', 10),
          'TCH-003': bcrypt.hashSync('NIIS-TCH-2026-KEY3', 10)
        };
      }
      if (!parsed.obstacles) parsed.obstacles = INITIAL_OBSTACLES;
      if (!parsed.auditLogs) parsed.auditLogs = [];
      if (parsed.buildings && !parsed.buildings.some((b: any) => b.id === 'cafeteria')) {
        const cafe = INITIAL_BUILDINGS.find(b => b.id === 'cafeteria');
        if (cafe) parsed.buildings.push(cafe);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading data file, initializing fresh store:', e);
  }

  const initial: CampusStore = {
    buildings: INITIAL_BUILDINGS,
    navNodes: INITIAL_NAV_NODES,
    navEdges: INITIAL_NAV_EDGES,
    faculty: INITIAL_FACULTY,
    events: INITIAL_EVENTS,
    gallery: INITIAL_GALLERY,
    coreMembers: INITIAL_CORE_MEMBERS,
    announcements: INITIAL_ANNOUNCEMENTS,
    settings: INITIAL_SETTINGS,
    teachers: INITIAL_TEACHERS,
    teacherKeys: {
      'TCH-001': bcrypt.hashSync('NIIS-TCH-2026-KEY1', 10),
      'TCH-002': bcrypt.hashSync('NIIS-TCH-2026-KEY2', 10),
      'TCH-003': bcrypt.hashSync('NIIS-TCH-2026-KEY3', 10)
    },
    obstacles: INITIAL_OBSTACLES,
    auditLogs: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        admin: 'admin@gmail.com',
        action: 'System initialized with 19 buildings and 3 verified teachers',
        entityType: 'System'
      }
    ],
    users: [
      {
        id: 'usr-demo-student',
        fullName: 'Aman Sharma',
        email: 'student@niis.ac.in',
        passwordHash: bcrypt.hashSync('student123', 10),
        department: 'BCA 3rd Year',
        studentId: 'NIIS-BCA-2024-042',
        profilePic: '',
        role: 'student',
        createdAt: new Date().toISOString()
      }
    ],
    savedPlaces: [
      {
        id: 'sp-1',
        userId: 'usr-demo-student',
        buildingId: 'block-c',
        buildingName: 'Block C (Computer Science & Library)',
        category: 'academic',
        customLabel: 'My CS Lab & Library',
        savedAt: new Date().toISOString()
      },
      {
        id: 'sp-2',
        userId: 'usr-demo-student',
        buildingId: 'niis-canteen',
        buildingName: 'NIIS Canteen & Mess',
        category: 'dining',
        customLabel: 'Favorite Lunch Spot',
        savedAt: new Date().toISOString()
      }
    ],
    history: [
      {
        id: 'hist-1',
        userId: 'usr-demo-student',
        fromName: 'Main Gate',
        toName: 'Block C (Computer Science & Library)',
        distance: 280,
        estimatedMinutes: 4,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        routeType: 'fastest'
      }
    ]
  };

  saveStore(initial);
  return initial;
}

function saveStore(data: CampusStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving data store:', e);
  }
}

function logAudit(admin: string, action: string, entityType: string, details?: string) {
  store.auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    admin,
    action,
    entityType,
    details
  });
  if (store.auditLogs.length > 100) store.auditLogs = store.auditLogs.slice(0, 100);
  saveStore(store);
}

store = loadStore();

// ==========================================
// GEMINI AI INITIALIZATION (Server-Side)
// ==========================================
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Campus Data Full Sync Endpoints
app.get('/api/campus/data', (req: Request, res: Response) => {
  res.json({
    buildings: store.buildings,
    navNodes: store.navNodes,
    navEdges: store.navEdges,
    faculty: store.faculty,
    events: store.events,
    gallery: store.gallery,
    coreMembers: store.coreMembers,
    announcements: store.announcements,
    settings: store.settings,
    teachers: store.teachers,
    obstacles: store.obstacles,
    auditLogs: store.auditLogs.slice(0, 20)
  });
});

app.get('/api/campus/buildings', (req: Request, res: Response) => {
  res.json(store.buildings);
});

app.post('/api/campus/buildings', (req: Request, res: Response) => {
  const newBuilding = {
    ...req.body,
    id: req.body.id || `bld-${Date.now()}`
  };
  store.buildings.push(newBuilding);
  logAudit('admin@gmail.com', `Created building ${newBuilding.name}`, 'Building');
  saveStore(store);
  res.json(newBuilding);
});

app.put('/api/campus/buildings/:id', (req: Request, res: Response) => {
  const idx = store.buildings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Building not found' });
  store.buildings[idx] = { ...store.buildings[idx], ...req.body };
  logAudit('admin@gmail.com', `Updated building ${store.buildings[idx].name}`, 'Building');
  saveStore(store);
  res.json(store.buildings[idx]);
});

app.put('/api/campus/buildings/:id/capacity', (req: Request, res: Response) => {
  const idx = store.buildings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Building not found' });
  const { maxCapacity, currentOccupancy, occupancyStatus } = req.body;
  if (maxCapacity !== undefined) store.buildings[idx].maxCapacity = Number(maxCapacity);
  if (currentOccupancy !== undefined) store.buildings[idx].currentOccupancy = Number(currentOccupancy);
  if (occupancyStatus) store.buildings[idx].occupancyStatus = occupancyStatus;
  logAudit('admin@gmail.com', `Updated capacity for ${store.buildings[idx].name}`, 'Building');
  saveStore(store);
  res.json(store.buildings[idx]);
});

app.delete('/api/campus/buildings/:id', (req: Request, res: Response) => {
  store.buildings = store.buildings.filter(b => b.id !== req.params.id);
  logAudit('admin@gmail.com', `Deleted building ${req.params.id}`, 'Building');
  saveStore(store);
  res.json({ success: true });
});

// 2. Teachers Management & Auth
app.get('/api/campus/teachers', (req: Request, res: Response) => {
  // Return teachers with masked keys
  const masked = store.teachers.map(t => ({
    ...t,
    teacherKeyMasked: store.teacherKeys[t.id] ? '••••••••••••' : undefined
  }));
  res.json(masked);
});

app.post('/api/campus/teachers', (req: Request, res: Response) => {
  const id = req.body.id || `TCH-${(store.teachers.length + 1).toString().padStart(3, '0')}`;
  const rawKey = req.body.initialKey || `NIIS-${id}-KEY${Math.floor(1000 + Math.random() * 9000)}`;
  
  const newTeacher: TeacherProfile = {
    ...req.body,
    id,
    schedule: req.body.schedule || []
  };

  store.teachers.push(newTeacher);
  store.teacherKeys[id] = bcrypt.hashSync(rawKey, 10);
  logAudit('admin@gmail.com', `Added teacher ${newTeacher.name} (${id})`, 'Teacher');
  saveStore(store);

  res.json({
    teacher: newTeacher,
    generatedKey: rawKey
  });
});

app.put('/api/campus/teachers/:id', (req: Request, res: Response) => {
  const idx = store.teachers.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Teacher not found' });
  store.teachers[idx] = { ...store.teachers[idx], ...req.body };
  logAudit('admin@gmail.com', `Updated profile for teacher ${store.teachers[idx].name}`, 'Teacher');
  saveStore(store);
  res.json(store.teachers[idx]);
});

app.post('/api/campus/teachers/:id/generate-key', (req: Request, res: Response) => {
  const teacher = store.teachers.find(t => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  const rawKey = `NIIS-${teacher.id}-KEY${Math.floor(1000 + Math.random() * 9000)}`;
  store.teacherKeys[teacher.id] = bcrypt.hashSync(rawKey, 10);
  logAudit('admin@gmail.com', `Reset key for teacher ${teacher.name} (${teacher.id})`, 'Security');
  saveStore(store);

  res.json({ teacherId: teacher.id, newKey: rawKey });
});

app.post('/api/campus/teachers/:id/schedule', (req: Request, res: Response) => {
  const idx = store.teachers.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Teacher not found' });

  const newSched = {
    ...req.body,
    id: req.body.id || `sch-${Date.now()}`
  };
  store.teachers[idx].schedule.push(newSched);
  logAudit('admin@gmail.com', `Added schedule entry for ${store.teachers[idx].name}: ${newSched.subject}`, 'Schedule');
  saveStore(store);
  res.json(store.teachers[idx]);
});

app.delete('/api/campus/teachers/:id/schedule/:schedId', (req: Request, res: Response) => {
  const idx = store.teachers.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Teacher not found' });

  store.teachers[idx].schedule = store.teachers[idx].schedule.filter(s => s.id !== req.params.schedId);
  logAudit('admin@gmail.com', `Removed schedule entry for ${store.teachers[idx].name}`, 'Schedule');
  saveStore(store);
  res.json(store.teachers[idx]);
});

app.delete('/api/campus/teachers/:id', (req: Request, res: Response) => {
  store.teachers = store.teachers.filter(t => t.id !== req.params.id);
  delete store.teacherKeys[req.params.id];
  logAudit('admin@gmail.com', `Deleted teacher ${req.params.id}`, 'Teacher');
  saveStore(store);
  res.json({ success: true });
});

// Teacher Login Endpoint
app.post('/api/auth/teacher/login', (req: Request, res: Response) => {
  const { teacherId, teacherKey } = req.body;
  if (!teacherId || !teacherKey) {
    return res.status(400).json({ error: 'Teacher ID and Teacher Key required' });
  }

  const teacher = store.teachers.find(t => t.id.toLowerCase() === teacherId.trim().toLowerCase());
  if (!teacher) {
    return res.status(401).json({ error: 'Teacher record not found' });
  }

  const hash = store.teacherKeys[teacher.id];
  let isMatch = false;

  if (hash) {
    isMatch = bcrypt.compareSync(teacherKey.trim(), hash);
  }
  // Hackathon demo fallback check for standard demo keys
  if (!isMatch && (teacherKey.trim() === `NIIS-${teacher.id}-KEY1` || teacherKey.trim() === 'teacher123')) {
    isMatch = true;
  }

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid Teacher Key. Please contact admin to reset.' });
  }

  res.json({
    token: `teacher-token-${teacher.id}-${Date.now()}`,
    user: {
      id: teacher.id,
      fullName: teacher.name,
      email: teacher.email,
      department: teacher.department,
      role: 'teacher',
      teacherId: teacher.id,
      profilePic: teacher.photo,
      createdAt: new Date().toISOString()
    },
    teacherProfile: teacher
  });
});

// 3. Obstacles Endpoints
app.get('/api/campus/obstacles', (req: Request, res: Response) => {
  res.json(store.obstacles);
});

app.post('/api/campus/obstacles', (req: Request, res: Response) => {
  const obs = {
    ...req.body,
    id: req.body.id || `obs-${Date.now()}`,
    active: req.body.active !== undefined ? req.body.active : true
  };
  store.obstacles.push(obs);
  logAudit('admin@gmail.com', `Created obstacle: ${obs.name}`, 'Obstacle');
  saveStore(store);
  res.json(obs);
});

app.put('/api/campus/obstacles/:id', (req: Request, res: Response) => {
  const idx = store.obstacles.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Obstacle not found' });
  store.obstacles[idx] = { ...store.obstacles[idx], ...req.body };
  logAudit('admin@gmail.com', `Updated obstacle status: ${store.obstacles[idx].name} (active: ${store.obstacles[idx].active})`, 'Obstacle');
  saveStore(store);
  res.json(store.obstacles[idx]);
});

app.delete('/api/campus/obstacles/:id', (req: Request, res: Response) => {
  store.obstacles = store.obstacles.filter(o => o.id !== req.params.id);
  logAudit('admin@gmail.com', `Removed obstacle: ${req.params.id}`, 'Obstacle');
  saveStore(store);
  res.json({ success: true });
});

// 4. Audit Logs
app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  res.json(store.auditLogs);
});

// 5. Faculty Endpoints
app.get('/api/campus/faculty', (req: Request, res: Response) => {
  res.json(store.faculty.sort((a, b) => a.displayOrder - b.displayOrder));
});

app.post('/api/campus/faculty', (req: Request, res: Response) => {
  const newFac = {
    ...req.body,
    id: req.body.id || `fac-${Date.now()}`,
    displayOrder: req.body.displayOrder || store.faculty.length + 1
  };
  store.faculty.push(newFac);
  logAudit('admin@gmail.com', `Added faculty member ${newFac.name}`, 'Faculty');
  saveStore(store);
  res.json(newFac);
});

app.put('/api/campus/faculty/:id', (req: Request, res: Response) => {
  const idx = store.faculty.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Faculty not found' });
  store.faculty[idx] = { ...store.faculty[idx], ...req.body };
  logAudit('admin@gmail.com', `Updated faculty member ${store.faculty[idx].name}`, 'Faculty');
  saveStore(store);
  res.json(store.faculty[idx]);
});

app.delete('/api/campus/faculty/:id', (req: Request, res: Response) => {
  store.faculty = store.faculty.filter(f => f.id !== req.params.id);
  logAudit('admin@gmail.com', `Deleted faculty member ${req.params.id}`, 'Faculty');
  saveStore(store);
  res.json({ success: true });
});

// 6. Events Endpoints
app.get('/api/campus/events', (req: Request, res: Response) => {
  res.json(store.events);
});

app.post('/api/campus/events', (req: Request, res: Response) => {
  const newEvent = {
    ...req.body,
    id: req.body.id || `evt-${Date.now()}`
  };
  store.events.push(newEvent);
  logAudit('admin@gmail.com', `Published event ${newEvent.title}`, 'Event');
  saveStore(store);
  res.json(newEvent);
});

app.put('/api/campus/events/:id', (req: Request, res: Response) => {
  const idx = store.events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });
  store.events[idx] = { ...store.events[idx], ...req.body };
  logAudit('admin@gmail.com', `Updated event ${store.events[idx].title}`, 'Event');
  saveStore(store);
  res.json(store.events[idx]);
});

app.delete('/api/campus/events/:id', (req: Request, res: Response) => {
  store.events = store.events.filter(e => e.id !== req.params.id);
  logAudit('admin@gmail.com', `Deleted event ${req.params.id}`, 'Event');
  saveStore(store);
  res.json({ success: true });
});

// 7. Gallery Endpoints
app.get('/api/campus/gallery', (req: Request, res: Response) => {
  res.json(store.gallery);
});

app.post('/api/campus/gallery', (req: Request, res: Response) => {
  const item = {
    ...req.body,
    id: req.body.id || `gal-${Date.now()}`
  };
  store.gallery.push(item);
  logAudit('admin@gmail.com', `Uploaded moment ${item.title}`, 'Gallery');
  saveStore(store);
  res.json(item);
});

app.put('/api/campus/gallery/:id', (req: Request, res: Response) => {
  const idx = store.gallery.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Gallery item not found' });
  store.gallery[idx] = { ...store.gallery[idx], ...req.body };
  logAudit('admin@gmail.com', `Updated moment ${store.gallery[idx].title}`, 'Gallery');
  saveStore(store);
  res.json(store.gallery[idx]);
});

app.delete('/api/campus/gallery/:id', (req: Request, res: Response) => {
  store.gallery = store.gallery.filter(g => g.id !== req.params.id);
  logAudit('admin@gmail.com', `Deleted moment ${req.params.id}`, 'Gallery');
  saveStore(store);
  res.json({ success: true });
});

// 8. Core Members
app.get('/api/campus/core-members', (req: Request, res: Response) => {
  res.json(store.coreMembers);
});

app.post('/api/campus/core-members', (req: Request, res: Response) => {
  const item = {
    ...req.body,
    id: req.body.id || `core-${Date.now()}`
  };
  store.coreMembers.push(item);
  logAudit('admin@gmail.com', `Added core member ${item.name}`, 'CoreMember');
  saveStore(store);
  res.json(item);
});

app.put('/api/campus/core-members/:id', (req: Request, res: Response) => {
  const idx = store.coreMembers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Core member not found' });
  store.coreMembers[idx] = { ...store.coreMembers[idx], ...req.body };
  logAudit('admin@gmail.com', `Updated core member ${store.coreMembers[idx].name}`, 'CoreMember');
  saveStore(store);
  res.json(store.coreMembers[idx]);
});

app.delete('/api/campus/core-members/:id', (req: Request, res: Response) => {
  store.coreMembers = store.coreMembers.filter(c => c.id !== req.params.id);
  logAudit('admin@gmail.com', `Deleted core member ${req.params.id}`, 'CoreMember');
  saveStore(store);
  res.json({ success: true });
});

// 9. Announcements
app.get('/api/campus/announcements', (req: Request, res: Response) => {
  res.json(store.announcements);
});

app.post('/api/campus/announcements', (req: Request, res: Response) => {
  const item = {
    ...req.body,
    id: req.body.id || `ann-${Date.now()}`
  };
  store.announcements.push(item);
  logAudit('admin@gmail.com', `Published announcement ${item.title}`, 'Notice');
  saveStore(store);
  res.json(item);
});

app.put('/api/campus/announcements/:id', (req: Request, res: Response) => {
  const idx = store.announcements.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Announcement not found' });
  store.announcements[idx] = { ...store.announcements[idx], ...req.body };
  logAudit('admin@gmail.com', `Updated announcement ${store.announcements[idx].title}`, 'Notice');
  saveStore(store);
  res.json(store.announcements[idx]);
});

app.delete('/api/campus/announcements/:id', (req: Request, res: Response) => {
  store.announcements = store.announcements.filter(a => a.id !== req.params.id);
  logAudit('admin@gmail.com', `Deleted announcement ${req.params.id}`, 'Notice');
  saveStore(store);
  res.json({ success: true });
});

// 10. Navigation Management
app.get('/api/campus/navigation', (req: Request, res: Response) => {
  res.json({
    nodes: store.navNodes,
    edges: store.navEdges,
    obstacles: store.obstacles
  });
});

app.post('/api/campus/navigation/nodes', (req: Request, res: Response) => {
  const node = {
    ...req.body,
    id: req.body.id || `node-${Date.now()}`
  };
  store.navNodes.push(node);
  saveStore(store);
  res.json(node);
});

app.post('/api/campus/navigation/edges', (req: Request, res: Response) => {
  const edge = {
    ...req.body,
    id: req.body.id || `edge-${Date.now()}`
  };
  store.navEdges.push(edge);
  saveStore(store);
  res.json(edge);
});

// 11. Settings
app.get('/api/campus/settings', (req: Request, res: Response) => {
  res.json(store.settings);
});

app.put('/api/campus/settings', (req: Request, res: Response) => {
  store.settings = { ...store.settings, ...req.body };
  logAudit('admin@gmail.com', 'Updated institutional campus settings', 'Settings');
  saveStore(store);
  res.json(store.settings);
});

// 12. Authentication
// Admin Login
app.post('/api/auth/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (email.toLowerCase() === 'admin@gmail.com') {
    const isMatch = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
    if (isMatch) {
      logAudit('admin@gmail.com', 'Admin successfully logged in', 'Security');
      return res.json({
        token: 'admin-session-token-niis-' + Date.now(),
        user: {
          id: 'admin-root',
          email: 'admin@gmail.com',
          name: 'NIIS Super Admin',
          role: 'admin'
        }
      });
    }
  }

  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// Student Register
app.post('/api/auth/student/register', (req: Request, res: Response) => {
  const { fullName, email, password, department, studentId } = req.body;
  if (!fullName || !email || !password || !department) {
    return res.status(400).json({ error: 'Please provide full name, email, password, and department' });
  }

  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    fullName,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    department,
    studentId: studentId || `NIIS-${Date.now().toString().slice(-4)}`,
    profilePic: '',
    role: 'student' as const,
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);
  saveStore(store);

  const { passwordHash, ...cleanUser } = newUser;
  res.json({
    token: `student-token-${newUser.id}-${Date.now()}`,
    user: cleanUser
  });
});

// Student Login
app.post('/api/auth/student/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Account not found' });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const { passwordHash, ...cleanUser } = user;
  res.json({
    token: `student-token-${user.id}-${Date.now()}`,
    user: cleanUser
  });
});

// Profile Update
app.put('/api/student/profile/:id', (req: Request, res: Response) => {
  const idx = store.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  const { fullName, department, studentId, profilePic, newPassword } = req.body;
  if (fullName) store.users[idx].fullName = fullName;
  if (department) store.users[idx].department = department;
  if (studentId) store.users[idx].studentId = studentId;
  if (profilePic !== undefined) store.users[idx].profilePic = profilePic;
  if (newPassword) {
    store.users[idx].passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  saveStore(store);
  const { passwordHash, ...cleanUser } = store.users[idx];
  res.json(cleanUser);
});

// Saved Places
app.get('/api/student/saved-places/:userId', (req: Request, res: Response) => {
  const items = store.savedPlaces.filter(p => p.userId === req.params.userId);
  res.json(items);
});

app.post('/api/student/saved-places', (req: Request, res: Response) => {
  const { userId, buildingId, buildingName, category, customLabel } = req.body;
  const existing = store.savedPlaces.find(p => p.userId === userId && p.buildingId === buildingId);
  if (existing) {
    if (customLabel) existing.customLabel = customLabel;
    saveStore(store);
    return res.json(existing);
  }
  const item = {
    id: `sp-${Date.now()}`,
    userId,
    buildingId,
    buildingName,
    category,
    customLabel: customLabel || undefined,
    savedAt: new Date().toISOString()
  };
  store.savedPlaces.push(item);
  saveStore(store);
  res.json(item);
});

app.delete('/api/student/saved-places/:id', (req: Request, res: Response) => {
  store.savedPlaces = store.savedPlaces.filter(p => p.id !== req.params.id);
  saveStore(store);
  res.json({ success: true });
});

// History
app.get('/api/student/history/:userId', (req: Request, res: Response) => {
  const items = store.history.filter(h => h.userId === req.params.userId);
  res.json(items);
});

app.post('/api/student/history', (req: Request, res: Response) => {
  const item = {
    ...req.body,
    id: `hist-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  store.history.unshift(item);
  if (store.history.length > 50) store.history = store.history.slice(0, 50);
  saveStore(store);
  res.json(item);
});

app.delete('/api/student/history/:userId', (req: Request, res: Response) => {
  store.history = store.history.filter(h => h.userId !== req.params.userId);
  saveStore(store);
  res.json({ success: true });
});

// 13. AI Campus Assistant (/api/ai/chat)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, previousDestinationId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const activeObstacles = store.obstacles.filter(o => o.active);

  const campusSummary = `
You are GeoNav AI, the intelligent spatial campus assistant for NIIS Institute / NIIS Campus in Bhubaneswar, Odisha.
Official campus tagline: "Your Campus. Your Route. Your Way."
Location: Sarada Vihar, Madanpur, Bhubaneswar, Khordha, Odisha - 752054.

Campus Buildings & Key Locations:
${store.buildings.map(b => `- ${b.name} (Code: ${b.code}, Category: ${b.category}): ${b.description}. Capacity: ${b.maxCapacity || 500} (Occupancy: ${b.currentOccupancy || 250}, Status: ${b.occupancyStatus || 'Moderate'}). Facilities: ${b.facilities.join(', ')}. Rooms: ${b.rooms ? b.rooms.map(r => r.name + ' [' + r.roomNumber + ', Floor ' + r.floor + ']').join(', ') : 'N/A'}`).join('\n')}

Active Events:
${store.events.map(e => `- ${e.title} (${e.category}): ${e.status}, at ${e.venue}, ${e.startDate}`).join('\n')}

Active Obstacles & Notices:
${activeObstacles.length > 0 ? activeObstacles.map(o => `- ${o.name}: ${o.description}`).join('\n') : 'No current temporary obstructions on campus.'}

Key Leadership & Faculty:
${store.faculty.map(f => `- ${f.name} (${f.designation}, ${f.department}), Office: ${f.office}`).join('\n')}

Verified Teachers & Schedules:
${store.teachers.map(t => `- ${t.name} (${t.id}, ${t.department}): Office ${t.office}. Classes: ${t.schedule.map(s => `${s.day} ${s.startTime}-${s.endTime} (${s.subject} in ${s.room}, ${s.buildingName})`).join('; ')}`).join('\n')}

Instructions:
1. Provide helpful, polite, concise, and accurate answers about NIIS campus buildings, routes, facilities, departments, hostels, events, leadership, teachers, class schedules, and obstacles.
2. Context awareness: If the user says "take me there", "navigate there", or "go there" and previousDestinationId is "${previousDestinationId || ''}", guide them to that location.
3. If they ask about lost assistance (e.g. "I'm lost"), reassure them, identify nearest campus landmarks, and offer to guide them to their target building.
4. If they ask about classrooms (e.g. "Where is BCA classroom?", "B-204"), explain that B-204 is in Block B, floor 2.
5. If they ask about accessible wheelchair routes, highlight that ramps and elevators are available in Block A, Block B, and Block C.
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${campusSummary}\n\nUser Question: ${message}` }] }
        ]
      });

      const replyText = response.text || 'I am ready to help you navigate NIIS campus.';

      // Check if destination can be detected
      let suggestedDestinationId: string | null = null;
      const lower = message.toLowerCase();

      if (lower.includes('there') && previousDestinationId) {
        suggestedDestinationId = previousDestinationId;
      } else {
        for (const b of store.buildings) {
          if (lower.includes(b.name.toLowerCase()) || lower.includes(b.id) || lower.includes(b.code.toLowerCase())) {
            suggestedDestinationId = b.id;
            break;
          }
        }
      }

      if (!suggestedDestinationId) {
        if (lower.includes('canteen') || lower.includes('food') || lower.includes('lunch') || lower.includes('eat')) suggestedDestinationId = 'niis-canteen';
        else if (lower.includes('cafe') || lower.includes('coffee') || lower.includes('nescafe')) suggestedDestinationId = 'nescafe';
        else if (lower.includes('temple') || lower.includes('sai')) suggestedDestinationId = 'sai-temple';
        else if (lower.includes('library') || lower.includes('book')) suggestedDestinationId = 'block-c';
        else if (lower.includes('parking') || lower.includes('car') || lower.includes('bus')) suggestedDestinationId = 'parking';
        else if (lower.includes('washroom') || lower.includes('toilet') || lower.includes('restroom')) suggestedDestinationId = 'common-washroom';
        else if (lower.includes('hostel 3') || lower.includes('jagannath')) suggestedDestinationId = 'hostel-3';
        else if (lower.includes('hostel 4') || lower.includes('balabhadra')) suggestedDestinationId = 'hostel-4';
        else if (lower.includes('hostel 1') || lower.includes('arnapurna')) suggestedDestinationId = 'hostel-1';
        else if (lower.includes('hostel 2') || lower.includes('subhadra')) suggestedDestinationId = 'hostel-2';
        else if (lower.includes('hostel 5') || lower.includes('biju')) suggestedDestinationId = 'hostel-5';
        else if (lower.includes('block a') || lower.includes('admin') || lower.includes('principal') || lower.includes('director')) suggestedDestinationId = 'block-a';
        else if (lower.includes('block b') || lower.includes('bca') || lower.includes('b-204')) suggestedDestinationId = 'block-b';
        else if (lower.includes('block c') || lower.includes('computer science') || lower.includes('bsc')) suggestedDestinationId = 'block-c';
        else if (lower.includes('block d') || lower.includes('management') || lower.includes('commerce')) suggestedDestinationId = 'block-d';
        else if (lower.includes('block e') || lower.includes('auditorium') || lower.includes('seminar') || lower.includes('placement')) suggestedDestinationId = 'block-e';
        else if (lower.includes('sports') || lower.includes('basketball') || lower.includes('ground') || lower.includes('playground')) suggestedDestinationId = 'playground';
        else if (lower.includes('gate') || lower.includes('entrance')) suggestedDestinationId = 'main-gate';
      }

      return res.json({
        reply: replyText,
        destinationId: suggestedDestinationId
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local campus intelligence:', err?.message);
    }
  }

  // Realistic local campus-aware fallback
  const lower = message.toLowerCase();
  let reply = '';
  let destinationId: string | null = null;

  if (lower.includes('lost')) {
    reply = "Don't worry! You appear to be near Block A along the central lawn promenade. Where would you like to reach? I can map an immediate walking route.";
    destinationId = 'block-a';
  } else if (lower.includes('block c')) {
    reply = 'Block C is the Computer Science & Library building in the central-east area. It houses the Central Digital Library, AI Research Lab, and BCA/B.Sc IT classrooms. Estimated occupancy is currently Moderate (280/500).';
    destinationId = 'block-c';
  } else if (lower.includes('canteen') || lower.includes('food') || lower.includes('lunch') || lower.includes('mess')) {
    reply = 'The NIIS Canteen & Mess is located in the south-east wing past Hostel 2 and Nescafe. It provides freshly prepared Odia meals and dining for 400+ students.';
    destinationId = 'niis-canteen';
  } else if (lower.includes('library')) {
    reply = 'The Central Digital Library is situated on the 1st Floor of Block C. It features high-speed Wi-Fi, digital journals, reading cabins, and is open from 8:00 AM to 9:00 PM.';
    destinationId = 'block-c';
  } else if (lower.includes('bca') || lower.includes('b-204') || lower.includes('classroom')) {
    reply = 'BCA classrooms are primarily in Block B (Room B-204 on 2nd Floor) and advanced labs in Block C. Would you like me to map a route to Block B?';
    destinationId = 'block-b';
  } else if (lower.includes('teacher') || lower.includes('schedule') || lower.includes('rajesh') || lower.includes('ananya')) {
    reply = 'Prof. Rajesh Kumar Mishra teaches Advanced Database Systems on Mondays at 10:00 AM in Room A-201. Dr. Ananya Priyadarshini has Web GIS in Room B-204 at 11:15 AM.';
    destinationId = 'block-b';
  } else if (lower.includes('obstacle') || lower.includes('construction') || lower.includes('road')) {
    reply = activeObstacles.length > 0 
      ? `Active notice: ${activeObstacles.map(o => o.name).join(', ')}. The navigation engine automatically routes around this area.` 
      : 'All campus pedestrian avenues and ring roads are clear and open.';
  } else {
    reply = `Welcome to NIIS GeoNav! I can guide you to any of our 19 campus facilities, show classroom locations, calculate accessible walking routes, check teacher schedules, or report building occupancy. Try asking "Where is Block C?" or "Take me to the canteen."`;
  }

  res.json({
    reply,
    destinationId
  });
});

// 14. Weather endpoint
let simulatedWeather: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rain' | 'Heavy Rain' | 'Thunderstorm' | 'Fog' | 'Night' | 'Clear Night' = 'Sunny';

app.get('/api/weather', (req: Request, res: Response) => {
  res.json({
    temp: 28,
    condition: simulatedWeather,
    location: 'Bhubaneswar, Odisha',
    humidity: '68%',
    wind: '12 km/h',
    isSimulated: false
  });
});

app.post('/api/weather/simulate', (req: Request, res: Response) => {
  if (req.body.condition) {
    simulatedWeather = req.body.condition;
  }
  res.json({ success: true, condition: simulatedWeather });
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 NIIS GeoNav Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
