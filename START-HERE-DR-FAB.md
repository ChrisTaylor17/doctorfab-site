# Doctor Fab Website Handoff

This file is the simple operating guide for taking over the Doctor Fab website.

## What You Need

1. A GitHub account for Dr. Fab.
2. Access to the GitHub repo: `ChrisTaylor17/doctorfab-site`.
3. Access to Hostinger for `doctorfab.org`.
4. Codex installed and signed in on Dr. Fab's own computer/account.

Do not copy private API keys, Hostinger passwords, or Codex login files between accounts. Each person should sign in with their own account.

## One-Time Setup On Dr. Fab's Computer

1. Install GitHub Desktop or Git.
2. Install Codex.
3. Sign into Codex with Dr. Fab's own account.
4. Clone the website repo:

```sh
git clone https://github.com/ChrisTaylor17/doctorfab-site.git
```

5. Open the cloned `doctorfab-site` folder in Codex.
6. Ask Codex:

```text
Please inspect this Doctor Fab static website repo and help me preview it locally before making changes.
```

## Preview The Site Locally

From the repo folder, run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8765/index.html
```

There is also a double-click helper at:

```text
scripts/start-local-preview.command
```

## Normal Editing Workflow

Use this pattern with Codex:

```text
Please make this exact website update. Preserve the current design and only change what I request. Preview locally and tell me what changed before pushing live.
```

After Codex edits the site, ask:

```text
Please verify the local site, commit the changes, push to GitHub main, and confirm the live site updated.
```

Hostinger is connected to GitHub, so pushing to `main` is what makes the live site update.

## Important Files

- `index.html`: homepage and most site sections.
- `autism-parent-coaching.html`: autism parent coaching page.
- `styles.css`: visual design, spacing, mobile layout.
- `companion.js`: interaction logic, contact modal, companion, lexicon filters.
- `site.js`: shared mobile navigation behavior.
- `assets/resources/`: downloadable PDFs.
- `resources/`: individual resource pages.
- `lexicon/`: long-form Lexicon articles.
- `api/companion.php`: server endpoint for the AI companion.
- `config.example.php`: example only. The real API key file must stay private on Hostinger.

## Adding Dr. Fab To GitHub

Chris can add Dr. Fab as a collaborator:

1. Open `https://github.com/ChrisTaylor17/doctorfab-site`.
2. Go to `Settings`.
3. Go to `Collaborators and teams`.
4. Add Dr. Fab's GitHub username.
5. Choose `Write` access to start. Choose `Admin` only when she is ready to manage settings.

After she accepts the invite, she can clone, edit, and push.

## Hostinger Access

In Hostinger, give Dr. Fab her own access instead of sharing a password.

Recommended:

1. Invite her email through Hostinger account sharing.
2. Keep GitHub deployment connected to `main`.
3. Keep the real API key outside the repo.
4. Rotate private API keys when ownership changes.

## Safe Rule For Codex

Before major changes, ask Codex to run:

```sh
git status --short --branch
```

If there are unexpected changes, pause and ask what changed before pushing.

## Emergency Rollback

If a live update breaks the site, ask Codex:

```text
Please inspect the last commit and revert only the latest website change safely, then push the fix live.
```

Do not use destructive commands like `git reset --hard` unless you are absolutely sure.
