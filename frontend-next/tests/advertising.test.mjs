import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(relativePath, imports = require, globals = {}) {
  const exports = {};
  const source = readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  vm.runInNewContext(outputText, { exports, require: imports, ...globals });
  return exports;
}
const sizing = load("lib/home-leaderboard.ts");
const leaderboard = [[970, 250], [728, 90], [320, 100], [320, 50]];
const sidebar = [[300, 250], [300, 600]];
const plain = (value) => JSON.parse(JSON.stringify(value));

test("all requests and mapping entries fit usable container and viewport widths", () => {
  for (const sizes of [leaderboard, sidebar]) {
    for (const width of [0, 250, 284, 299, 300, 319, 320, 727, 728, 969, 970, 1440]) {
      for (const viewport of [280, 300, 319, 320, 390, 728, 969, 970, 1440]) {
        const wide = sizes === leaderboard;
        const eligible = sizing.responsiveSlotSizes(sizes, width, viewport, wide);
        for (const [w, h] of eligible) {
          assert.ok(w <= width && w <= viewport);
          assert.ok(sizes.some(([sw, sh]) => sw === w && sh === h));
        }
        for (const entry of sizing.responsiveSlotMapping(eligible, width, wide)) {
          for (const [w] of entry.sizes) assert.ok(w <= width && w <= entry.viewport[0] && w <= viewport);
        }
      }
    }
  }
  assert.equal(sizing.availableAdWidth(316, 8, 8, 1440), 300);
  assert.equal(sizing.availableAdWidth(300, 8, 8, 1440), 284);
  assert.deepEqual(plain(sizing.responsiveSlotSizes(leaderboard, 970, 1440, true)), [[970, 250], [728, 90]]);
  assert.deepEqual(plain(sizing.responsiveSlotSizes(leaderboard, 728, 1024, true)), [[728, 90]]);
  assert.deepEqual(plain(sizing.responsiveSlotSizes(leaderboard, 320, 390, true)), [[320, 100], [320, 50]]);
  assert.deepEqual(plain(sizing.responsiveSlotSizes(sidebar, 300, 390, false)), [[300, 250]]);
  assert.deepEqual(plain(sizing.responsiveSlotSizes(sidebar, 300, 1440, false)), sidebar);
});

// A small hook/GPT harness exercises the actual component without adding dependencies.
function fixture({ sizes = sidebar, width = 300, viewport = 1440, padding = 0, ready = true } = {}) {
  const hooks = [], queued = [], observers = new Set(), listeners = new Set(), resizeListeners = new Set();
  const created = [], destroyed = [], displayed = [];
  let cursor = 0, dirty = false, pendingEffects = [], pathname = "/articles/first", lastClass;
  let props = {
    ad: { id: "test-ad", placement: "article-sidebar", dataUnit: "test", google: {
      networkCode: "23298734611", adUnitCode: sizes === leaderboard ? "sahomeschooling_home_leaderboard" : "newspack-sidebar-1-684ff96a6f547", sizes,
    } },
    sizeClass: "test-slot", idSuffix: "explicit",
  };
  const classes = new Set();
  const element = { clientWidth: width, parentElement: {}, style: { setProperty() {} }, classList: {
    add(...names) { names.forEach((name) => classes.add(name)); },
    remove(...names) { names.forEach((name) => classes.delete(name)); },
    toggle(name, present) { if (present) classes.add(name); else classes.delete(name); },
  } };
  const document = { documentElement: { clientWidth: viewport }, getElementById: () => element };
  const pubads = {
    addEventListener: (_, listener) => listeners.add(listener),
    removeEventListener: (_, listener) => listeners.delete(listener),
  };
  const google = {
    cmd: { push(fn) { if (ready) fn(); else queued.push(fn); } },
    defineSlot(path, sizes, id) {
      const slot = { path, sizes, id, configs: [], mappings: [],
        addService() {}, setConfig(config) { this.configs.push(config); },
        defineSizeMapping(mapping) { this.mappings.push(mapping); }, getSlotElementId: () => id,
      };
      created.push(slot);
      return slot;
    },
    sizeMapping() { const entries = []; return {
      addSize(viewport, sizes) { entries.push({ viewport, sizes }); return this; }, build: () => entries,
    }; },
    pubads: () => pubads, setConfig() {}, enableServices() {},
    display: (id) => displayed.push(id), destroySlots: (slots) => destroyed.push(...slots),
  };
  const window = {
    innerWidth: viewport, googletag: google,
    getComputedStyle: () => ({ paddingLeft: `${padding}px`, paddingRight: `${padding}px` }),
    addEventListener: (_, listener) => resizeListeners.add(listener),
    removeEventListener: (_, listener) => resizeListeners.delete(listener),
    setTimeout() { assert.fail("Elapsed time must not decide ad fill"); },
  };
  const sameDeps = (a, b) => a && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    useId: () => "instance-1",
    useState(initial) {
      const i = cursor++;
      hooks[i] ??= { value: initial };
      return [hooks[i].value, (next) => {
        if (!Object.is(hooks[i].value, next)) { hooks[i].value = next; dirty = true; }
      }];
    },
    useMemo(fn, deps) {
      const i = cursor++;
      if (!sameDeps(hooks[i]?.deps, deps)) hooks[i] = { value: fn(), deps };
      return hooks[i].value;
    },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!sameDeps(hooks[i]?.deps, deps)) pendingEffects.push(() => {
        hooks[i]?.cleanup?.(); hooks[i] = { deps, cleanup: fn() };
      });
    },
  };
  const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: "fragment" };
  const { default: Component } = load("components/GoogleAdUnit.tsx", (name) => {
    if (name === "react") return react;
    if (name === "react/jsx-runtime") return jsx;
    if (name === "next/navigation") return { usePathname: () => pathname };
    if (name === "next/script") return () => null;
    if (name === "@/lib/home-leaderboard") return sizing;
    return require(name);
  }, { window, document, ResizeObserver: class {
    constructor(callback) { this.callback = callback; observers.add(callback); }
    observe() {} disconnect() { observers.delete(this.callback); }
  } });
  function render() {
    for (let attempts = 0; attempts < 20; attempts++) {
      cursor = 0; dirty = false; pendingEffects = [];
      const tree = Component(props);
      const className = tree.props.children[1].props.children.props.className;
      if (className !== lastClass) {
        classes.clear(); className.split(" ").filter(Boolean).forEach((name) => classes.add(name)); lastClass = className;
      }
      pendingEffects.forEach((effect) => effect());
      if (!dirty) return;
    }
    assert.fail("Unexpected render/measurement loop");
  }
  return {
    created, destroyed, displayed, classes, listeners, window,
    render,
    resize(nextWidth, nextViewport = viewport) {
      element.clientWidth = nextWidth;
      document.documentElement.clientWidth = nextViewport; window.innerWidth = nextViewport;
      observers.forEach((callback) => callback()); resizeListeners.forEach((callback) => callback()); render();
    },
    navigate(nextPath) { pathname = nextPath; render(); },
    sameConfig() { props = { ...props, ad: { ...props.ad, google: { ...props.ad.google } } }; render(); },
    ready() { ready = true; while (queued.length) queued.shift()(); if (dirty) render(); },
    respond(slot, empty = false) { listeners.forEach((listener) => listener({ slot, isEmpty: empty, size: empty ? null : slot.sizes[0] })); },
    unmount() { hooks.forEach((hook) => hook.cleanup?.()); },
    assertClean() {
      assert.equal(listeners.size, 0); assert.equal(observers.size, 0); assert.equal(resizeListeners.size, 0);
      assert.equal(Object.keys(window.saHomeschoolingAdSlots ?? {}).length, 0);
    },
  };
}

test("padding is subtracted and narrow slots recover without duplicate requests", () => {
  const f = fixture({ width: 300, padding: 8 });
  f.render(); assert.equal(f.created.length, 0); assert.ok(f.classes.has("google-ad-slot--suppressed"));
  f.resize(316); assert.equal(f.created.length, 1);
  f.resize(318); f.sameConfig(); assert.equal(f.created.length, 1);
  f.resize(299); assert.equal(f.destroyed.length, 1);
  f.resize(316); assert.equal(f.created.length, 2);
  f.unmount(); f.assertClean(); assert.equal(f.destroyed.length, 2);
});

test("mobile, desktop, navigation and fill states use the correct slot lifecycle", () => {
  const f = fixture(); f.render();
  assert.equal(f.created[0].path, "/23298734611/newspack-sidebar-1-684ff96a6f547");
  assert.deepEqual(plain(f.created[0].sizes), sidebar);
  assert.ok(f.classes.has("google-ad-slot--pending"));
  f.respond(f.created[0], true); assert.ok(f.classes.has("google-ad-slot--empty"));
  f.sameConfig(); assert.equal(f.created.length, 1); assert.ok(f.classes.has("google-ad-slot--empty"));
  f.resize(300, 390); assert.deepEqual(plain(f.created[1].sizes), [[300, 250]]);
  f.respond(f.created[0]); assert.ok(!f.classes.has("google-ad-slot--loaded"));
  f.respond(f.created[1]); assert.ok(f.classes.has("google-ad-slot--loaded"));
  f.navigate("/articles/second");
  assert.equal(f.created.length, 3);
  assert.equal(f.created[2].configs[0].targeting.slug, "second");
  assert.equal(f.listeners.size, 1);
  f.unmount(); f.assertClean(); assert.equal(f.destroyed.length, 3);
});

test("delayed GPT rechecks width and cancels work after unmount", () => {
  const f = fixture({ ready: false }); f.render(); f.resize(280); f.ready();
  assert.equal(f.created.length, 0); f.resize(300); assert.equal(f.created.length, 1);
  f.unmount(); f.assertClean();
  const cancelled = fixture({ ready: false }); cancelled.render(); cancelled.unmount(); cancelled.ready();
  assert.equal(cancelled.created.length, 0); cancelled.assertClean();
});

test("leaderboard remains on its original path and only requests supported fitting sizes", () => {
  const f = fixture({ sizes: leaderboard, width: 300 });
  f.render(); assert.equal(f.created.length, 0);
  f.resize(320, 390); assert.deepEqual(plain(f.created[0].sizes), [[320, 100], [320, 50]]);
  f.resize(728, 1024); assert.deepEqual(plain(f.created[1].sizes), [[728, 90]]);
  f.resize(970, 1440); assert.deepEqual(plain(f.created[2].sizes), [[970, 250], [728, 90]]);
  for (const slot of f.created) {
    assert.equal(slot.path, "/23298734611/sahomeschooling_home_leaderboard");
    assert.equal(slot.mappings.length, 1);
    assert.ok(slot.id.includes("explicit-instance-1"));
    assert.ok(!slot.sizes.some(([w, h]) => w === 300 && h === 250));
  }
  f.unmount(); f.assertClean();
});
