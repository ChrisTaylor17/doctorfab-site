# Doctor Fab Nautical Website

This folder contains a complete one-page nautical website for Doctor Fab.

## Files

- `index.html`: full website markup
- `styles.css`: full visual design
- `assets/`: approved AI-generated Doctor Fab photos/boards for the site
- `HOSTINGER-COPY.md`: copy/paste content for Hostinger Website Builder

## GitHub to Hostinger Route

Hostinger's GitHub deployment works for custom HTML/PHP sites on web or cloud hosting. It does not deploy directly into a Hostinger Website Builder project, so this site should be treated as a custom static site.

1. Create a GitHub repository, for example `doctorfab-site`.
2. Push this folder's contents to the repository root. `index.html` must be at the top level.
3. In Hostinger hPanel, open the website dashboard.
4. Go to `Advanced` -> `Git`.
5. Click `Continue with GitHub` and authorize Hostinger.
6. Choose the repository and the `main` branch.
7. Use the default root directory / `public_html`.
8. Deploy.

Important: deploying to `public_html` can overwrite the existing site files. Keep a backup or only do this once you are ready to replace the current builder version.

## Easiest Hostinger Builder Route

1. In Hostinger, replace the current meditation image with the approved AI-generated Doctor Fab images, starting with `assets/doctorfab-ai-board-wide.png` or `assets/ai3-pink-portrait.jpg`.
2. Use the text in `HOSTINGER-COPY.md` section by section.
3. Set the palette to deep navy, soft shell white, warm cream, dune beige, sea-glass blue, and dusty pink.
4. Remove the duplicate `About` navigation item.
5. Check the mobile view with the phone icon and use Auto-fix layout if needed.
6. Add the `Work With Dr. Fab` section before Resources so the page has clear money-making paths.
7. Only click `Update website` when you are ready for the changes to go live.

Hostinger supports custom code through an Embed Code element, but for a full site this file-upload route is cleaner than stuffing the whole page into one embed.

## Static Upload Route

If you want to use this as a code site instead of Hostinger's visual builder:

1. Zip the contents of this folder, not the folder itself.
2. Upload the zip to Hostinger File Manager.
3. Extract into the site's web root, usually `public_html`.
4. Make sure `index.html`, `styles.css`, and the `assets` folder sit together.

Before replacing a live site, download or back up the current Hostinger version.
