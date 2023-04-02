// I'm not true js developer, it looks jest enable to test pure single file scripts.
// So, I write this micro runner

const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync(`${__dirname}/../extension/background.js`, { encoding: 'utf8', flag: 'r' });

const global = {
  // console: console,
  console: undefined,
  chrome: {
    tabs: {
      onUpdated: { addListener(f) { this.f = f; } },
      onCreated: { addListener(f) { this.f = f; } },
    },
    tabGroups: {
      onUpdated: { addListener(f) { this.f = f; } },
      onRemoved: { addListener(f) { this.f = f; } },
    },
    storage: {
      local: {
        get([k]) {
          return { 'Dmichurin.github.io': { 'Dmichurin.github.io': { title: 'morn', color: 'red' } } }[k] || {};
        },
      },
    },
  },
};

vm.runInNewContext(code, global);

function print(...a) { console.log(...a); } // eslint-disable-line no-console

// ----------------- tests -----------------

async function main() { // wrapper for async calls
  const fails = (await Promise.all([
    // corner cases
    ['', 'noname'],
    ['com', 'com'],
    ['window', 'wndw'],
    ['www.com', 'www'],
    ['team.google', 'team┆ggl'],
    // remove boring parts and simple abbr
    ['www.anchor.com', 'anchr'],
    ['www1.site.support.anchor.com', 'sprt┆anchr'], // keep two longest
    ['support.anchor.city', 'sprt┆anchr'],
    // avoid too short parts
    ['axaaaa.city', 'axaa┆city'],
    ['qqq.aa.city', 'qqq┆city'], // aa too short, q too short so we keep qqq
    ['atatatata.city', 'attt┆city'],
  ].map(async ([domain, expectation], n) => { // TODO it seems async we do not need async here
    const actual = global.tabAbbrName(domain);
    if (actual !== expectation) {
      return `case ${n}: domain=${domain}: ${actual} (${expectation} expected)`;
    }
    return false;
  }))).filter((x) => x);

  if (fails.length) {
    fails.forEach((m) => { print(`FAIL: ${m}`); });
    process.exit(1);
  }

  // TODO call em
  // console.log(global.chrome.tabs.onCreated.f)
  // console.log(global.chrome.tabs.onUpdated.f)
  // etc

  print('OK');
}

main();
