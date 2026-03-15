// ═══════════════════════════════════════
//  PHYSICS EXHIBITS (5)
// ═══════════════════════════════════════

const ELEMENTS=["?","H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca","Sc","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","Ga","Ge","As","Se","Br","Kr"];
const SHELL_MAX=[2,8,18,32,32,18,8];

// 1. ATOM EXPLORER
reg('physics-atoms',{
  section:'physics',icon:'⚛️',tKey:'p_atom.t',dKey:'p_atom.d',tagKey:'p_atom.tag',expTKey:'p_atom.exp_t',expKey:'p_atom.exp',
  render(el){
    let p=1,n=0,e=1,aid;
    function shells(ec){const s=[];let r=ec;for(const m of SHELL_MAX){if(r<=0)break;s.push(Math.min(r,m));r-=m}return s}
    el.innerHTML=`<canvas id="atomCv" height="380"></canvas>
      <div class="two-col" style="margin-top:1rem"><div>
      ${['p','n','e'].map(x=>{const col=x==='p'?'#ff6b6b':x==='e'?'#3b82f6':'#999';
        const lk=x==='p'?'p_atom.protons':x==='n'?'p_atom.neutrons':'p_atom.electrons';
        return`<div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:0.6rem">
          <button class="btn btn-r" onclick="atomA('${x}',-1)" style="color:${col}">−</button>
          <div style="flex:1;text-align:center"><div style="font-size:0.65rem;color:var(--dim)">${t(lk)}</div>
          <div id="${x}C" style="font-size:1.3rem;color:${col};font-family:var(--mono)">${x==='n'?0:1}</div></div>
          <button class="btn btn-r" onclick="atomA('${x}',1)" style="color:${col}">+</button></div>`}).join('')}
      </div><div class="info" id="atomI"></div></div>`;
    window.atomA=(t2,d)=>{
      if(t2==='p')p=Math.max(0,Math.min(36,p+d));
      if(t2==='n')n=Math.max(0,Math.min(50,n+d));
      if(t2==='e')e=Math.max(0,Math.min(36,e+d));
      document.getElementById('pC').textContent=p;
      document.getElementById('nC').textContent=n;
      document.getElementById('eC').textContent=e;
      updInfo();
    };
    function updInfo(){
      const ch=p-e,sym=p<ELEMENTS.length?ELEMENTS[p]:'E'+p;
      document.getElementById('atomI').innerHTML=`
        <h4 style="font-size:2.5rem;text-align:center">${p>0?sym:'—'}</h4>
        <div class="info-row"><span class="l">${t('p_atom.element')}</span><span class="v">${sym}</span></div>
        <div class="info-row"><span class="l">${t('p_atom.mass')}</span><span class="v">${p+n}</span></div>
        <div class="info-row"><span class="l">${t('p_atom.charge')}</span><span class="v">${ch>0?'+'+ch:ch}</span></div>
        <div class="info-row"><span class="l">Status</span><span class="v" style="color:${ch===0?'#10b981':'#f59e0b'}">${ch===0?t('p_atom.neutral'):t('p_atom.ion')}</span></div>`;
    }
    function draw(){
      const cv=document.getElementById('atomCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=380;
      const ctx=setupCanvas(cv,w,h);const cx=w/2,cy=h/2,time=performance.now()/1000;
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      const sh=shells(e),radii=sh.map((_,i)=>50+i*38);
      // Orbits
      radii.forEach((r,i)=>{ctx.strokeStyle='rgba(59,130,246,0.12)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke()});
      // Nucleus glow
      const nr=Math.max(12,Math.sqrt(p+n)*5.5);
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,nr+12);
      g.addColorStop(0,'rgba(255,100,80,0.25)');g.addColorStop(1,'rgba(255,100,80,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,nr+12,0,Math.PI*2);ctx.fill();
      // Nucleons
      for(let i=0;i<p+n;i++){
        const a=(i/(p+n))*Math.PI*2+Math.sin(time*2+i)*0.08;
        const r2=i<1?0:Math.sqrt(i)*4.5+Math.sin(time+i)*1;
        ctx.beginPath();ctx.arc(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2,4.5,0,Math.PI*2);
        ctx.fillStyle=i<p?'#ff6b6b':'#888';ctx.fill();
      }
      // Electrons
      for(let s=0;s<sh.length;s++){
        const r=radii[s],cnt=sh[s];
        for(let j=0;j<cnt;j++){
          const a=(j/cnt)*Math.PI*2+time*(1.5-s*0.2);
          const ex2=cx+Math.cos(a)*r,ey=cy+Math.sin(a)*r;
          ctx.strokeStyle='rgba(59,130,246,0.12)';ctx.lineWidth=2;
          ctx.beginPath();ctx.arc(cx,cy,r,a-0.4,a);ctx.stroke();
          ctx.beginPath();ctx.arc(ex2,ey,3.5,0,Math.PI*2);
          ctx.fillStyle='#3b82f6';ctx.shadowColor='#3b82f6';ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;
        }
      }
      aid=requestAnimationFrame(draw);
    }
    updInfo();draw();
    return()=>{cancelAnimationFrame(aid);delete window.atomA};
  }
});

// 2. FORCES & NEWTON'S LAWS
reg('physics-forces',{
  section:'physics',icon:'🏋️',tKey:'p_forces.t',dKey:'p_forces.d',tagKey:'p_forces.tag',expTKey:'p_forces.exp_t',expKey:'p_forces.exp',
  render(el){
    let mass=5,force=0,friction=0.2,vx=0,px=50,aid;
    el.innerHTML=`<canvas id="forcesCv" height="300"></canvas>
      <div class="controls">
        <div class="ctrl"><label>${t('p_forces.mass')} (kg)</label><input type="range" id="fMass" min="1" max="20" value="5"></div><span class="val" id="fMassV">5</span>
        <div class="ctrl"><label>${t('p_forces.force')} (N)</label><input type="range" id="fForce" min="-50" max="50" value="0"></div><span class="val" id="fForceV">0</span>
        <div class="ctrl"><label>${t('p_forces.friction')}</label><input type="range" id="fFric" min="0" max="1" value="0.2" step="0.05"></div><span class="val" id="fFricV">0.2</span>
        <button class="btn" onclick="fReset()">${t('p_forces.reset')}</button>
      </div>
      <div style="display:flex;gap:2rem;margin-top:0.5rem;font-family:var(--mono);font-size:0.8rem">
        <span>${t('p_forces.velocity')}: <span id="fVel" style="color:var(--physics)">0.0</span> m/s</span>
        <span>${t('p_forces.accel')}: <span id="fAcc" style="color:var(--accent)">0.0</span> m/s²</span>
      </div>`;
    const sl=(id,cb)=>{document.getElementById(id).oninput=e=>{cb(+e.target.value)}};
    sl('fMass',v=>{mass=v;document.getElementById('fMassV').textContent=v});
    sl('fForce',v=>{force=v;document.getElementById('fForceV').textContent=v});
    sl('fFric',v=>{friction=v;document.getElementById('fFricV').textContent=v});
    window.fReset=()=>{vx=0;px=50;force=0;document.getElementById('fForce').value=0;document.getElementById('fForceV').textContent='0'};
    function draw(){
      const cv=document.getElementById('forcesCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=300;
      const ctx=setupCanvas(cv,w,h);
      // Physics
      const accel=(force-friction*mass*9.8*Math.sign(vx))/mass;
      if(Math.abs(vx)<0.05&&Math.abs(force)<friction*mass*9.8)vx=0;
      else vx+=accel*0.016;
      px+=vx*2;
      if(px<30){px=30;vx=Math.abs(vx)*0.5}
      if(px>w-30){px=w-30;vx=-Math.abs(vx)*0.5}
      document.getElementById('fVel').textContent=vx.toFixed(1);
      document.getElementById('fAcc').textContent=accel.toFixed(1);
      // Draw
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      // Ground
      ctx.fillStyle='#1a2a1a';ctx.fillRect(0,h-40,w,40);
      ctx.strokeStyle='#2a4a2a';ctx.lineWidth=1;
      for(let x=0;x<w;x+=20){ctx.beginPath();ctx.moveTo(x,h-40);ctx.lineTo(x-10,h);ctx.stroke()}
      // Box
      const bw=30+mass*2,bh=30+mass*2;
      const by=h-40-bh;
      ctx.fillStyle='#3b82f6';ctx.shadowColor='rgba(59,130,246,0.3)';ctx.shadowBlur=15;
      ctx.fillRect(px-bw/2,by,bw,bh);ctx.shadowBlur=0;
      ctx.fillStyle='#fff';ctx.font='bold 12px Space Mono';ctx.textAlign='center';
      ctx.fillText(mass+'kg',px,by+bh/2+4);
      // Force arrow
      if(Math.abs(force)>0.5){
        const dir=Math.sign(force);
        ctx.strokeStyle='#ff6b6b';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(px,by+bh/2);ctx.lineTo(px+dir*Math.abs(force)*1.5,by+bh/2);ctx.stroke();
        ctx.fillStyle='#ff6b6b';
        ctx.beginPath();ctx.moveTo(px+dir*Math.abs(force)*1.5,by+bh/2-6);
        ctx.lineTo(px+dir*(Math.abs(force)*1.5+10),by+bh/2);
        ctx.lineTo(px+dir*Math.abs(force)*1.5,by+bh/2+6);ctx.fill();
        ctx.fillText('F='+force+'N',px+dir*Math.abs(force)*0.8,by-8);
      }
      // Friction arrow
      if(Math.abs(vx)>0.05){
        ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;
        const fd=-Math.sign(vx)*friction*mass*9.8*0.3;
        ctx.beginPath();ctx.moveTo(px,h-38);ctx.lineTo(px+fd,h-38);ctx.stroke();
      }
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>{cancelAnimationFrame(aid);delete window.fReset};
  }
});

// 3. ELECTRICITY & CIRCUITS (Ohm's Law)
reg('physics-circuits',{
  section:'physics',icon:'⚡',tKey:'p_circuits.t',dKey:'p_circuits.d',tagKey:'p_circuits.tag',expTKey:'p_circuits.exp_t',expKey:'p_circuits.exp',
  render(el){
    let voltage=9,resistance=100,aid;
    el.innerHTML=`<canvas id="circCv" height="320"></canvas>
      <div class="controls">
        <div class="ctrl"><label>${t('p_circuits.voltage')}</label><input type="range" id="cV" min="1" max="24" value="9"></div><span class="val" id="cVV">9V</span>
        <div class="ctrl"><label>${t('p_circuits.resistance')}</label><input type="range" id="cR" min="10" max="1000" value="100" step="10"></div><span class="val" id="cRV">100Ω</span>
      </div>
      <div class="info" style="margin-top:1rem">
        <div class="info-row"><span class="l">${t('p_circuits.current')}</span><span class="v" id="cI">0.090</span></div>
        <div class="info-row"><span class="l">${t('p_circuits.power')}</span><span class="v" id="cP">0.81</span></div>
        <div class="info-row"><span class="l">V = I × R</span><span class="v" id="cEq">9 = 0.09 × 100</span></div>
      </div>`;
    function upd(){
      const I=voltage/resistance,P=voltage*I;
      document.getElementById('cI').textContent=I.toFixed(3)+'A';
      document.getElementById('cP').textContent=P.toFixed(2)+'W';
      document.getElementById('cEq').textContent=`${voltage} = ${I.toFixed(3)} × ${resistance}`;
    }
    document.getElementById('cV').oninput=e=>{voltage=+e.target.value;document.getElementById('cVV').textContent=voltage+'V';upd()};
    document.getElementById('cR').oninput=e=>{resistance=+e.target.value;document.getElementById('cRV').textContent=resistance+'Ω';upd()};
    let eFlow=0;
    function draw(){
      const cv=document.getElementById('circCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=320;
      const ctx=setupCanvas(cv,w,h);
      const I=voltage/resistance;
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      // Circuit path
      const mx=w/2,my=h/2,cw=Math.min(w*0.7,400),ch=200;
      const l=mx-cw/2,r=mx+cw/2,tp=my-ch/2,bt=my+ch/2;
      ctx.strokeStyle='#333';ctx.lineWidth=3;ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(l,tp);ctx.lineTo(r,tp);ctx.lineTo(r,bt);ctx.lineTo(l,bt);ctx.closePath();ctx.stroke();
      // Battery (left side)
      ctx.strokeStyle='#f59e0b';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(l,my-15);ctx.lineTo(l,my+15);ctx.stroke();
      ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(l-8,my-8);ctx.lineTo(l-8,my+8);ctx.stroke();
      ctx.fillStyle='#f59e0b';ctx.font='bold 14px Space Mono';ctx.textAlign='center';
      ctx.fillText(voltage+'V',l-30,my+5);
      // Resistor (right side)
      ctx.strokeStyle='#10b981';ctx.lineWidth=2;
      const ry=my,rw=40;
      for(let i=0;i<6;i++){
        const x1=r-rw/2+(i/6)*rw,x2=r-rw/2+((i+1)/6)*rw;
        ctx.beginPath();ctx.moveTo(x1,i%2===0?ry-8:ry+8);ctx.lineTo(x2,i%2===0?ry+8:ry-8);ctx.stroke();
      }
      ctx.fillStyle='#10b981';ctx.fillText(resistance+'Ω',r+35,my+5);
      // Bulb (top)
      const brightness=Math.min(1,I*5);
      ctx.beginPath();ctx.arc(mx,tp,12,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,150,${brightness})`;ctx.fill();
      ctx.strokeStyle=`rgba(255,255,150,${0.3+brightness*0.7})`;ctx.lineWidth=1;ctx.stroke();
      if(brightness>0.2){ctx.beginPath();ctx.arc(mx,tp,12+brightness*15,0,Math.PI*2);
        const grd=ctx.createRadialGradient(mx,tp,12,mx,tp,12+brightness*15);
        grd.addColorStop(0,`rgba(255,255,150,${brightness*0.3})`);grd.addColorStop(1,'rgba(255,255,150,0)');
        ctx.fillStyle=grd;ctx.fill();}
      // Electron flow
      eFlow+=I*0.5;
      const path=[[l,tp],[mx-20,tp],[mx+20,tp],[r,tp],[r,my-20],[r,my+20],[r,bt],[mx+20,bt],[mx-20,bt],[l,bt],[l,my+20],[l,my-20]];
      ctx.fillStyle='#3b82f6';
      for(let i=0;i<12;i++){
        const idx=((eFlow*0.1+i*0.5)%path.length);
        const fi=Math.floor(idx)%path.length,ni=(fi+1)%path.length;
        const frac=idx-Math.floor(idx);
        const ex=path[fi][0]+(path[ni][0]-path[fi][0])*frac;
        const ey=path[fi][1]+(path[ni][1]-path[fi][1])*frac;
        ctx.beginPath();ctx.arc(ex,ey,3,0,Math.PI*2);ctx.fill();
      }
      // Labels
      ctx.fillStyle='var(--dim)';ctx.font='11px Outfit';
      ctx.fillText('I = '+I.toFixed(3)+'A',mx,bt+25);
      aid=requestAnimationFrame(draw);
    }
    upd();draw();return()=>cancelAnimationFrame(aid);
  }
});

// 4. LIGHT, LENSES & TELESCOPES
reg('physics-light',{
  section:'physics',icon:'🔭',tKey:'p_light.t',dKey:'p_light.d',tagKey:'p_light.tag',expTKey:'p_light.exp_t',expKey:'p_light.exp',
  render(el){
    let focal=120,objDist=250,lensType='convex',aid;
    el.innerHTML=`<canvas id="lightCv" height="350"></canvas>
      <div class="controls">
        <div class="ctrl"><label>${t('p_light.focal')}</label><input type="range" id="lF" min="40" max="200" value="120"></div><span class="val" id="lFV">120</span>
        <div class="ctrl"><label>${t('p_light.obj_dist')}</label><input type="range" id="lO" min="80" max="400" value="250"></div><span class="val" id="lOV">250</span>
        <button class="btn" id="lTypeBtn" onclick="toggleLens()">${t('p_light.convex')}</button>
      </div>`;
    document.getElementById('lF').oninput=e=>{focal=+e.target.value;document.getElementById('lFV').textContent=focal};
    document.getElementById('lO').oninput=e=>{objDist=+e.target.value;document.getElementById('lOV').textContent=objDist};
    window.toggleLens=()=>{lensType=lensType==='convex'?'concave':'convex';document.getElementById('lTypeBtn').textContent=t('p_light.'+lensType)};
    function draw(){
      const cv=document.getElementById('lightCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=350;
      const ctx=setupCanvas(cv,w,h);
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      const cx=w/2,cy=h/2;
      // Optical axis
      ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(w,cy);ctx.stroke();ctx.setLineDash([]);
      // Lens
      ctx.strokeStyle='rgba(59,130,246,0.8)';ctx.lineWidth=3;
      if(lensType==='convex'){
        ctx.beginPath();ctx.ellipse(cx,cy,8,h*0.35,0,0,Math.PI*2);ctx.stroke();
      }else{
        ctx.beginPath();ctx.moveTo(cx-8,cy-h*0.35);ctx.quadraticCurveTo(cx+5,cy,cx-8,cy+h*0.35);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+8,cy-h*0.35);ctx.quadraticCurveTo(cx-5,cy,cx+8,cy+h*0.35);ctx.stroke();
      }
      // Focal points
      ctx.fillStyle='rgba(245,158,11,0.7)';
      ctx.beginPath();ctx.arc(cx-focal,cy,4,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(cx+focal,cy,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(245,158,11,0.5)';ctx.font='10px Space Mono';ctx.textAlign='center';
      ctx.fillText('F',cx-focal,cy+15);ctx.fillText('F',cx+focal,cy+15);
      // Object (arrow on left)
      const objX=cx-objDist,objH=60;
      ctx.strokeStyle='#10b981';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(objX,cy);ctx.lineTo(objX,cy-objH);ctx.stroke();
      ctx.beginPath();ctx.moveTo(objX-5,cy-objH+10);ctx.lineTo(objX,cy-objH);ctx.lineTo(objX+5,cy-objH+10);ctx.stroke();
      // Image calculation: 1/f = 1/do + 1/di → di = f*do/(do-f)
      const f2=lensType==='convex'?focal:-focal;
      const di=f2*objDist/(objDist-f2);
      const mag=-di/objDist;
      const imgH=objH*mag;
      const imgX=cx+di;
      // Rays
      ctx.lineWidth=1.5;ctx.globalAlpha=0.6;
      // Ray 1: parallel to axis → through focal point
      ctx.strokeStyle='#ff6b6b';
      ctx.beginPath();ctx.moveTo(objX,cy-objH);ctx.lineTo(cx,cy-objH);
      if(di>0){ctx.lineTo(imgX,cy-imgH)}else{ctx.lineTo(cx+(w-cx),cy-objH+(objH/(focal))*(w-cx))}
      ctx.stroke();
      // Ray 2: through center → straight
      ctx.strokeStyle='#f59e0b';
      ctx.beginPath();ctx.moveTo(objX,cy-objH);ctx.lineTo(imgX,cy-imgH);ctx.stroke();
      // Ray 3: through near focal → parallel
      ctx.strokeStyle='#3b82f6';
      const slopeToF=(cy-objH-cy)/(objX-(cx-f2));
      ctx.beginPath();ctx.moveTo(objX,cy-objH);ctx.lineTo(cx,cy+slopeToF*(cx-objX));
      ctx.lineTo(imgX,cy-imgH);ctx.stroke();
      ctx.globalAlpha=1;
      // Image arrow
      if(Math.abs(di)<w){
        ctx.strokeStyle=di>0?'#ec4899':'rgba(236,72,153,0.4)';ctx.lineWidth=3;
        ctx.setLineDash(di>0?[]:[6,4]);
        ctx.beginPath();ctx.moveTo(imgX,cy);ctx.lineTo(imgX,cy-imgH);ctx.stroke();ctx.setLineDash([]);
      }
      // Info
      ctx.fillStyle='#fff';ctx.font='11px Space Mono';ctx.textAlign='left';
      ctx.fillText(`Image: ${di>0?'Real':'Virtual'}, ${Math.abs(mag).toFixed(1)}x, ${mag<0?'Inverted':'Upright'}`,10,25);
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>{cancelAnimationFrame(aid);delete window.toggleLens};
  }
});

// 5. ENERGY & WAVES (Pendulum + wave)
reg('physics-energy',{
  section:'physics',icon:'🔋',tKey:'p_energy.t',dKey:'p_energy.d',tagKey:'p_energy.tag',expTKey:'p_energy.exp_t',expKey:'p_energy.exp',
  render(el){
    let angle=Math.PI/3,angVel=0,aid,time=0;
    const L=150,g=9.8,damping=0.999;
    el.innerHTML=`<canvas id="energyCv" height="380"></canvas>
      <div style="display:flex;gap:2rem;margin-top:0.5rem;font-family:var(--mono);font-size:0.85rem;justify-content:center">
        <span>${t('p_energy.ke')}: <span id="eKE" style="color:#ff6b6b">0</span></span>
        <span>${t('p_energy.pe')}: <span id="ePE" style="color:#3b82f6">0</span></span>
        <span>${t('p_energy.total')}: <span id="eT" style="color:#10b981">0</span></span>
      </div>
      <p style="font-size:0.8rem;color:var(--dim);text-align:center;margin-top:0.3rem">Click and drag the pendulum to set angle</p>`;
    const cv=document.getElementById('energyCv');
    let dragging=false;
    cv.onmousedown=cv.ontouchstart=e=>{dragging=true;angVel=0;e.preventDefault()};
    cv.onmouseup=cv.ontouchend=()=>{dragging=false};
    cv.onmousemove=cv.ontouchmove=e=>{
      if(!dragging)return;
      const rect=cv.getBoundingClientRect();
      const mx=(e.clientX||e.touches[0].clientX)-rect.left;
      const w2=rect.width/2;
      angle=Math.max(-Math.PI/2,Math.min(Math.PI/2,(mx-w2)/(L*0.8)));
    };
    function draw(){
      if(!document.getElementById('energyCv'))return;
      const w=cv.parentElement.getBoundingClientRect().width,h=380;
      const ctx=setupCanvas(cv,w,h);
      if(!dragging){
        const angAcc=-g/L*Math.sin(angle);
        angVel+=angAcc*0.016;angVel*=damping;angle+=angVel*0.016;
      }
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      const ox=w/2,oy=50;
      const bx=ox+Math.sin(angle)*L,by=oy+Math.cos(angle)*L;
      // Rod
      ctx.strokeStyle='#444';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(bx,by);ctx.stroke();
      // Pivot
      ctx.fillStyle='#666';ctx.beginPath();ctx.arc(ox,oy,5,0,Math.PI*2);ctx.fill();
      // Bob
      ctx.beginPath();ctx.arc(bx,by,18,0,Math.PI*2);
      ctx.fillStyle='#3b82f6';ctx.shadowColor='rgba(59,130,246,0.4)';ctx.shadowBlur=15;ctx.fill();ctx.shadowBlur=0;
      // Energy
      const height=L-Math.cos(angle)*L;
      const pe=height*g*0.01;const ke=0.5*L*angVel*angVel*0.0001;const total=pe+ke;
      document.getElementById('eKE').textContent=ke.toFixed(2);
      document.getElementById('ePE').textContent=pe.toFixed(2);
      document.getElementById('eT').textContent=total.toFixed(2);
      // Energy bars
      const barW=100,barH=12,barX=w-barW-20;
      ctx.fillStyle='#1a1a35';ctx.fillRect(barX,20,barW,barH);ctx.fillRect(barX,38,barW,barH);ctx.fillRect(barX,56,barW,barH);
      const maxE=L*g*0.01*1.2;
      ctx.fillStyle='#ff6b6b';ctx.fillRect(barX,20,ke/maxE*barW,barH);
      ctx.fillStyle='#3b82f6';ctx.fillRect(barX,38,pe/maxE*barW,barH);
      ctx.fillStyle='#10b981';ctx.fillRect(barX,56,total/maxE*barW,barH);
      ctx.fillStyle='#fff';ctx.font='9px Space Mono';ctx.textAlign='right';
      ctx.fillText('KE',barX-4,30);ctx.fillText('PE',barX-4,48);ctx.fillText('Total',barX-8,66);
      // Trail
      time+=0.016;
      const trailY=h-80+Math.sin(angle)*40;
      ctx.fillStyle='rgba(59,130,246,0.5)';
      ctx.beginPath();ctx.arc(20+(time*30)%w,trailY,2,0,Math.PI*2);ctx.fill();
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(aid);
  }
});
