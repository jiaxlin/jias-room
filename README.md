# Jia’s room

An interactive Three.js room based on Jia’s real furniture and belongings.

- **v1/**: preserved baseline. Keep unchanged.
- **v2/**: current styling experiment. Original room objects, plus sparse trailing vines, small star lights, a windowsill plant, a subtle rug, and warm light.
- The root page opens **v2** by default.

## Preview locally

```sh
git clone https://github.com/jiaxlin/jias-room.git
cd jias-room
python3 -m http.server 5173 --bind 127.0.0.1
```

Open http://127.0.0.1:5173/v2/ or http://127.0.0.1:5173/v1/.
Keep that terminal running. Run `git pull --ff-only` in a separate terminal to get changes, then refresh the browser.

Internet access and a WebGL-capable browser are required. Three.js 0.180.0 and OrbitControls load from jsDelivr. Lighting is simulated, and preferences are saved in the browser. Arrow keys rotate when the room is focused; +/- zoom.

## Updating

Change v2/index.html, v2/styles.css and v2/main.js. Keep v1 untouched. Local-only changes are not automatically copied here; commit and push them before requesting changes to those files.

## Vercel

Import this repository, choose **Other** as the framework, leave the build command empty, and use `.` as the output directory. The root page redirects to v2/. No deployment has been configured by this repository setup.

## Validation

JavaScript syntax, UI control behavior, local file references, and v1 file hashes were checked. The 3D render has not been verified in a browser in the authoring environment.
