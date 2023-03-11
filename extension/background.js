function canonicalName(h) {
  if (!h) { // empty strings, undefs, etc
    return 'noname';
  }
  if (h.length <= 5) {
    return h.toLowerCase().replace('.', '┆'); // do not shrink extra short domains
  }
  let p = h.toLowerCase().split('.'); // can't return empty array as far as separator is not empty
  while (p.length > 1 && p[p.length - 1].length <= 3) {
    p.pop(); // remove TLD like .com, .en and even .org.uk (boring)
  }
  while (p.length > 1 && (p[0].startsWith('www') || p[0] === 'web' || p[0].length < 3)) {
    p.shift(); // remove www, www1..., web, and languages as en.wikipedia.org (boring)
  }
  if (p.length > 2) { // keep two longest parts
    const s = p.map((x) => x.length);
    s.sort();
    const th = s[s.length - 2];
    p = p.filter((x) => x.length >= th);
  }
  p = p.map((x) => {
    if (x.length <= 2) { // too short, keep untouched
      return x;
    }
    const y = x.substring(0, 1) + x.substring(1).replace(/[^bcdfghjklmnpqrstvwxz]/g, '');
    if (y.length <= 2) { // gets too short
      return x.substring(0, 4);
    }
    const z = y.replace(/(.)\1+/g, '$1');
    if (z.length <= 2) {
      return y.substring(0, 4);
    }
    return z.substring(0, 5);
  });
  return p.join('┆');
}

async function onUpdated(tabId, tabUpdate, activeInfo) {
  if (!(tabUpdate.url && activeInfo.windowId)) {
    return;
  }
  const url = new URL(tabUpdate.url);
  if (!url.protocol.startsWith('http')) { // cover both http and https
    return;
  }
  const { host } = url;
  const allInWindow = await chrome.tabs.query({ windowId: activeInfo.windowId });
  const locator = {};
  const similar = [tabId];
  allInWindow.forEach((x) => {
    if (!(x.id && x.groupId && x.url)) { // just skip if tab is not loaded or drugging right now
      return;
    }
    if (x.id === tabId) { // skip self
      return;
    }
    if ((new URL(x.url)).host === host) {
      if (x.groupId === -1) {
        similar.push(x.id);
      } else {
        locator[x.groupId] = (locator[x.groupId] || 0) + 1;
      }
    }
  });
  let targetGroup;
  let targetScore = 0;
  Object.keys(locator).forEach((k) => { // TODO pretty unstable way to figure out maximum score
    const v = locator[k];
    if (v > targetScore) {
      targetScore = v;
      targetGroup = +k; // as far as keys are always strings we are to cast they back to ints
    }
  });
  if (targetGroup !== undefined) {
    await chrome.tabs.group({ groupId: targetGroup, tabIds: [tabId] });
  } else if (similar.length > 1) {
    const newGroupId = await chrome.tabs.group({ tabIds: similar });
    chrome.tabGroups.update(newGroupId, { title: canonicalName(host) }); // tabGroups required
  }
}

function onCreated(tab) {
  chrome.tabs.ungroup(tab.id); // TODO make it setupable: ungroup every tab, ungroup some hosts, do not ungroup...
}

chrome.tabs.onUpdated.addListener(onUpdated);
chrome.tabs.onCreated.addListener(onCreated);
