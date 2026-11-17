import { getDisabledHosts, registerScript } from './sites.js';

// Fires on install and on every update, which is when Chrome drops
// dynamically registered content scripts.
chrome.runtime.onInstalled.addListener(async () => registerScript(await getDisabledHosts()));
