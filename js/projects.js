// =============================================================================
// THE ONLY FILE YOU NEED TO EDIT TO ADD A PROJECT.
//
// Copy one { ... } block, paste it, change the values. The grid, the layout and
// the styling all take care of themselves. Newest first is a good default.
//
// Fields:
//   name        Project title.                                      (required)
//   blurb       One or two sentences. What it does, for whom.       (required)
//   tags        Tech worth advertising. Three or four is plenty.    (required)
//   initials    Shown on the card until you add a screenshot.       (required)
//   live        URL of the deployed app. OMIT IT if there isn't one
//               -- the card drops the "Live site" link and the
//               status pill by itself, no dead buttons.             (optional)
//   repo        URL of the source.                                  (optional)
//   team        Credit line, e.g. "Team of 3". Omit on solo work.    (optional)
//   image       Screenshot path, e.g. "images/moodwalk.png". Omit
//               it and the card shows `initials` instead.           (optional)
//   caseStudy   Path to a write-up page on this site, e.g.
//               "moodwalk.html". Adds a "Case study" link, which
//               becomes the card's primary one.                     (optional)
// =============================================================================

const PROJECTS = [
  {
    name: "Moodwalk",
    blurb:
      "Generates a walking route near you from how you want to feel, guides you along it turn by " +
      "turn while tracking the path you actually take, then logs your mood and a reflection. " +
      "Finished walks can be shared to a community feed.",
    tags: ["Rails 8", "PostGIS", "Mapbox", "Google Places"],
    initials: "MW",
    image: "images/moodwalk.jpg",
    caseStudy: "moodwalk.html",
    live: "https://moodwalk-ec6251edd332.herokuapp.com/",
    repo: "https://github.com/cura-yjk/moodwalk",
    team: "Team of 3"
  },
  {
    name: "Pera Flash",
    blurb:
      "A Japanese tutor you chat with. Pera corrects your sentences and explains the grammar, " +
      "then turns the conversation into flashcards you review on a spaced-repetition schedule, " +
      "quiz yourself on, and export to Anki. Interface in six languages.",
    tags: ["Rails 8", "Gemini", "Hotwire", "PostgreSQL"],
    initials: "PF",
    image: "images/pera-flash.jpg",
    live: "https://pera-flash-3683e7b80a56.herokuapp.com/",
    repo: "https://github.com/cura-yjk/pera-flash",
    team: "Team of 3"
  }
];

// -----------------------------------------------------------------------------
// Rendering. You should not need to touch anything below this line.
// -----------------------------------------------------------------------------

// Everything from PROJECTS reaches the page as a text node or via setAttribute,
// never innerHTML, so a stray < or & in a blurb renders as a character instead
// of breaking the markup.
const svgNS = "http://www.w3.org/2000/svg";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Two arrows, because the links no longer all do the same thing: out-of-page
// for anything that leaves the site, straight ahead for a page on it.
function arrowIcon(internal) {
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2.4");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const paths = internal ? ["M5 12h14", "m12 5 7 7-7 7"] : ["M7 17 17 7", "M9 7h8v8"];
  for (const d of paths) {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  }
  return svg;
}

function linkTo(url, label, variant, internal) {
  const a = el("a", `card__link card__link--${variant}`);
  a.href = url;
  a.append(label, arrowIcon(internal));
  // A case study is a page on this site; everything else leaves it, and a link
  // that leaves gets a new tab so the grid is still there to come back to.
  if (!internal) {
    a.target = "_blank";
    a.rel = "noopener";
  }
  a.setAttribute("aria-label", label);
  return a;
}

function thumbFor(project) {
  if (project.image) {
    const img = el("img", "card__shot");
    img.src = project.image;
    img.alt = `Screenshot of ${project.name}`;
    img.loading = "lazy";
    const figure = el("div", "card__thumb card__thumb--shot");
    figure.appendChild(img);
    return figure;
  }
  const thumb = el("div", "card__thumb");
  thumb.appendChild(el("span", "card__initials", project.initials));
  return thumb;
}

function cardFor(project) {
  const card = el("article", "card");
  card.appendChild(thumbFor(project));

  const body = el("div", "card__body");

  // The status pill is a claim that the thing is running. Only a project with a
  // live URL gets to make it. The credit sits beside it so a team project says
  // so before anyone opens the repo and counts contributors.
  const meta = el("div", "card__meta");
  if (project.live) {
    const status = el("span", "card__status");
    status.append(el("span", "card__dot"), el("span", null, "Live"));
    meta.appendChild(status);
  }
  if (project.team) meta.appendChild(el("span", "card__team", project.team));
  if (meta.childElementCount) body.appendChild(meta);

  body.appendChild(el("h3", "card__name", project.name));
  body.appendChild(el("p", "card__blurb", project.blurb));

  const tags = el("ul", "card__tags");
  for (const tag of project.tags) tags.appendChild(el("li", "tag", tag));
  body.appendChild(tags);

  const links = el("div", "card__links");
  if (project.caseStudy) {
    links.appendChild(linkTo(project.caseStudy, "Case study", "primary", true));
  }
  if (project.live) {
    links.appendChild(linkTo(project.live, "Live site", project.caseStudy ? "muted" : "primary"));
  }
  if (project.repo) links.appendChild(linkTo(project.repo, "Code", "muted"));
  if (links.childElementCount) body.appendChild(links);

  card.appendChild(body);
  return card;
}

function render() {
  const grid = document.querySelector("[data-projects]");
  if (!grid) return;

  const fragment = document.createDocumentFragment();
  for (const project of PROJECTS) fragment.appendChild(cardFor(project));

  grid.replaceChildren(fragment);

  const count = document.querySelector("[data-project-count]");
  if (count) {
    const shipped = PROJECTS.filter((p) => p.live).length;
    count.textContent = `${shipped} shipped · more on the way`;
  }
}

document.addEventListener("DOMContentLoaded", render);
