# Portfolio

My personal site: [cura-yjk.github.io/portfolio](https://cura-yjk.github.io/portfolio)

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies — open
`index.html` in a browser and it works.

## Adding a project

Edit **`js/projects.js`** and nothing else. Copy one block in the `PROJECTS` array, paste it,
change the values:

```js
{
  name: "Project name",
  blurb: "One or two sentences. What it does, and for whom.",
  tags: ["Rails 8", "PostgreSQL"],
  initials: "PN",
  live: "https://example.com",              // omit if not deployed
  repo: "https://github.com/cura-yjk/thing" // omit if private
}
```

The grid places the card itself. Two projects or twenty, nothing else needs touching.

- **No `live` URL?** Leave the key out. The card drops the "Live site" link and the green
  "Live" pill on its own — no dead buttons.
- **No screenshot?** Leave `image` out and the card shows `initials` on a pixel grid instead.
  To add one later, drop the file in `images/` and set `image: "images/name.png"`.
- Order in the array is the order on the page. Newest first reads well.

## Layout

```
index.html              the page
css/style.css           tokens, layout, sections
css/components/card.css the project card
js/projects.js          project data + the code that renders it
images/                 portrait, and project screenshots
```

**Changing colours or spacing** is one place: the `:root` block at the top of `css/style.css`.
Every colour on the page is a variable there — `--accent` alone repaints the links, buttons,
pills and rules.

## Running it locally

Opening `index.html` directly works. If you want a real server:

```
python3 -m http.server 8000
```

then visit <http://localhost:8000>.

## Deploying

Pushing to `master` is the deploy — GitHub Pages serves the repo root. No build, no CI.

## License

MIT.
