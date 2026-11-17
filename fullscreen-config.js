// Runs in the extension's isolated world, where storage is available, and tells
// fullscreen.js (in the page's world) whether this site has the setting on.
// The setting belongs to the site in the address bar, so frames follow the top page.
const topHost = (() => {
  const origins = location.ancestorOrigins;
  if (origins.length === 0) return location.hostname;
  try {
    return new URL(origins[origins.length - 1]).hostname;
  } catch {
    // A sandboxed top page reports the origin "null"; treat it as a site with the setting off.
    return '';
  }
})();

const apply = (hosts = []) => {
  window.dispatchEvent(new Event(hosts.includes(topHost) ? 'vm-fullscreen-on' : 'vm-fullscreen-off'));
};

chrome.storage.local.get('fullscreenHosts').then(({ fullscreenHosts }) => apply(fullscreenHosts));
chrome.storage.onChanged.addListener((changes) => {
  if (changes.fullscreenHosts) apply(changes.fullscreenHosts.newValue);
});

// Lets the popup find tabs that were opened before the extension was installed
// or updated: they have no working copy of this script and need a reload.
chrome.runtime.onMessage.addListener((message, _sender, reply) => {
  if (message === 'vm-ping') reply(true);
});
