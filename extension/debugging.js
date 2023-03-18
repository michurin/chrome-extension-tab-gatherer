async function init() {
  const e = document.getElementsByTagName('pre')[0];
  e.innerText = `Borowser information: ${navigator.userAgent}\n
Extension id: ${chrome.runtime.id}\n
Last error: ${chrome.runtime.lastError}\n
Extension actual information:\n\n${JSON.stringify(chrome.runtime.getManifest(), null, 2)}\n
Storage content:\n\n${JSON.stringify(await chrome.storage.local.get(null), null, 2)}\n
Tabs:\n\n${JSON.stringify(await chrome.tabs.query({}), null, 2)}\n
Reporting date: ${new Date()}`;
}

init();
