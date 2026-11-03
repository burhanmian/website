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

Current idle uses rest transforms for hips, spine and legs; arms use an averaged walk pose. This corrects the bent idle stance but is not an authored idle animation. Walk weight follows travel speed; the camera and character follow separate paths. Pause freezes progress. Without the GLB, the room and portfolio remain usable.

## Next priorities
1. Author proper idle, turn, walk, stop and interaction clips; refine foot planting and stride timing.
2. Replace crude props with detailed licensed models and improve lighting, proportions and materials. The owner is not satisfied with current visual quality.
3. Improve hero text placement and mobile framing; avoid overlapping the character.
4. Add actual project media and case studies. Undaunted's cover is conceptual typography, not gameplay. No outcomes or endorsements should be invented.
5. Test forward/reverse scroll, pause/resume, reduced motion, mobile, loading failures and performance before deployment.

## Validation status
Local browser checks observed upright idle, walk/arrival views and no console errors. Taste skill source lint passed. Its rendered inspection did NOT pass: imagery count, title/overlap detection, motion count and typography need further review. Do not claim production-ready or fully realistic rendering. No production deployment has been done.
