// Tests for js/projects.js.
//
// The rules under test are the ones README.md promises in prose: a project
// without a live URL gets no pill and no dead button, a project with a case
// study promotes that link and demotes the rest, and a project without a
// screenshot falls back to its initials. If a rule changes, the README is
// wrong too.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "js", "projects.js");

// A fresh DOM per test: projects.js reads `document` at require time, so the
// globals have to exist before it loads, and the cache has to be dropped or
// every test would share one window.
function load(html = "<!doctype html><body></body>") {
  const dom = new JSDOM(html);
  global.window = dom.window;
  global.document = dom.window.document;
  delete require.cache[require.resolve(SOURCE)];
  return { dom, api: require(SOURCE) };
}

const FULL = {
  name: "Example",
  blurb: "Does a thing.",
  tags: ["Rails 8", "PostgreSQL"],
  initials: "EX",
  live: "https://example.test/",
  repo: "https://github.com/example/example",
  team: "Team of 3",
  image: "images/example.jpg",
  caseStudy: "example.html"
};

const linkLabels = (card) =>
  [...card.querySelectorAll(".card__link")].map((a) => a.textContent.trim());

// A screen reader's list of links has no card around it to say which project a
// link belongs to. Two projects otherwise give six links and three names.
test("a card's links say which project they belong to", () => {
  const { api } = load();
  const card = api.cardFor({ ...FULL, name: "Moodwalk" });
  const labels = [...card.querySelectorAll(".card__link")].map((a) => a.getAttribute("aria-label"));

  assert.deepEqual(labels, ["Case study: Moodwalk", "Live site: Moodwalk", "Code: Moodwalk"]);
});

test("the visible text stays short", () => {
  const { api } = load();
  const card = api.cardFor({ ...FULL, name: "Moodwalk" });

  assert.deepEqual(linkLabels(card), ["Case study", "Live site", "Code"]);
});

test("two projects' links are all distinguishable by name", () => {
  const { api } = load();
  const names = [
    ...api.cardFor({ ...FULL, name: "Moodwalk" }).querySelectorAll(".card__link"),
    ...api.cardFor({ ...FULL, name: "Pera Flash" }).querySelectorAll(".card__link")
  ].map((a) => a.getAttribute("aria-label"));

  assert.equal(new Set(names).size, names.length, "every link should be tellable from the others");
});

test("el() builds a node without inventing a class or text", () => {
  const { api } = load();
  const bare = api.el("div");
  assert.equal(bare.tagName, "DIV");
  assert.equal(bare.className, "");
  assert.equal(bare.textContent, "");

  const full = api.el("p", "x", "hello");
  assert.equal(full.className, "x");
  assert.equal(full.textContent, "hello");
});

test("text is set as text, so markup in a blurb cannot break the page", () => {
  const { api } = load();
  const card = api.cardFor({ ...FULL, blurb: '<img src=x onerror="boom()">' });
  const blurb = card.querySelector(".card__blurb");
  assert.equal(blurb.querySelector("img"), null, "blurb must not parse as HTML");
  assert.match(blurb.textContent, /onerror/);
});

test("an internal link stays in this tab; an external one opens a new one", () => {
  const { api } = load();

  const internal = api.linkTo("moodwalk.html", "Case study", "primary", true);
  assert.equal(internal.getAttribute("target"), null);
  assert.equal(internal.getAttribute("rel"), null);

  const external = api.linkTo("https://example.test/", "Live site", "muted");
  assert.equal(external.getAttribute("target"), "_blank");
  assert.equal(external.getAttribute("rel"), "noopener");
});

test("the two arrows differ, so a link that leaves the site looks like one", () => {
  const { api } = load();
  const d = (a) => [...a.querySelectorAll("path")].map((p) => p.getAttribute("d"));
  assert.notDeepEqual(
    d(api.linkTo("a.html", "A", "primary", true)),
    d(api.linkTo("https://b.test/", "B", "muted"))
  );
});

test("a screenshot becomes an img; without one the initials show instead", () => {
  const { api } = load();

  const shot = api.thumbFor(FULL);
  const img = shot.querySelector("img");
  assert.ok(img, "a project with an image should render one");
  assert.equal(img.getAttribute("src"), "images/example.jpg");
  assert.equal(img.getAttribute("alt"), "Screenshot of Example");
  // The property, not the attribute: jsdom does not reflect `loading` to one.
  assert.equal(img.loading, "lazy");

  const { image, ...noImage } = FULL;
  const placeholder = api.thumbFor(noImage);
  assert.equal(placeholder.querySelector("img"), null);
  assert.equal(placeholder.querySelector(".card__initials").textContent, "EX");
});

test("a live URL earns the status pill", () => {
  const { api } = load();
  const card = api.cardFor(FULL);
  assert.ok(card.querySelector(".card__status"));
  assert.match(card.querySelector(".card__status").textContent, /Live/);
});

// README: "The card drops the 'Live site' link and the green 'Live' pill on
// its own, so there are no dead buttons."
test("no live URL means no pill and no dead button", () => {
  const { api } = load();
  const { live, ...offline } = FULL;
  const card = api.cardFor(offline);

  assert.equal(card.querySelector(".card__status"), null, "no pill without a live URL");
  assert.ok(!linkLabels(card).includes("Live site"), "no link to a site that isn't there");
});

// README: "The card grows a 'Case study' link, which becomes its primary one
// and opens in the same tab. Everything else still opens in a new one."
test("a case study takes the primary link and demotes the live site", () => {
  const { api } = load();
  const card = api.cardFor(FULL);
  const links = [...card.querySelectorAll(".card__link")];

  assert.equal(links[0].textContent.trim(), "Case study", "case study comes first");
  assert.ok(links[0].classList.contains("card__link--primary"));
  assert.equal(links[0].getAttribute("target"), null, "stays in this tab");

  const liveLink = links.find((a) => a.textContent.includes("Live site"));
  assert.ok(liveLink.classList.contains("card__link--muted"), "live site is demoted");
  assert.equal(liveLink.getAttribute("target"), "_blank");
});

test("without a case study the live site is the primary link", () => {
  const { api } = load();
  const { caseStudy, ...noWriteUp } = FULL;
  const card = api.cardFor(noWriteUp);
  const links = [...card.querySelectorAll(".card__link")];

  assert.equal(links[0].textContent.trim(), "Live site");
  assert.ok(links[0].classList.contains("card__link--primary"));
});

test("the team credit appears only when there is one", () => {
  const { api } = load();
  assert.equal(api.cardFor(FULL).querySelector(".card__team").textContent, "Team of 3");

  const { team, ...solo } = FULL;
  assert.equal(api.cardFor(solo).querySelector(".card__team"), null);
});

test("a project with neither pill nor credit gets no meta row at all", () => {
  const { api } = load();
  const { live, team, ...bare } = FULL;
  assert.equal(api.cardFor(bare).querySelector(".card__meta"), null);
});

test("every tag becomes a list item", () => {
  const { api } = load();
  const tags = [...api.cardFor(FULL).querySelectorAll(".card__tags .tag")];
  assert.deepEqual(tags.map((t) => t.textContent), ["Rails 8", "PostgreSQL"]);
});

test("render() fills the grid and counts what has shipped", () => {
  const { api } = load(
    '<!doctype html><body><div data-projects></div><p data-project-count></p></body>'
  );
  api.render();

  const cards = document.querySelectorAll("[data-projects] .card");
  assert.equal(cards.length, api.PROJECTS.length);

  const shipped = api.PROJECTS.filter((p) => p.live).length;
  assert.equal(
    document.querySelector("[data-project-count]").textContent,
    `${shipped} shipped · more on the way`
  );
});

test("render() does nothing on a page with no grid", () => {
  const { api } = load();
  assert.doesNotThrow(() => api.render());
});

test("render() replaces the grid rather than appending to it", () => {
  const { api } = load(
    '<!doctype html><body><div data-projects><p id="stale">stale</p></div></body>'
  );
  api.render();
  const grid = document.querySelector("[data-projects]");
  assert.equal(grid.querySelector("#stale"), null, "old contents should be gone");
  assert.equal(grid.children.length, api.PROJECTS.length);
});

// The data is content, but a typo here ships a broken card, so it is checked
// like anything else.
test("every project has the fields the card needs", () => {
  const { api } = load();
  for (const project of api.PROJECTS) {
    for (const field of ["name", "blurb", "tags", "initials"]) {
      assert.ok(project[field], `${project.name || "a project"} is missing ${field}`);
    }
    assert.ok(Array.isArray(project.tags) && project.tags.length, `${project.name}: tags`);
  }
});

test("every file a project points at actually exists", () => {
  const { api } = load();
  for (const project of api.PROJECTS) {
    for (const field of ["image", "caseStudy"]) {
      if (!project[field]) continue;
      const target = path.join(ROOT, project[field]);
      assert.ok(fs.existsSync(target), `${project.name}: ${field} -> ${project[field]} is missing`);
    }
  }
});
