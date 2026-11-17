import { getDisabledHosts, setSiteEnabled } from './sites.js';

const hostLabel = document.getElementById('host');
const favicon = document.getElementById('favicon');
const toggle = document.getElementById('toggle');
const reload = document.getElementById('reload');

// Only http and https pages can be switched; chrome:// and file pages have no host.
const hostOf = (url) => {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'http:' || protocol === 'https:' ? hostname : '';
  } catch {
    return '';
  }
};

// Whether the loaded page currently carries inject.js: its getter replaces the native one.
const isPagePatched = async (tabId) => {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () =>
      !Object.getOwnPropertyDescriptor(Document.prototype, 'hidden')
        .get.toString()
        .includes('[native code]'),
  });
  return result;
};

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const host = hostOf(tab?.url);

reload.textContent = chrome.i18n.getMessage('reloadPage');

if (!host) {
  hostLabel.textContent = chrome.i18n.getMessage('unavailable');
  toggle.disabled = true;
} else {
  const enabled = !(await getDisabledHosts()).includes(host);
  // If the page cannot be inspected, assume it matches the saved setting.
  const pagePatched = await isPagePatched(tab.id).catch(() => enabled);

  // The page keeps its old state until it reloads.
  const showReloadIfStale = () => {
    reload.hidden = toggle.checked === pagePatched;
  };

  hostLabel.textContent = host;
  toggle.checked = enabled;
  toggle.setAttribute('aria-label', host);
  showReloadIfStale();

  if (tab.favIconUrl) {
    favicon.addEventListener('error', () => (favicon.hidden = true));
    favicon.src = tab.favIconUrl;
    favicon.hidden = false;
  }

  // Quick repeated clicks are applied one after another, never interleaved.
  let pending = Promise.resolve();
  toggle.addEventListener('change', () => {
    const target = toggle.checked;
    pending = pending.then(async () => {
      try {
        await setSiteEnabled(host, target);
      } catch {
        // Chrome rejected the host; the switch snaps back to show nothing changed.
        toggle.checked = !target;
      }
      showReloadIfStale();
    });
  });

  reload.addEventListener('click', async () => {
    await chrome.tabs.reload(tab.id);
    window.close();
  });
}
