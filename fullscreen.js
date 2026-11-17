// Runs in the page's own JS world. Does nothing, and changes nothing on the page,
// until fullscreen-config.js switches it on for this site; then fullscreen
// requests fill the tab instead of the screen, and the page is told it is in
// fullscreen.
(() => {
  const ATTR = 'data-vm-fullscreen';
  const MESSAGE = 'vmFullscreen';

  let installed = false;
  let enabled = false;
  let current = null;
  let sheet = null;

  // The element stops counting once it leaves the page, as with real fullscreen.
  const live = () => {
    if (current && !current.isConnected) leave();
    return current;
  };

  const announce = (target) => {
    for (const type of ['fullscreenchange', 'webkitfullscreenchange']) {
      target.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
    }
    window.dispatchEvent(new Event('resize'));
  };

  const tellFrame = (frame, action) => frame.contentWindow?.postMessage({ [MESSAGE]: action }, '*');
  const tellParent = (action) => {
    if (window.parent !== window) window.parent.postMessage({ [MESSAGE]: action }, '*');
  };

  const enter = (element) => {
    if (current === element) return;
    if (current) {
      current.removeAttribute(ATTR);
      // A frame that was filling the tab has to learn it no longer does.
      if (current instanceof HTMLIFrameElement) tellFrame(current, 'exit');
    }
    current = element;

    // The root element already fills the tab.
    if (element !== document.documentElement) {
      const root = element.getRootNode();
      if (!root.adoptedStyleSheets.includes(sheet)) {
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
      }
      element.setAttribute(ATTR, '');
    }

    announce(element);
    // Inside a frame, the frame itself has to grow to fill the tab.
    tellParent('enter');
  };

  const leave = () => {
    const element = current;
    if (!element) return;
    current = null;
    element.removeAttribute(ATTR);
    announce(element.isConnected ? element : document);
    tellParent('exit');
    if (element instanceof HTMLIFrameElement) tellFrame(element, 'exit');
  };

  // Same rules as real fullscreen: the page must be allowed to use it, and only
  // in response to a click or key press.
  const request = function () {
    if (!document.fullscreenEnabled || !navigator.userActivation.isActive) {
      return Promise.reject(new TypeError('Fullscreen request denied.'));
    }
    return Promise.resolve().then(() => enter(this));
  };

  const patchMethod = (proto, name, fake, isActive) => {
    const original = proto[name];
    if (!original) return;
    proto[name] = function (...args) {
      return isActive() ? fake.call(this) : original.apply(this, args);
    };
  };

  // A fake value of undefined falls through to the browser's own answer.
  const patchGetter = (proto, name, fake) => {
    const original = Object.getOwnPropertyDescriptor(proto, name)?.get;
    if (!original) return;
    Object.defineProperty(proto, name, {
      get() {
        return (enabled ? fake() : undefined) ?? original.call(this);
      },
      configurable: true,
    });
  };

  // A frame may only grow if the page gave it fullscreen permission, as with real fullscreen.
  const mayFill = (frame) => frame.allowFullscreen || /\bfullscreen\b/.test(frame.allow);

  const onMessage = (event) => {
    const action = event.data?.[MESSAGE];
    if (!enabled || !action) return;

    if (action === 'enter') {
      const frame = [...document.querySelectorAll('iframe')].find(
        (candidate) => candidate.contentWindow === event.source
      );
      // A click inside a frame also counts as a gesture here, so a frame cannot
      // take over the tab on its own.
      if (frame && mayFill(frame) && navigator.userActivation.isActive) enter(frame);
    } else if (action === 'exit') {
      const fromParent = window.parent !== window && event.source === window.parent;
      const fromCurrentFrame =
        current instanceof HTMLIFrameElement && current.contentWindow === event.source;
      if (fromParent || fromCurrentFrame) leave();
    }
  };

  const install = () => {
    // Constructed sheets are not blocked by a page's Content Security Policy.
    sheet = new CSSStyleSheet();
    sheet.replaceSync(`
      [${ATTR}] {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        max-width: none !important;
        max-height: none !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        transform: none !important;
        z-index: 2147483647 !important;
      }
      video[${ATTR}], iframe[${ATTR}] {
        object-fit: contain !important;
        background: #000 !important;
        border: 0 !important;
      }
    `);

    patchMethod(Element.prototype, 'requestFullscreen', request, () => enabled);
    for (const name of ['webkitRequestFullscreen', 'webkitRequestFullScreen']) {
      patchMethod(Element.prototype, name, function () {
        request.call(this).catch(() => {});
      }, () => enabled);
    }

    patchMethod(Document.prototype, 'exitFullscreen', async () => leave(), () => live() !== null);
    for (const name of ['webkitExitFullscreen', 'webkitCancelFullScreen']) {
      patchMethod(Document.prototype, name, () => leave(), () => live() !== null);
    }

    for (const name of ['fullscreenElement', 'webkitFullscreenElement', 'webkitCurrentFullScreenElement']) {
      patchGetter(Document.prototype, name, () => live() ?? undefined);
    }
    for (const name of ['fullscreen', 'webkitIsFullScreen']) {
      patchGetter(Document.prototype, name, () => (live() ? true : undefined));
    }

    // Pages that compare the window with the screen see a screen the size of the tab.
    for (const [name, size] of [
      ['width', () => window.innerWidth],
      ['height', () => window.innerHeight],
      ['availWidth', () => window.innerWidth],
      ['availHeight', () => window.innerHeight],
    ]) {
      patchGetter(Screen.prototype, name, () => (live() ? size() : undefined));
    }

    window.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape' && live()) leave();
      },
      true
    );
    window.addEventListener('message', onMessage);
  };

  window.addEventListener('vm-fullscreen-on', () => {
    if (!installed) {
      install();
      installed = true;
    }
    enabled = true;
  });
  window.addEventListener('vm-fullscreen-off', () => {
    leave();
    enabled = false;
  });
})();
