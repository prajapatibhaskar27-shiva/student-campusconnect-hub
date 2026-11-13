# CampusConnect — Your Campus, Connected

A responsive student hub built with **HTML5, CSS3 and vanilla JavaScript**. It helps students discover campus opportunities, manage tasks, find learning resources and share updates with a community.

## Features

- Responsive dark-futuristic dashboard with mobile navigation
- Events directory with search, category filters and RSVP registration
- Task manager: add, complete, filter and delete tasks
- LocalStorage persistence for tasks, profile, registrations, likes and posts
- Learning resource library with search and category filters
- Community board with post creation, likes and copy-to-clipboard
- Editable student display profile
- Animated cards, gradients, hover states, toast feedback and reduced-motion support

## Run locally

No build tools or dependencies are required.

1. Download and extract the ZIP.
2. Open `index.html` in a modern browser.
3. For the best development experience, use the VS Code **Live Server** extension and click **Go Live**.

## Deploy with GitHub Pages

1. Create a GitHub account (if needed) and create a new **public** repository, e.g. `campusconnect`.
2. Upload `index.html`, `styles.css`, `script.js` and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then click **Save**.
6. Wait for the Pages deployment to finish. Your site will be available at:
   `https://YOUR-USERNAME.github.io/campusconnect/`

## Customize before submitting

- Change the profile name from the top-right avatar or sidebar profile menu.
- Update the sample event list in `script.js` (`seedEvents`) with your real campus details.
- Update the resource list in `script.js` (`resources`) if desired.
- Add your name/team and project screenshots to this README.

## Project structure

```text
campusconnect/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Notes

- This is a front-end demonstration project. Data is stored in the browser using LocalStorage; it is not shared between different users or devices.
- The event listings and community posts are sample content. RSVP and community actions are local demo interactions, not connected to a real campus backend.
- External learning resources open their respective provider websites.
- Google Fonts is loaded online; system sans-serif fallbacks are included.

## Suggested submission checklist

- [ ] Test the site on desktop and mobile widths
- [ ] Try registering for an event
- [ ] Add, complete, filter and delete a task
- [ ] Search the resource library
- [ ] Publish and like a community post
- [ ] Capture desktop and mobile screenshots
- [ ] Verify the public GitHub Pages link
