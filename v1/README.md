# Jia’s room

A playful fictional portfolio: an interactive Three.js bedroom, a purple blanket, and simple Lighting and Rituals controls.

## Run locally

From this folder, run:

```sh
python3 -m http.server 5173 --bind 127.0.0.1
```

Then open http://localhost:5173. Internet is required to load the pinned Three.js dependencies from jsDelivr.

## Files

- `index.html`: page structure and import map
- `styles.css`: layout, blue glass controls, and greeting behind the room
- `main.js`: Three.js room, orbit controls, lighting, and interactions

Drag to rotate, scroll to zoom, right-drag to pan. Touch: one finger to rotate; two fingers to zoom/pan. The greeting is an HTML layer behind the transparent WebGL canvas, so the room covers the words. Lights are simulated.

## GitHub

Intended repository: `jiaxlin/jias-room`. This local project is prepared for Git; its remote repository has not been created yet.

## Notes

Lighting and Rituals are the only settings panels. Light preferences are stored in the browser. A browser with WebGL enabled is required. The interface has syntax and control checks; WebGL rendering has not been verified in this workspace.
