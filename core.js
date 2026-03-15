// ═══════════════════════════════════════
//  CORE: Registry, Router, Helpers
// ═══════════════════════════════════════
const exhibits=new Map();
let currentCleanup=null;
const DPR=window.devicePixelRatio||1;

function reg(id,cfg){exhibits.set(id,cfg)}
function exForSec(s){return[...exhibits.entries()].filter(([,c])=>c.section===s)}

function setupCanvas(cv,w,h){
  cv.width=w*DPR;cv.height=h*DPR;
  cv.style.width=w+'px';cv.style.height=h+'px';
  const ctx=cv.getContext('2d');ctx.scale(DPR,DPR);return ctx;
}

// Router
function navigate(p){location.hash=p}
function handleRoute(){
  if(currentCleanup){currentCleanup();currentCleanup=null}
  window.scrollTo({top:0,behavior:'smooth'});
  const hash=location.hash.slice(1)||'home';
  const parts=hash.split('/');
  const app=document.getElementById('app');
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.toggle('active',a.dataset.section===parts[0]));
  document.getElementById('navLinks')?.classList.remove('open');
  if(hash==='home')return renderHome(app);
  if(parts.length===1)return renderSection(app,parts[0]);
  if(parts.length===2)return renderExhibit(app,parts[0],parts[1]);
}
window.addEventListener('hashchange',handleRoute);

// Home
function renderHome(app){
  const secs=[
    {id:'physics',icon:'⚛️',c:'var(--physics)'},
    {id:'math',icon:'🔢',c:'var(--math)'},
    {id:'chemistry',icon:'🧪',c:'var(--chem)'},
    {id:'space',icon:'🚀',c:'var(--space)'}
  ];
  const now=new Date();const isPiSeason=(now.getMonth()===2&&now.getDate()>=10&&now.getDate()<=18);

  const featured=[
    {
      id:'math/riemann',
      badge:t('home.feat_riemann_badge'),
      formula:'ζ(s)',
      title:t('home.feat_riemann_title'),
      sub:t('home.feat_riemann_sub'),
      desc:t('home.feat_riemann_desc'),
      gfrom:'#1a0533',gto:'#4c1d95',accent:'#a78bfa',
      particles:['ζ','½','∞','ℝ','∑','π']
    },
    {
      id:'math/ai',
      badge:t('home.feat_ai_badge'),
      formula:'AI',
      title:t('home.feat_ai_title'),
      sub:t('home.feat_ai_sub'),
      desc:t('home.feat_ai_desc'),
      gfrom:'#0a1628',gto:'#1e3a5f',accent:'#60a5fa',
      particles:['∇','θ','σ','∂','Σ','w']
    },
    {
      id:'math/piday',
      badge:t('home.feat_pi_badge'),
      formula:'π',
      title:t('home.feat_pi_title'),
      sub:t('home.feat_pi_sub'),
      desc:t('home.feat_pi_desc'),
      gfrom:'#2d1000',gto:'#7c2d12',accent:'#fb923c',
      particles:['π','τ','e','φ','∞','3.14']
    },
    {
      id:'space/rocket',
      badge:t('home.feat_rocket_badge'),
      formula:'F=ma',
      title:t('home.feat_rocket_title'),
      sub:t('home.feat_rocket_sub'),
      desc:t('home.feat_rocket_desc'),
      gfrom:'#000d1a',gto:'#0c2a4a',accent:'#38bdf8',
      particles:['↑','v²','Δv','g','F','m']
    },
    {
      id:'physics/city-energy',
      badge:t('home.feat_city_badge'),
      formula:'CO₂',
      title:t('home.feat_city_title'),
      sub:t('home.feat_city_sub'),
      desc:t('home.feat_city_desc'),
      gfrom:'#0a1a0a',gto:'#1a4a2a',accent:'#22c55e',
      particles:['⚡','🌱','☀','💨','🏭','🌡']
    }
  ];

  app.innerHTML=`
    <div class="home-hero">
      <canvas id="heroBg"></canvas>
      <div class="hero-content">
        <div class="hero-badge">🔬 Interactive Science</div>
        <h1>${t('home.title')}</h1>
        <p class="sub">${t('home.sub')}</p>
        <div class="hero-stats">
          <div class="hstat"><span class="hstat-n">20+</span><span class="hstat-l">Exhibits</span></div>
          <div class="hstat-div"></div>
          <div class="hstat"><span class="hstat-n">2</span><span class="hstat-l">Languages</span></div>
          <div class="hstat-div"></div>
          <div class="hstat"><span class="hstat-n">Free</span><span class="hstat-l">Always</span></div>
        </div>
      </div>
    </div>

    <div class="featured-section fade-up">
      <div class="featured-header">
        <h2 class="featured-title">${t('home.feat_header')}</h2>
        <p class="featured-sub">${t('home.feat_sub')}</p>
      </div>
      <div class="featured-grid">
        ${featured.map((f,i)=>`
          <div class="feat-card fade-up" style="--delay:${i*0.1}s;--gfrom:${f.gfrom};--gto:${f.gto};--acc:${f.accent}" onclick="navigate('${f.id}')">
            <div class="feat-particles">${f.particles.map(p=>`<span class="feat-p">${p}</span>`).join('')}</div>
            <div class="feat-formula">${f.formula}</div>
            <div class="feat-body">
              <div class="feat-badge">${f.badge}</div>
              <h3 class="feat-name">${f.title}</h3>
              <p class="feat-sub-text">${f.sub}</p>
              <p class="feat-desc">${f.desc}</p>
              <div class="feat-cta">${t('home.feat_explore')}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    ${isPiSeason?`
    <div class="pi-day-hero fade-up" onclick="navigate('math/piday')">
      <div class="pi-day-bg"></div>
      <div class="pi-day-content">
        <div class="pi-day-icon">π</div>
        <div>
          <h3>${t('pi.banner')}</h3>
          <p>${t('pi.d')}</p>
          <span class="pi-day-cta">${t('pi.tag')} →</span>
        </div>
      </div>
    </div>`:''}

    <div class="sections-header fade-up">
      <h2>${t('home.feat_explore_subject')}</h2>
    </div>
    <div class="section-grid">
      ${secs.map(s=>`
        <div class="section-card fade-up" style="--sc:${s.c}" onclick="navigate('${s.id}')">
          <span class="icon">${s.icon}</span>
          <h3>${t('sec.'+s.id+'.t')}</h3>
          <p>${t('home.'+s.id+'_d')}</p>
          <div class="count">${exForSec(s.id).length} ${t('home.ex')}</div>
        </div>`).join('')}
    </div>
    <div class="ad-banner"><div class="ad-banner-inner">
      <span class="ad-label"></span>
    </div></div>`;
  initHeroBg();
}

function initHeroBg(){
  const cv=document.getElementById('heroBg');if(!cv)return;
  const rect=cv.parentElement.getBoundingClientRect();
  const w=rect.width,h=rect.height;
  cv.width=w*DPR;cv.height=h*DPR;cv.style.width='100%';cv.style.height='100%';
  const ctx=cv.getContext('2d');ctx.scale(DPR,DPR);
  const pts=Array.from({length:50},()=>({
    x:Math.random()*w,y:Math.random()*h,
    vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,
    r:Math.random()*2+1,
    c:['#3b82f6','#f59e0b','#10b981','#8b5cf6'][Math.floor(Math.random()*4)]
  }));
  let raf;
  function frame(){
    ctx.fillStyle='rgba(8,8,15,0.12)';ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=0.06;ctx.strokeStyle='#fff';ctx.lineWidth=0.5;
    for(let i=0;i<pts.length;i++){
      const p=pts[i];p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;
      ctx.globalAlpha=0.5;ctx.fillStyle=p.c;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      for(let j=i+1;j<pts.length;j++){
        const dx=p.x-pts[j].x,dy=p.y-pts[j].y;
        if(dx*dx+dy*dy<12000){ctx.globalAlpha=0.04;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke()}
      }
    }
    ctx.globalAlpha=1;raf=requestAnimationFrame(frame);
  }
  frame();currentCleanup=()=>cancelAnimationFrame(raf);
}

// Section gallery
function renderSection(app,sec){
  const list=exForSec(sec);
  app.innerHTML=`
    <div class="sec-header fade-up">
      <h2>${t('sec.'+sec+'.t')}</h2>
      <p>${t('sec.'+sec+'.d')}</p>
    </div>
    <div class="ex-grid">
      ${list.map(([id,c])=>`
        <div class="ex-card fade-up" onclick="navigate('${sec}/${id.split('-').slice(1).join('-')}')">
          <span class="icon">${c.icon}</span>
          <h4>${t(c.tKey)}</h4>
          <p>${t(c.dKey)}</p>
          <span class="tag">${t(c.tagKey)}</span>
        </div>`).join('')}
    </div>`;
}

// Exhibit renderer
function renderExhibit(app,sec,slug){
  const id=sec+'-'+slug;
  const ex=exhibits.get(id);
  if(!ex){navigate(sec);return}
  app.innerHTML=`
    <div class="ex-view fade-up">
      <div class="ex-back" onclick="navigate('${sec}')">${t('back')} ${t('sec.'+sec+'.t')}</div>
      <h2 class="ex-title">${t(ex.tKey)}</h2>
      <p class="ex-desc">${t(ex.dKey)}</p>
      <div class="ex-mount" id="exMount"></div>
      <div class="ad-banner" style="padding:0;margin:1.2rem 0"><div class="ad-banner-inner">
        <span class="ad-label"></span>
      </div></div>
      <div class="ex-share" style="display:flex;gap:0.5rem;align-items:center;margin-bottom:1rem">
        <span style="font-family:var(--mono);font-size:0.7rem;color:var(--dim);text-transform:uppercase;letter-spacing:0.08em">Share this exhibit:</span>
        <button class="share-btn" onclick="shareOnFacebook()" title="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
        <button class="share-btn" onclick="shareOnTwitter()" title="X/Twitter"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
        <button class="share-btn" onclick="copyLink()" title="Copy Link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
      </div>
      <div class="explain" id="exExplain">
        <h5>${t(ex.expTKey)}</h5>
        <p>${t(ex.expKey)}</p>
      </div>
      ${(window.EXHIBIT_DETAIL&&window.EXHIBIT_DETAIL[id])?`<div class="exhibit-deep-dive">${typeof window.EXHIBIT_DETAIL[id]==='object'?(window.EXHIBIT_DETAIL[id][currentLang]||window.EXHIBIT_DETAIL[id].en||''):window.EXHIBIT_DETAIL[id]}</div>`:''}
    </div>`;
  const mount=document.getElementById('exMount');
  const cleanup=ex.render(mount);
  if(cleanup)currentCleanup=cleanup;
}
