# Repository Guidelines

## Project Overview

This repository is Yishu Li's academic personal website, built with Jekyll and the al-folio theme. The site is hosted at `https://Yishu-Li.github.io` and deployed by GitHub Actions from the `main` or `master` branch.

The public site is primarily in English. The user may give instructions in Chinese; keep public-facing copy in polished English unless the user explicitly asks for Chinese content.

## Important Files and Directories

- `_config.yml`: global site settings, plugin configuration, enabled features, blog tags, publication settings, and explicit build exclusions.
- `_pages/about.md`: homepage content, profile image, subtitle, announcements, selected papers, and latest posts.
- `_pages/blog.md` and `_posts/*.md`: blog index and dated blog posts. New posts should use `YYYY-MM-DD-slug.md`.
- `_bibliography/papers.bib`: publication data rendered by Jekyll Scholar on `_pages/publications.md`.
- `assets/img/publication_preview/`: publication preview images referenced from BibTeX `preview={...}` fields.
- `assets/img/`: profile photos, post thumbnails, cat pages, and other site images.
- `_data/socials.yml`: email and social profile identifiers.
- `_data/cv.yml` and `assets/pdf/Li_Yishu_CV.pdf`: rendered CV data and downloadable CV PDF.
- `_news/*.md`: short announcements shown on the homepage.
- `_includes/`, `_layouts/`, `_sass/`, and `assets/css/main.scss`: theme templates and styling.
- `_site/`, `.jekyll-cache/`, `assets/libs/`, `node_modules/`, and `vendor/`: generated or dependency output; do not edit these by hand.

Several al-folio demo pages and collections remain in the repo but are excluded in `_config.yml`, including example projects, books, teaching, profiles, repositories, and dropdown pages. Do not re-enable or clean them up unless the user asks.

## Local Development

Activate the project virtual environment before running Bundler/Jekyll commands:

```sh
source .venv/bin/activate
export PATH="$HOME/gems/bin:$HOME/.local/share/gem/ruby/3.4.0/bin:$PATH" # only needed if bundle/jekyll are not already on PATH
bundle exec jekyll build
bundle exec jekyll serve --livereload --host 127.0.0.1
```

Use the Node tooling only for formatting or CSS cleanup. There are no npm scripts in `package.json`; call tools directly when needed:

```sh
npx prettier --check .
npx prettier --write <paths>
```

The deploy workflow installs Ruby 3.3.5, Python 3.13, ImageMagick, `nbconvert`, builds with `bundle exec jekyll build`, runs PurgeCSS, and deploys `_site` on non-PR pushes.

## Content Conventions

- Keep homepage and bio edits in `_pages/about.md`; maintain the current first-person academic voice.
- For blog posts, include front matter with `layout: post`, `title`, `date`, `description`, `tags`, `categories`, and `thumbnail` when relevant.
- Put post images under a descriptive folder in `assets/img/` and reference them with repository-relative paths such as `assets/img/example/image.jpg`.
- For publications, update `_bibliography/papers.bib`; use `selected={true}` for homepage selected papers and `preview={filename}` for thumbnail previews.
- Add matching publication thumbnails to `assets/img/publication_preview/`.
- Keep navigation changes in page front matter (`nav`, `nav_order`) and confirm `_config.yml` does not exclude the page.
- The CV page currently links to `assets/pdf/Li_Yishu_CV.pdf`; replace that PDF for CV updates unless the user asks to convert the structured YAML CV.

## Agent Workflow

- Inspect the relevant file before editing; this repo contains both live content and untouched theme examples.
- Preserve user changes. If the working tree is dirty, work around unrelated edits instead of reverting them.
- Prefer focused content/layout changes over broad theme refactors.
- After content or template changes, run `bundle exec jekyll build` when practical and report any build issues clearly.
- Do not manually edit generated `_site` output.
- If the user supplies exact academic details, use them verbatim where accuracy matters; otherwise ask before inventing dates, affiliations, publication metadata, or claims.
