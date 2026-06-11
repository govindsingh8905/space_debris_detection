# NEXUS Mission Operations Dashboard

This workspace contains the Next.js frontend shell for two separate product layers:

- `/` - Landing Experience, **"The Race To Save Orbit"**.
- `/dashboard` - NEXUS Mission Operations Dashboard, the actual frontend application.

The landing experience explains orbital debris, collision risk, Kessler Syndrome, and ESA-style statistics. It is a storytelling and awareness layer only. The operational frontend begins after the user clicks **Launch System** and enters `/dashboard`.

## Frontend Application Boundary

```text
Landing Page (/)
  |
  v
Launch System
  |
  v
Mission Operations Dashboard (/dashboard)
  |
  v
Backend Services
  |
  v
Space Data Sources
```

The current Collision Avoidance System dashboard is the real frontend product. It should be understood as a Mission Operations Command Center for a Space Situational Awareness (SSA), Space Traffic Management, and orbital collision avoidance platform.

## Frontend Stack

- Next.js 15+ with the App Router
- React
- TypeScript
- Framer Motion
- Three.js
- React Three Fiber

## Mission Operations Modules

1. **Detection Interface**
   - Detects potential conjunction events between satellites and debris.
   - Outputs closest approach distance, relative velocity, and detection confidence.

2. **Risk Assessment Interface**
   - Calculates and visualizes collision probability.
   - Outputs Low Risk, Medium Risk, High Risk, and Critical Risk classifications.

3. **Maneuver Recommendation Interface**
   - Presents collision avoidance recommendations.
   - Outputs Delta-V, burn direction, fuel impact, and mission impact.

4. **AI Analysis Interface**
   - Summarizes threats, explains risks, compares maneuver options, and assists operators.
   - AI never directly controls satellites. The human operator remains in control.

5. **72-Hour Simulation Interface**
   - Projects orbital behavior for the next 72 hours.
   - Outputs future conjunctions, collision forecasts, safe maneuver windows, and risk timelines.

6. **Live Conjunction Alerts**
   - Displays active warnings and real-time alert context.

7. **Orbital Visualization**
   - Renders Earth, satellites, debris, orbital paths, and conjunction zones.

8. **Mission Control Dashboard**
   - Provides the command-center surface that organizes alerts, risk state, visualization, AI analysis, and operator decisions.

## Runtime Flow

```text
NEXUS Mission Operations Dashboard
  |
  v
Detection
  |
  v
Risk Assessment
  |
  v
Maneuver Call
  |
  v
AI Systems
  |
  v
72-Hour Protocol
  |
  v
Operator Decision
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm

### Installation

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing experience. Click **Launch System** or open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to enter the NEXUS Mission Operations Dashboard.

## Performance Notes

- Deterministic math caching helps preserve 60 FPS web stability.
- Memoized object arrays keep repeated orbital calculations efficient.
- High-density orbital traffic is rendered with instancing-oriented Three.js patterns where possible.

## License

MIT License
