// Tests for the stylesheets' responsive rules.
//
// The rule under test is the one the layout depends on but cannot state in
// CSS: an `auto-fit` grid whose track minimum is a bare pixel value will
// demand that width even when its container is narrower, and the page scrolls
// sideways. Wrapping the minimum in `min(..., 100%)` lets the track shrink
// with the container instead. css/components/case-study.css already does this;
// this test keeps the rest of the CSS honest about it.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");

const SHEETS = [
  path.join("css", "style.css"),
  path.join("css", "components", "card.css"),
  path.join("css", "components", "case-study.css")
];

// repeat(auto-fit|auto-fill, minmax(<min>, ...)) -- we only care about <min>.
const REPEAT_MINMAX = /repeat\(\s*auto-(?:fit|fill)\s*,\s*minmax\(\s*([^,]+?)\s*,/g;

function offendersIn(relPath) {
  const css = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  const lines = css.split("\n");
  const found = [];
  lines.forEach((line, i) => {
    for (const match of line.matchAll(REPEAT_MINMAX)) {
      const min = match[1];
      // A bare length (300px, 20rem) cannot shrink; min(300px, 100%) can, and
      // so can a relative unit that is already container-based.
      if (/^\d+(\.\d+)?(px|rem|em|ch)$/.test(min)) {
        found.push(`${relPath}:${i + 1}  minmax(${min}, ...)`);
      }
    }
  });
  return found;
}

test("no auto-fit grid demands more width than its container", () => {
  const offenders = SHEETS.flatMap(offendersIn);
  assert.deepEqual(
    offenders,
    [],
    "these track minimums cannot shrink, so the page scrolls sideways on a " +
      "narrow phone; wrap each in min(..., 100%):\n  " + offenders.join("\n  ")
  );
});

test("the house idiom is actually in use where grids do wrap", () => {
  const clamped = SHEETS.flatMap((relPath) => {
    const css = fs.readFileSync(path.join(ROOT, relPath), "utf8");
    return [...css.matchAll(REPEAT_MINMAX)].map((m) => m[1]);
  });
  assert.ok(clamped.length > 0, "expected at least one auto-fit grid to exist");
  for (const min of clamped) {
    assert.match(
      min,
      /^min\(/,
      `track minimum ${min} should be written as min(${min}, 100%)`
    );
  }
});
