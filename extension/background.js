function canonicalName(h) {
  // TODO has to be testes carefully: empty names, different number of parts...
  const p = h.split('.');
  if (p.length > 1) {
    const d = p[p.length - 2].toLowerCase();
    return (d.substring(0, 1) + d.substring(1).replace(/[^bcdfghjklmnpqrstvwxz]/g, '')) || d || h; // remove vowels
  }
  return h; // TODO consider this fallback
}

async function move(tabId, tabUpdate, activeInfo) {
  if (!tabUpdate.url) {
    return;
  }
  const url = new URL(tabUpdate.url);
  if (!url.protocol.startsWith('http')) { // both http and https
    return;
  }
  const { host } = url;
  const allInWindow = await chrome.tabs.query({ windowId: activeInfo.windowId });
  const locator = {};
  const similar = [tabId];
  allInWindow.forEach((x) => {
    if (x.id === tabId) { // skip itself
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

function create(tab) {
  chrome.tabs.ungroup(tab.id); // TODO make it setupable
}

chrome.tabs.onUpdated.addListener(move);
chrome.tabs.onCreated.addListener(create);
