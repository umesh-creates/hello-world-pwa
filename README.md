# Hello World PWA

A dependency-free Progressive Web App starter with separate HTML, CSS, and JavaScript files, install metadata, app icons, and an offline app shell.

## Run locally

Service workers and installation require a secure context. Use `localhost` for local development; opening `index.html` directly with `file://` will not enable PWA features.

From this folder, run:

```powershell
py -m http.server 8000
```

Then open <http://localhost:8000>. You can also use the VS Code Live Server extension.

## Install and test

- In supported Chromium browsers, use the **Install app** button or the browser's app/install option in its menu.
- On iPhone or iPad, open the Share menu and choose **Add to Home Screen**.
- To test offline mode, load the app once, wait for the service worker to activate, then switch the browser offline and reload.
- For Android or another device, deploy to an HTTPS host (GitHub Pages works) or use a local HTTPS tunnel. `localhost` is considered secure only on the development device itself.

The browser decides whether installation is available and when to show its native prompt. The in-page button uses that prompt when supported and otherwise explains the browser-menu install path.