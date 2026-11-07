# Continue the portfolio

## Goal
Build Burhan Aftab Mian's immersive portfolio: show his character, transition from idle to a natural turn and walk toward the computer, then follow the camera into the work. Target a believable detailed tech studio, not a low-poly dollhouse.

References: https://www.selindursun.com/, https://www.yuusuke.work/, https://hoyojerez.com/, and the MengTo Kage, Towers and Sketchbook repositories. Study their composition and movement; do not copy unlicensed code or artwork.

## Run
Serve the repository with `python3 -m http.server 4175`, then open http://localhost:4175/. No build step or API keys. ES modules require HTTP rather than file://.

## Files
- index.html: semantic portfolio and sticky scene.
- style.css: responsive dark studio direction.
- studio.js: procedural room, lighting, GLTF loading, camera and animation blend.
- assets/: local Three.js r149 modules and loader dependencies.

## Character
The owner-approved generated character is included at `outputs/burhan-character.glb`. No separate download is needed after cloning. It has one skinned mesh and an in-place casual walk clip. Keep scale at 1: r149 static bounding-box measurements are misleading for this rig. Do not rescale it from those bounds.

The current sequence is hologram → solid upright idle → turn → distance-synchronized walk → eye-level POV. `journey-motion.mjs` defines a reversible scroll timeline. Walk speed was measured from grounded ankle motion in the source clip (0.64414 m/s); pose time follows path distance, not elapsed time. Fast scroll catch-up is bounded.

The rig is sampled absolutely every frame, with upright rest transforms for the torso and legs. This prevents the old breathing rotation from accumulating and bending the spine. Arms relax from the source clip. Breathing is a small bounded offset. Pausing freezes the entire state. There is one supplied walk clip, so idle/turn/arrival remain procedural rather than separately authored animation assets.

The holographic scan transitions into the original materials. Camera position shares the actor path, approaches the actor's eye position, then fades the body only at close range to avoid looking through the headset. Reduced-motion users get a solid stationary character and direct portfolio links.

## Next priorities
1. Refine foot planting and add separately authored idle, turn, stop and interaction clips if higher-fidelity acting is needed.
2. Replace crude props with detailed licensed models and improve lighting, proportions and materials. The owner is not satisfied with current visual quality.
3. Improve hero text placement and mobile framing; avoid overlapping the character.
4. Add actual project media and case studies. Undaunted's cover is conceptual typography, not gameplay. No outcomes or endorsements should be invented.
5. Test forward/reverse scroll, pause/resume, reduced motion, mobile, loading failures and performance before deployment.

## Validation status
Local browser checks observed upright idle, walk/arrival views and no console errors. Taste skill source lint passed. Its rendered inspection did NOT pass: imagery count, title/overlap detection, motion count and typography need further review. Do not claim production-ready or fully realistic rendering. No production deployment has been done.


Motion regression checks: `node --test work/journey-motion.test.mjs`. These cover phase ordering, distance/pose agreement, reversibility and bounded catch-up.

## Taste-skill restyle (v8)
style.css rewritten as one flat layer: one typeface, no gradients/shadows/hairlines, tour progress in the top centre, flat page-corner, entrance rises in page-effects.js. Direction dark-room, seed 787031352; lint clean. Open: no real photos/footage yet.
