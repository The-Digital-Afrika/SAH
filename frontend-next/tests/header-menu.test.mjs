import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';

function fixture() {
  const state = [];
  let cursor = 0;
  const exports = {};
  const source = readFileSync(new URL('../components/Header.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  vm.runInNewContext(outputText, { exports, require(name) {
    if (name === 'react/jsx-runtime') return jsx;
    if (name === 'react') return {
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
      },
      useId: () => 'test-navigation',
      useEffect() {},
    };
    if (name === 'next/navigation') return { usePathname: () => '/' };
    if (name === 'next/link') return { default: 'a' };
    if (name === 'next/image') return { default: 'img' };
    if (name.endsWith('.css')) return { default: {} };
    if (name === '@/lib/search-types') return { searchPages: [] };
    throw new Error(name);
  } });
  function render() {
    cursor = 0;
    const nodes = [];
    function walk(node) {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node?.props) return;
      nodes.push(node);
      walk(node.props.children);
    }
    walk(exports.default());
    return {
      button: nodes.find(n => n.props.className === 'menu-toggle'),
      nav: nodes.find(n => n.type === 'nav'),
      header: nodes.find(n => n.type === 'header'),
      links: nodes.filter(n => n.type === 'a' && n.props.prefetch),
    };
  }
  return render;
}

test('mobile menu toggles and closes immediately on every navigation link, including the current page', () => {
  const render = fixture();
  assert.equal(render().button.props['aria-expanded'], false);
  assert.equal(render().links.length, 8);
  for (let i = 0; i < 8; i++) {
    render().button.props.onClick();
    const open = render();
    assert.equal(open.button.props['aria-expanded'], true);
    assert.equal(open.button.props['aria-controls'], open.nav.props.id);
    assert.equal(open.button.props['aria-label'], 'Close navigation');
    open.links[i].props.onClick();
    assert.equal(render().button.props['aria-expanded'], false);
    assert.equal(render().nav.props.className, 'site-nav');
  }
  render().button.props.onClick();
  render().button.props.onClick();
  assert.equal(render().button.props['aria-expanded'], false);
});

test('Escape closes the menu and returns keyboard focus to its toggle', () => {
  const render = fixture();
  render().button.props.onClick();
  let focused = false;
  let prevented = false;
  render().header.props.onKeyDown({ key: 'Escape',
    currentTarget: { querySelector: () => ({ focus() { focused = true; } }) },
    preventDefault() { prevented = true; },
  });
  assert.equal(render().button.props['aria-expanded'], false);
  assert.equal(focused, true);
  assert.equal(prevented, true);
});
