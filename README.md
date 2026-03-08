# Blast Program Web (Initial Port)

Static web port target for GitHub Pages.

## Included in this first pass

- Start screen card navigation
- Vibration Tool menu
- Vibration Calculator logic (ported from PySide implementation)
- Site Factor Calibrator logic (ported from PySide implementation)
- Empirical Formula logic (ported from PySide implementation)
- References/Cheat Sheets links
- Gassing Calculator with workbook-template driven formula evaluation (from exported JSON)

## Run locally

Open `index.html` in a browser (this is the splash page), then click through to `app.html` and the `/pages` subpages.
For full Gassing Calculator behavior, serve the folder over HTTP so template JSON can load via `fetch`.

Or with a simple local server:

```powershell
cd blast-program-web
python -m http.server 8080
```

Then browse to `http://localhost:8080`.

## Deploy to GitHub Pages

- Push this folder as a repository root (or `/docs` folder in a repo).
- In GitHub repo settings: `Pages -> Build and deployment -> Deploy from a branch`.
- Select your branch and root folder.

## Differences from desktop app

- Desktop-only integrations are not yet ported.
- Browser security may block local-file `fetch`; use a local server or GitHub Pages.
