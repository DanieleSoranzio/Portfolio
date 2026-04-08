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

    // GAME
    (function(){
    const media  = document.getElementById('heroMedia');
    const canvas = document.getElementById('gameCanvas');
    const ctx    = canvas.getContext('2d');
    const CHROME = 24; // px for fake window chrome

    function resize(){
    const w = media.clientWidth;
    const h = media.clientHeight - CHROME;
    canvas.width  = Math.round(w * devicePixelRatio);
    canvas.height = Math.round(h * devicePixelRatio);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
    resize();
    new ResizeObserver(()=>{ ctx.setTransform(1,0,0,1,0,0); resize(); }).observe(media);

    const W  = () => media.clientWidth;
    const H  = () => media.clientHeight - CHROME;
    const GY = () => H() * 0.70;

    const GRAV=0.52, JV=-10.5;
    let started=false,dead=false,score=0,hi=0,speed=4,fc=0;
    const P={x:44,w:17,h:23,y:0,vy:0,jc:0};
    P.y = GY()-P.h;
    let obs=[], nxt=80;
    const stars=Array.from({length:22},()=>({
    x:Math.random()*400, y:Math.random()*GY()*0.88,
    r:Math.random()*1.1+0.3, sp:Math.random()*0.5+0.2
}));

    function jump(){ if(dead){reset();return;} if(!started)started=true; if(P.jc<2){P.vy=JV*(P.jc===1?0.78:1);P.jc++;} }
    function reset(){ dead=false;started=false;score=0;speed=4;fc=0;obs=[];nxt=80;P.y=GY()-P.h;P.vy=0;P.jc=0; }

    document.addEventListener('keydown',e=>{ if(e.code==='Space'){e.preventDefault();jump();} });
    canvas.addEventListener('click',jump);
    canvas.addEventListener('touchstart',e=>{e.preventDefault();jump();},{passive:false});

    function spawn(){ const t=Math.random()>.5; const ow=t?13:20,oh=t?38:19; obs.push({x:W()+ow,w:ow,h:oh,y:GY()-oh}); }
    function hit(a,b){ const p=4; return a.x+p<b.x+b.w-p&&a.x+a.w-p>b.x+p&&a.y+p<b.y+b.h&&a.y+a.h>b.y+p; }

    function draw(){
    const w=W(),h=H(),g=GY();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#010409'; ctx.fillRect(0,0,w,h);

    // grid
    ctx.strokeStyle='rgba(48,54,61,0.5)'; ctx.lineWidth=0.5;
    for(let x=0;x<w;x+=20){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke(); }
    for(let y=0;y<g;y+=20){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke(); }

    // stars
    ctx.fillStyle='rgba(88,166,255,0.4)';
    stars.forEach(s=>{
    if(started&&!dead) s.x-=s.sp; if(s.x<0) s.x=w;
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
});

    // ground
    ctx.strokeStyle='rgba(48,54,61,0.9)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,g); ctx.lineTo(w,g); ctx.stroke();
    ctx.strokeStyle='rgba(88,166,255,0.15)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,g+1); ctx.lineTo(w,g+1); ctx.stroke();

    // obstacles
    ctx.fillStyle='#58a6ff';
    obs.forEach(o=>{ ctx.beginPath(); ctx.roundRect(o.x,o.y,o.w,o.h,3); ctx.fill(); });

    // player
    ctx.fillStyle=dead?'#f85149':'#3fb950';
    ctx.beginPath(); ctx.roundRect(P.x,P.y,P.w,P.h,[4,4,2,2]); ctx.fill();

    // score
    ctx.font='500 10px JetBrains Mono,monospace'; ctx.textAlign='right';
    ctx.fillStyle='rgba(125,133,144,.6)';
    ctx.fillText(String(Math.floor(score)).padStart(5,'0'),w-10,18);
    if(hi>0){ ctx.font='400 8px JetBrains Mono,monospace'; ctx.fillStyle='rgba(125,133,144,.3)'; ctx.fillText('HI '+String(Math.floor(hi)).padStart(5,'0'),w-10,29); }

    ctx.textAlign='center';
    if(!started&&!dead){ ctx.fillStyle='rgba(125,133,144,.5)'; ctx.font='400 9px JetBrains Mono,monospace'; ctx.fillText('// space or tap to start',w/2,g*.42); }
    if(dead){ ctx.fillStyle='#f85149'; ctx.font='600 11px JetBrains Mono,monospace'; ctx.fillText('// game_over()',w/2,g*.36); ctx.fillStyle='rgba(125,133,144,.4)'; ctx.font='400 8px JetBrains Mono,monospace'; ctx.fillText('space / tap to restart',w/2,g*.36+16); }
    ctx.textAlign='left';
}

    function update(){
    if(!started||dead) return;
    fc++; score+=0.1; speed=4+Math.floor(score/80)*.4;
    P.vy+=GRAV; P.y+=P.vy;
    if(P.y>=GY()-P.h){ P.y=GY()-P.h; P.vy=0; P.jc=0; }
    nxt--; if(nxt<=0){ spawn(); nxt=Math.floor(55+Math.random()*55-speed*3); }
    obs.forEach(o=>o.x-=speed);
    obs=obs.filter(o=>o.x+o.w>-10);
    if(obs.some(o=>hit(P,o))){ dead=true; if(score>hi)hi=score; }
}

    function loop(){ update(); draw(); requestAnimationFrame(loop); }
    loop();
})();

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
    const USER = 'Soransen';
    const KEY  = '99fab9592df92f8f434b8eaed11f5da0';
    function fetchTrack(){
    fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USER}&api_key=${KEY}&limit=1&format=json`)
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
