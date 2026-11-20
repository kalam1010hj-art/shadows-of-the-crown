# Shadows of the Crown

Explore Eldermoor at sunset in a desktop, third-person 3D prototype. Follow the road from the southern gate to the market, listen at the well and inspect the smith’s hearth. Reading the mark at the forge records a discovery for the current session.

## Run

Use Node.js 22 or newer. Run `npm ci` and `npm run dev`, then open the address Vite prints. To serve the production version, run `npm run build` followed by `npm run preview`. Static hosts such as Vercel can serve the generated `dist` directory. No environment variables or backend services are required.

| Action | Control |
|---|---|
| Move / sprint | WASD / hold Shift while moving |
| Jump | Space |
| Orbit / zoom | Drag the mouse / scroll |
| Inspect / dismiss a journal entry | E / Escape |
| Pause / resume | Escape |

## Implementation

- `src/world.js` builds the village, baked batches of architectural geometry, procedural texture maps, trees, skyline and collision volumes.
- `src/Scene.jsx` connects the React Three Fiber scene to Rapier physics and handles movement, grounding, orbit distance, camera obstruction and input.
- `src/Character.jsx` contains an original articulated placeholder villager with procedural movement.
- `src/layout.js` defines buildings and discoveries. `src/state.js` manages the menu, pause state and investigations with Zustand.
- `src/main.jsx` and `src/game.module.css` implement the title screen, HUD, control guide, journal and error screen.

## Assets and scope

All scenery, textures, character geometry, motion and story text were generated for this project. There are no downloaded models, texture packs, fonts, music or sound effects. The character and scenery use stylized procedural art. This repository does not add a separate commercial asset pack or apply a new license to the owner’s game content. React, React DOM, Three.js, React Three Fiber, Zustand and Vite use MIT licenses. Rapier uses Apache-2.0. Dependency notices are included in their npm packages.

Phase 1 covers outdoor desktop exploration on fairly level ground. Most buildings have solid exteriors. This version has no persistent player save, touch controller, combat or audio. Gameplay requires WebGL 2. The JavaScript bundle includes Rapier’s physics runtime. Device frame rates have yet to be measured.

## Verification

Run `npm test` for deterministic geometry, proximity detection, progression/reset and a real Rapier capsule collision/jump simulation. To test the browser flow, run `npm run build`, `npx playwright install chromium`, then `npm run test:browser`. The browser test walks the actual road using keyboard input, opens a clue, finds the forge and verifies that a new game resets the discovery.

Next milestone: one forest bandit with patrol, detection, telegraphed attacks and defeat, plus player health and stamina.
