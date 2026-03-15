// ═══════════════════════════════════════
//  CHEMISTRY EXHIBITS (5)
// ═══════════════════════════════════════

const PT=[
[1,"H","Hydrogen","ဟိုက်ဒရိုဂျင်","1.008","nm",1,1],[2,"He","Helium","ဟီလီယမ်","4.003","ng",1,18],
[3,"Li","Lithium","လီသီယမ်","6.941","am",2,1],[4,"Be","Beryllium","ဘယ်ရီလီယမ်","9.012","ae",2,2],
[5,"B","Boron","ဘိုရွန်","10.81","ml",2,13],[6,"C","Carbon","ကာဗွန်","12.01","nm",2,14],
[7,"N","Nitrogen","နိုက်ထရိုဂျင်","14.01","nm",2,15],[8,"O","Oxygen","အောက်ဆီဂျင်","16.00","nm",2,16],
[9,"F","Fluorine","ဖလိုရင်း","19.00","ha",2,17],[10,"Ne","Neon","နီယွန်","20.18","ng",2,18],
[11,"Na","Sodium","ဆိုဒီယမ်","22.99","am",3,1],[12,"Mg","Magnesium","မဂ္ဂနီဆီယမ်","24.31","ae",3,2],
[13,"Al","Aluminium","အလူမီနီယမ်","26.98","pt",3,13],[14,"Si","Silicon","ဆီလီကွန်","28.09","ml",3,14],
[15,"P","Phosphorus","ဖော့စဖရပ်","30.97","nm",3,15],[16,"S","Sulfur","ဆာလဖာ","32.07","nm",3,16],
[17,"Cl","Chlorine","ကလိုရင်း","35.45","ha",3,17],[18,"Ar","Argon","အာဂွန်","39.95","ng",3,18],
[19,"K","Potassium","ပိုတက်ဆီယမ်","39.10","am",4,1],[20,"Ca","Calcium","ကယ်လ်ဆီယမ်","40.08","ae",4,2],
[21,"Sc","Scandium","စကန္ဒီယမ်","44.96","tm",4,3],[22,"Ti","Titanium","တိုင်တေနီယမ်","47.87","tm",4,4],
[23,"V","Vanadium","ဗနေဒီယမ်","50.94","tm",4,5],[24,"Cr","Chromium","ခရိုမီယမ်","52.00","tm",4,6],
[25,"Mn","Manganese","မန်ဂနိစ်","54.94","tm",4,7],[26,"Fe","Iron","သံ","55.85","tm",4,8],
[27,"Co","Cobalt","ကိုဘော့","58.93","tm",4,9],[28,"Ni","Nickel","နီကယ်","58.69","tm",4,10],
[29,"Cu","Copper","ကြေးနီ","63.55","tm",4,11],[30,"Zn","Zinc","သွပ်","65.38","tm",4,12],
[31,"Ga","Gallium","ဂယ်လီယမ်","69.72","pt",4,13],[32,"Ge","Germanium","ဂျာမေနီယမ်","72.63","ml",4,14],
[33,"As","Arsenic","အာဆင်းနစ်","74.92","ml",4,15],[34,"Se","Selenium","ဆီလီနီယမ်","78.97","nm",4,16],
[35,"Br","Bromine","ဘရိုမင်း","79.90","ha",4,17],[36,"Kr","Krypton","ခရစ်ပတွန်","83.80","ng",4,18]
];
const CAT_NAMES={am:'Alkali Metal',ae:'Alkaline Earth',tm:'Transition Metal',pt:'Post-Transition',ml:'Metalloid',nm:'Nonmetal',ha:'Halogen',ng:'Noble Gas'};

// 1. PERIODIC TABLE
reg('chemistry-ptable',{
  section:'chemistry',icon:'⚗️',tKey:'c_ptable.t',dKey:'c_ptable.d',tagKey:'c_ptable.tag',expTKey:'c_ptable.exp_t',expKey:'c_ptable.exp',
  render(el){
    const grid=Array.from({length:4},()=>Array(18).fill(null));
    PT.forEach(e=>{grid[e[6]-1][e[7]-1]={n:e[0],s:e[1],name:e[2],nameMy:e[3],mass:e[4],cat:e[5]}});
    let cells='';
    for(let r=0;r<4;r++)for(let c=0;c<18;c++){
      const e=grid[r][c];
      if(e)cells+=`<div class="pt-cell cat-${e.cat}" onclick="showEl(${e.n})"><span class="n">${e.n}</span><span class="s">${e.s}</span></div>`;
      else cells+=`<div class="pt-cell empty"></div>`;
    }
    el.innerHTML=`<div class="pt-grid">${cells}</div>
      <div class="info" id="elDetail" style="margin-top:1rem;text-align:center"><p style="color:var(--dim)">Click an element</p></div>`;
    window.showEl=n=>{
      const e=PT.find(x=>x[0]===n);if(!e)return;
      const nm=currentLang==='my'?e[3]:e[2];
      document.getElementById('elDetail').innerHTML=`
        <div style="font-size:3rem;font-weight:800;color:var(--bright)">${e[1]}</div>
        <div style="font-size:1.1rem;margin:0.3rem 0;color:var(--dim)">${nm}</div>
        <div class="info-row"><span class="l">${t('c_ptable.anum')}</span><span class="v">${e[0]}</span></div>
        <div class="info-row"><span class="l">${t('c_ptable.amass')}</span><span class="v">${e[4]}</span></div>
        <div class="info-row"><span class="l">${t('c_ptable.cat')}</span><span class="v">${CAT_NAMES[e[5]]||e[5]}</span></div>`;
    };
    return()=>{delete window.showEl};
  }
});

// 2. STATES OF MATTER
reg('chemistry-states',{
  section:'chemistry',icon:'🧊',tKey:'c_states.t',dKey:'c_states.d',tagKey:'c_states.tag',expTKey:'c_states.exp_t',expKey:'c_states.exp',
  render(el){
    let temp=25,aid;const NP=80;let parts=[];
    el.innerHTML=`<canvas id="stCv" height="380"></canvas>
      <div style="text-align:center;margin-top:0.5rem">
        <span id="stLabel" style="font-weight:700;font-size:1.1rem;color:var(--chem)"></span>
        <span id="stTemp" style="font-family:var(--mono);margin-left:1rem;color:var(--accent)"></span>
      </div>
      <div class="controls" style="justify-content:center">
        <span style="font-size:1.5rem">🧊</span>
        <div class="ctrl"><label>${t('c_states.temp')}</label><input type="range" id="stT" min="-50" max="200" value="25" style="width:280px"></div>
        <span style="font-size:1.5rem">🔥</span>
      </div>`;
    document.getElementById('stT').oninput=e=>{temp=+e.target.value};
    function init(){
      const cv=document.getElementById('stCv');const w=cv?.parentElement.getBoundingClientRect().width||600;
      const cols=Math.ceil(Math.sqrt(NP)),sp=Math.min((w-80)/cols,300/cols);
      const ox=(w-cols*sp)/2+sp/2,oy=(380-Math.ceil(NP/cols)*sp)/2+sp/2;
      parts=Array.from({length:NP},(_,i)=>({
        x:Math.random()*(w-40)+20,y:Math.random()*340+20,
        vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,
        bx:ox+(i%cols)*sp,by:oy+Math.floor(i/cols)*sp
      }));
    }
    function draw(){
      const cv=document.getElementById('stCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=380;
      const ctx=setupCanvas(cv,w,h);
      let state;
      if(temp<0){state='solid';document.getElementById('stLabel').textContent=t('c_states.solid')}
      else if(temp<100){state='liquid';document.getElementById('stLabel').textContent=t('c_states.liquid')}
      else{state='gas';document.getElementById('stLabel').textContent=t('c_states.gas')}
      document.getElementById('stTemp').textContent=temp+'°C';
      const energy=Math.max(0.1,(temp+50)/50);
      const col=temp<0?'#3b82f6':temp<100?'#10b981':'#ff6b6b';
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=2;ctx.strokeRect(10,10,w-20,h-20);
      for(const p of parts){
        if(state==='solid'){
          p.x+=(p.bx-p.x)*0.1+(Math.random()-0.5)*energy*1.5;
          p.y+=(p.by-p.y)*0.1+(Math.random()-0.5)*energy*1.5;
        }else if(state==='liquid'){
          p.vx+=(Math.random()-0.5)*energy*0.4;p.vy+=(Math.random()-0.5)*energy*0.4+0.08;
          p.vx*=0.95;p.vy*=0.95;p.x+=p.vx;p.y+=p.vy;
          if(p.y>h-15-h*0.25)p.vy*=-0.5;
        }else{
          p.vx+=(Math.random()-0.5)*energy*0.7;p.vy+=(Math.random()-0.5)*energy*0.7;
          p.vx*=0.98;p.vy*=0.98;p.x+=p.vx;p.y+=p.vy;
        }
        if(p.x<15){p.x=15;p.vx*=-0.8}if(p.x>w-15){p.x=w-15;p.vx*=-0.8}
        if(p.y<15){p.y=15;p.vy*=-0.8}if(p.y>h-15){p.y=h-15;p.vy*=-0.8}
        ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fillStyle=col;ctx.globalAlpha=0.8;ctx.fill();
        if(state==='solid'){
          const pi=parts.indexOf(p);
          for(let k=pi+1;k<Math.min(parts.length,pi+8);k++){
            const p2=parts[k];const dx=p.x-p2.x,dy=p.y-p2.y;
            if(dx*dx+dy*dy<1800){ctx.strokeStyle='rgba(59,130,246,0.12)';ctx.lineWidth=0.5;
              ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.stroke()}}
        }
      }
      ctx.globalAlpha=1;aid=requestAnimationFrame(draw);
    }
    init();draw();return()=>cancelAnimationFrame(aid);
  }
});

// 3. CHEMICAL BONDING
reg('chemistry-bonds',{
  section:'chemistry',icon:'🔗',tKey:'c_bonds.t',dKey:'c_bonds.d',tagKey:'c_bonds.tag',expTKey:'c_bonds.exp_t',expKey:'c_bonds.exp',
  render(el){
    let bondType='ionic',aid,time=0;
    el.innerHTML=`<canvas id="bondCv" height="350"></canvas>
      <div class="controls" style="justify-content:center">
        <button class="btn btn-p" id="ionicBtn" onclick="setBond('ionic')">${t('c_bonds.ionic')}</button>
        <button class="btn" id="covalBtn" onclick="setBond('covalent')">${t('c_bonds.covalent')}</button>
      </div>`;
    window.setBond=t2=>{bondType=t2;
      document.getElementById('ionicBtn').className=t2==='ionic'?'btn btn-p':'btn';
      document.getElementById('covalBtn').className=t2==='covalent'?'btn btn-p':'btn'};
    function draw(){
      const cv=document.getElementById('bondCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=350;
      const ctx=setupCanvas(cv,w,h);time+=0.02;
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      const cx=w/2,cy=h/2;
      if(bondType==='ionic'){
        // Na gives electron to Cl
        const sep=80+Math.sin(time)*10;
        // Na atom (left)
        ctx.beginPath();ctx.arc(cx-sep,cy,35,0,Math.PI*2);
        ctx.fillStyle='rgba(59,130,246,0.2)';ctx.fill();
        ctx.strokeStyle='#3b82f6';ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle='#fff';ctx.font='bold 18px Outfit';ctx.textAlign='center';
        ctx.fillText('Na',cx-sep,cy-5);
        ctx.font='12px Space Mono';ctx.fillStyle='#3b82f6';
        ctx.fillText('11+',cx-sep,cy+12);
        // Cl atom (right)
        ctx.beginPath();ctx.arc(cx+sep,cy,40,0,Math.PI*2);
        ctx.fillStyle='rgba(16,185,129,0.2)';ctx.fill();
        ctx.strokeStyle='#10b981';ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle='#fff';ctx.font='bold 18px Outfit';
        ctx.fillText('Cl',cx+sep,cy-5);
        ctx.font='12px Space Mono';ctx.fillStyle='#10b981';
        ctx.fillText('17+',cx+sep,cy+12);
        // Electron transfer animation
        const eProgress=(Math.sin(time*2)+1)/2;
        const eX=cx-sep+eProgress*(sep*2);
        ctx.beginPath();ctx.arc(eX,cy-30,5,0,Math.PI*2);
        ctx.fillStyle='#f59e0b';ctx.shadowColor='#f59e0b';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;
        // Arrow
        ctx.strokeStyle='rgba(245,158,11,0.5)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(cx-sep+20,cy-30);ctx.lineTo(cx+sep-20,cy-30);ctx.stroke();
        ctx.fillStyle='rgba(245,158,11,0.5)';ctx.beginPath();
        ctx.moveTo(cx+sep-20,cy-33);ctx.lineTo(cx+sep-10,cy-30);ctx.lineTo(cx+sep-20,cy-27);ctx.fill();
        // Labels
        ctx.fillStyle='#fff';ctx.font='13px Outfit';
        ctx.fillText(t('c_bonds.transfer'),cx,cy+65);
        ctx.fillText('Na⁺ + Cl⁻ → NaCl',cx,cy+85);
        // Charge labels
        ctx.font='bold 14px Space Mono';
        ctx.fillStyle='#3b82f6';ctx.fillText('+',cx-sep,cy-45);
        ctx.fillStyle='#10b981';ctx.fillText('−',cx+sep,cy-45);
      }else{
        // H-H covalent bond (water)
        const oX=cx,oY=cy;
        const h1X=cx-55,h1Y=cy+40;
        const h2X=cx+55,h2Y=cy+40;
        // O atom
        ctx.beginPath();ctx.arc(oX,oY,30,0,Math.PI*2);
        ctx.fillStyle='rgba(236,72,153,0.2)';ctx.fill();
        ctx.strokeStyle='#ec4899';ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle='#fff';ctx.font='bold 18px Outfit';ctx.textAlign='center';
        ctx.fillText('O',oX,oY+6);
        // H atoms
        [h1X,h2X].forEach(hx=>{
          ctx.beginPath();ctx.arc(hx,h1Y,22,0,Math.PI*2);
          ctx.fillStyle='rgba(59,130,246,0.2)';ctx.fill();
          ctx.strokeStyle='#3b82f6';ctx.lineWidth=2;ctx.stroke();
          ctx.fillStyle='#fff';ctx.font='bold 16px Outfit';
          ctx.fillText('H',hx,h1Y+5);
        });
        // Shared electrons
        const pulse=Math.sin(time*3)*3;
        ctx.fillStyle='#f59e0b';ctx.shadowColor='#f59e0b';ctx.shadowBlur=6;
        // Bond 1
        const b1x=(oX+h1X)/2,b1y=(oY+h1Y)/2;
        ctx.beginPath();ctx.arc(b1x+pulse,b1y,4,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(b1x-pulse,b1y+5,4,0,Math.PI*2);ctx.fill();
        // Bond 2
        const b2x=(oX+h2X)/2,b2y=(oY+h2Y)/2;
        ctx.beginPath();ctx.arc(b2x+pulse,b2y,4,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(b2x-pulse,b2y+5,4,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
        // Labels
        ctx.fillStyle='#fff';ctx.font='13px Outfit';
        ctx.fillText(t('c_bonds.share'),cx,cy-55);
        ctx.fillText('H₂O — Water',cx,cy+90);
        // Lone pairs on O
        ctx.fillStyle='rgba(245,158,11,0.4)';
        ctx.beginPath();ctx.arc(oX-8,oY-32+Math.sin(time*2),3,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(oX+8,oY-32-Math.sin(time*2),3,0,Math.PI*2);ctx.fill();
      }
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>{cancelAnimationFrame(aid);delete window.setBond};
  }
});

// 4. pH & ACIDS/BASES
reg('chemistry-ph',{
  section:'chemistry',icon:'🧫',tKey:'c_ph.t',dKey:'c_ph.d',tagKey:'c_ph.tag',expTKey:'c_ph.exp_t',expKey:'c_ph.exp',
  render(el){
    let ph=7,aid;
    const examples=[
      {ph:0,name:'Battery Acid'},{ph:1,name:'Stomach Acid'},{ph:2,name:'Lemon Juice'},{ph:3,name:'Vinegar'},
      {ph:4,name:'Tomato'},{ph:5,name:'Coffee'},{ph:6,name:'Milk'},{ph:7,name:'Pure Water'},
      {ph:8,name:'Sea Water'},{ph:9,name:'Baking Soda'},{ph:10,name:'Soap'},{ph:11,name:'Ammonia'},
      {ph:12,name:'Bleach'},{ph:13,name:'Oven Cleaner'},{ph:14,name:'Drain Cleaner'}
    ];
    el.innerHTML=`<canvas id="phCv" height="320"></canvas>
      <div class="controls" style="justify-content:center">
        <div class="ctrl"><label>${t('c_ph.ph')} (0-14)</label>
          <input type="range" id="phS" min="0" max="14" value="7" step="0.1" style="width:300px"></div>
        <span class="val" id="phV" style="font-size:1.5rem">7.0</span>
      </div>`;
    document.getElementById('phS').oninput=e=>{ph=+e.target.value;document.getElementById('phV').textContent=ph.toFixed(1)};
    function draw(){
      const cv=document.getElementById('phCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=320;
      const ctx=setupCanvas(cv,w,h);
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      // pH scale bar
      const barX=40,barY=40,barW=w-80,barH=60;
      for(let i=0;i<barW;i++){
        const p=i/barW*14;
        const hue=p/14*240; // red(0) -> blue(240)
        ctx.fillStyle=`hsl(${hue},80%,50%)`;
        ctx.fillRect(barX+i,barY,1,barH);
      }
      // Labels
      ctx.fillStyle='#fff';ctx.font='11px Space Mono';ctx.textAlign='center';
      for(let i=0;i<=14;i++){
        ctx.fillText(i,barX+i/14*barW,barY+barH+16);
      }
      // Pointer
      const ptrX=barX+ph/14*barW;
      ctx.fillStyle='#fff';ctx.beginPath();
      ctx.moveTo(ptrX-8,barY-2);ctx.lineTo(ptrX+8,barY-2);ctx.lineTo(ptrX,barY+10);ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(ptrX,barY);ctx.lineTo(ptrX,barY+barH);ctx.stroke();
      // Labels
      ctx.fillStyle='#ff6b6b';ctx.font='bold 14px Outfit';ctx.textAlign='left';
      ctx.fillText(t('c_ph.acidic'),barX,barY-10);
      ctx.fillStyle='#10b981';ctx.textAlign='right';
      ctx.fillText(t('c_ph.basic'),barX+barW,barY-10);
      ctx.fillStyle='#f59e0b';ctx.textAlign='center';
      ctx.fillText(t('c_ph.neutral'),barX+barW/2,barY-10);
      // Current substance
      const closest=examples.reduce((a,b)=>Math.abs(b.ph-ph)<Math.abs(a.ph-ph)?b:a);
      // Beaker visualization
      const bx=w/2-50,by=140,bw=100,bh=140;
      ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+bh);ctx.lineTo(bx+bw,by+bh);ctx.lineTo(bx+bw,by);ctx.stroke();
      // Liquid
      const hue=ph/14*240;
      const liquidH=bh*0.8;
      ctx.fillStyle=`hsla(${hue},70%,45%,0.6)`;
      ctx.fillRect(bx+2,by+bh-liquidH,bw-4,liquidH-2);
      // Bubbles
      for(let i=0;i<5;i++){
        const bub_x=bx+10+Math.random()*(bw-20);
        const bub_y=by+bh-Math.random()*liquidH;
        ctx.beginPath();ctx.arc(bub_x,bub_y,2+Math.random()*3,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},80%,70%,0.3)`;ctx.fill();
      }
      // Substance name
      ctx.fillStyle='#fff';ctx.font='bold 16px Outfit';ctx.textAlign='center';
      ctx.fillText(closest.name,w/2,by+bh+30);
      ctx.font='12px Space Mono';ctx.fillStyle='var(--dim)';
      const conc=Math.pow(10,-ph);
      ctx.fillText(`[H⁺] = ${conc.toExponential(1)} mol/L`,w/2,by+bh+50);
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(aid);
  }
});

// 5. BALANCING EQUATIONS
reg('chemistry-react',{
  section:'chemistry',icon:'⚖️',tKey:'c_react.t',dKey:'c_react.d',tagKey:'c_react.tag',expTKey:'c_react.exp_t',expKey:'c_react.exp',
  render(el){
    const equations=[
      {reactants:[['H',2],['O',2]],products:[['H',2,'O',1]],coeffs:[2,1,2],names:['H₂','O₂','H₂O']},
      {reactants:[['Fe',1],['O',2]],products:[['Fe',2,'O',3]],coeffs:[4,3,2],names:['Fe','O₂','Fe₂O₃']},
      {reactants:[['N',2],['H',2]],products:[['N',1,'H',3]],coeffs:[1,3,2],names:['N₂','H₂','NH₃']},
      {reactants:[['C',1,'H',4],['O',2]],products:[['C',1,'O',2],['H',2,'O',1]],coeffs:[1,2,1,2],names:['CH₄','O₂','CO₂','H₂O']},
      {reactants:[['Na',1],['Cl',2]],products:[['Na',1,'Cl',1]],coeffs:[2,1,2],names:['Na','Cl₂','NaCl']}
    ];
    let eqIdx=0,userCoeffs;
    function load(){
      const eq=equations[eqIdx];
      const n=eq.names.length;
      userCoeffs=new Array(n).fill(1);
      render2();
    }
    function render2(){
      const eq=equations[eqIdx];
      const nr=eq.reactants.length,np=eq.products.length;
      let html='<div style="display:flex;align-items:center;justify-content:center;gap:0.5rem;flex-wrap:wrap;margin:1.5rem 0">';
      eq.names.forEach((name,i)=>{
        const isProduct=i>=nr;
        if(i>0&&i<nr)html+='<span style="font-size:1.5rem;color:var(--dim)">+</span>';
        if(i===nr)html+='<span style="font-size:1.5rem;color:var(--math)">→</span>';
        if(i>nr)html+='<span style="font-size:1.5rem;color:var(--dim)">+</span>';
        html+=`<div style="text-align:center">
          <div style="display:flex;align-items:center;gap:0.3rem">
            <button class="btn btn-r" style="width:32px;height:32px;font-size:1rem" onclick="adjCoeff(${i},-1)">−</button>
            <span style="font-family:var(--mono);font-size:1.5rem;color:var(--bright);min-width:24px" id="coeff${i}">${userCoeffs[i]}</span>
            <button class="btn btn-r" style="width:32px;height:32px;font-size:1rem" onclick="adjCoeff(${i},1)">+</button>
          </div>
          <div style="font-size:1.2rem;margin-top:0.3rem;color:${isProduct?'var(--chem)':'var(--physics)'}">${name}</div>
        </div>`;
      });
      html+='</div>';
      // Check balance
      const balanced=userCoeffs.every((c,i)=>c===eq.coeffs[i]);
      html+=`<div style="text-align:center;font-size:1.2rem;font-weight:700;color:${balanced?'var(--chem)':'var(--accent)'}">${balanced?'✓ '+t('c_react.balanced'):t('c_react.notyet')}</div>`;
      if(balanced)html+=`<div style="text-align:center;margin-top:0.5rem"><button class="btn btn-p" onclick="nextEq()">${t('c_react.next')} →</button></div>`;
      html+=`<div style="text-align:center;margin-top:0.5rem;font-family:var(--mono);font-size:0.8rem;color:var(--dim)">Equation ${eqIdx+1}/${equations.length}</div>`;
      el.innerHTML=html;
    }
    window.adjCoeff=(i,d)=>{userCoeffs[i]=Math.max(1,Math.min(8,userCoeffs[i]+d));render2()};
    window.nextEq=()=>{eqIdx=(eqIdx+1)%equations.length;load()};
    load();
    return()=>{delete window.adjCoeff;delete window.nextEq};
  }
});
