import {
  getDisabledHosts,
  getFullscreenHosts,
  setFullscreenEnabled,
  setHostsEnabled,
} from './sites.js';

const tabList = document.getElementById('tabs');
const panel = document.getElementById('panel');
const list = document.getElementById('sites');
const empty = document.getElementById('empty');
const allButton = document.getElementById('all');
const reload = document.getElementById('reload');
const t = chrome.i18n.getMessage;

const svg = (viewBox, strokeWidth, body) =>
  `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

// Each setting has its own tab, its own site list state and its own switch drawing.
const MODES = {
  vis: {
    label: t('tabVisibility'),
    glyph: svg('0 0 36 26', 2.6, '<path class="lid" d="M3 13C9 3 27 3 33 13"/><path d="M3 13C9 23 27 23 33 13"/>' +
        '<circle class="iris" cx="18" cy="13" r="4.2"/>' +
        '<path class="lashes" d="M10.5 19.8 9.2 22.8M18 21.2v3.4M25.5 19.8l1.3 3"/>'),
    save: setHostsEnabled,
  },
  fs: {
    label: t('tabFullscreen'),
    glyph: svg(
      '0 0 36 26',
      2.6,
      '<path class="corner" d="M5 10V4h7"/><path class="corner" d="M24 4h7v6"/>' +
        '<path class="corner" d="M31 16v6h-7"/><path class="corner" d="M12 22H5v-6"/>'
    ),
    save: setFullscreenEnabled,
  },
};
let mode = 'vis';

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

const [disabledHosts, fullscreenHosts, [activeTab], allTabs] = await Promise.all([
  getDisabledHosts(),
  getFullscreenHosts(),
  chrome.tabs.query({ active: true, currentWindow: true }),
  chrome.tabs.query({}),
]);
const activeHost = hostOf(activeTab?.url);

// One row per site, however many tabs it has open. The current tab's site comes first.
const byHost = new Map();
for (const tab of allTabs) {
  const host = hostOf(tab.url);
  if (!host) continue;
  if (!byHost.has(host)) {
    byHost.set(host, {
      host,
      tabs: [],
      vis: !disabledHosts.includes(host),
      fs: fullscreenHosts.includes(host),
      switch: null,
    });
  }
  byHost.get(host).tabs.push(tab);
}
const sites = [...byHost.values()].sort((a, b) => (b.host === activeHost) - (a.host === activeHost));

// Sleeping or still-loading tabs cannot be inspected; they pick up the settings when they load.
const patchedByTab = new Map();
const reachableByTab = new Map();
await Promise.all(
  sites.flatMap((site) =>
    site.tabs
      .filter((tab) => !tab.discarded && tab.status === 'complete')
      .map(async (tab) => {
        try {
          patchedByTab.set(tab.id, await isPagePatched(tab.id));
        } catch {
          // Not inspectable (for example a blocked page): treat it as up to date.
          return;
        }
        // No answer means the tab was opened before the extension was installed or updated.
        reachableByTab.set(tab.id, await chrome.tabs.sendMessage(tab.id, 'vm-ping').then(() => true, () => false));
      })
  )
);

// A tab keeps its old visibility state until it reloads. Fullscreen applies live,
// except in tabs that the extension's scripts never reached.
const isStale = {
  vis: (site, tab) => patchedByTab.has(tab.id) && patchedByTab.get(tab.id) !== site.vis,
  fs: (site, tab) => site.fs && reachableByTab.get(tab.id) === false,
};
const staleTabs = () =>
  sites.flatMap((site) => site.tabs.filter((tab) => isStale[mode](site, tab)));

const refresh = () => {
  for (const tab of tabList.children) {
    const key = tab.dataset.mode;
    tab.setAttribute('aria-selected', key === mode);
    tab.tabIndex = key === mode ? 0 : -1;
    tab.querySelector('.count').textContent = sites.filter((site) => site[key]).length;
  }
  panel.dataset.mode = mode;
  panel.setAttribute('aria-labelledby', `tab-${mode}`);
  for (const site of sites) site.switch.setAttribute('aria-checked', site[mode]);
  allButton.textContent = t(sites.some((site) => site[mode]) ? 'turnAllOff' : 'turnAllOn');
  reload.hidden = staleTabs().length === 0;
};

// Changes are applied one after another, never interleaved.
let pending = Promise.resolve();
const apply = (targets, nextState) => {
  const key = mode;
  pending = pending.then(async () => {
    // Decided only now, so a quick second click undoes the first.
    const enabled = nextState(key);
    try {
      await MODES[key].save(targets.map((site) => site.host), enabled);
      for (const site of targets) site[key] = enabled;
    } catch {
      // Chrome rejected a host; refresh() puts the switches back.
    }
    refresh();
  });
};

const showMode = (next) => {
  mode = next;
  // Swap the drawing with the switch already in its final state, so only clicks animate.
  for (const site of sites) {
    site.switch.setAttribute('aria-checked', site[mode]);
    site.switch.innerHTML = MODES[mode].glyph;
  }
  refresh();
};

for (const [key, { label }] of Object.entries(MODES)) {
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'tab';
  tab.setAttribute('role', 'tab');
  tab.dataset.mode = key;
  tab.id = `tab-${key}`;
  tab.setAttribute('aria-controls', 'panel');
  const name = document.createElement('span');
  name.textContent = label;
  const count = document.createElement('span');
  count.className = 'count';
  tab.append(name, count);
  tab.addEventListener('click', () => showMode(key));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const other = key === 'vis' ? 'fs' : 'vis';
    showMode(other);
    document.getElementById(`tab-${other}`).focus();
  });
  tabList.append(tab);
}

for (const site of sites) {
  const row = document.createElement('li');
  row.className = site.host === activeHost ? 'row current' : 'row';

  // Sites without an icon get a lettered tile, so every name starts on the same line.
  const tile = document.createElement('span');
  tile.className = 'tile';
  tile.textContent = site.host.replace(/^www\./, '').charAt(0);
  const favIconUrl = site.tabs.find((tab) => tab.favIconUrl)?.favIconUrl;
  if (favIconUrl) {
    const icon = document.createElement('img');
    icon.alt = '';
    icon.addEventListener('load', () => tile.replaceWith(icon));
    icon.src = favIconUrl;
  }
  row.append(tile);

  const name = document.createElement('span');
  name.className = 'host';
  name.textContent = site.host;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'glyph';
  button.setAttribute('role', 'switch');
  button.setAttribute('aria-label', site.host);
  button.addEventListener('click', () => apply([site], (key) => !site[key]));
  site.switch = button;

  row.append(name, button);
  list.append(row);
}

reload.textContent = t('reloadPages');
const sponsor = document.getElementById('sponsor');
sponsor.title = t('sponsor');
sponsor.setAttribute('aria-label', t('sponsor'));

if (sites.length === 0) {
  empty.textContent = t('noSites');
  empty.hidden = false;
} else {
  allButton.hidden = false;
  allButton.addEventListener('click', () => apply(sites, (key) => !sites.some((site) => site[key])));
  reload.addEventListener('click', async () => {
    await pending;
    await Promise.all(staleTabs().map((tab) => chrome.tabs.reload(tab.id)));
    window.close();
  });
}
showMode('vis');
