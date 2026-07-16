# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

María Borbonés's personal website — a plain HTML/CSS/JS static site with no build step and no dependencies.

## Commands

- Preview locally: open `index.html` directly in a browser, or run `npx serve .` for a local server.
- No install, build, lint, or test commands — there is no package.json or build tooling.

## Architecture

- `index.html` — single-page site; all content lives here as anchor-linked `<section>`s (`#home`, `#about`, `#work`, `#contact`).
- `assets/css/style.css` — global styles, including a `prefers-color-scheme: dark` variant.
- `assets/js/main.js` — minimal vanilla JS (currently just sets the footer year).
- `render.yaml` — deploys the site as a Render static site (`staticPublishPath: .`, no build command). Pushing to the connected branch auto-deploys.

Keep this structure flat: add new pages as sibling `.html` files or new sections within `index.html`, and avoid introducing a bundler/framework/build step unless the user asks for one.
