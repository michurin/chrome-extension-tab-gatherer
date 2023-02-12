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
    await chrome.tabs.group({ tabIds: similar }); // TODO setup group?
  }
}

chrome.tabs.onUpdated.addListener(move);
