# Doctor Fab Nautical Website

This folder contains a complete one-page nautical website for Doctor Fab.

## Files

- `index.html`: full website markup
- `styles.css`: full visual design
- `companion.js`: vanilla JavaScript for the Reflection & Grounding Companion
- `api/companion.php`: PHP endpoint that calls Anthropic server-side
- `api/companion-system-prompt.md`: editable clinical voice and safety prompt
- `config.example.php`: safe template for the private Anthropic API config
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

## Reflection & Grounding Companion Setup

The companion uses a single PHP endpoint so the Anthropic API key is never placed in HTML, CSS, or JavaScript. The repo includes only `config.example.php`; the real key must be added on Hostinger after deployment.

### Preferred key location

1. In Hostinger File Manager, open the folder one level above `public_html`.
2. Create a file named `doctorfab-companion-config.php`.
3. Copy the contents of `public_html/config.example.php` into that new file.
4. Replace `PASTE_YOUR_ANTHROPIC_API_KEY_HERE` with the real Anthropic API key.
5. Replace `CHANGE_THIS_TO_A_LONG_RANDOM_STRING` with a long random phrase.
6. Save the file.

The endpoint looks for this file first:

```php
../doctorfab-companion-config.php
```

Keeping it above `public_html` is the cleanest option because the file is not web-accessible.

### Fallback key location

If Hostinger does not allow a file above `public_html`:

1. In `public_html`, copy `config.example.php`.
2. Rename the copy to `config.php`.
3. Paste the real Anthropic API key into `config.php`.
4. Replace the rate-limit salt with a long random phrase.

`config.php` is listed in `.gitignore`, and `.htaccess` denies direct web access to it. Never commit `config.php`.

### Model and cost controls

The model string currently used is:

```php
claude-haiku-4-5-20251001
```

Change it in the private config file under `anthropic_model`.

The endpoint also caps message length, caps total conversation length, rate-limits by hashed IP/session, and stores only timestamps for rate limiting. It does not log or store what visitors type. PHP cURL must be enabled on Hostinger for the endpoint to call Anthropic.

### Safety behavior

The companion is a support-between-sessions reflection tool, not therapy or crisis care. The UI states this near the tool. The PHP endpoint and frontend both check for crisis language; when detected, the exercise pauses and the visitor sees emergency guidance, including call/text 988 in the United States.

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
