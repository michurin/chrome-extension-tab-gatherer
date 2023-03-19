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

async function init() {
  const naming = await chrome.storage.local.get(null);

  const table = document.createElement('table');
  const head = document.createElement('tr');
  head.append(th(''), th('Domain'), th('Abbr'), th('Color'));
  table.append(head);

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

  rows.sort((a, b) => {
    if (a.title < b.title) { return -1; }
    if (a.title > b.title) { return 1; }
    if (a.domain < b.domain) { return -1; }
    if (a.domain > b.domain) { return 1; }
    return 0;
  });

  rows.forEach((x) => {
    const tr = document.createElement('tr');
    tr.append(close(tr, x.key), td(x.domain), td(x.title), td(x.color));
    table.append(tr);
  });

  document.body.insertBefore(table, document.getElementsByTagName('script')[0]);
}

init();
