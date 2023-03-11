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
  },
};

vm.runInNewContext(code, global);

// ----------------- tests -----------------

const fails = [];

[
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
].forEach(([domain, expectation], n) => {
  const actual = global.canonicalName(domain);
  if (actual !== expectation) {
    fails.push(`case ${n}: domain=${domain}: ${actual} (${expectation} expected)`);
  }
});

// TODO call em
// console.log(global.chrome.tabs.onCreated.f)
// console.log(global.chrome.tabs.onUpdated.f)

if (fails.length) {
  fails.forEach((m) => { console.log(`FAIL: ${m}`); });
  process.exit(1);
}
console.log('OK');
