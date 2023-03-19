function element(n, t) {
  const x = document.createElement(n);
  x.innerText = t;
  return x;
}

function th(t) {
  return element('th', t);
}

function td(t) {
  return element('td', t);
}

function close(tr, k) {
  const x = td('✖');
  x.title = `remove ${k}`;
  x.style.cursor = 'pointer';
  x.onclick = () => {
    chrome.storage.local.remove(k);
    tr.remove();
  };
  return x;
}

function tableOfCustomNames(naming) {
  const rows = Object.keys(naming).map((k) => {
    if (!k.startsWith('D')) {
      return false;
    }
    const v = naming[k];
    return {
      key: k,
      domain: k.substring(1),
      title: v.title,
      color: v.color,
    };
  }).filter((x) => x);

  if (rows.length === 0) {
    return element('p', '(no custom names)');
  }

  rows.sort((a, b) => {
    if (a.title < b.title) { return -1; }
    if (a.title > b.title) { return 1; }
    if (a.domain < b.domain) { return -1; }
    if (a.domain > b.domain) { return 1; }
    return 0;
  });

  const table = document.createElement('table');
  const head = document.createElement('tr');
  head.append(th(''), th('Domain'), th('Abbr'), th('Color'));
  table.append(head);
  rows.forEach((x) => {
    const tr = document.createElement('tr');
    tr.append(close(tr, x.key), td(x.domain), td(x.title), td(x.color));
    table.append(tr);
  });
  return table;
}

async function init() {
  document.getElementById('ungroup').onclick = async () => {
    (await chrome.tabs.query({})).forEach((x) => chrome.tabs.ungroup(x.id));
  };
  document.body.insertBefore(tableOfCustomNames(await chrome.storage.local.get(null)), document.getElementById('custom_names').nextSibling);
}

init();
