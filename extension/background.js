// storage

async function storageSet(prefix, d, val) {
  const k = prefix + d;
  const v = {};
  v[k] = val;
  await chrome.storage.local.set(v);
}

async function storageGet(prefix, d) {
  const k = prefix + d;
  const x = await chrome.storage.local.get([k]);
  if (x && x[k]) {
    return x[k];
  }
  return undefined;
}

async function domainSet(d, title, color) { await storageSet('D', d, { title, color }); }
async function domainGet(d) { return await storageGet('D', d); }

async function suggestSet(k, title, color) { await storageSet('S', k, { title, color }); }
async function suggestGet(k) { return await storageGet('S', k); }
async function suggestRemove(k) { await chrome.storage.local.remove(`S${k}`); }

async function countIncr() {
  const t = await storageGet('N', '') || 0;
  await storageSet('N', '', (t + 1) % 9);
  return t;
}

// suggestions

async function tabCustom(h) {
  if (h) { // empty strings, undefs, etc
    const preset = await domainGet(h);
    if (preset) {
      return preset;
    }
  }
  return {};
}

function tabAbbrName(h) {
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

async function tabNextColor() {
  return ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'][await countIncr()];
}

// events

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
    let { title, color } = await tabCustom(host);
    if (!(title && color)) {
      title = tabAbbrName(host);
      color = await tabNextColor();
      // Unfortunately Chrome provides very limited information in tagGroups events. We have to
      // store "known" tabs, to be able to skip not related updates.
      await suggestSet(newGroupId, title, color); // see comment in onGroupUpdated
    }
    await chrome.tabGroups.update(newGroupId, { title, color }); // tabGroups required
  }
}

async function onCreated(tab) {
  // TODO it seems, there is no races onCreated and onUpdated,
  // however, it will be nice to check tab.url and if it is not empty, find target group as if this tab was ungrouped and group/ungoup
  await chrome.tabs.ungroup(tab.id); // TODO make it setupable: ungroup every tab, ungroup some hosts, do not ungroup...
}

async function onGroupUpdated(group) {
  if (!(group.id && group.title && group.color)) {
    // It is important to check group.title. It seems, Chrome creates tab in this way:
    // - creates
    // - updates color: it fires update event with empty title, we have to skip it
    // - then we update title and it fires next update, however, it is skipped thanks to autoGroupSettings
    // the last point is the reason why we have to setup both title and color when we are establishing new tab
    return;
  }
  const inf = await suggestGet(group.id);
  if (inf && inf.title === group.title && inf.color === group.color) {
    // inf is empty if the group was created manually, or has already touched
    return; // skip all not related changes
  }
  await suggestRemove(group.id); // save all further changes
  const allInGroup = await chrome.tabs.query({ groupId: group.id });
  const domains = {};
  allInGroup.forEach((x) => {
    if (!x.url) {
      return; // skip not loaded tabs
    }
    const url = new URL(x.url);
    if (!url.protocol.startsWith('http')) { // cover both http and https (TODO code repetition)
      return;
    }
    domains[url.host] = true;
  });
  Object.keys(domains).forEach((k) => {
    domainSet(k, group.title, group.color);
  });
}

function onGroupRemoved(group) {
  delete suggestRemove(group.id); // cleanup; just to avoid autoGroupSettings leaking
}

chrome.tabs.onUpdated.addListener(onUpdated);
chrome.tabs.onCreated.addListener(onCreated);
chrome.tabGroups.onUpdated.addListener(onGroupUpdated);
chrome.tabGroups.onRemoved.addListener(onGroupRemoved);
