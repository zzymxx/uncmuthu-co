// Komponen (versi vanilla dari DealTech UI). Gaya ada di ui.css.

// Ikon dari lucide
const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  menu: '<path d="M21 5H3"/><path d="M21 12H9"/><path d="M21 19H7"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
};

function icon(name, size = 18, cls) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  Object.entries({ viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor',
    'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })
    .forEach(([k, v]) => s.setAttribute(k, v));
  if (cls) s.setAttribute('class', cls);
  s.innerHTML = ICONS[name];
  return s;
}

// SimpleHeaderV2: brand + link antar brand, drawer di HP
// brands: Map nama brand -> baris menu. cta: { label, href } opsional di kanan
function renderHeader(brands = new Map(), current = '', cta) {
  const links = cls => [...brands].map(([name, rows]) => {
    const ready = rows.some(isVisible);
    const a = el(ready ? 'a' : 'span', cls, name);
    if (!ready) a.setAttribute('aria-disabled', 'true');
    else {
      a.href = 'menu.html?brand=' + slug(name);
      if (name === current) a.setAttribute('aria-current', 'page');
    }
    return a;
  });
  const button = (label, name, size, cls) => {
    const b = el('button', cls);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.append(icon(name, size));
    return b;
  };

  const home = el('a', 'simple-header-v2__brand', STORE);
  home.href = './';
  const nav = el('nav', 'simple-header-v2__nav');
  nav.setAttribute('aria-label', 'Brand');
  nav.append(...links('simple-header-v2__nav-link'));
  const open = button('Buka menu', 'menu', 22, 'simple-header-v2__menu-button');
  const inner = el('div', 'simple-header-v2__inner');
  const action = cta && el('a', 'simple-header-v2__cta');
  if (action) {
    Object.assign(action, { href: cta.href, target: '_blank', rel: 'noreferrer' });
    action.append(icon('chat', 16), cta.label);
  }
  inner.append(...[home, nav, brands.size && open, action].filter(Boolean));
  const header = el('header', 'simple-header-v2');
  header.append(inner);

  const close = button('Tutup menu', 'close', 20);
  const head = el('div', 'simple-header-v2__drawer-head');
  head.append(el('strong', null, 'Pilih brand'), close);
  const list = el('nav');
  list.setAttribute('aria-label', 'Brand');
  list.append(...links());
  const drawer = el('aside', 'simple-header-v2__drawer');
  drawer.append(head, list);
  const overlay = el('div', 'simple-header-v2__overlay');

  const toggle = on => [overlay, drawer].forEach(e => e.classList.toggle('is-open', on));
  open.onclick = () => toggle(true);
  close.onclick = overlay.onclick = list.onclick = () => toggle(false);
  $('site-header').replaceChildren(header, overlay, drawer);
}

// SearchV1: pil dengan ikon
function searchBox(onInput) {
  const input = el('input', 'search-v1__input');
  input.type = 'search';
  input.placeholder = 'Cari menu';
  input.setAttribute('aria-label', 'Cari menu');
  input.oninput = () => onInput(input.value.trim().toLowerCase());
  const form = el('form', 'search-v1');
  form.setAttribute('role', 'search');
  form.onsubmit = e => e.preventDefault();
  form.append(icon('search', 18, 'search-v1__icon'), input);
  return form;
}

// Popup info: <dialog> bawaan browser (fokus, Esc, dan backdrop sudah diurus browser)
function showNotice(title, lines) {
  const ok = el('button', 'notice-v1__button', 'Mengerti');
  ok.type = 'button';
  const body = el('div', 'notice-v1__body');
  body.append(el('h2', null, title), ...lines.map(l => el('p', null, l)), ok);
  const box = el('dialog', 'notice-v1');
  box.append(body);
  ok.onclick = () => box.close();
  box.onclick = e => { if (e.target === box) box.close(); };   // klik area gelap
  box.onclose = () => box.remove();
  document.body.append(box);
  box.showModal();
}

// SimpleFooterV1
$('site-footer').replaceChildren(
  el('p', null, `Copyright © ${new Date().getFullYear()} ${STORE} – Harga dapat berubah sewaktu-waktu`));

addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.is-open').forEach(x => x.classList.remove('is-open'));
});