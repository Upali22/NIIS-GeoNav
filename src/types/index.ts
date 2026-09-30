export type BuildingCategory = 
  | 'academic'
  | 'hostel'
  | 'religious'
  | 'dining'
  | 'sports'
  | 'amenity'
  | 'gate'
  | 'parking';

export interface RoomInfo {
  id: string;
  roomNumber: string;
  floor: number;
  name: string;
  department: string;
  capacity: number;
  facilities: string[];
  transitionType?: 'stairs' | 'elevator' | 'ramp';
  nodeId?: string;
}

export interface BuildingData {
  id: string;
  name: string;
  code: string;
  shortName?: string;
  label?: string;
  subtitle?: string;
  category: BuildingCategory;
  description: string;
  position: [number, number, number]; // [x, y, z] in 3D world space
  size: [number, number, number]; // [width, height, depth]
  rotationY?: number;
  height: number;
  floors: number;
  image: string;
  facilities: string[];
  departments?: string[];
  accessibility: boolean;
  openingHours?: string;
  rooms?: RoomInfo[];
  color?: string;
  accentColor?: string;
  status: 'active' | 'under_maintenance' | 'closed';
  visible?: boolean;
  featured?: boolean;
  latitude?: number;
  longitude?: number;
  mainEntrance?: string;
  accessibleEntrance?: string;
  maxCapacity?: number;
  currentOccupancy?: number;
  occupancyStatus?: 'Low' | 'Moderate' | 'Busy' | 'Very Busy' | 'Full';
  details?: {
    architecturalStyle?: string;
    builtYear?: string;
    groundArea?: string;
  };
}

export interface NavNode {
  id: string;
  name: string;
  x: number;
  z: number;
  y?: number;
  buildingId?: string;
  floor?: number;
  type: 'gate' | 'junction' | 'building_entrance' | 'pathway' | 'landmark' | 'stair' | 'elevator';
  accessible: boolean;
  landmark?: string;
}

export interface NavEdge {
  id: string;
  from: string;
  to: string;
  distance: number; // in meters
  accessible: boolean;
  stairs?: boolean;
  ramp?: boolean;
  scenic?: boolean;
  blocked?: boolean;
  obstacleId?: string;
  name?: string;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  action: 'straight' | 'turn-left' | 'turn-right' | 'slight-left' | 'slight-right' | 'climb-stairs' | 'take-elevator' | 'use-ramp' | 'arrive';
  nodeId: string;
  coordinates: [number, number, number];
  floorNotice?: string;
}

export interface CalculatedRoute {
  id?: string;
  type?: 'fastest' | 'accessible' | 'quiet';
  title?: string;
  path: NavNode[];
  coordinates: [number, number, number][];
  totalDistance: number; // in meters
  estimatedMinutes: number;
  steps: RouteStep[];
  fromNode: NavNode;
  toNode: NavNode;
  hasObstaclesBypassed?: boolean;
}

export interface TeacherSchedule {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. '10:00 AM'
  endTime: string;   // e.g. '11:00 AM'
  subject: string;
  semester: string;
  section: string;
  buildingId: string;
  buildingName: string;
  room: string;
  floor: number;
  nodeId?: string;
}

export interface TeacherProfile {
  id: string; // e.g. 'TCH-001'
  name: string;
  designation: string;
  department: string;
  qualification: string;
  specialization: string;
  office: string;
  email: string;
  photo: string;
  bio: string;
  status: 'active' | 'inactive';
  schedule: TeacherSchedule[];
  teacherKeyMasked?: string;
}

export interface TemporaryObstacle {
  id: string;
  name: string;
  type: 'construction' | 'maintenance' | 'event_restriction' | 'closed_entrance' | 'temporary_closure';
  description: string;
  affectedNodeIds: string[];
  affectedEdgeIds: string[];
  severity: 'low' | 'medium' | 'high' | 'blocked';
  active: boolean;
  startTime: string;
  endTime: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  category: 'leadership' | 'faculty' | 'staff';
  photo: string;
  bio: string;
  qualification: string;
  specialization: string;
  office: string;
  email: string;
  displayOrder: number;
  status: 'active' | 'on_leave';
  teacherId?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: 'Academic' | 'Cultural' | 'Technical' | 'Workshop' | 'Seminar' | 'Hackathon' | 'Sports' | 'Festival';
  status: 'ongoing' | 'upcoming' | 'completed';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  buildingId?: string;
  organizer: string;
  bannerImage: string;
  galleryImages?: string[];
  registrationLink?: string;
  featured?: boolean;
  published?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
  published?: boolean;
}

export interface CoreMember {
  id: string;
  name: string;
  role: string;
  designation?: string;
  department: string;
  bio: string;
  qualification?: string;
  photo: string;
  socialEmail?: string;
  phone?: string;
  active?: boolean;
  displayOrder?: number;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: 'Exam Notice' | 'Holiday' | 'Campus Event' | 'Workshop' | 'Emergency' | 'General Notice';
  date: string;
  active: boolean;
  urgent?: boolean;
  priority?: 'Normal' | 'Important' | 'Urgent';
  expiryDate?: string;
  bannerImage?: string;
  published?: boolean;
  featured?: boolean;
}

export interface CampusSettings {
  campusName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  officialWebsite: string;
  phone: string;
  email: string;
  emergencyPhone: string;
  securityPhone: string;
  geofence: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
  mission: string;
  vision: string;
  aboutText: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  department: string;
  studentId?: string;
  profilePic?: string;
  role: 'student' | 'teacher' | 'admin';
  teacherId?: string;
  preferences?: {
    preferredRoute?: 'fastest' | 'accessible' | 'quiet';
    theme?: 'dark' | 'light' | 'system';
    voiceEnabled?: boolean;
    weatherEffects?: boolean;
    autoDestinationSwitch?: boolean;
  };
  createdAt: string;
}

export interface SavedPlace {
  id: string;
  userId: string;
  buildingId: string;
  buildingName: string;
  category: string;
  customLabel?: string; // e.g. "My Classroom", "My Hostel"
  savedAt: string;
}

export interface NavigationHistoryItem {
  id: string;
  userId: string;
  fromName: string;
  toName: string;
  distance: number;
  estimatedMinutes: number;
  timestamp: string;
  routeType?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  entityType: string;
  details?: string;
}

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rain' | 'Heavy Rain' | 'Thunderstorm' | 'Fog' | 'Night' | 'Clear Night';
  humidity: string;
  wind: string;
  location: string;
  isSimulated?: boolean;
}

export type SearchCategory = 
  | 'building' 
  | 'block' 
  | 'classroom' 
  | 'faculty' 
  | 'facility' 
  | 'event' 
  | 'gallery' 
  | 'service';

export interface SearchResultItem {
  id: string;
  name: string;
  category: SearchCategory;
  categoryLabel: string;
  buildingId: string;
  buildingName: string;
  floor?: number;
  roomNumber?: string;
  locationDetails: string;
  image?: string;
  iconType?: string;
  distanceMeters?: number;
  tags?: string[];
  rawItem?: any;
}

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  type: 'arrival' | 'class' | 'obstacle' | 'event' | 'route' | 'destination' | 'announcement';
  timestamp: string;
  read: boolean;
  priority?: 'normal' | 'high' | 'urgent';
  targetBuildingId?: string;
  actionLabel?: string;
}

export interface EmergencyContact {
  id: string;
  title: string;
  department: string;
  phone: string;
  location: string;
  availableHours: string;
  buildingId: string;
}
