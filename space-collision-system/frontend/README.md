# Orbital Shield AI

A NASA/SpaceX-inspired space intelligence dashboard for real-time satellite tracking, collision detection, and orbital debris monitoring. Recently updated with live API integration and advanced AI simulation tools.

## ✨ New Features

### 📡 Live CelesTrak Integration
- Replaced mock data with **real active satellite data** via the CelesTrak API.
- Live tracking of known targets including ISS (ZARYA), STARLINK, GALILEO, and USA satellites.
- Deterministic 3D pseudo-orbit projections using actual NORAD ID seeds.
- Client-side `sessionStorage` caching for smooth performance and rate-limit prevention.

### 🧠 Advanced AI & Simulation
- **Multi-Agent Decision Panel**: Real-time AI analysis showing detection, analysis, and execution phases with an integrated Confidence Meter.
- **What-If Simulation Mode**: A timeline toggle to preview predictive trajectories. Displays safe avoidance maneuvers (green) vs. direct collision paths (red) projected hours ahead.
- **Mission Priority Protocol**: AI automatically classifies satellites by type (Station, Military, Nav, Comm) and assigns Mission Priority levels (Critical to Low).
- **Debris Cascade Engine**: Simulates Kessler Syndrome by automatically spawning orbital debris clusters dynamically when un-avoided collisions occur.

### 🌍 Enhanced 3D & UI Upgrades
- **Earth Risk Heatmap**: A subtle inner-atmosphere additive glowing mesh visualizing highly congested LEO risk zones.
- **High-Density Instanced Render**: Flawlessly renders 50+ live API objects alongside 350+ background orbiters at 60 FPS utilizing `InstancedMesh`.
- **Advanced Timeline Controller**: Fluid time scrubbing allowing predictions +1h, +24h, and +72h ahead in real-time.
- **Secure Gateway**: A cinematic Authentication Portal matching the "Antigravity" premium aesthetic.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **3D Rendering**: Three.js with React Three Fiber (`@react-three/drei`)
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS v4 & custom Glassmorphism UI
- **Language**: TypeScript
- **Data Source**: CelesTrak (`gp.php` API)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd orbital-shield-ai

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📂 Project Structure

```
├── app/
│   ├── globals.css          # Global styles, Tailwind directives, glassmorphism tokens
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard (Simulation State & Logic)
├── components/
│   ├── agent-panel.tsx      # Multi-Agent decision UI and confidence meter
│   ├── alert-panel.tsx      # Collision warnings with proximity data
│   ├── globe-3d.tsx         # 3D Earth, paths, trails, and heatmap via R3F
│   ├── object-details.tsx   # Selected object metrics and Mission Priority UI
│   ├── space-background.tsx # Animated starfield background
│   ├── stats-sidebar.tsx    # Live global metrics
│   └── timeline-controller.tsx # Time simulation controls and What-If toggle
├── lib/
│   └── space-data.ts        # API Fetch logic, Collision Math, AI rules
└── public/
    └── textures/            # High-res Earth diffuses, normal maps, clouds
```

## 🎮 Usage

### 3D Globe Navigation
- **Click and drag** to rotate the Earth and Orbital planes.
- **Scroll** to zoom in and out of orbits.
- **Select an object** to isolate its telemetry and engage the AI panel.

### Collision Avoidance
1. Wait for a `High Risk` alert in the right panel.
2. The AI will initiate its Decision Phase.
3. Toggle the **What-If Mode** at the bottom to view the collision trajectory.
4. Click **Avoid Collision** to execute a simulated orbital burn, offsetting the asset and generating a safe green trajectory.

### Debris Cascade
- Allow the Timeline to reach `TCA` (Time to Closest Approach) on a high-risk collision without taking action. 
- The UI will throw a system error and dynamically spawn secondary debris fragments representing a catastrophic event.

## ⚡ Performance Notes

- The system now uses deterministic math caching over live TLE conversion libraries to ensure 60 FPS stability on the web.
- `useMemo` hooks heavily manage massive object arrays, ensuring only collision calculations run per-frame.
- Background traffic utilizes `instancedMesh` ensuring an active, busy sky without GPU bottlenecking.

## 📜 License
MIT License - see LICENSE file for details.
