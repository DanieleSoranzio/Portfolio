   // Certifications marquee — JS-driven so the loop is mathematically seamless
    // (duplicates enough real chips to fill the strip, then loops by exactly one set-width)
    // Runs immediately: this script tag sits at the end of <body>, so the DOM above it
    // is already fully parsed — no need to wait for 'load' or 'DOMContentLoaded'.
    (function initCertsMarquee(){
      const list = document.getElementById('certsList');
      if(!list) { console.warn('certsList not found'); return; }
      const track = list.parentElement;
      const originals = Array.from(list.children);
      if(originals.length === 0) return;

      // duplicate the original chips until we have at least 2 full sets across the visible track
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
      const speed = 40; // px per second
      let last = performance.now();

      function tick(now){
        const dt = (now - last) / 1000;
        last = now;
        x -= speed * dt;
        if (x <= -oneSetWidth) x += oneSetWidth;
        list.style.transform = `translateX(${x}px)`;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })();

  // ZOOM
    const bar    = document.getElementById('progress');
    const panels = Array.from(document.querySelectorAll('.panel-wrap'));
    const last   = panels.length - 1;
    function lerp(a,b,t){ return a+(b-a)*t; }
    function clamp(v,mn,mx){ return Math.min(Math.max(v,mn),mx); }

    function updateZoom() {
    const vh = window.innerHeight;
    panels.forEach((p,i) => {
    const inner = p.querySelector('.panel');
    const r  = inner.getBoundingClientRect();
    const dist = (r.top + inner.offsetHeight/2 - vh/2) / vh;
    let sc,op,bl;
    if (dist < 0) {
    const t = Math.pow(clamp(-dist*1.8,0,1),3);
    sc=lerp(1,.80,t); op=lerp(1,.12,t); bl=lerp(0,8,t);
} else if (i===last) {
    sc=1; op=1; bl=0;
} else {
    const t = Math.pow(clamp(dist*1.5,0,1),2);
    sc=lerp(1,.88,t); op=lerp(1,.55,t); bl=lerp(0,3,t);
}
    p.style.transform = `scale(${sc.toFixed(4)})`;
    p.style.opacity   = op.toFixed(4);
    p.style.filter    = bl>0.05 ? `blur(${bl.toFixed(2)}px)` : 'none';
});
    bar.style.width = clamp(window.scrollY/(document.body.scrollHeight-vh)*100,0,100)+'%';

    // Active nav tab
    let cur = panels[0].querySelector('.panel');
    panels.forEach(p => {
    const r = p.querySelector('.panel').getBoundingClientRect();
    if (r.top <= vh*0.5) cur = p.querySelector('.panel');
});
    document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#'+cur.id);
});
}

    let ticking=false;
    window.addEventListener('scroll',()=>{
    if(!ticking){ requestAnimationFrame(()=>{updateZoom();ticking=false;}); ticking=true; }
},{passive:true});
    updateZoom();

    // NAV ANCHORS
    document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const panel = document.querySelector(a.getAttribute('href'));
        if (!panel) return;
        const wrap = panel.closest('.panel-wrap') || panel;
        document.documentElement.style.scrollSnapType = 'none';
        const targetY = wrap.getBoundingClientRect().top + window.scrollY + wrap.offsetHeight/2 - window.innerHeight/2;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        setTimeout(() => { document.documentElement.style.scrollSnapType = ''; }, 900);
    });
});

    // TYPEWRITER
    const phrases = ['// hello_there!', '// welcome.exe', '// pushing_last_commit;'];
    let pi=0,ci=0,del=false;
    const tw = document.getElementById('typewriter');
    function type(){
    const cur=phrases[pi];
    if(!del){ ci++; tw.textContent=cur.slice(0,ci); if(ci===cur.length){del=true;setTimeout(type,pi===0?2200:1600);return;} setTimeout(type,pi===0?72:58); }
    else { ci--; tw.textContent=cur.slice(0,ci); if(ci===0){del=false;pi=(pi+1)%phrases.length;setTimeout(type,350);return;} setTimeout(type,30); }
}
    setTimeout(type,600);


    // REVEAL
    const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } });
},{threshold:0.15});
    document.querySelectorAll('.r,.r-left,.r-right,.stagger').forEach(el=>io.observe(el));
    (function(){
    function tick(){
        document.getElementById('navClock').textContent =
            new Date().toLocaleTimeString('it-IT', {timeZone:'Europe/Rome', hour:'2-digit', minute:'2-digit', second:'2-digit'}) +
            ' (GMT' + (new Date().toLocaleString('it-IT', {timeZone:'Europe/Rome', timeZoneName:'shortOffset'}).match(/GMT[+-]\d+/) || [''])[0].replace('GMT','') + ')';
    }
    tick(); setInterval(tick, 1000);
})();
    (function(){
    function fetchTrack(){
        fetch('/.netlify/functions/lastfm')
    .then(r=>r.json())
    .then(d=>{
    const t = d.recenttracks.track[0];
    const label = `${t.artist['#text']} — ${t.name}`;
    const el = document.getElementById('lfmTrack');
    el.textContent = label;
    el.classList.toggle('scrolling', label.length > 22);
})
    .catch(()=>{});
}
    fetchTrack();
    setInterval(fetchTrack, 30000);
})();

  (function initCertsMarquee(){
    const list = document.getElementById('certsList');
    if(!list) { console.warn('certsList not found'); return; }
    const track = list.parentElement;
    const originals = Array.from(list.children);
    if(originals.length === 0) return;

    // duplicate the original chips until we have at least 2 full sets across the visible track
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

    function tick(now){
      const dt = (now - last) / 1000;
      last = now;
      x -= speed * dt;
      if (x <= -oneSetWidth) x += oneSetWidth;
      list.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();
