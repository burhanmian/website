# Project content guide

The active preview uses `demo-projects.json`. All seven entries are explicitly fictional demo content. The previous imported catalogue remains in `projects.json` for reference and is not used by the new project panels.

## Replace a project

Edit its title, category, overview, contribution, process array and results. Replace its image path with your cover artwork. Keep its id stable so the physical object links continue to work. Set station to `computer` for the monitor gallery or `hardware` for the workbench/archive. Replace the simulated slider block in project-view.js with your actual video or interactive demo when available.

## Physical object mapping

- Printer → form
- Circuit board → sense
- Prototype → light

The mapping is in hardware-projects.js. Both actual geometry and visible, keyboard-accessible labels open the project panel.

## Interaction

View all work opens the archive immediately, without requiring the tour. Category filters narrow the cards. Computer cards, hardware objects and archive cards all open the same native dialog. Closing with Back to studio or Escape resumes the room at its existing progress and preserves monitor selection. The room animation pauses while the dialog is open.

The UI is local; no production deployment or GitHub push is part of this change.
