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

  Object.keys(naming).forEach((k) => {
    if (!k.startsWith('D')) {
      return;
    }
    const tr = document.createElement('tr');
    tr.append(close(tr, k), td(k.substring(1)), td(naming[k].title), td(naming[k].color));
    table.append(tr);
  });

  document.body.insertBefore(table, document.getElementsByTagName('script')[0]);
}

init();
