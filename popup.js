import { getDisabledHosts, setHostsEnabled } from './sites.js';

const list = document.getElementById('sites');
const empty = document.getElementById('empty');
const allButton = document.getElementById('all');
const reload = document.getElementById('reload');
const t = chrome.i18n.getMessage;

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

const disabled = new Set(await getDisabledHosts());
const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
const activeHost = hostOf(activeTab?.url);

// One row per site, however many tabs it has open. The current tab's site comes first.
const sites = new Map();
for (const tab of await chrome.tabs.query({})) {
  const host = hostOf(tab.url);
  if (!host) continue;
  if (!sites.has(host)) sites.set(host, { host, enabled: !disabled.has(host), tabs: [], switch: null });
  sites.get(host).tabs.push(tab);
}
const ordered = [...sites.values()].sort((a, b) => (b.host === activeHost) - (a.host === activeHost));

// Sleeping or still-loading tabs cannot be inspected; they pick up the setting when they load.
const patchedByTab = new Map();
await Promise.all(
  ordered.flatMap((site) =>
    site.tabs
      .filter((tab) => !tab.discarded && tab.status === 'complete')
      .map(async (tab) => {
        try {
          patchedByTab.set(tab.id, await isPagePatched(tab.id));
        } catch {
          // Not inspectable (for example a blocked page): treat it as up to date.
        }
      })
  )
);

// A tab keeps its old state until it reloads.
const staleTabs = () =>
  ordered.flatMap((site) =>
    site.tabs.filter((tab) => patchedByTab.has(tab.id) && patchedByTab.get(tab.id) !== site.enabled)
  );

const refresh = () => {
  for (const site of ordered) site.switch.checked = site.enabled;
  const anyEnabled = ordered.some((site) => site.enabled);
  allButton.textContent = t(anyEnabled ? 'turnAllOff' : 'turnAllOn');
  reload.hidden = staleTabs().length === 0;
};

// Changes are applied one after another, never interleaved.
let pending = Promise.resolve();
const apply = (targets, enabled) => {
  pending = pending.then(async () => {
    try {
      await setHostsEnabled(targets.map((site) => site.host), enabled);
      for (const site of targets) site.enabled = enabled;
    } catch {
      // Chrome rejected a host; refresh() puts the switches back.
    }
    refresh();
  });
};

for (const site of ordered) {
  const row = document.createElement('li');
  const label = document.createElement('label');
  const name = document.createElement('span');
  const input = document.createElement('input');

  const favIconUrl = site.tabs.find((tab) => tab.favIconUrl)?.favIconUrl;
  if (favIconUrl) {
    const icon = document.createElement('img');
    icon.width = icon.height = 16;
    icon.alt = '';
    icon.addEventListener('error', () => icon.remove());
    icon.src = favIconUrl;
    label.append(icon);
  }

  name.textContent = site.host;
  input.type = 'checkbox';
  input.setAttribute('role', 'switch');
  input.setAttribute('aria-label', site.host);
  input.addEventListener('change', () => apply([site], input.checked));
  site.switch = input;

  if (site.host === activeHost) row.classList.add('current');
  label.append(name, input);
  row.append(label);
  list.append(row);
}

reload.textContent = t('reloadPages');

if (ordered.length === 0) {
  empty.textContent = t('noSites');
  empty.hidden = false;
} else {
  allButton.hidden = false;
  allButton.addEventListener('click', () =>
    apply(ordered, !ordered.some((site) => site.enabled))
  );
  reload.addEventListener('click', async () => {
    await pending;
    await Promise.all(staleTabs().map((tab) => chrome.tabs.reload(tab.id)));
    window.close();
  });
  refresh();
}
