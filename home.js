document.title = STORE;
renderHeader(new Map(), '', waLink() && { label: 'Order via WhatsApp', href: waLink() });

// HeadingStrokeV1: kata terakhir diberi blok warna
const words = STORE.split(' ');
const accent = el('span', 'heading-stroke-v1__accent', words.pop());
$('title').replaceChildren(...(words.length ? [words.join(' ') + ' ', accent] : [accent]));

// Logo dari kolom `logo` di sheet; tanpa logo = huruf awal
function logoEl(name, url) {
    const initial = () => el('div', 'pk-card__logo', name[0].toUpperCase());
    if (!url) return initial();
    const img = el('img', 'pk-card__logo');
    img.src = url; img.alt = ''; img.loading = 'lazy';
    img.onerror = () => img.replaceWith(initial());
    return img;
}

function brandCard([name, items]) {
    const count = items.filter(isVisible).length;
    const cta = el(count ? 'a' : 'button', 'pk-card__cta');
    if (count) cta.href = 'menu.html?brand=' + slug(name);
    else cta.disabled = true;
    cta.append(el('span', null, 'Lihat menu'), icon('arrow', 16));

    const logo = logoEl(name, items.map(r => r.logo).find(Boolean));
    const card = el('article', 'pk-card');
    card.append(logo, el('h3', 'pk-card__name', name), el('p', 'pk-card__desc', count ? count + ' menu' : 'Segera hadir'), cta);
    return card;
}

loadMenu()
    .then(rows => {
        if (!rows.length) throw new Error('menu kosong');
        $('main').replaceChildren(...[...groupBy(rows, r => r.brand)].map(brandCard));
    })
    .catch(showError);