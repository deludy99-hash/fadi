const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

class Element extends EventTarget {
  constructor(id) {
    super();
    this.id = id;
    this.style = {};
    this.iframe = null;
  }
  querySelector(sel) {
    if (sel === 'iframe') return this.iframe;
    return null;
  }
  getBoundingClientRect() {
    return { top: 0, left: 0, width: 100, height: 100 };
  }
  closest() {
    return null;
  }
}

class MouseEvent extends Event {
  constructor(type, opts = {}) {
    super(type);
    this.button = opts.button || 0;
    this.clientX = opts.clientX || 0;
    this.clientY = opts.clientY || 0;
  }
  preventDefault() {}
}

test('iframe pointerEvents toggled during drag', () => {
  const window = new EventTarget();
  const document = {};
  const el = new Element('pdf-pane');
  const iframe = new Element('iframe');
  el.iframe = iframe;

  const code = fs.readFileSync(path.join(__dirname, '..', 'Quiz'), 'utf8');
  const start = code.indexOf('function ensureFixed');
  const end = code.indexOf('// Enable dragging');
  const snippet = code.substring(start, end);

  const context = { window, document };
  vm.createContext(context);
  vm.runInContext(snippet, context);
  const makeDraggable = context.makeDraggable;

  makeDraggable(el);

  el.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 }));
  assert.strictEqual(iframe.style.pointerEvents, 'none');

  window.dispatchEvent(new MouseEvent('mouseup'));
  assert.strictEqual(iframe.style.pointerEvents, '');
});
