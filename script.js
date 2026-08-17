
// CERTIFICATIONS MARQUEE
// JS-driven so the loop is mathematically seamless.
// Runs immediately: script tag sits at end of <body>, DOM is already parsed.
(function initCertsMarquee() {
    const list = document.getElementById('certsList');
    if (!list) { console.warn('certsList not found'); return; }
    const track = list.parentElement;
    const originals = Array.from(list.children);
    if (originals.length === 0) return;
    
    let guard = 0;
    while (list.scrollWidth < track.offsetWidth * 2 + 400 && guard < 20) {
        originals.forEach(node => list.appendChild(node.cloneNode(true)));
        guard++;
    }

    const gap = 0.9 * parseFloat(getComputedStyle(document.documentElement).fontSize); // matches CSS gap
    let oneSetWidth = 0;
    originals.forEach(node => { oneSetWidth += node.getBoundingClientRect().width + gap; });

    if (oneSetWidth <= 0) { console.warn('certs marquee: could not measure width'); return; }

    let x = 0;
    const speed = 40; 
    let last = performance.now();

    function tick(now) {
        const dt = (now - last) / 1000;
        last = now;
        x -= speed * dt;
        if (x <= -oneSetWidth) x += oneSetWidth;
        list.style.transform = `translateX(${x}px)`;
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();


// NAV ANCHORS
document.querySelectorAll('.navlinks a').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const panel = document.querySelector(a.getAttribute('href'));
        if (!panel) return;
        panel.scrollIntoView({ behavior: 'smooth' });
    });
});


// TYPEWRITER
const phrases = ['// hello_there!', '// welcome.exe', '// pushing_last_commit;'];
let pi = 0, ci = 0, del = false;
const tw = document.getElementById('typewriter');
if (tw) {
    function type() {
        const cur = phrases[pi];
        if (!del) {
            ci++;
            tw.textContent = cur.slice(0, ci);
            if (ci === cur.length) { del = true; setTimeout(type, pi === 0 ? 2200 : 1600); return; }
            setTimeout(type, pi === 0 ? 72 : 58);
        } else {
            ci--;
            tw.textContent = cur.slice(0, ci);
            if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(type, 350); return; }
            setTimeout(type, 30);
        }
    }
    setTimeout(type, 600);
}


// SCROLL REVEAL
const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    });
}, { threshold: 0.15 });
document.querySelectorAll('.r,.r-left,.r-right,.stagger').forEach(el => io.observe(el));


// NAV CLOCK
(function () {
    const clockEl = document.getElementById('navClock');
    if (!clockEl) return;
    function tick() {
        clockEl.textContent =
            new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
            ' (GMT' + (new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome', timeZoneName: 'shortOffset' }).match(/GMT[+-]\d+/) || [''])[0].replace('GMT', '') + ')';
    }
    tick();
    setInterval(tick, 1000);
})();


// LAST.FM NOW PLAYING
(function () {
    function fetchTrack() {
        fetch('/.netlify/functions/lastfm')
            .then(r => r.json())
            .then(d => {
                const t = d.recenttracks.track[0];
                const label = `${t.artist['#text']} — ${t.name}`;
                const el = document.getElementById('lfmTrack');
                if (!el) return;
                el.textContent = label;
                el.classList.toggle('scrolling', label.length > 22);
            })
            .catch(() => {});
    }
    fetchTrack();
    setInterval(fetchTrack, 30000);
})();