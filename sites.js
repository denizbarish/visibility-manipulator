// The list of switched-off sites lives in storage; the registered content
// script is rebuilt from it so excluded sites never receive inject.js.
const SCRIPT_ID = 'visibility';

export async function getDisabledHosts() {
  const { disabledHosts = [] } = await chrome.storage.local.get('disabledHosts');
  return disabledHosts;
}

export async function registerScript(hosts) {
  const script = {
    id: SCRIPT_ID,
    js: ['inject.js'],
    matches: ['<all_urls>'],
    excludeMatches: hosts.map((host) => `*://${host}/*`),
    runAt: 'document_start',
    world: 'MAIN',
    allFrames: true,
    matchOriginAsFallback: true,
  };
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
  if (existing.length) {
    await chrome.scripting.updateContentScripts([script]);
  } else {
    await chrome.scripting.registerContentScripts([script]);
  }
}

export async function setHostsEnabled(hosts, enabled) {
  const disabled = new Set(await getDisabledHosts());
  for (const host of hosts) {
    if (enabled) disabled.delete(host);
    else disabled.add(host);
  }
  // Register first: a host Chrome rejects as a match pattern must never be saved,
  // or every later registration would fail.
  await registerScript([...disabled]);
  await chrome.storage.local.set({ disabledHosts: [...disabled] });
}

// Tab-sized fullscreen is opt-in per site; fullscreen-config.js reads this list live.
export async function getFullscreenHosts() {
  const { fullscreenHosts = [] } = await chrome.storage.local.get('fullscreenHosts');
  return fullscreenHosts;
}

export async function setFullscreenEnabled(hosts, enabled) {
  const active = new Set(await getFullscreenHosts());
  for (const host of hosts) {
    if (enabled) active.add(host);
    else active.delete(host);
  }
  await chrome.storage.local.set({ fullscreenHosts: [...active] });
}
