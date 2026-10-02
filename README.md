# 🧭 NIIS GeoNav — Smart Campus Navigation System

<div align="center">

### Intelligent • Interactive • Accessible • Context-Aware

**A smart 3D campus navigation platform designed for NIIS Institute of Information Science & Management**

[🌐 Live Demo](https://niis-geonav.onrender.com)

</div>

---

## 📌 About the Project

**NIIS GeoNav** is an intelligent campus navigation system developed specifically for **NIIS Institute of Information Science & Management**.

The platform helps students, faculty, staff, and visitors explore the campus, locate buildings and facilities, and find suitable routes between locations through an interactive digital campus environment.

Instead of relying on a conventional 2D map, NIIS GeoNav combines **3D campus visualization, intelligent route calculation, interactive navigation, AI assistance, and an administrative management system** into a single platform.

---

## ✨ Key Features

### 🗺️ Smart Campus Navigation
- Interactive campus map
- Search for buildings and facilities
- Distance calculation between locations
- Route visualization
- Shortest-path navigation
- Campus-wide location directory

### 🧠 Intelligent Route Finding
NIIS GeoNav uses the **A\* (A-Star) pathfinding algorithm** to determine efficient routes between campus locations.

The algorithm considers:
- Starting location
- Destination
- Available paths
- Distance between connected locations
- Estimated remaining distance

This allows the system to calculate an efficient route through the campus navigation graph.

### 🏫 3D Campus Visualization
The campus is represented through an interactive **3D digital environment**, allowing users to explore campus structures and locations in a more immersive way.

### 🚀 Campus Arrival Experience
When users enter the platform, they can experience a cinematic location journey that transitions through:

**Earth → India → Odisha → Bhubaneswar → NIIS Campus**

The experience provides geographical context before entering the campus navigation interface.

### 🤖 NIIS GeoNav AI Assistant
An integrated AI assistant helps users interact with the campus navigation system and obtain information about campus locations and facilities.

### 👤 Student Account System
The platform provides student-oriented account functionality including:
- Registration
- Login
- Student profile
- Account information

### 👨‍💼 Admin Portal
Administrators can manage campus information through a dedicated administration interface.

Management features include:
- 📢 Announcements
- 👨‍🏫 Core Members / Faculty information
- 🖼️ Event Gallery
- 🏢 Buildings and 3D campus information
- 🛣️ Routes
- 📅 Events
- 📚 Program-related information

### 💾 Persistent Data Management
The system is designed to retain administrative changes so that managed campus information remains available after refreshing or reopening the application.

### 📱 Responsive Design
The interface is designed to work across:
- 💻 Desktop
- 📱 Mobile
- 🖥️ Different screen sizes

### 🌗 Theme Support
The interface supports both:
- Dark Mode
- Light Mode

---

## 🏫 Campus Locations

NIIS GeoNav includes important campus locations such as:

- Main Gate
- Parking
- Sai Temple of NIIS
- Block A
- Open Park
- Block B
- Common Washroom
- Hostel 1 — Arnapurna
- Hostel 2 — Subhadra
- Nescafe
- NIIS Canteen
- Block C
- Hostel 3 — Jagannath
- Hostel 4 — Balabhadra
- Block D
- Playground
- Block E
- Back Gate
- Hostel 5 — Biju Pattanaik

---

## 🧠 Algorithm

### A* Pathfinding Algorithm

NIIS GeoNav models the campus as a **navigation graph**, where:

- **Nodes** represent campus locations.
- **Edges** represent navigable paths between locations.
- **Edge weights** represent the distance or cost of travelling between locations.

A* evaluates possible paths using:

**f(n) = g(n) + h(n)**

Where:

- `g(n)` = cost from the starting point to the current node
- `h(n)` = estimated cost from the current node to the destination
- `f(n)` = total estimated cost

The algorithm explores promising paths and determines an efficient route to the selected destination.

---

## 🛠️ Technology Stack

### Frontend
- React
- TypeScript / JavaScript
- HTML5
- CSS3
- Vite

### 3D & Visualization
- Three.js
- React Three Fiber
- React Three Drei

### Animation
- Framer Motion

### UI & Icons
- Lucide React
- Responsive CSS
- Glassmorphism-based interface

### Backend
- Node.js
- Server-side API architecture

### Data Management
- Persistent campus data storage
- Structured campus location and route data

### Development Tools
- Git
- GitHub
- Visual Studio Code
- npm

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   NIIS GeoNav UI    │
                    │   React + Vite      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │ 3D Campus   │  │ Navigation  │  │ AI Assistant│
       │ Visualization│  │  Engine     │  │             │
       └─────────────┘  └──────┬──────┘  └─────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ A* Pathfinding  │
                       │    Algorithm    │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Campus Data &   │
                       │ Route Network   │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Admin / Data    │
                       │ Management      │
                       └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/Upali22/NIIS-GeoNav.git
```

Navigate to the project:

```bash
cd NIIS-GeoNav
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will then be available through the local development URL provided by Vite.

---

## 📂 Project Structure

```text
NIIS-GeoNav/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   ├── account/
│   │   ├── admin/
│   │   └── ...
│   │
│   ├── services/
│   ├── App.tsx
│   └── ...
│
├── data/
├── server.ts
├── package.json
├── README.md
└── ...
```

---

## 🎯 Problem Addressed

Large educational campuses can be difficult to navigate, particularly for:

- New students
- Visitors
- Parents
- Faculty and staff
- Users unfamiliar with the campus layout

Traditional maps may not provide enough campus-specific context.

**NIIS GeoNav** addresses this problem by providing an interactive digital campus environment with intelligent route discovery and location-based information.

---

## 💡 Why NIIS GeoNav?

The system combines several capabilities into one platform:

**3D Campus + Smart Navigation + A* Pathfinding + AI Assistance + Campus Information + Admin Management**

This creates a centralized digital navigation experience for the NIIS campus.

---

## 🔮 Future Scope

Potential future enhancements include:

- 📍 Real-time user positioning
- 🧭 Indoor navigation
- ♿ Advanced accessibility-aware routing
- 🚶 Walking-time estimation
- 📡 Live campus updates
- 📱 Progressive Web App support
- 🔔 Event-based navigation notifications
- 🗺️ Expanded campus mapping
- 📊 Navigation analytics
- 🎙️ Voice-based navigation
- 🌐 Multi-campus support

---

## 🌐 Live Project

**NIIS GeoNav**

🔗 https://niis-geonav.onrender.com

---
## 👩‍💻 Developer

**Upali Aparajita Patra**

NIIS GeoNav is an independently developed smart campus navigation project created to explore 3D visualization, intelligent navigation, pathfinding algorithms, AI-assisted interaction, and campus information management.

🔗 **GitHub:** [Upali22](https://github.com/Upali22)  
🔗 **LinkedIn:** [Upali Aparajita Patra](https://www.linkedin.com/in/upali-aparajita-patra-52915440b/)  
---

## 📄 License

This project is developed for educational and demonstration purposes.
