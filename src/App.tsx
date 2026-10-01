import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Compass, MapPin, Navigation, Play, ChevronUp, X } from 'lucide-react';
import { 
  BuildingData, 
  NavNode, 
  NavEdge, 
  FacultyMember, 
  CampusEvent, 
  GalleryItem, 
  CoreMember, 
  Announcement, 
  CampusSettings, 
  CalculatedRoute, 
  UserProfile,
  RoomInfo,
  SavedPlace,
  CampusNotification
} from './types';
import { 
  INITIAL_BUILDINGS, 
  INITIAL_NAV_NODES, 
  INITIAL_NAV_EDGES, 
  INITIAL_FACULTY, 
  INITIAL_EVENTS, 
  INITIAL_GALLERY, 
  INITIAL_CORE_MEMBERS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_SETTINGS 
} from './data/campusData';
import { 
  calculateRoute, 
  calculateRouteOptions, 
  findNearestNode, 
  getRouteExplanation,
  checkIsOffRoute 
} from './services/navigationEngine';
import { gpsToCampus } from './data/niisNavigationData';
import { voiceGuidance } from './services/voiceGuidance';

// 3D Components
import { CinematicOpening } from './components/3d/CinematicOpening';
import { CampusDigitalTwin } from './components/3d/CampusDigitalTwin';

// Layout & UI Components
import { Navbar } from './components/layout/Navbar';
import { MobileBottomBar } from './components/layout/MobileBottomBar';
import { WebsiteIntroAnimation } from './components/layout/WebsiteIntroAnimation';
import { NavigationPlannerCard } from './components/navigation/NavigationPlannerCard';
import { TurnByTurnActiveCard } from './components/navigation/TurnByTurnActiveCard';
import { BuildingDetailModal } from './components/campus/BuildingDetailModal';
import { AIAssistantWidget } from './components/ai/AIAssistantWidget';
import { CampusStatusCenter } from './components/status/CampusStatusCenter';
import { CampusArrivalModal } from './components/modals/CampusArrivalModal';
import { DestinationArrivalModal } from './components/modals/DestinationArrivalModal';
import { EmergencySafetyModal } from './components/modals/EmergencySafetyModal';
import { PermissionOnboardingModal } from './components/modals/PermissionOnboardingModal';
import { SmartGlobalSearchModal } from './components/search/SmartGlobalSearchModal';
import { StudentAuthModal } from './components/account/StudentAuthModal';
import { StudentProfileView } from './components/account/StudentProfileView';
import { AdminPortal } from './components/admin/AdminPortal';

// Secondary Page Views
import { FacultyPage } from './components/pages/FacultyPage';
import { EventsPage } from './components/pages/EventsPage';
import { GalleryPage } from './components/pages/GalleryPage';
import { AboutPage } from './components/pages/AboutPage';
import { BuildingsDirectory } from './components/pages/BuildingsDirectory';

export function App() {
  // 1. Data Store
  const [buildings, setBuildings] = useState<BuildingData[]>(INITIAL_BUILDINGS);
  const [navNodes, setNavNodes] = useState<NavNode[]>(INITIAL_NAV_NODES);
  const [navEdges, setNavEdges] = useState<NavEdge[]>(INITIAL_NAV_EDGES);
  const [faculty, setFaculty] = useState<FacultyMember[]>(INITIAL_FACULTY);
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [coreMembers, setCoreMembers] = useState<CoreMember[]>(INITIAL_CORE_MEMBERS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [settings, setSettings] = useState<CampusSettings>(INITIAL_SETTINGS);

  // 2. Navigation & 3D Map State
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  const [fromBuildingId, setFromBuildingId] = useState<string>('main-gate');
  const [toBuildingId, setToBuildingId] = useState<string>('block-c');
  const [isAccessibleOnly, setIsAccessibleOnly] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [activeRoute, setActiveRoute] = useState<CalculatedRoute | null>(null);
  const [routeOptions, setRouteOptions] = useState<CalculatedRoute[]>([]);
  const [selectedRouteType, setSelectedRouteType] = useState<'fastest' | 'accessible' | 'quiet'>('fastest');
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [userPosition, setUserPosition] = useState<[number, number, number] | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [remainingDistance, setRemainingDistance] = useState<number>(0);
  const [remainingMinutes, setRemainingMinutes] = useState<number>(0);
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

  // 3. UI & Experience Modals
  const [showCinematicOpening, setShowCinematicOpening] = useState<boolean>(false);
  const [showArrivalModal, setShowArrivalModal] = useState<boolean>(false);
  const [showDestinationArrivalModal, setShowDestinationArrivalModal] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showAIWidget, setShowAIWidget] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isMobileDirectionsSheetOpen, setIsMobileDirectionsSheetOpen] = useState<boolean>(false);
  const [showIntroAnimation, setShowIntroAnimation] = useState<boolean>(true);

  // Feature 10 & 11: Saved Places & Recent Destinations
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => {
    const saved = localStorage.getItem('niis_saved_places');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'sp-1', userId: 'guest', buildingId: 'block-b', buildingName: 'Block B (Academic)', category: 'academic', customLabel: 'My Classroom (B-204)', savedAt: '2026-09-29' },
      { id: 'sp-2', userId: 'guest', buildingId: 'block-c', buildingName: 'Block C (CS & Library)', category: 'academic', customLabel: 'Central Library', savedAt: '2026-09-29' },
      { id: 'sp-3', userId: 'guest', buildingId: 'hostel-1', buildingName: 'Hostel 1 — Arnapurna', category: 'hostel', customLabel: 'My Hostel', savedAt: '2026-09-29' }
    ];
  });

  const [recentDestinations, setRecentDestinations] = useState<{ id: string; name: string; buildingId: string }[]>(() => {
    const recents = localStorage.getItem('niis_recent_destinations');
    if (recents) {
      try { return JSON.parse(recents); } catch (e) {}
    }
    return [
      { id: 'rec-1', name: 'Block C (Computer Science & Library)', buildingId: 'block-c' },
      { id: 'rec-2', name: 'NIIS Canteen & Mess', buildingId: 'niis-canteen' },
      { id: 'rec-3', name: 'Main Gate', buildingId: 'main-gate' },
      { id: 'rec-4', name: 'Nescafe (Campus Cafe)', buildingId: 'nescafe' }
    ];
  });

  // Feature 12: Notification Center
  const [notifications, setNotifications] = useState<CampusNotification[]>([
    {
      id: 'n-1',
      title: 'Welcome to NIIS GeoNav',
      message: 'Explore 19+ 3D campus locations, lecture halls, and facilities.',
      type: 'arrival',
      timestamp: 'Just now',
      read: false
    },
    {
      id: 'n-2',
      title: 'Upcoming Class at 2:00 PM',
      message: 'BCA / MCA Software Engineering Studio in Block B Room 204.',
      type: 'class',
      timestamp: '11:30 AM',
      read: false,
      targetBuildingId: 'block-b',
      actionLabel: 'Route to Room B-204'
    },
    {
      id: 'n-3',
      title: 'Pathways Clear & Accessible',
      message: 'All central ramps and campus avenues are unobstructed.',
      type: 'obstacle',
      timestamp: '9:00 AM',
      read: true
    },
    {
      id: 'n-4',
      title: 'TechnoSparks Hackathon',
      message: 'Registration is live at Block E Seminar & Auditorium complex.',
      type: 'event',
      timestamp: 'Yesterday',
      read: false,
      targetBuildingId: 'block-e',
      actionLabel: 'Route to Block E'
    }
  ]);

  // Feature 13: PWA Installability
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);

  // Feature 14 & 15: Network & GPS Status
  const [networkStatus, setNetworkStatus] = useState<'online' | 'low' | 'offline'>('online');
  const [gpsStatus, setGpsStatus] = useState<'accurate' | 'searching' | 'weak' | 'denied'>('accurate');
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(3);

  // Animation Refs
  const demoIntervalRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // 4. Initial Fetch from Backend
  const refreshCampusData = async () => {
    try {
      const res = await fetch('/api/campus/data');
      if (res.ok) {
        const data = await res.json();
        if (data.buildings) setBuildings(data.buildings);
        if (data.navNodes) setNavNodes(data.navNodes);
        if (data.navEdges) setNavEdges(data.navEdges);
        if (data.faculty) setFaculty(data.faculty);
        if (data.events) setEvents(data.events);
        if (data.gallery) setGallery(data.gallery);
        if (data.coreMembers) setCoreMembers(data.coreMembers);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.settings) setSettings(data.settings);
      }
    } catch (e) {
      console.warn('Backend fetch failed, using seed data:', e);
    }
  };

  useEffect(() => {
    refreshCampusData();

    // Check stored user
    const savedUser = localStorage.getItem('niis_student_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    // Check voice pref
    setIsVoiceEnabled(voiceGuidance.isEnabled());

    // Theme setup
    const savedTheme = localStorage.getItem('niis_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('light');
    }

    // Permission onboarding check
    const onboarded = localStorage.getItem('niis_permissions_onboarded');
    if (!onboarded) {
      setShowPermissionModal(true);
    }

    // PWA beforeinstallprompt event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Network connection status
    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        setNetworkStatus('offline');
      } else {
        const conn = (navigator as any).connection;
        if (conn && (conn.effectiveType === '2g' || conn.saveData)) {
          setNetworkStatus('low');
        } else {
          setNetworkStatus('online');
        }
      }
    };
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // Global CMD+K / Ctrl+K search shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Browser Geolocation check for campus geofence
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsStatus('accurate');
          setGpsAccuracy(Math.round(pos.coords.accuracy || 3));
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const dLat = (lat - settings.geofence.latitude) * 111000;
          const dLng = (lng - settings.geofence.longitude) * 111000 * Math.cos((lat * Math.PI) / 180);
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          if (dist <= settings.geofence.radiusMeters) {
            setShowArrivalModal(true);
          }
        },
        () => {
          setGpsStatus('searching');
        },
        { timeout: 6000 }
      );
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('niis_theme', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  // Voice toggle
  const handleToggleVoice = () => {
    const next = voiceGuidance.toggle();
    setIsVoiceEnabled(next);
  };

  // Swap From / To
  const handleSwapFromTo = () => {
    const temp = fromBuildingId;
    setFromBuildingId(toBuildingId);
    setToBuildingId(temp);
    if (activeRoute) {
      handleGetRoute(toBuildingId, temp, selectedRouteType, selectedRoom || undefined);
    }
  };

  // Feature 5 & 3: Calculate Point-to-Point Route with Choices & Multi-Floor
  const handleGetRoute = (
    overrideFrom?: string, 
    overrideTo?: string, 
    routeTypeChoice: 'fastest' | 'accessible' | 'quiet' = 'fastest',
    targetRoom?: RoomInfo
  ) => {
    const fId = overrideFrom || fromBuildingId;
    const tId = overrideTo || toBuildingId;

    const startB = buildings.find(b => b.id === fId);
    const destB = buildings.find(b => b.id === tId);

    if (!startB || !destB) return;

    let startNode = navNodes.find(n => n.buildingId === fId);
    let destNode = navNodes.find(n => n.buildingId === tId);

    if (!startNode) {
      startNode = findNearestNode(startB.position[0], startB.position[2], navNodes) || navNodes[0];
    }
    if (!destNode) {
      destNode = findNearestNode(destB.position[0], destB.position[2], navNodes) || navNodes[navNodes.length - 1];
    }

    // Calculate all route options
    const options = calculateRouteOptions(startNode.id, destNode.id, navNodes, navEdges, [], targetRoom);
    setRouteOptions(options);

    const chosen = options.find(o => o.type === routeTypeChoice) || options[0];
    if (chosen) {
      setActiveRoute(chosen);
      setSelectedRouteType(chosen.type || 'fastest');
      setCurrentStepIndex(0);
      setRemainingDistance(chosen.totalDistance);
      setRemainingMinutes(chosen.estimatedMinutes);
      setSelectedBuilding(destB);
      setActiveTab('home');

      // Add to recent destinations
      addRecentDestination(destB.id, destB.name);

      const roomText = targetRoom ? ` to ${targetRoom.name} on Floor ${targetRoom.floor}` : '';
      voiceGuidance.speak(`Route calculated from ${startB.name} to ${destB.name}${roomText}. Total distance: ${chosen.totalDistance} meters, about ${chosen.estimatedMinutes} minutes.`);
    }
  };

  // Switch between calculated route choices
  const handleSelectRouteOption = (route: CalculatedRoute) => {
    setActiveRoute(route);
    setSelectedRouteType(route.type || 'fastest');
    setCurrentStepIndex(0);
    setRemainingDistance(route.totalDistance);
    setRemainingMinutes(route.estimatedMinutes);
  };

  // Add Recent Destination
  const addRecentDestination = (bId: string, bName: string) => {
    setRecentDestinations(prev => {
      const filtered = prev.filter(p => p.buildingId !== bId);
      const updated = [{ id: `rec-${Date.now()}`, name: bName, buildingId: bId }, ...filtered].slice(0, 6);
      localStorage.setItem('niis_recent_destinations', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentDestination = (id: string) => {
    setRecentDestinations(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('niis_recent_destinations', JSON.stringify(updated));
      return updated;
    });
  };

  // Save Place Handler
  const handleToggleSavePlace = async (b: BuildingData) => {
    const existing = savedPlaces.find(sp => sp.buildingId === b.id);
    let updated: SavedPlace[];
    if (existing) {
      updated = savedPlaces.filter(sp => sp.buildingId !== b.id);
    } else {
      const newPlace: SavedPlace = {
        id: `sp-${Date.now()}`,
        userId: currentUser?.id || 'guest',
        buildingId: b.id,
        buildingName: b.name,
        category: b.category,
        customLabel: b.name,
        savedAt: new Date().toISOString()
      };
      updated = [newPlace, ...savedPlaces];
    }
    setSavedPlaces(updated);
    localStorage.setItem('niis_saved_places', JSON.stringify(updated));

    if (currentUser) {
      try {
        await fetch('/api/student/saved-places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            buildingId: b.id,
            buildingName: b.name,
            category: b.category
          })
        });
      } catch (e) {}
    }
  };

  // Start Real Navigation Mode
  const handleStartRealNavigation = () => {
    if (!activeRoute) return;
    setIsNavigating(true);
    setIsDemoMode(false);
    setCurrentStepIndex(0);

    const startCoord = activeRoute.coordinates[0];
    setUserPosition(startCoord);

    if (activeRoute.steps[0]) {
      voiceGuidance.speak(activeRoute.steps[0].instruction);
    }

    saveNavigationHistory(activeRoute);

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsStatus('accurate');
          setGpsAccuracy(Math.round(pos.coords.accuracy || 3));
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          // One consistent GPS-to-campus transformation
          const [mappedX, mappedY, mappedZ] = gpsToCampus(lng, lat);

          setUserPosition([mappedX, mappedY, mappedZ]);
          if (pos.coords.heading !== null) {
            setUserHeading(pos.coords.heading);
          }

          // Off-route detection (Section 9)
          if (activeRoute && checkIsOffRoute([mappedX, mappedY, mappedZ], activeRoute.coordinates, 12)) {
            setIsOffRoute(true);
            voiceGuidance.speak("You are off route. Recalculating...");
            // Recalculate using navigation graph from current position
            const nearest = findNearestNode(mappedX, mappedZ, navNodes);
            if (nearest && activeRoute.toNode) {
              const recalculated = calculateRoute(
                nearest.id, 
                activeRoute.toNode.id, 
                navNodes, 
                navEdges, 
                selectedRouteType === 'accessible', 
                [], 
                selectedRouteType
              );
              if (recalculated) {
                setActiveRoute(recalculated);
                setCurrentStepIndex(0);
                setRemainingDistance(recalculated.totalDistance);
                setRemainingMinutes(recalculated.estimatedMinutes);
                setIsOffRoute(false);
              }
            }
          } else {
            setIsOffRoute(false);
          }

          // Check arrival threshold (< 6 meters from destination node)
          const targetCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];
          const distToDest = Math.sqrt(
            Math.pow(mappedX - targetCoord[0], 2) + Math.pow(mappedZ - targetCoord[2], 2)
          );
          if (distToDest < 6) {
            handleArrival();
          }
        },
        (err) => {
          console.warn('GPS error:', err);
          setGpsStatus('weak');
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Start Demo Navigation Simulation
  const handleStartDemoNavigation = () => {
    if (!activeRoute || activeRoute.coordinates.length < 2) return;
    setIsNavigating(true);
    setIsDemoMode(true);
    setCurrentStepIndex(0);

    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    saveNavigationHistory(activeRoute);

    const coords = activeRoute.coordinates;
    let segIdx = 0;
    let segProgress = 0;
    const totalPoints = coords.length;

    setUserPosition(coords[0]);
    if (activeRoute.steps[0]) {
      voiceGuidance.speak(activeRoute.steps[0].instruction);
    }

    demoIntervalRef.current = setInterval(() => {
      segProgress += 0.045;

      if (segProgress >= 1) {
        segProgress = 0;
        segIdx++;

        if (segIdx >= totalPoints - 1) {
          clearInterval(demoIntervalRef.current);
          handleArrival();
          return;
        }

        const nextStepIdx = Math.min(
          activeRoute.steps.length - 1,
          Math.floor((segIdx / (totalPoints - 1)) * activeRoute.steps.length)
        );

        if (nextStepIdx !== currentStepIndex) {
          setCurrentStepIndex(nextStepIdx);
          const step = activeRoute.steps[nextStepIdx];
          if (step) {
            voiceGuidance.speak(step.instruction);
          }
        }
      }

      const p1 = coords[segIdx];
      const p2 = coords[Math.min(segIdx + 1, totalPoints - 1)];

      const curX = p1[0] + (p2[0] - p1[0]) * segProgress;
      const curY = p1[1] + (p2[1] - p1[1]) * segProgress;
      const curZ = p1[2] + (p2[2] - p1[2]) * segProgress;

      setUserPosition([curX, curY, curZ]);

      const dx = p2[0] - p1[0];
      const dz = p2[2] - p1[2];
      const angleDeg = (Math.atan2(dx, dz) * 180) / Math.PI;
      setUserHeading(angleDeg);

      const remainingRatio = 1 - (segIdx + segProgress) / (totalPoints - 1);
      const remDist = Math.max(0, Math.round(activeRoute.totalDistance * remainingRatio));
      const remMin = Math.max(1, Math.round(activeRoute.estimatedMinutes * remainingRatio));
      setRemainingDistance(remDist);
      setRemainingMinutes(remMin);
    }, 60);
  };

  // Feature 4: Smart Arrival Experience
  const handleArrival = () => {
    setIsNavigating(false);
    setIsDemoMode(false);
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);

    confetti({
      particleCount: 130,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FF3FA4', '#00f0ff', '#E9B95F', '#ffffff']
    });

    const dest = buildings.find(b => b.id === toBuildingId) || selectedBuilding;
    const destName = dest ? dest.name : 'Destination';

    voiceGuidance.speak(`You have arrived at ${destName}. Destination reached.`);

    if (dest) {
      setSelectedBuilding(dest);
    }

    // Add destination notification
    const arrivalNotif: CampusNotification = {
      id: `notif-${Date.now()}`,
      title: 'Destination Reached',
      message: `You have safely arrived at ${destName}.`,
      type: 'destination',
      timestamp: 'Just now',
      read: false,
      targetBuildingId: dest?.id
    };
    setNotifications(prev => [arrivalNotif, ...prev]);

    // Open polished arrival modal
    setShowDestinationArrivalModal(true);
  };

  // End Navigation
  const handleEndNavigation = () => {
    setIsNavigating(false);
    setIsDemoMode(false);
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setUserPosition(null);
    voiceGuidance.stop();
  };

  // Save history to backend
  const saveNavigationHistory = async (route: CalculatedRoute) => {
    try {
      await fetch('/api/student/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'usr-guest',
          fromName: route.fromNode.name,
          toName: route.toNode.name,
          distance: route.totalDistance,
          estimatedMinutes: route.estimatedMinutes
        })
      });
    } catch (e) {}
  };

  // PWA Install Trigger
  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstallPwa(false);
        setDeferredPrompt(null);
      }
    } else {
      alert('To install NIIS GeoNav, tap the Share or Menu button in your browser and select "Add to Home Screen".');
    }
  };

  // AI Destination Selection
  const handleAIDestination = (destId: string) => {
    setToBuildingId(destId);
    setSelectedRoom(null);
    handleGetRoute(fromBuildingId, destId);
    setShowAIWidget(false);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#08070B] text-[#F8EDE2] ${isDarkMode ? '' : 'light'}`}>
      {/* 0. Website Intro Animation */}
      {showIntroAnimation && (
        <WebsiteIntroAnimation
          onComplete={() => setShowIntroAnimation(false)}
          onExplore3DSpace={() => {
            setShowIntroAnimation(false);
            setShowCinematicOpening(true);
          }}
        />
      )}

      {/* 1. Cinematic Opening Overlay */}
      {showCinematicOpening && (
        <div className="fixed inset-0 z-50">
          <CinematicOpening
            onComplete={() => {
              setShowCinematicOpening(false);
              handleGetRoute('main-gate', 'block-c');
            }}
            onSkip={() => {
              setShowCinematicOpening(false);
              handleGetRoute('main-gate', 'block-c');
            }}
          />
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearchModal={() => setShowSearchModal(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onSimulateArrival={() => setShowArrivalModal(true)}
        onOpenEmergency={() => setShowEmergencyModal(true)}
        notifications={notifications}
        onMarkNotificationRead={(id) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }}
        onClearAllNotifications={() => setNotifications([])}
        onNavigateToBuilding={(bId) => {
          setToBuildingId(bId);
          setSelectedRoom(null);
          handleGetRoute(fromBuildingId, bId);
        }}
        networkStatus={networkStatus}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
        onToggleAI={() => setShowAIWidget(prev => !prev)}
        isAIOpen={showAIWidget}
        onReplayIntro={() => setShowIntroAnimation(true)}
      />

      {/* 3. Main Content Router */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* VIEW: HOME / 3D CAMPUS TWIN */}
        {activeTab === 'home' && (
          <div className="relative flex-1 w-full h-[calc(100dvh-56px)] md:h-[calc(100vh-60px)] min-h-0 flex flex-col overflow-hidden">
            {/* Real 3D WebGL Digital Twin Canvas */}
            <div className="absolute inset-0 w-full h-full z-0">
              <CampusDigitalTwin
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                onSelectBuilding={(b) => setSelectedBuilding(b)}
                activeRoute={activeRoute}
                userPosition={userPosition}
                userHeading={userHeading}
                isNavigating={isNavigating}
                isDemoMode={isDemoMode}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
              />
            </div>

            {/* Active Turn-by-Turn Guidance Banner at Top of 3D Scene */}
            {isNavigating && activeRoute && (
              <div className="relative z-30 p-2.5 sm:p-4 pointer-events-auto">
                <TurnByTurnActiveCard
                  route={activeRoute}
                  currentStepIndex={currentStepIndex}
                  remainingDistance={remainingDistance}
                  remainingMinutes={remainingMinutes}
                  isOffRoute={isOffRoute}
                  isVoiceEnabled={isVoiceEnabled}
                  onToggleVoice={handleToggleVoice}
                  onEndNavigation={handleEndNavigation}
                  onRecenter={() => {}}
                  isDemoMode={isDemoMode}
                />
              </div>
            )}

            {/* Desktop Left Drawer: Destination Finder */}
            {!isNavigating && (
              <div className="absolute top-4 left-4 z-20 w-full max-w-xs sm:max-w-sm pointer-events-auto hidden md:block">
                <NavigationPlannerCard
                  buildings={buildings}
                  selectedBuilding={selectedBuilding}
                  fromBuildingId={fromBuildingId}
                  toBuildingId={toBuildingId}
                  onChangeFrom={setFromBuildingId}
                  onChangeTo={setToBuildingId}
                  onSwap={handleSwapFromTo}
                  isAccessibleOnly={isAccessibleOnly}
                  onToggleAccessible={() => {
                    const next = !isAccessibleOnly;
                    setIsAccessibleOnly(next);
                    handleGetRoute(fromBuildingId, toBuildingId, next ? 'accessible' : 'fastest', selectedRoom || undefined);
                  }}
                  onCalculateRoute={(rType, rm) => handleGetRoute(fromBuildingId, toBuildingId, rType, rm)}
                  activeRoute={activeRoute}
                  routeOptions={routeOptions}
                  selectedRouteType={selectedRouteType}
                  onSelectRouteOption={handleSelectRouteOption}
                  isNavigating={isNavigating}
                  onStartNavigation={handleStartRealNavigation}
                  onStartDemoNavigation={handleStartDemoNavigation}
                  onCancelRoute={() => setActiveRoute(null)}
                  onQuickSelectCategory={(cat) => {
                    const match = buildings.find(b => b.category === cat);
                    if (match) setSelectedBuilding(match);
                  }}
                  savedPlaces={savedPlaces}
                  onSelectSavedPlace={(sp) => {
                    setToBuildingId(sp.buildingId);
                    setSelectedRoom(null);
                    handleGetRoute(fromBuildingId, sp.buildingId);
                  }}
                  recentDestinations={recentDestinations}
                  onSelectRecentDestination={(bId) => {
                    setToBuildingId(bId);
                    setSelectedRoom(null);
                    handleGetRoute(fromBuildingId, bId);
                  }}
                  onRemoveRecentDestination={removeRecentDestination}
                  onTriggerLostMode={() => setShowAIWidget(true)}
                  navNodes={navNodes}
                  navEdges={navEdges}
                  selectedRoom={selectedRoom}
                  onSelectRoom={setSelectedRoom}
                />
              </div>
            )}

            {/* Selected Building Details Floating Card */}
            {selectedBuilding && !isNavigating && (
              <div className="absolute bottom-20 md:bottom-4 left-3 right-3 md:left-auto md:right-4 z-30 max-w-sm pointer-events-auto">
                <BuildingDetailModal
                  building={selectedBuilding}
                  onClose={() => setSelectedBuilding(null)}
                  onNavigateHere={(b, targetRoom) => {
                    setToBuildingId(b.id);
                    setSelectedRoom(targetRoom || null);
                    handleGetRoute(fromBuildingId, b.id, selectedRouteType, targetRoom);
                    setIsMobileDirectionsSheetOpen(true);
                  }}
                  isSaved={savedPlaces.some(sp => sp.buildingId === selectedBuilding.id)}
                  onToggleSave={handleToggleSavePlace}
                />
              </div>
            )}

            {/* Mobile Bottom Floating Card (Requirement 8, 11, 12: Compact trigger / Route Preview) */}
            {!isNavigating && !selectedBuilding && (
              <div className="absolute bottom-16 sm:bottom-20 left-3 right-3 z-30 md:hidden pointer-events-auto">
                {!activeRoute ? (
                  /* Compact Find Destination Trigger Card */
                  <div
                    onClick={() => setIsMobileDirectionsSheetOpen(true)}
                    className="glass-panel p-3 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between cursor-pointer group active:scale-[0.98] transition-transform backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF3FA4] to-[#00f0ff] p-0.5 shrink-0 flex items-center justify-center shadow-md">
                        <div className="w-full h-full bg-[#08070B] rounded-[10px] flex items-center justify-center">
                          <Compass className="w-4.5 h-4.5 text-[#FF3FA4]" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-extrabold text-white truncate font-display flex items-center gap-1.5">
                          <span>Find Your Destination</span>
                        </h3>
                        <p className="text-[10px] text-white/60 truncate">
                          Point-to-point campus routes & rooms
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white text-xs font-bold shrink-0 shadow-md">
                      Route
                    </div>
                  </div>
                ) : (
                  /* Compact Mobile Route Card (Requirement 11 & 12) */
                  <div className="glass-panel p-3 rounded-2xl shadow-2xl border border-[#00f0ff]/40 flex flex-col gap-2 backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#00f0ff]/20 text-[#00f0ff] font-mono font-bold text-[10px] uppercase border border-[#00f0ff]/30">
                          {selectedRouteType.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-white font-mono">
                          {activeRoute.estimatedMinutes} min · {activeRoute.totalDistance} m
                        </span>
                      </div>
                      <button
                        onClick={() => setIsMobileDirectionsSheetOpen(true)}
                        className="text-[11px] text-[#00f0ff] font-semibold flex items-center gap-0.5 cursor-pointer hover:underline"
                      >
                        <span>Details</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/80 font-semibold truncate px-1">
                      <span className="truncate">{activeRoute.fromNode.name}</span>
                      <span className="text-[#FF3FA4] px-1 shrink-0">➔</span>
                      <span className="truncate text-white font-bold">{activeRoute.toNode.name}</span>
                    </div>

                    {/* Start Navigation & Demo Walk Buttons */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={handleStartRealNavigation}
                        className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF3FA4]/30 active:scale-[0.98] transition-transform cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 fill-current" />
                        <span>START NAVIGATION</span>
                      </button>
                      <button
                        onClick={handleStartDemoNavigation}
                        className="min-h-[44px] px-3 rounded-xl glass-panel text-[#E9B95F] border border-[#E9B95F]/40 text-xs font-semibold flex items-center justify-center gap-1 active:bg-white/10 transition-all cursor-pointer shrink-0"
                        title="Demonstrate automated walk along route"
                      >
                        <Play className="w-3 h-3 text-[#E9B95F]" />
                        <span>Demo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Bottom Status Bar: Campus Status Center (positioned safely away from left planner and right controls) */}
            {!isNavigating && !selectedBuilding && (
              <div className="absolute bottom-4 left-4 md:left-[390px] right-4 md:right-24 z-20 pointer-events-auto max-w-lg xl:max-w-xl hidden sm:block">
                <CampusStatusCenter
                  events={events}
                  announcements={announcements}
                  settings={settings}
                  networkStatus={networkStatus}
                  gpsStatus={gpsStatus}
                  gpsAccuracy={gpsAccuracy}
                  onOpenAnnouncements={() => setActiveTab('about')}
                  onOpenEmergency={() => setShowEmergencyModal(true)}
                />
              </div>
            )}

            {/* Desktop Floating Right-Side AI Toggle Button (Quick Access) */}
            {!showAIWidget && !isNavigating && (
              <div className="absolute top-4 right-4 z-20 hidden md:block pointer-events-auto">
                <button
                  onClick={() => setShowAIWidget(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-panel border border-[#FF3FA4]/40 text-white text-xs font-bold shadow-xl hover:bg-[#FF3FA4]/20 hover:border-[#FF3FA4] transition-all cursor-pointer group"
                  title="Open NIIS GeoNav AI Assistant"
                >
                  <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-[#FF3FA4] to-[#00f0ff] p-0.5 flex items-center justify-center">
                    <div className="w-full h-full bg-[#08070B] rounded-[9px] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF3FA4] group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>
                  <span>GeoNav AI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: EXPLORE */}
        {activeTab === 'explore' && (
          <div className="flex-1 w-full p-3 sm:p-6 overflow-y-auto pb-24 md:pb-8">
            <BuildingsDirectory
              buildings={buildings}
              onSelectBuilding={(b) => {
                setSelectedBuilding(b);
                setActiveTab('home');
              }}
              onNavigateToBuilding={(b) => {
                setToBuildingId(b.id);
                setSelectedRoom(null);
                handleGetRoute(fromBuildingId, b.id);
              }}
            />
          </div>
        )}

        {/* VIEW: BUILDINGS */}
        {activeTab === 'buildings' && (
          <div className="flex-1 w-full p-3 sm:p-6 overflow-y-auto pb-24 md:pb-8">
            <BuildingsDirectory
              buildings={buildings}
              onSelectBuilding={(b) => {
                setSelectedBuilding(b);
                setActiveTab('home');
              }}
              onNavigateToBuilding={(b) => {
                setToBuildingId(b.id);
                setSelectedRoom(null);
                handleGetRoute(fromBuildingId, b.id);
              }}
            />
          </div>
        )}

        {/* VIEW: FACILITIES */}
        {activeTab === 'facilities' && (
          <div className="flex-1 w-full p-3 sm:p-6 overflow-y-auto pb-24 md:pb-8">
            <BuildingsDirectory
              buildings={buildings.filter(b => b.category === 'dining' || b.category === 'amenity' || b.category === 'sports' || b.category === 'religious')}
              onSelectBuilding={(b) => {
                setSelectedBuilding(b);
                setActiveTab('home');
              }}
              onNavigateToBuilding={(b) => {
                setToBuildingId(b.id);
                setSelectedRoom(null);
                handleGetRoute(fromBuildingId, b.id);
              }}
            />
          </div>
        )}

        {/* VIEW: FACULTY */}
        {activeTab === 'faculty' && (
          <div className="flex-1 w-full overflow-y-auto pb-24 md:pb-8">
            <FacultyPage
              faculty={faculty}
              buildings={buildings}
            />
          </div>
        )}

        {/* VIEW: EVENTS */}
        {activeTab === 'events' && (
          <div className="flex-1 w-full overflow-y-auto pb-24 md:pb-8">
            <EventsPage
              events={events}
              buildings={buildings}
              onNavigateToVenue={(venue) => {
                const safeVenue = String(venue ?? '');
                const match = buildings.find(b => safeVenue.toLowerCase().includes(String(b.name ?? '').toLowerCase()) || safeVenue.toLowerCase().includes(String(b.code ?? '').toLowerCase()));
                if (match) {
                  setToBuildingId(match.id);
                  setSelectedRoom(null);
                  handleGetRoute(fromBuildingId, match.id);
                } else {
                  handleGetRoute(fromBuildingId, 'block-e');
                }
              }}
            />
          </div>
        )}

        {/* VIEW: GALLERY */}
        {activeTab === 'gallery' && (
          <div className="flex-1 w-full overflow-y-auto pb-24 md:pb-8">
            <GalleryPage items={gallery} />
          </div>
        )}

        {/* VIEW: ABOUT NIIS */}
        {activeTab === 'about' && (
          <div className="flex-1 w-full overflow-y-auto pb-24 md:pb-8">
            <AboutPage
              settings={settings}
              coreMembers={coreMembers}
              announcements={announcements}
              onNavigateHome={() => setActiveTab('home')}
            />
          </div>
        )}

        {/* VIEW: STUDENT ACCOUNT */}
        {activeTab === 'account' && (
          <div className="flex-1 w-full p-4">
            {currentUser ? (
              <StudentProfileView
                user={currentUser}
                buildings={buildings}
                onLogout={() => {
                  setCurrentUser(null);
                  localStorage.removeItem('niis_student_user');
                  localStorage.removeItem('niis_token');
                }}
                onNavigateToBuilding={(bId) => {
                  setToBuildingId(bId);
                  setSelectedRoom(null);
                  handleGetRoute(fromBuildingId, bId);
                }}
                onUpdateProfile={(u) => {
                  setCurrentUser(u);
                  localStorage.setItem('niis_student_user', JSON.stringify(u));
                }}
              />
            ) : (
              <div className="text-center py-20">
                <p className="text-white/60 mb-4">Please sign in to view your saved places and route history.</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 rounded-2xl bg-[#FF3FA4] text-white font-bold text-xs uppercase"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Navigation Bottom Sheet Drawer (Requirement 8 & 9) */}
      {isMobileDirectionsSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDirectionsSheetOpen(false)}
          />

          {/* Sheet Panel */}
          <div 
            className="relative w-full max-h-[82vh] glass-panel rounded-t-3xl border-t border-white/20 p-3 sm:p-4 pb-6 shadow-2xl flex flex-col animate-slide-up z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-2 shrink-0" />

            <div className="flex-1 overflow-y-auto pr-0.5">
              <NavigationPlannerCard
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                fromBuildingId={fromBuildingId}
                toBuildingId={toBuildingId}
                onChangeFrom={setFromBuildingId}
                onChangeTo={setToBuildingId}
                onSwap={handleSwapFromTo}
                isAccessibleOnly={isAccessibleOnly}
                onToggleAccessible={() => {
                  const next = !isAccessibleOnly;
                  setIsAccessibleOnly(next);
                  handleGetRoute(fromBuildingId, toBuildingId, next ? 'accessible' : 'fastest', selectedRoom || undefined);
                }}
                onCalculateRoute={(rType, rm) => handleGetRoute(fromBuildingId, toBuildingId, rType, rm)}
                activeRoute={activeRoute}
                routeOptions={routeOptions}
                selectedRouteType={selectedRouteType}
                onSelectRouteOption={handleSelectRouteOption}
                isNavigating={isNavigating}
                onStartNavigation={() => {
                  setIsMobileDirectionsSheetOpen(false);
                  handleStartRealNavigation();
                }}
                onStartDemoNavigation={() => {
                  setIsMobileDirectionsSheetOpen(false);
                  handleStartDemoNavigation();
                }}
                onCancelRoute={() => setActiveRoute(null)}
                onQuickSelectCategory={(cat) => {
                  const match = buildings.find(b => b.category === cat);
                  if (match) setSelectedBuilding(match);
                }}
                savedPlaces={savedPlaces}
                onSelectSavedPlace={(sp) => {
                  setToBuildingId(sp.buildingId);
                  setSelectedRoom(null);
                  handleGetRoute(fromBuildingId, sp.buildingId);
                }}
                recentDestinations={recentDestinations}
                onSelectRecentDestination={(bId) => {
                  setToBuildingId(bId);
                  setSelectedRoom(null);
                  handleGetRoute(fromBuildingId, bId);
                }}
                onRemoveRecentDestination={removeRecentDestination}
                onTriggerLostMode={() => {
                  setIsMobileDirectionsSheetOpen(false);
                  setShowAIWidget(true);
                }}
                navNodes={navNodes}
                navEdges={navEdges}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
                onClose={() => setIsMobileDirectionsSheetOpen(false)}
                isMobileBottomSheet={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Mobile Bottom Navigation Bar */}
      <MobileBottomBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAI={() => setShowAIWidget(!showAIWidget)}
        onOpenAccount={() => {
          if (currentUser) {
            setActiveTab('account');
          } else {
            setShowAuthModal(true);
          }
        }}
        onOpenDirections={() => {
          setActiveTab('home');
          setIsMobileDirectionsSheetOpen(true);
        }}
      />

      {/* 5. Geofence Welcome Modal */}
      <CampusArrivalModal
        isOpen={showArrivalModal}
        buildings={buildings}
        onGuideMe={() => {
          setShowArrivalModal(false);
          setShowCinematicOpening(true);
        }}
        onExplore={() => {
          setShowArrivalModal(false);
          setActiveTab('home');
        }}
        onSelectDestination={(bId) => {
          setShowArrivalModal(false);
          setToBuildingId(bId);
          setSelectedRoom(null);
          handleGetRoute(fromBuildingId, bId);
        }}
        onOpenSearch={() => {
          setShowArrivalModal(false);
          setShowSearchModal(true);
        }}
        onOpenAI={() => {
          setShowArrivalModal(false);
          setShowAIWidget(true);
        }}
        onToggleAccessible={() => {
          setIsAccessibleOnly(prev => !prev);
        }}
        onClose={() => setShowArrivalModal(false)}
      />

      {/* 6. Feature 4: Smart Destination Arrival Experience Modal */}
      <DestinationArrivalModal
        isOpen={showDestinationArrivalModal}
        onClose={() => setShowDestinationArrivalModal(false)}
        destinationBuilding={buildings.find(b => b.id === toBuildingId) || selectedBuilding}
        targetRoomName={selectedRoom?.name}
        targetFloor={selectedRoom?.floor}
        onNavigateNext={(nextBuildingId) => {
          setShowDestinationArrivalModal(false);
          setToBuildingId(nextBuildingId);
          setSelectedRoom(null);
          handleGetRoute(toBuildingId, nextBuildingId);
        }}
        onReturnNavigation={() => {
          setShowDestinationArrivalModal(false);
          handleGetRoute(toBuildingId, fromBuildingId);
        }}
        onExploreBuilding={() => {
          setShowDestinationArrivalModal(false);
        }}
      />

      {/* 7. Feature 1: Smart Global Search Modal */}
      <SmartGlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        buildings={buildings}
        faculty={faculty}
        events={events}
        gallery={gallery}
        onSelectBuilding={(b) => {
          setSelectedBuilding(b);
          setToBuildingId(b.id);
          setSelectedRoom(null);
          setActiveTab('home');
        }}
        onNavigateToBuilding={(bId, room) => {
          setToBuildingId(bId);
          setSelectedRoom(room || null);
          handleGetRoute(fromBuildingId, bId, selectedRouteType, room);
        }}
      />

      {/* 8. Feature 8: Emergency Safety Modal */}
      <EmergencySafetyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        settings={settings}
        buildings={buildings}
        onNavigateToLocation={(bId) => {
          setToBuildingId(bId);
          setSelectedRoom(null);
          handleGetRoute(fromBuildingId, bId);
        }}
      />

      {/* 9. Feature 16: Permission Onboarding Modal */}
      <PermissionOnboardingModal
        isOpen={showPermissionModal}
        onComplete={() => setShowPermissionModal(false)}
      />

      {/* 10. Student Sign-In / Register Modal */}
      <StudentAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setCurrentUser(u);
          setActiveTab('account');
        }}
      />

      {/* 11. Admin CMS Modal */}
      {showAdminModal && (
        <AdminPortal
          buildings={buildings}
          faculty={faculty}
          events={events}
          gallery={gallery}
          coreMembers={coreMembers}
          announcements={announcements}
          settings={settings}
          navNodes={navNodes}
          navEdges={navEdges}
          onRefreshData={refreshCampusData}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {/* 12. Floating AI Assistant Chatbot (Single unified instance) */}
      {showAIWidget && (
        <div className="fixed top-14 md:top-16 right-4 md:right-20 z-50 w-full max-w-[calc(100vw-32px)] sm:w-96 animate-slide-up">
          <AIAssistantWidget
            buildings={buildings}
            onSelectDestination={handleAIDestination}
            isOpen={showAIWidget}
            onToggle={() => setShowAIWidget(false)}
            userNearestBuilding={buildings.find(b => b.id === fromBuildingId)}
          />
        </div>
      )}
    </div>
  );
}

export default App;
