// Link CSV Google Sheets (File > Bagikan > Publikasikan ke web > CSV).
// Kosong = pakai database-jasdor.csv di folder yang sama.
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSU4gspKy7HPfMn7rLn-oURIhb4N42L4JLiD101CaqfpgjpTSji6-JFgJblmONSzIPRGxvCSfguRh4/pub?gid=2107600521&single=true&output=csv';
const STORE = 'Uncle Muthu';

// Nomor WhatsApp format 62812xxxxxxx (tanpa + dan tanpa 0 di depan). Kosong = tombol Order disembunyikan.
const WA_NUMBER = '62881027570693';
const ORDER_FORMAT = `Halo ${STORE}, saya mau order.
 
Nama:
Brand:
Outlet:
Pesanan (menu x jumlah):
1.
Catatan:`;
const waLink = () => WA_NUMBER && `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(ORDER_FORMAT)}`;

const $ = id => document.getElementById(id);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const isVisible = r => r.tampil?.toLowerCase() !== 'tidak';

function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
}

// Map menjaga urutan kemunculan di sheet
function groupBy(arr, keyFn) {
    const m = new Map();
    arr.forEach(x => { const k = keyFn(x); m.has(k) ? m.get(k).push(x) : m.set(k, [x]); });
    return m;
}

function parseCSV(text) {
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted) {
            if (ch !== '"') cell += ch;
            else if (text[i + 1] === '"') { cell += '"'; i++; }
            else quoted = false;
        } else if (ch === '"') quoted = true;
        else if (ch === ',') { row.push(cell); cell = ''; }
        else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); rows.push(row); row = []; cell = '';
        } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
}

function readMenu(text) {
    const [head, ...rows] = parseCSV(text.replace(/^\uFEFF/, '')).filter(r => r.some(c => c.trim()));
    const keys = head.map(k => k.trim().toLowerCase());
    return rows
        .map(r => Object.fromEntries(keys.map((k, i) => [k, (r[i] || '').trim()])))
        .filter(r => r.brand && r.nama);
}

function loadMenu() {
    return fetch(SHEET_URL || 'menu.csv')
        .then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)))
        .then(readMenu);
}

function showError() {
    $('main').replaceChildren(el('p', 'empty',
        'Menu belum bisa dimuat. Periksa link Google Sheets, atau buka website lewat hosting/server lokal.'));
}