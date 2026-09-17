# Portfolio

My personal site: [cura-yjk.github.io/portfolio](https://cura-yjk.github.io/portfolio)

Plain HTML, CSS and JavaScript. No framework and no build step. Open `index.html` in a
browser and it works: the site itself ships with no dependencies. The only ones in
`package.json` are for the tests, which never reach the page.

## Adding a project

Edit **`js/projects.js`** and nothing else. Copy one block in the `PROJECTS` array, paste it,
change the values:

```js
{
  name: "Project name",
  blurb: "One or two sentences. What it does, and for whom.",
  tags: ["Rails 8", "PostgreSQL"],
  initials: "PN",
  live: "https://example.com",               // omit if not deployed
  repo: "https://github.com/cura-yjk/thing", // omit if private
  caseStudy: "thing.html"                    // omit if there's no write-up
}
```

The grid places the card itself. Two projects or twenty, nothing else needs touching.

- **No `live` URL?** Leave the key out. The card drops the "Live site" link and the green
  "Live" pill on its own, so there are no dead buttons.
- **No screenshot?** Leave `image` out and the card shows `initials` on a pixel grid instead.
  To add one later, drop the file in `images/` and set `image: "images/name.png"`.
- **Written it up?** Point `caseStudy` at a page on this site. The card grows a "Case study"
  link, which becomes its primary one and opens in the same tab. Everything else still opens
  in a new one. See `moodwalk.html`.
- Order in the array is the order on the page. Newest first reads well.

## Layout

```
index.html                    the page
moodwalk.html                 the Moodwalk case study
css/style.css                 tokens, layout, sections
css/components/card.css       the project card
css/components/case-study.css the case study page, loaded only by it
js/projects.js                project data + the code that renders it
images/                       portrait, and project screenshots
images/moodwalk/              the case study's own screens
```

**Changing colours or spacing** is one place: the `:root` block at the top of `css/style.css`.
Every colour on the page is a variable there. `--accent` alone repaints the links, buttons,
pills and rules.

## Running it locally

Opening `index.html` directly works. If you want a real server:

```
python3 -m http.server 8000
```

then visit <http://localhost:8000>.

## Tests

```
npm install   # once, for jsdom
npm test
```

`test/projects.test.js` covers the card rules this README describes: no `live` URL means no
pill and no dead button, a `caseStudy` takes the primary link and demotes the rest, a missing
`image` falls back to `initials`. It also checks that every `image` and `caseStudy` path points
at a file that exists, which is the typo most likely to ship unnoticed.

If you change a rule here, a test will tell you the README is now wrong too.

## Deploying

Pushing to `master` is the deploy: GitHub Pages serves the repo root. No build step and no CI,
so run `npm test` before pushing.

## License

MIT.
