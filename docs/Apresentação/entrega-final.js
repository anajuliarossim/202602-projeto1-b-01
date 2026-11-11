window.__DATA = B.data;
let live = false,
    hist = [],
    now = null;
const fr = document.getElementById('fr'),
    cur = document.getElementById('cur'),
    IDX = {},
    nk = s => s.normalize('NFC').toLowerCase();
Object.keys(B.pages).forEach(k => IDX[nk(k)] = k);
const SHIM =
    "(function(){window.__path='/pages/%N';window.__go=function(h){parent.postMessage({bulbe:'go',h:String(h)},'*')};window.__back=function(){parent.postMessage({bulbe:'back'},'*')};addEventListener('click',function(e){if(e.defaultPrevented)return;var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href');if(h&&h.length>1&&h[0]=='#'){e.preventDefault();var t=document.getElementById(decodeURIComponent(h.slice(1)));if(t)t.scrollIntoView({behavior:'smooth'});return}e.preventDefault();if(h&&h[0]!='#')__go(h)});addEventListener('submit',function(e){if(e.defaultPrevented)return;e.preventDefault();__go(e.target.getAttribute('action')||'')})})();";

function resolve(h) {
    h = decodeURIComponent(String(h).split('#')[0].split('?')[0]).split('/').pop();
    return IDX[nk(h)] || null
}

function render(n) {
    const D = [];
    let s = B.pages[n].replace(/<!--CSS:([^>]+?)-->/g, (m, f) => '<style>' + B.css[f] + '</style>').replace(
        /<!--JS:(\w+):([^>]+?)-->/g, (m, t, f) => {
            const c = B.js[f];
            return t == 'module' ? '<script type="module">' + c + '<\/script>' : t == 'defer' ? (D.push(
                '<script>' + c + '<\/script>'), '') : '<script>' + c + '<\/script>'
        });
    s = s.replace('<head>', '<head><script>' + SHIM.replace('%N', n) + '<\/script>');
    s = s.includes('<\/body>') ? s.replace('<\/body>', () => D.join('') + '<\/body>') : s + D.join('');
    return s.replace(/\{\{IMG:([^}]+)\}\}/g, (m, f) => B.img[f] || '')
}

function load(h, push = true) {
    const n = resolve(h);
    if (!n) return;
    if (push && now) hist.push(now);
    now = n;
    fr.srcdoc = render(n);
    cur.textContent = B.label[n] || n
}
addEventListener('message', e => {
    if (e.source !== fr.contentWindow) return;
    const d = e.data || {};
    if (d.bulbe == 'go') load(d.h);
    if (d.bulbe == 'back' && hist.length) load(hist.pop(), false)
});
document.getElementById('rs').onclick = () => {
    try {
        sessionStorage.removeItem('bulbe:onboarding:v1')
    } catch (e) {}
    hist = [];
    now = null;
    load('Acesso.html')
};
document.getElementById('bk').onclick = () => {
    if (hist.length) load(hist.pop(), false)
};
document.querySelectorAll('.chips button').forEach(b => b.onclick = () => load(b.dataset.p));
const st = document.getElementById('stage'),
    ss = [...document.querySelectorAll('.s')],
    c = document.getElementById('c');
let i = 0;

function fit() {
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    st.style.transform = 'translate(-50%,-50%) scale(' + k + ')'
}

function go(n) {
    i = Math.max(0, Math.min(ss.length - 1, n));
    ss.forEach((e, j) => e.classList.toggle('on', j == i));
    c.textContent = (i + 1) + ' / ' + ss.length;
    if (ss[i].id == 'live' && !live) {
        live = true;
        load('Acesso.html')
    }
    history.replaceState(null, '', '#s' + (i + 1))
}
document.getElementById('p').onclick = () => go(i - 1);
document.getElementById('n').onclick = () => go(i + 1);
addEventListener('keydown', e => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) go(i + 1);
    if (['ArrowLeft', 'PageUp'].includes(e.key)) go(i - 1)
});
addEventListener('resize', fit);
fit();
go((parseInt(location.hash.slice(2)) || 1) - 1)
