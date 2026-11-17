// Runs in the page's own JS world at document_start, before any page script.
(() => {
  const pin = (name, value) =>
    Object.defineProperty(Document.prototype, name, { get: () => value, configurable: true });

  pin('visibilityState', 'visible');
  pin('hidden', false);
  pin('webkitVisibilityState', 'visible');
  pin('webkitHidden', false);
  Document.prototype.hasFocus = () => true;

  // Only page-level events are swallowed, so blur on inputs keeps working.
  const isPageTarget = (event) =>
    event.target === window ||
    event.target === document ||
    event.target === document.documentElement;

  const swallow = (event) => {
    if (isPageTarget(event)) event.stopImmediatePropagation();
  };

  for (const type of ['visibilitychange', 'webkitvisibilitychange', 'blur', 'mouseleave', 'freeze']) {
    window.addEventListener(type, swallow, true);
    document.addEventListener(type, swallow, true);
  }
})();
