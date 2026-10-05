const rp = n => 'Rp' + n.toLocaleString('id-ID');
const num = v => Number(String(v || '').replace(/\D/g, ''));
const ACTIVE = 'tab-buttons-v1__button--active';

function itemEl(r) {
    const img = el('img', 'ph');
    img.alt = ''; img.loading = 'lazy';
    if (r.gambar) img.src = r.gambar;
    img.onerror = () => img.removeAttribute('src');

    const price = el('div', 'price', rp(num(r.harga)));
    if (num(r.harga_coret) > num(r.harga)) price.append(el('s', null, rp(num(r.harga_coret))));

    const info = el('div', 'info');
    info.append(el('div', 'name', r.nama));
    if (r.label) info.append(el('div', 'badge', r.label));
    info.append(price);

    const li = el('li');
    li.dataset.n = r.nama.toLowerCase();
    li.append(img, info);
    return li;
}

function renderMenu(brand, categories) {
    $('title').textContent = brand;
    document.title = brand + ' - ' + STORE;
    $('main').replaceChildren();
    if (!categories.size) $('main').append(el('p', 'empty', 'Menu segera hadir.'));

    [...categories].forEach(([name, items], i) => {
        const tab = el('a', 'tab-buttons-v1__button', name);
        tab.href = '#k' + i;
        $('tabs').append(tab);

        const ul = el('ul', 'menu-grid');
        ul.append(...items.map(itemEl));
        const sec = el('section');
        sec.id = 'k' + i;
        sec.append(el('h2', null, name), ul);
        $('main').append(sec);
    });
}

function filterMenu(q) {
    let found = 0;
    document.querySelectorAll('#main section').forEach(sec => {
        const items = [...sec.querySelectorAll('li')];
        items.forEach(li => { li.hidden = !li.dataset.n.includes(q); });
        const n = items.filter(li => !li.hidden).length;
        sec.hidden = !n;
        found += n;
    });
    $('none').hidden = found > 0;
}

// Tab kategori ikut menyala saat halaman di-scroll
function setupScrollSpy() {
    const tabs = $('tabs');
    const io = new IntersectionObserver(entries => entries.filter(e => e.isIntersecting).forEach(e => {
        [...tabs.children].forEach(a => a.classList.toggle(ACTIVE, a.hash === '#' + e.target.id));
        const on = tabs.querySelector('.' + ACTIVE);
        if (on) tabs.scrollTo({ left: on.offsetLeft - 20, behavior: 'smooth' });
    }), { rootMargin: '-30% 0px -65% 0px' });
    document.querySelectorAll('#main section').forEach(s => io.observe(s));
}

renderHeader();
loadMenu()
    .then(rows => {
        const brands = groupBy(rows, r => r.brand);
        const wanted = new URLSearchParams(location.search).get('brand');
        const brand = [...brands.keys()].find(n => slug(n) === wanted);
        if (!brand) return location.replace('./');

        renderHeader(brands, brand);
        renderMenu(brand, groupBy(brands.get(brand).filter(isVisible), r => r.kategori || 'Lainnya'));
        $('search').replaceChildren(searchBox(filterMenu));
        setupScrollSpy();
    })
    .catch(showError);