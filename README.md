# SIMULACRA

**SIMULACRA** is a high-performance, WebGL-powered interactive manifesto that explores the philosophy and mathematics of simulation through real-time browser physics and dynamic data visualization.

## 🌌 Overview

Unlike traditional websites, SIMULACRA functions as a real-time graphics and physics engine running directly in the browser. By decoupling the React HTML UI from the underlying WebGL canvas, we achieve seamless routing and complex 3D rendering without dropping frames.

- **The Particle Grid:** A reactive 5,000-particle instanced mesh that responds to cursor gravity and time-dilation parameters.
- **The Sandbox Engine:** A high-performance Plinko-board utilizing Rapier (WebAssembly) physics, computing collisions for hundreds of rigid bodies simultaneously.
- **The Ledger:** A live data visualization sorting 4,000 3D nodes at 60 FPS to demonstrate algorithmic efficiency.
- **The Manifesto:** A technical deep-dive into the stack and performance considerations.

## 🛠 Tech Stack

- **Framework:** React + TypeScript (Vite)
- **Routing:** React Router DOM (v6)
- **State Management:** Zustand (Transient Updates)
- **Graphics:** Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Physics:** Rapier (`@react-three/rapier`)
- **Animations:** GSAP (ScrollTrigger)
- **Styling:** Tailwind CSS v4

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/jamilharun/simulacra.git

# Navigate to directory
cd simulacra

# Install dependencies
npm install

# Start the dev server
npm run dev
```

## 📱 Performance

SIMULACRA utilizes `@react-three/drei`'s `<PerformanceMonitor>` to actively track frame rates. If the browser dips below 50 FPS on low-end devices, the engine automatically culls physics objects and particle counts to prevent browser crashes.

## ☁️ Deployment (Cloudflare Pages)

This project is configured as a Single Page Application (SPA). A `public/_redirects` file is included so that direct links to routes (like `/sandbox`) resolve correctly on Cloudflare's edge network.

```bash
npm run build
npx wrangler pages deploy dist
```
