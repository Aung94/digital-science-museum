// ═══════════════════════════════════════
//  SPACE EXHIBITS (5)
// ═══════════════════════════════════════

const PLANETS=[
  {name:'Mercury',my:'ဗုဒ္ဓဟူးဂြိုလ်',color:'#b5b5b5',r:4,orbit:45,spd:4.15,moons:0,dist:'57.9M km',diam:'4,879 km',day:'58.6 days',yr:'88 days'},
  {name:'Venus',my:'သောကြာဂြိုလ်',color:'#e8cda0',r:6,orbit:70,spd:1.62,moons:0,dist:'108.2M km',diam:'12,104 km',day:'243 days',yr:'225 days'},
  {name:'Earth',my:'ကမ္ဘာဂြိုလ်',color:'#4a9eff',r:6,orbit:100,spd:1,moons:1,dist:'149.6M km',diam:'12,756 km',day:'24 hours',yr:'365.25 days'},
  {name:'Mars',my:'အင်္ဂါဂြိုလ်',color:'#e07040',r:5,orbit:130,spd:0.53,moons:2,dist:'227.9M km',diam:'6,792 km',day:'24.6 hours',yr:'687 days'},
  {name:'Jupiter',my:'ကြာသပတေးဂြိုလ်',color:'#d4a574',r:14,orbit:185,spd:0.084,moons:95,dist:'778.6M km',diam:'142,984 km',day:'9.9 hours',yr:'11.9 years'},
  {name:'Saturn',my:'စနေဂြိုလ်',color:'#f0d890',r:12,orbit:235,spd:0.034,moons:146,dist:'1,433M km',diam:'120,536 km',day:'10.7 hours',yr:'29.5 years'},
  {name:'Uranus',my:'ယူရေးနပ်',color:'#7de7e7',r:9,orbit:285,spd:0.012,moons:28,dist:'2,872M km',diam:'51,118 km',day:'17.2 hours',yr:'84 years'},
  {name:'Neptune',my:'နက်ပကျွန်း',color:'#4466ff',r:8,orbit:325,spd:0.006,moons:16,dist:'4,495M km',diam:'49,528 km',day:'16.1 hours',yr:'165 years'}
];

// 1. SOLAR SYSTEM
reg('space-solar',{
  section:'space',icon:'🪐',tKey:'s_solar.t',dKey:'s_solar.d',tagKey:'s_solar.tag',expTKey:'s_solar.exp_t',expKey:'s_solar.exp',
  render(el){
    let spd=1,aid,time=0,sel=null;
    el.innerHTML=`<canvas id="solCv" height="420" style="cursor:pointer"></canvas>
      <div class="two-col" style="margin-top:1rem">
        <div class="controls">
          <div class="ctrl"><label>${t('s_solar.speed')}</label><input type="range" id="solSpd" min="0" max="10" value="1" step="0.5"></div>
          <span class="val" id="solSpdV">1x</span>
        </div>
        <div class="info" id="plInfo"><p style="color:var(--dim);text-align:center">Click a planet</p></div>
      </div>`;
    document.getElementById('solSpd').oninput=e=>{spd=+e.target.value;document.getElementById('solSpdV').textContent=spd+'x'};
    const cv=document.getElementById('solCv');
    cv.onclick=e=>{
      const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,cx=r.width/2,cy=210;
      for(const p of PLANETS){
        const a=time*p.spd*0.02,px=cx+Math.cos(a)*p.orbit,py=cy+Math.sin(a)*p.orbit*0.4;
        if((mx-px)**2+(my-py)**2<(p.r+10)**2){
          sel=p;const nm=currentLang==='my'?p.my:p.name;
          document.getElementById('plInfo').innerHTML=`<h4 style="color:${p.color}">${nm}</h4>
            <div class="info-row"><span class="l">${t('s_solar.dist')}</span><span class="v">${p.dist}</span></div>
            <div class="info-row"><span class="l">${t('s_solar.diam')}</span><span class="v">${p.diam}</span></div>
            <div class="info-row"><span class="l">${t('s_solar.moons')}</span><span class="v">${p.moons}</span></div>
            <div class="info-row"><span class="l">${t('s_solar.day')}</span><span class="v">${p.day}</span></div>
            <div class="info-row"><span class="l">${t('s_solar.year')}</span><span class="v">${p.yr}</span></div>`;break}
      }
    };
    function draw(){
      if(!document.getElementById('solCv'))return;
      const w=cv.parentElement.getBoundingClientRect().width,h=420;
      const ctx=setupCanvas(cv,w,h);const cx=w/2,cy=h/2;time+=spd;
      ctx.fillStyle='#050510';ctx.fillRect(0,0,w,h);
      for(let i=0;i<80;i++){ctx.fillStyle=`rgba(255,255,255,${0.2+(i%4)*0.15})`;ctx.fillRect((i*7919+104729)%w,(i*6271+97381)%h,1,1)}
      // Sun
      const sg=ctx.createRadialGradient(cx,cy,0,cx,cy,22);sg.addColorStop(0,'#fff8e0');sg.addColorStop(0.5,'#ffcc00');sg.addColorStop(1,'rgba(255,150,0,0)');
      ctx.fillStyle=sg;ctx.beginPath();ctx.arc(cx,cy,22,0,Math.PI*2);ctx.fill();
      for(const p of PLANETS){
        ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(cx,cy,p.orbit,p.orbit*0.4,0,0,Math.PI*2);ctx.stroke();
        const a=time*p.spd*0.02,px=cx+Math.cos(a)*p.orbit,py=cy+Math.sin(a)*p.orbit*0.4;
        ctx.beginPath();ctx.arc(px,py,p.r,0,Math.PI*2);ctx.fillStyle=p.color;ctx.fill();
        if(p.name==='Saturn'){ctx.strokeStyle='rgba(240,216,144,0.5)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(px,py,p.r+6,3,0.3,0,Math.PI*2);ctx.stroke()}
        ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='8px Space Mono';ctx.textAlign='center';
        ctx.fillText(currentLang==='my'?p.my:p.name,px,py-p.r-4);
        if(sel===p){ctx.strokeStyle=p.color;ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(px,py,p.r+5,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
      }
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(aid);
  }
});

// 2. ROCKET LAUNCH — Moon Mission Optimizer
reg('space-rocket',{
  section:'space',icon:'🚀',tKey:'s_rocket.t',dKey:'s_rocket.d',tagKey:'s_rocket.tag',expTKey:'s_rocket.exp_t',expKey:'s_rocket.exp',
  render(el){
    // ── Constants ────────────────────────────────────────────────────
    const G0=9.81, R_EARTH=6371, DRY_PER_STAGE=2000;
    // Engine types: name, ISP (s), min thrust (kN), max thrust (kN)
    const ENGINES=[
      {key:'kerosene', isp:310, minT:400, maxT:4000, icon:'🔥'},
      {key:'methane',  isp:360, minT:400, maxT:3500, icon:'🟢'},
      {key:'hydrogen', isp:450, minT:300, maxT:3000, icon:'💧'}
    ];
    // Milestones
    const MS=[
      {alt:100,vel:0,label:'🌍 Kármán Line (100km)',col:'#60a5fa'},
      {alt:200,vel:7800,label:'🛰 LEO Orbit',col:'#a78bfa'},
      {alt:384400,vel:0,label:'🌕 Moon!',col:'#fbbf24'}
    ];

    // ── Parameters ──────────────────────────────────────────────────
    let engIdx=0, thrust_kN=1500, fuel_kg=50000, payload_kg=1000, angle_deg=80, stages=2;
    // Capacity: max cargo (fuel+payload) per stage — represents tankage volume
    const CAPACITY_PER_STAGE=80000; // kg per stage
    const maxCapacity=()=>CAPACITY_PER_STAGE*stages;
    // ── Sim state ───────────────────────────────────────────────────
    let alt=0,downrange=0,vx=0,vy=0,mass=0,fuel_left=0,stagesLeft=0;
    let launched=false,done=false,init_fuel=0,rStatus='',statusCol='#10b981',trail=[],aid;
    let msReached=[false,false,false], maxAltReached=0;
    let autoAdjMsg='';

    const eng=()=>ENGINES[engIdx];
    const initMass=()=>DRY_PER_STAGE*stages+fuel_kg+payload_kg;
    const twrCalc=()=>(thrust_kN*1000)/(initMass()*G0);

    // ── Proper multi-stage Δv (sequential burn + jettison) ─────────
    function stageDv(){
      const isp=eng().isp, fuelPerStage=fuel_kg/stages;
      let totalDv=0;
      for(let s=stages;s>=1;s--){
        // Payload above this stage: upper stages (full) + final payload
        const upperDry=(s-1)*DRY_PER_STAGE;
        const upperFuel=(s-1)*fuelPerStage;
        const payloadAbove=upperDry+upperFuel+payload_kg;
        // This stage
        const m0=DRY_PER_STAGE+fuelPerStage+payloadAbove;
        const mf=DRY_PER_STAGE+payloadAbove;
        if(mf>0&&m0>mf) totalDv+=isp*G0*Math.log(m0/mf);
      }
      return totalDv;
    }
    // Predicted Δv after gravity/drag losses (~2000 m/s)
    const predDv=()=>Math.max(0,stageDv()-2000);

    function missionPredict(){
      const dv=predDv(), tw=twrCalc();
      if(tw<1) return {label:'⛔ Can\'t Lift Off (TWR<1)',col:'#ef4444',pct:0};
      if(tw<1.15) return {label:'⚠️ TWR too low, barely lifts',col:'#f59e0b',pct:2};
      if(dv<2000) return {label:'💨 Sub-orbital hop',col:'#6b7280',pct:5};
      if(dv<5000) return {label:'🌍 Upper atmosphere',col:'#60a5fa',pct:15};
      if(dv<7800) return {label:'🌍 High sub-orbital',col:'#38bdf8',pct:30};
      if(dv<9500) return {label:'🛰 LEO Orbit possible!',col:'#a78bfa',pct:50};
      if(dv<11200) return {label:'🛰 High orbit possible!',col:'#8b5cf6',pct:65};
      if(dv<14000) return {label:'🌕 Moon flyby possible!',col:'#fbbf24',pct:82};
      if(dv<16000) return {label:'🌕 Lunar orbit possible!',col:'#f59e0b',pct:92};
      return {label:'🌕 Moon landing possible!',col:'#10b981',pct:100};
    }

    // ── Auto-adjust logic ───────────────────────────────────────────
    // Helper: update a slider + display
    function setSlider(id,vid,val,fmt){
      const sl=document.getElementById(id),vl=document.getElementById(vid);
      if(sl) sl.value=val;
      if(vl) vl.textContent=fmt(val);
    }

    function autoAdjustThrust(){
      // Ensure TWR >= 1.4 when mass changes
      const minThrust=Math.ceil((initMass()*G0*1.4)/1000/50)*50;
      const e=eng();
      if(thrust_kN<minThrust){
        thrust_kN=Math.min(minThrust,e.maxT);
        setSlider('rT','rTV',thrust_kN,v=>v.toLocaleString()+' kN');
        const sl=document.getElementById('rT');
        if(sl){sl.max=e.maxT;sl.min=e.minT;}
        autoAdjMsg=t('s_rocket.auto_adj')+': '+t('s_rocket.thrust')+' → '+thrust_kN.toLocaleString()+' kN';
        return;
      }
      autoAdjMsg='';
    }

    // When fuel changes → auto-reduce payload if over capacity
    function onFuelChange(newFuel){
      const cap=maxCapacity();
      fuel_kg=Math.min(newFuel,cap-100); // always leave room for min payload
      if(fuel_kg!==newFuel) setSlider('rF','rFV',fuel_kg,v=>v.toLocaleString()+' kg');
      if(fuel_kg+payload_kg>cap){
        payload_kg=Math.max(100,cap-fuel_kg);
        setSlider('rP','rPV',payload_kg,v=>v.toLocaleString()+' kg');
        autoAdjMsg=t('s_rocket.auto_adj')+': '+t('s_rocket.payload')+' ↓ '+payload_kg.toLocaleString()+' kg';
      } else { autoAdjMsg=''; }
      autoAdjustThrust();
    }

    // When payload changes → auto-reduce fuel if over capacity
    function onPayloadChange(newPay){
      const cap=maxCapacity();
      payload_kg=Math.min(newPay,cap-5000); // always leave room for min fuel
      if(payload_kg!==newPay) setSlider('rP','rPV',payload_kg,v=>v.toLocaleString()+' kg');
      if(fuel_kg+payload_kg>cap){
        fuel_kg=Math.max(5000,cap-payload_kg);
        setSlider('rF','rFV',fuel_kg,v=>v.toLocaleString()+' kg');
        autoAdjMsg=t('s_rocket.auto_adj')+': '+t('s_rocket.fuel')+' ↓ '+fuel_kg.toLocaleString()+' kg';
      } else { autoAdjMsg=''; }
      autoAdjustThrust();
    }

    // When stages change → capacity changes, rebalance
    function onStagesChange(newStg){
      stages=newStg;
      const cap=maxCapacity();
      if(fuel_kg+payload_kg>cap){
        // Proportionally reduce both
        const ratio=cap/(fuel_kg+payload_kg);
        fuel_kg=Math.max(5000,Math.round(fuel_kg*ratio/5000)*5000);
        payload_kg=Math.max(100,Math.min(cap-fuel_kg,Math.round(payload_kg*ratio/100)*100));
        setSlider('rF','rFV',fuel_kg,v=>v.toLocaleString()+' kg');
        setSlider('rP','rPV',payload_kg,v=>v.toLocaleString()+' kg');
        autoAdjMsg=t('s_rocket.auto_adj')+': capacity '+cap.toLocaleString()+' kg';
      }
      autoAdjustThrust();
    }

    function autoAdjustForEngine(){
      const e=eng();
      thrust_kN=Math.max(e.minT,Math.min(e.maxT,thrust_kN));
      setSlider('rT','rTV',thrust_kN,v=>v.toLocaleString()+' kN');
      const sl=document.getElementById('rT');
      if(sl){sl.max=e.maxT;sl.min=e.minT;}
      autoAdjustThrust();
    }

    // ── Build UI ────────────────────────────────────────────────────
    const engBtns=ENGINES.map((e,i)=>
      `<button class="btn ${i===engIdx?'btn-p':''}" id="rEng${i}" onclick="rSetEng(${i})" style="font-size:0.7rem;padding:0.25rem 0.5rem">${e.icon} ${t('s_rocket.'+e.key)} <span style="color:var(--dim);font-size:0.6em">ISP ${e.isp}</span></button>`
    ).join('');

    el.innerHTML=`<canvas id="rktCv" height="380"></canvas>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:0.8rem;margin:0.6rem 0">
        <div style="font-family:var(--mono);font-size:0.7rem;color:var(--dim);margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.06em">${t('s_rocket.mission')} — ${t('s_rocket.optimize')}</div>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.6rem">${engBtns}</div>
        <div style="display:flex;gap:0.8rem;flex-wrap:wrap;margin-bottom:0.5rem">
          <div class="ctrl" style="flex:1;min-width:130px"><label>${t('s_rocket.thrust')} (kN) <span style="color:var(--dim);font-size:0.6em">${t('s_rocket.thr_hint')}</span></label><input type="range" id="rT" min="${eng().minT}" max="${eng().maxT}" value="${thrust_kN}" step="50"></div><span class="val" id="rTV">${thrust_kN.toLocaleString()} kN</span>
          <div class="ctrl" style="flex:1;min-width:130px"><label>${t('s_rocket.fuel')} (kg) <span style="color:var(--dim);font-size:0.6em">${t('s_rocket.fuel_hint')}</span></label><input type="range" id="rF" min="5000" max="200000" value="${fuel_kg}" step="5000"></div><span class="val" id="rFV">${fuel_kg.toLocaleString()} kg</span>
        </div>
        <div style="display:flex;gap:0.8rem;flex-wrap:wrap;margin-bottom:0.5rem">
          <div class="ctrl" style="flex:1;min-width:130px"><label>${t('s_rocket.payload')} (kg) <span style="color:var(--dim);font-size:0.6em">${t('s_rocket.pay_hint')}</span></label><input type="range" id="rP" min="100" max="10000" value="${payload_kg}" step="100"></div><span class="val" id="rPV">${payload_kg.toLocaleString()} kg</span>
          <div class="ctrl" style="flex:1;min-width:130px"><label>${t('s_rocket.stages')} <span style="color:var(--dim);font-size:0.6em">${t('s_rocket.stg_hint')}</span></label><input type="range" id="rSt" min="1" max="3" value="${stages}" step="1"></div><span class="val" id="rStV">${stages} stage${stages>1?'s':''}</span>
        </div>
        <div style="display:flex;gap:0.8rem;flex-wrap:wrap;margin-bottom:0.5rem">
          <div class="ctrl" style="flex:1;min-width:130px"><label>${t('s_rocket.angle')} (°) <span style="color:var(--dim);font-size:0.6em">${t('s_rocket.ang_hint')}</span></label><input type="range" id="rA" min="50" max="90" value="${angle_deg}" step="1"></div><span class="val" id="rAV">${angle_deg}°</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;font-family:var(--mono);font-size:0.65rem">
          <span style="color:var(--dim)">Capacity:</span>
          <div style="flex:1;background:rgba(255,255,255,0.07);border-radius:3px;height:10px;position:relative;overflow:hidden">
            <div id="rCapFuel" style="position:absolute;left:0;top:0;height:100%;background:#f59e0b;transition:width 0.2s"></div>
            <div id="rCapPay" style="position:absolute;top:0;height:100%;background:#a78bfa;transition:left 0.2s,width 0.2s"></div>
          </div>
          <span id="rCapTxt" style="color:var(--dim);min-width:90px;text-align:right"></span>
        </div>
        <div style="display:flex;gap:1rem;font-size:0.6rem;color:var(--dim);margin-bottom:0.3rem;font-family:var(--mono)">
          <span><span style="color:#f59e0b">■</span> ${t('s_rocket.fuel')}</span>
          <span><span style="color:#a78bfa">■</span> ${t('s_rocket.payload')}</span>
          <span style="margin-left:auto"><span style="color:rgba(255,255,255,0.15)">■</span> Free</span>
        </div>
        <div id="rAutoMsg" style="font-family:var(--mono);font-size:0.65rem;color:#f59e0b;min-height:1em;margin-bottom:0.3rem"></div>
        <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap">
          <span style="font-family:var(--mono);font-size:0.7rem;color:var(--dim)">${t('s_rocket.predict')}:</span>
          <span id="rPred" style="font-family:var(--mono);font-size:0.75rem;font-weight:700"></span>
          <div style="flex:1;background:rgba(255,255,255,0.07);border-radius:4px;height:6px;min-width:80px"><div id="rPredBar" style="height:6px;border-radius:4px;transition:width 0.3s,background 0.3s"></div></div>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;align-items:center">
          <span style="font-family:var(--mono);font-size:0.7rem">${t('s_rocket.mass')}: <span id="rMass" style="color:#f59e0b"></span></span>
          <span style="font-family:var(--mono);font-size:0.7rem">${t('s_rocket.twr')}: <span id="rTWR"></span></span>
          <span style="font-family:var(--mono);font-size:0.7rem">${t('s_rocket.dv')}: <span id="rDv" style="color:#60a5fa"></span></span>
          <button class="btn btn-p" style="margin-left:auto" onclick="rLaunch()">🚀 ${t('s_rocket.launch')}</button>
          <button class="btn" onclick="rReset()">${t('s_rocket.reset')}</button>
        </div>
      </div>
      <div style="display:flex;gap:1rem;font-family:var(--mono);font-size:0.7rem;flex-wrap:wrap;margin-bottom:0.3rem">
        <span>Alt: <span id="rAlt" style="color:var(--space)">—</span></span>
        <span>Vel: <span id="rVel" style="color:var(--accent)">—</span></span>
        <span>Fuel: <span id="rFuel2" style="color:var(--chem)">—</span></span>
        <span id="rMsBox" style="margin-left:auto"></span>
      </div>`;

    // ── Refresh readouts ────────────────────────────────────────────
    function refreshStatic(){
      const tw=twrCalc(),dv=predDv(),pred=missionPredict();
      document.getElementById('rTWR').textContent=tw.toFixed(2);
      document.getElementById('rTWR').style.color=tw>=1.3?'#10b981':tw>=1?'#f59e0b':'#ef4444';
      document.getElementById('rMass').textContent=initMass().toLocaleString()+' kg';
      document.getElementById('rDv').textContent=Math.round(dv).toLocaleString()+' m/s';
      document.getElementById('rPred').textContent=pred.label;
      document.getElementById('rPred').style.color=pred.col;
      const bar=document.getElementById('rPredBar');
      bar.style.width=pred.pct+'%';bar.style.background=pred.col;
      // Capacity bar
      const cap=maxCapacity();
      const fPct=(fuel_kg/cap)*100, pPct=(payload_kg/cap)*100;
      const cf=document.getElementById('rCapFuel'),cp=document.getElementById('rCapPay'),ct=document.getElementById('rCapTxt');
      if(cf){cf.style.width=fPct+'%';}
      if(cp){cp.style.left=fPct+'%';cp.style.width=pPct+'%';}
      if(ct) ct.textContent=(fuel_kg+payload_kg).toLocaleString()+' / '+cap.toLocaleString()+' kg';
      // Auto-adjust message
      const am=document.getElementById('rAutoMsg');
      if(am){am.textContent=autoAdjMsg;setTimeout(()=>{autoAdjMsg='';if(am)am.textContent=''},2500);}
    }

    // ── Slider bindings with auto-coupling ──────────────────────────
    function bindSlider(id,vid,fmt,cb){
      document.getElementById(id).oninput=e=>{
        cb(+e.target.value);
        document.getElementById(vid).textContent=fmt(+e.target.value);
        refreshStatic();
      };
    }
    bindSlider('rT','rTV',v=>v.toLocaleString()+' kN',v=>{thrust_kN=v;autoAdjMsg=''});
    bindSlider('rF','rFV',v=>v.toLocaleString()+' kg',v=>{onFuelChange(v)});
    bindSlider('rP','rPV',v=>v.toLocaleString()+' kg',v=>{onPayloadChange(v)});
    bindSlider('rSt','rStV',v=>v+' stage'+(v>1?'s':''),v=>{onStagesChange(v)});
    bindSlider('rA','rAV',v=>v+'°',v=>{angle_deg=v});
    refreshStatic();

    // ── Engine selector ─────────────────────────────────────────────
    window.rSetEng=idx=>{
      engIdx=idx;
      ENGINES.forEach((_,i)=>{
        const b=document.getElementById('rEng'+i);
        if(b) b.className=i===idx?'btn btn-p':'btn';
      });
      autoAdjustForEngine();
      refreshStatic();
    };

    // ── Launch / Reset ──────────────────────────────────────────────
    window.rLaunch=()=>{
      if(launched||done)return;
      const tw=twrCalc();
      if(tw<1){rStatus='⛔ TWR='+tw.toFixed(2)+' < 1.0 — too heavy!';statusCol='#ef4444';return}
      if(tw<1.15){rStatus='⚠️ TWR='+tw.toFixed(2)+' — barely lifts, consider more thrust';statusCol='#f59e0b';}
      launched=true;done=false;rStatus='';msReached=[false,false,false];maxAltReached=0;
      alt=0;downrange=0;vx=0;vy=0;mass=initMass();fuel_left=init_fuel=fuel_kg;stagesLeft=stages;trail=[];
    };
    window.rReset=()=>{
      launched=false;done=false;rStatus='';msReached=[false,false,false];maxAltReached=0;
      alt=0;downrange=0;vx=0;vy=0;fuel_left=0;stagesLeft=0;trail=[];
      moonLandAnim=0;moonApproach=false;approachStart=0;approachAlt=0;
      ['rAlt','rVel','rFuel2'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent='—'});
      const mb=document.getElementById('rMsBox');if(mb)mb.textContent='';
      refreshStatic();
    };

    // ── Physics simulation ──────────────────────────────────────────
    function simulate(dt){
      const g=G0*Math.pow(R_EARTH/(R_EARTH+alt),2);
      const isp=eng().isp;
      const burn_rate=(thrust_kN*1000)/(isp*G0);

      // Current dry mass (remaining stages + payload)
      const dryNow=DRY_PER_STAGE*stagesLeft+payload_kg;
      // Fuel per stage
      const fuelPerStage=init_fuel/stages;

      // Stage separation: when current stage's fuel is depleted
      if(stagesLeft>1){
        const fuelBurned=init_fuel-fuel_left;
        const currentStageUsed=fuelBurned%fuelPerStage;
        const stagesDone=Math.floor(fuelBurned/fuelPerStage);
        const actualStagesLeft=stages-stagesDone;
        if(actualStagesLeft<stagesLeft){
          // Jettison stage! Drop dry mass
          mass-=DRY_PER_STAGE;
          stagesLeft=actualStagesLeft;
          rStatus='🔧 Stage separated! '+stagesLeft+' remaining';
          statusCol='#60a5fa';
        }
      }

      let ax=0,ay=0;
      if(fuel_left>0){
        const vel=Math.sqrt(vx*vx+vy*vy);
        let tA;
        // Gravity turn: start vertical, pitch over gradually
        if(vel<100){
          tA=angle_deg*Math.PI/180;
        } else {
          const vA=Math.atan2(vy,vx);
          const p=Math.min(1,(vel-100)/800);
          tA=(1-p)*(angle_deg*Math.PI/180)+p*vA;
        }
        const F=thrust_kN*1000;
        ax+=F*Math.cos(tA)/mass;
        ay+=F*Math.sin(tA)/mass;
        const b=burn_rate*dt;
        fuel_left=Math.max(0,fuel_left-b);
        mass=Math.max(dryNow,mass-b);
      }

      // Atmospheric drag (exponential decay, below 130km)
      if(alt<130){
        const vel=Math.sqrt(vx*vx+vy*vy);
        if(vel>0){
          const rho=1.225*Math.exp(-alt/8.5);
          const Cd=0.3, A=5; // drag coefficient, cross-section area
          const df=0.5*rho*vel*vel*Cd*A;
          ax-=df*(vx/vel)/mass;
          ay-=df*(vy/vel)/mass;
        }
      }

      ay-=g;
      vx+=ax*dt; vy+=ay*dt;
      alt+=vy*dt/1000; downrange+=vx*dt/1000;
      if(alt>maxAltReached) maxAltReached=alt;

      // Ground collision
      if(alt<0){
        alt=0;
        if(!done&&(Math.abs(vx)>10||Math.abs(vy)>10)){
          rStatus='💥 Crashed! Max alt: '+(maxAltReached>1000?(maxAltReached/1000).toFixed(0)+'k':Math.round(maxAltReached))+' km';
          statusCol='#ef4444';
        }
        launched=false;done=true;
      }
    }

    // ── Moon approach + landing animation state ─────────────────────
    let moonLandAnim=0; // 0=not started, >0 = frame count
    let moonApproach=false; // true = coasting to Moon (visual only)
    let approachStart=0, approachAlt=0; // starting altitude when approach began

    // ── Draw ─────────────────────────────────────────────────────────
    function draw(){
      const cv=document.getElementById('rktCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=380;
      const ctx=setupCanvas(cv,w,h);

      // ── Simulate steps ──────────────────────────────────────────
      if(launched&&!done){
        // Time warp: coast faster when no fuel and high altitude
        const warp=fuel_left<=0&&alt>500&&!moonApproach?Math.min(30,Math.floor(alt/600)):1;
        const steps=8*warp;
        for(let s=0;s<steps;s++) simulate(0.2);
        const vel2=Math.sqrt(vx*vx+vy*vy);
        trail.push({a:alt,d:downrange});if(trail.length>500)trail.shift();
        document.getElementById('rAlt').textContent=alt>1000?(alt/1000).toFixed(1)+'k km':alt.toFixed(1)+' km';
        document.getElementById('rVel').textContent=vel2>1000?(vel2/1000).toFixed(2)+' km/s':Math.round(vel2)+' m/s';
        document.getElementById('rFuel2').textContent=init_fuel>0?((fuel_left/init_fuel)*100).toFixed(0)+'%':'0%';
        // Milestone checks
        if(!msReached[0]&&alt>=100) msReached[0]=true;
        if(!msReached[1]&&alt>=200&&vel2>=7800){msReached[1]=true;rStatus='🛰 LEO achieved!';statusCol='#a78bfa';}
        if(!msReached[2]&&alt>=384400){msReached[2]=true;rStatus='🌕 Moon reached!';statusCol='#fbbf24';launched=false;done=true;moonLandAnim=1;}
        // Escape velocity check: if v > v_esc at current altitude → begin Moon approach
        if(!msReached[2]&&!moonApproach&&alt>150&&fuel_left<=0){
          const r_m=(R_EARTH+alt)*1000;
          const v_esc=Math.sqrt(2*3.986e14/r_m);
          if(vel2>=v_esc){
            moonApproach=true;
            approachStart=performance.now();
            // Start the visual approach from a low altitude for dramatic effect
            approachAlt=Math.min(alt,20000);
            alt=approachAlt;
            rStatus='🌕 On course for Moon!';statusCol='#fbbf24';
          }
        }
        // Moon approach animation: smoothly coast from ~20k km to 384,400 km over 5 seconds
        if(moonApproach&&!msReached[2]){
          const elapsed=(performance.now()-approachStart)/1000;
          const duration=5; // 5-second approach
          const progress=Math.min(1,elapsed/duration);
          // Ease-in then accelerate toward Moon (feels like gravity assist)
          const ease=progress*progress*(3-2*progress); // smoothstep
          alt=approachAlt+(384400-approachAlt)*ease;
          if(alt>maxAltReached) maxAltReached=alt;
          document.getElementById('rAlt').textContent=(alt/1000).toFixed(0)+'k km';
          if(progress>=1){
            msReached[2]=true;
            rStatus='🌕 Moon reached!';statusCol='#fbbf24';launched=false;done=true;moonLandAnim=1;
          }
        }
        document.getElementById('rMsBox').innerHTML=['🌍','🛰','🌕'].map((l,i)=>`<span style="opacity:${msReached[i]?1:0.25};font-size:1.1rem">${l}</span>`).join(' ');
        // Auto-stop: falling back, no fuel, low alt
        if(fuel_left<=0&&vy<-80&&alt<80&&!done){
          rStatus='📊 Max alt: '+(maxAltReached>1000?(maxAltReached/1000).toFixed(0)+'k':Math.round(maxAltReached))+' km'+(!msReached[1]?' — need more Δv!':!msReached[2]?' — need more stages/fuel for Moon!':' ✓');
          statusCol=msReached[1]?'#a78bfa':'#6b7280';launched=false;done=true;
        }
      }

      // ── Moon landing cinematic ────────────────────────────────────
      if(moonLandAnim>0){
        moonLandAnim++;
        const t2=Math.min(moonLandAnim/180,1); // 3 second animation
        // Full-screen moon surface scene
        ctx.fillStyle='#050510';ctx.fillRect(0,0,w,h);
        // Stars
        for(let i=0;i<120;i++){ctx.fillStyle=`rgba(255,255,255,${0.1+(i%6)*0.12})`;ctx.fillRect((i*7919+104729)%w,(i*6271)%(h*0.7),1,1)}
        // Earth in the sky (small, blue)
        const earthY=60,earthX=80;
        const eg=ctx.createRadialGradient(earthX,earthY,0,earthX,earthY,14);
        eg.addColorStop(0,'#4a9eff');eg.addColorStop(0.7,'#2060c0');eg.addColorStop(1,'rgba(32,96,192,0)');
        ctx.fillStyle=eg;ctx.beginPath();ctx.arc(earthX,earthY,14,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='8px Space Mono';ctx.textAlign='center';ctx.fillText('🌍 Earth',earthX,earthY+24);
        // Moon surface (grey, cratered)
        const surfY=h-80;
        const surfGrad=ctx.createLinearGradient(0,surfY-20,0,h);
        surfGrad.addColorStop(0,'#8a8570');surfGrad.addColorStop(0.3,'#6b6355');surfGrad.addColorStop(1,'#4a4540');
        ctx.fillStyle=surfGrad;ctx.fillRect(0,surfY,w,h-surfY);
        // Craters
        [[w*0.15,surfY+30,18],[w*0.45,surfY+45,25],[w*0.7,surfY+20,14],[w*0.85,surfY+55,20],[w*0.3,surfY+60,12]].forEach(([cx2,cy2,r])=>{
          ctx.beginPath();ctx.arc(cx2,cy2,r,0,Math.PI*2);
          ctx.fillStyle='rgba(60,55,48,0.6)';ctx.fill();
          ctx.strokeStyle='rgba(100,95,85,0.4)';ctx.lineWidth=1;ctx.stroke();
        });
        // Rocket descending to surface
        const rktY=Math.max(surfY-30, 50+(surfY-80)*t2);
        const rktX=w/2;
        ctx.save();ctx.translate(rktX,rktY);
        // Rocket body (bigger for close-up)
        const sc=1.8;
        ctx.scale(sc,sc);
        ctx.fillStyle='#e5e7eb';ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(-5,0);ctx.lineTo(-4,10);ctx.lineTo(4,10);ctx.lineTo(5,0);ctx.closePath();ctx.fill();
        ctx.fillStyle=engIdx===0?'#ef4444':engIdx===1?'#22c55e':'#3b82f6';
        ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(-3,-10);ctx.lineTo(3,-10);ctx.closePath();ctx.fill();
        ctx.fillStyle='#9ca3af';
        ctx.beginPath();ctx.moveTo(-5,4);ctx.lineTo(-10,12);ctx.lineTo(-4,9);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.moveTo(5,4);ctx.lineTo(10,12);ctx.lineTo(4,9);ctx.closePath();ctx.fill();
        // Landing burn flame (fades as we land)
        if(t2<0.9){
          const fl=8+Math.random()*10*(1-t2);
          ctx.fillStyle=`rgba(255,${150+Math.random()*100},50,${0.8*(1-t2)})`;
          ctx.beginPath();ctx.moveTo(-3,10);ctx.lineTo(0,10+fl);ctx.lineTo(3,10);ctx.closePath();ctx.fill();
        }
        ctx.restore();
        // Landing legs (appear near surface)
        if(t2>0.7){
          const legA=(t2-0.7)/0.3;
          ctx.strokeStyle=`rgba(200,200,200,${legA})`;ctx.lineWidth=2;
          ctx.beginPath();ctx.moveTo(rktX-8*sc,rktY+8*sc);ctx.lineTo(rktX-14*sc,rktY+18*sc);ctx.stroke();
          ctx.beginPath();ctx.moveTo(rktX+8*sc,rktY+8*sc);ctx.lineTo(rktX+14*sc,rktY+18*sc);ctx.stroke();
        }
        // Success text (fades in at end)
        if(t2>0.6){
          const tA=Math.min(1,(t2-0.6)/0.3);
          ctx.globalAlpha=tA;
          ctx.fillStyle='#fbbf24';ctx.font='bold 22px Outfit';ctx.textAlign='center';
          ctx.fillText('🌕 Moon Landing Successful!',w/2,50);
          ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='14px Space Mono';
          ctx.fillText('Distance: 384,400 km',w/2,78);
          // Confetti particles
          for(let i=0;i<20;i++){
            const cx2=w*0.2+Math.random()*w*0.6;
            const cy2=90+Math.random()*40;
            ctx.fillStyle=['#fbbf24','#ef4444','#10b981','#3b82f6','#a78bfa'][i%5];
            ctx.fillRect(cx2,cy2+Math.sin(moonLandAnim*0.05+i)*8,3,3);
          }
          ctx.globalAlpha=1;
        }
        // Warp indicator
        ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='9px Space Mono';ctx.textAlign='right';
        ctx.fillText('Click Reset to try again',w-10,h-10);

        aid=requestAnimationFrame(draw);
        return;
      }

      // ── Determine camera mode ──────────────────────────────────────
      // Phase 1: Launch (alt < 500km) — ground-relative view
      // Phase 2: Space transit (alt > 500km) — rocket-centered, Earth below, Moon above
      // Phase 3: Approaching Moon (alt > 300000km) — Moon grows larger
      const inTransit=(launched||moonApproach)&&alt>500||done&&!msReached[2]&&maxAltReached>500;

      if(inTransit&&!done){
        // ── SPACE TRANSIT VIEW: rocket centered, Earth+Moon as reference ──
        ctx.fillStyle='#030308';ctx.fillRect(0,0,w,h);
        // Stars (parallax based on altitude)
        for(let i=0;i<100;i++){
          const sx=((i*7919+104729)+alt*0.001*((i%3)+1))%w;
          const sy=(i*6271+97381)%h;
          ctx.fillStyle=`rgba(255,255,255,${0.1+(i%5)*0.1})`;
          ctx.fillRect(sx,sy,1,1);
        }
        // Earth (bottom-left, shrinks with altitude)
        const earthSz=Math.max(8,60-alt/8000);
        const eX=60,eY=h-40;
        const eGrad=ctx.createRadialGradient(eX,eY,0,eX,eY,earthSz);
        eGrad.addColorStop(0,'#4a9eff');eGrad.addColorStop(0.6,'#2060c0');eGrad.addColorStop(1,'rgba(32,96,192,0)');
        ctx.fillStyle=eGrad;ctx.beginPath();ctx.arc(eX,eY,earthSz,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='8px Space Mono';ctx.textAlign='center';
        ctx.fillText('🌍',eX,eY-earthSz-5);
        // Moon (top-right, grows as we approach)
        const moonProgress=Math.min(1,alt/384400);
        const moonSz=Math.max(10,8+moonProgress*60);
        const mX=w-60,mY=50;
        const mGrad=ctx.createRadialGradient(mX,mY,0,mX,mY,moonSz);
        mGrad.addColorStop(0,'#f5f5dc');mGrad.addColorStop(0.7,'#d4d0b0');mGrad.addColorStop(1,'rgba(212,208,176,0)');
        ctx.fillStyle=mGrad;ctx.beginPath();ctx.arc(mX,mY,moonSz,0,Math.PI*2);ctx.fill();
        // Moon craters (visible when close)
        if(moonSz>20){
          ctx.fillStyle='rgba(160,155,135,0.3)';
          [[-0.2,-0.15,0.15],[0.1,0.05,0.12],[-0.35,0.2,0.1],[0.2,-0.3,0.08]].forEach(([ox,oy,or])=>{
            ctx.beginPath();ctx.arc(mX+ox*moonSz,mY+oy*moonSz,or*moonSz,0,Math.PI*2);ctx.fill();
          });
        }
        ctx.fillStyle='rgba(251,191,36,0.8)';ctx.font='9px Space Mono';ctx.textAlign='center';
        ctx.fillText('🌕 Moon',mX,mY+moonSz+14);
        // Progress line Earth→Moon
        ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.setLineDash([4,8]);ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(eX+earthSz+5,eY);ctx.lineTo(mX-moonSz-5,mY);ctx.stroke();ctx.setLineDash([]);
        // Rocket at proportional position on the line
        const lx1=eX+earthSz+10,ly1=eY,lx2=mX-moonSz-10,ly2=mY;
        const rktPx=lx1+(lx2-lx1)*moonProgress;
        const rktPy=ly1+(ly2-ly1)*moonProgress;
        // Draw rocket — nose points toward Moon (up = -y in local, travel = Earth→Moon)
        const ang2=Math.atan2(ly2-ly1,lx2-lx1);
        ctx.save();ctx.translate(rktPx,rktPy);ctx.rotate(ang2+Math.PI/2);
        ctx.fillStyle='#e5e7eb';ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(-4,0);ctx.lineTo(-3,8);ctx.lineTo(3,8);ctx.lineTo(4,0);ctx.closePath();ctx.fill();
        ctx.fillStyle=engIdx===0?'#ef4444':engIdx===1?'#22c55e':'#3b82f6';
        ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(-2.5,-8);ctx.lineTo(2.5,-8);ctx.closePath();ctx.fill();
        ctx.fillStyle='#9ca3af';
        ctx.beginPath();ctx.moveTo(-4,3);ctx.lineTo(-7,9);ctx.lineTo(-3,7);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.moveTo(4,3);ctx.lineTo(7,9);ctx.lineTo(3,7);ctx.closePath();ctx.fill();
        if(fuel_left>0){
          const fCol=engIdx===0?[255,150,30]:engIdx===1?[100,255,130]:[100,180,255];
          ctx.fillStyle=`rgba(${fCol[0]},${fCol[1]},${fCol[2]},0.8)`;
          ctx.beginPath();ctx.moveTo(-2,8);ctx.lineTo(0,8+6+Math.random()*6);ctx.lineTo(2,8);ctx.closePath();ctx.fill();
        }
        ctx.restore();
        // Distance readout
        ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px Space Mono';ctx.textAlign='center';
        const distStr=alt>1000?(alt/1000).toFixed(0)+'k km':Math.round(alt)+' km';
        ctx.fillText(distStr+' / 384,400 km',w/2,h-12);
        // Progress bar at bottom
        ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(20,h-8,w-40,4);
        ctx.fillStyle='#fbbf24';ctx.fillRect(20,h-8,(w-40)*moonProgress,4);
        // Status indicator
        if(moonApproach){
          ctx.fillStyle='#fbbf24';ctx.font='bold 11px Space Mono';ctx.textAlign='left';
          ctx.fillText('🌕 Approaching Moon...',10,16);
          // Pulsing glow around Moon
          const pulse=0.3+0.3*Math.sin(performance.now()*0.005);
          ctx.strokeStyle=`rgba(251,191,36,${pulse})`;ctx.lineWidth=2;
          ctx.beginPath();ctx.arc(mX,mY,moonSz+6,0,Math.PI*2);ctx.stroke();
        } else if(fuel_left<=0&&alt>500){
          const warpN=Math.min(60,Math.floor(alt/400));
          ctx.fillStyle='#60a5fa';ctx.font='bold 10px Space Mono';ctx.textAlign='left';
          ctx.fillText('⏩ WARP x'+warpN,10,16);
        }
      } else {
        // ── LAUNCH / GROUND VIEW ──────────────────────────────────────
        const MAX_ALT=Math.max(600,alt*1.4,maxAltReached*1.1);
        const aY=a=>h-30-(a/MAX_ALT)*(h-50);

        // Sky gradient
        const sg=ctx.createLinearGradient(0,0,0,h);
        sg.addColorStop(0,'#000005');sg.addColorStop(0.4,'#050820');sg.addColorStop(0.85,'#0a2040');sg.addColorStop(1,'#1a4060');
        ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
        // Stars
        for(let i=0;i<80;i++){ctx.fillStyle=`rgba(255,255,255,${0.15+(i%5)*0.1})`;ctx.fillRect((i*7919+104729)%w,(i*6271)%(h*0.85),1,1)}
        // Ground
        ctx.fillStyle='#1e3a1e';ctx.fillRect(0,h-30,w,30);

        // Moon (top-right)
        if(alt>100||maxAltReached>100||done){
          const moonY2=30,moonX2=w-50;
          const mg=ctx.createRadialGradient(moonX2,moonY2,0,moonX2,moonY2,20);
          mg.addColorStop(0,'#f5f5dc');mg.addColorStop(0.7,'#d4d0b0');mg.addColorStop(1,'rgba(212,208,176,0)');
          ctx.fillStyle=mg;ctx.beginPath();ctx.arc(moonX2,moonY2,20,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='rgba(180,175,140,0.4)';
          [[-5,-3],[2,1],[-8,5],[4,-7]].forEach(([cx2,cy2])=>{ctx.beginPath();ctx.arc(moonX2+cx2,moonY2+cy2,2.5,0,Math.PI*2);ctx.fill()});
          ctx.fillStyle='rgba(251,191,36,0.8)';ctx.font='9px Space Mono';ctx.textAlign='center';ctx.fillText('🌕 384,400 km',moonX2,moonY2+30);
        }
        // Milestone lines
        [{alt:100,col:'rgba(96,165,250,0.3)',label:'Kármán 100km'},{alt:200,col:'rgba(139,92,246,0.4)',label:'LEO 200km'}].forEach(m=>{
          if(m.alt/MAX_ALT>0.02){
            const my2=aY(m.alt);
            ctx.strokeStyle=m.col;ctx.setLineDash([4,6]);ctx.lineWidth=1;
            ctx.beginPath();ctx.moveTo(0,my2);ctx.lineTo(w,my2);ctx.stroke();ctx.setLineDash([]);
            ctx.fillStyle=m.col;ctx.font='8px Space Mono';ctx.textAlign='right';
            ctx.fillText(m.label,w-4,my2-3);
          }
        });
        // Trail
        if(trail.length>1){
          ctx.strokeStyle='rgba(255,150,50,0.5)';ctx.lineWidth=1.5;ctx.beginPath();
          for(let i=0;i<trail.length;i++){
            const px=w*0.1+trail[i].d*0.3,py=aY(trail[i].a);
            i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
          }
          ctx.stroke();
        }
        // Rocket
        const rX=Math.min(w-30,Math.max(30,w*0.1+downrange*0.3)),rY=aY(alt);
        const vel2=Math.sqrt(vx*vx+vy*vy);
        const rRot=vel2>60?Math.atan2(-vy,vx)+Math.PI/2:(90-angle_deg)*Math.PI/180;
        ctx.save();ctx.translate(rX,rY);ctx.rotate(rRot);
        ctx.fillStyle='#e5e7eb';ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(-5,0);ctx.lineTo(-4,10);ctx.lineTo(4,10);ctx.lineTo(5,0);ctx.closePath();ctx.fill();
        ctx.fillStyle=engIdx===0?'#ef4444':engIdx===1?'#22c55e':'#3b82f6';
        ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(-3,-10);ctx.lineTo(3,-10);ctx.closePath();ctx.fill();
        ctx.fillStyle='#9ca3af';
        ctx.beginPath();ctx.moveTo(-5,4);ctx.lineTo(-10,12);ctx.lineTo(-4,9);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.moveTo(5,4);ctx.lineTo(10,12);ctx.lineTo(4,9);ctx.closePath();ctx.fill();
        if(stagesLeft>=2){ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(-5,3);ctx.lineTo(5,3);ctx.stroke();}
        if(stagesLeft>=3){ctx.beginPath();ctx.moveTo(-5,6);ctx.lineTo(5,6);ctx.stroke();}
        if(launched&&fuel_left>0){
          const flameLen=10+Math.random()*12;
          const fCol=engIdx===0?[255,130+Math.random()*100,30]:engIdx===1?[100,255,130+Math.random()*80]:[100,150+Math.random()*100,255];
          ctx.fillStyle=`rgba(${fCol[0]},${fCol[1]},${fCol[2]},0.9)`;
          ctx.beginPath();ctx.moveTo(-3,10);ctx.lineTo(0,10+flameLen);ctx.lineTo(3,10);ctx.closePath();ctx.fill();
          ctx.fillStyle='rgba(200,200,200,0.15)';
          for(let p=0;p<3;p++){ctx.beginPath();ctx.arc(-4+Math.random()*8,12+flameLen+Math.random()*8,1+Math.random()*2,0,Math.PI*2);ctx.fill();}
        }
        ctx.restore();

        // Status overlay (crash/fail)
        if(rStatus&&done&&!msReached[2]){
          ctx.fillStyle='rgba(0,0,0,0.6)';
          const tw2=Math.min(w-20,380);
          ctx.fillRect((w-tw2)/2,h/2-22,tw2,44);
          ctx.fillStyle=statusCol;ctx.font='bold 13px Outfit';ctx.textAlign='center';
          ctx.fillText(rStatus,w/2,h/2+5);
        } else if(rStatus&&launched){
          ctx.fillStyle=statusCol;ctx.font='bold 11px Space Mono';ctx.textAlign='center';ctx.fillText(rStatus,w/2,25);
        }
      }

      // ── HUD overlay (always visible) ────────────────────────────────
      // Fuel gauge
      const gH=90,gX=w-26,gY2=50;
      ctx.fillStyle='rgba(17,24,39,0.7)';ctx.fillRect(gX-1,gY2-1,12,gH+2);
      const fPct=init_fuel>0?fuel_left/init_fuel:(launched?0:1);const fh=fPct*gH;
      ctx.fillStyle=fPct>0.4?'#10b981':fPct>0.15?'#f59e0b':'#ef4444';
      ctx.fillRect(gX,gY2+gH-fh,10,fh);
      ctx.fillStyle='#6b7280';ctx.font='7px Space Mono';ctx.textAlign='center';ctx.fillText('⛽',gX+5,gY2-4);
      // Stages indicator
      if(launched&&stagesLeft>0){
        ctx.fillStyle='#9ca3af';ctx.font='7px Space Mono';ctx.textAlign='center';
        ctx.fillText('STG:'+stagesLeft,gX+5,gY2+gH+12);
      }

      aid=requestAnimationFrame(draw);
    }
    refreshStatic();draw();
    return()=>{cancelAnimationFrame(aid);delete window.rLaunch;delete window.rReset;delete window.rSetEng};
  }
});

// 3. MOON PHASES
reg('space-moon',{
  section:'space',icon:'🌙',tKey:'s_moon.t',dKey:'s_moon.d',tagKey:'s_moon.tag',expTKey:'s_moon.exp_t',expKey:'s_moon.exp',
  render(el){
    let moonAngle=0,aid,dragging=false;
    const phases=['new','waxc','firstq','waxg','full','wang','lastq','wanc'];
    el.innerHTML=`<canvas id="moonCv" height="400" style="cursor:pointer"></canvas>
      <div style="text-align:center;font-family:var(--mono);margin-top:0.5rem">
        ${t('s_moon.phase')}: <span id="mPhase" style="color:var(--space);font-weight:700"></span>
      </div>
      <p style="text-align:center;font-size:0.8rem;color:var(--dim)">Drag the moon around Earth</p>`;
    const cv=document.getElementById('moonCv');
    cv.onmousedown=cv.ontouchstart=()=>{dragging=true};
    cv.onmouseup=cv.ontouchend=()=>{dragging=false};
    cv.onmousemove=cv.ontouchmove=e=>{
      if(!dragging)return;
      const r=cv.getBoundingClientRect(),mx=(e.clientX||e.touches?.[0]?.clientX)-r.left,my=(e.clientY||e.touches?.[0]?.clientY)-r.top;
      moonAngle=Math.atan2(my-200,mx-r.width/2);
    };
    function draw(){
      if(!document.getElementById('moonCv'))return;
      const w=cv.parentElement.getBoundingClientRect().width,h=400;
      const ctx=setupCanvas(cv,w,h);
      ctx.fillStyle='#050510';ctx.fillRect(0,0,w,h);
      const cx=w/2,cy=h/2;
      // Sun direction indicator (from right)
      ctx.fillStyle='rgba(255,200,0,0.05)';
      ctx.fillRect(w-5,0,5,h);
      ctx.fillStyle='rgba(255,200,0,0.3)';ctx.font='12px Outfit';ctx.textAlign='right';
      ctx.fillText('☀ Sunlight →',w-10,20);
      // Draw sun rays
      for(let i=0;i<h;i+=30){ctx.strokeStyle='rgba(255,200,0,0.03)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w,i);ctx.lineTo(cx+50,cy);ctx.stroke()}
      // Earth
      ctx.beginPath();ctx.arc(cx,cy,25,0,Math.PI*2);
      const eg=ctx.createRadialGradient(cx+5,cy-5,5,cx,cy,25);eg.addColorStop(0,'#3b82f6');eg.addColorStop(1,'#1e40af');
      ctx.fillStyle=eg;ctx.fill();ctx.fillStyle='#10b981';// Continents (simple)
      ctx.beginPath();ctx.arc(cx-5,cy-8,8,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(cx+8,cy+5,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.font='10px Space Mono';ctx.textAlign='center';ctx.fillText('Earth',cx,cy+40);
      // Moon orbit
      const mOrbit=120;
      ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.arc(cx,cy,mOrbit,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      // Moon position
      const mX=cx+Math.cos(moonAngle)*mOrbit,mY=cy+Math.sin(moonAngle)*mOrbit;
      const mR=16;
      // Draw moon with phase (illumination from right/sun side)
      ctx.save();ctx.beginPath();ctx.arc(mX,mY,mR,0,Math.PI*2);ctx.clip();
      // Dark side
      ctx.fillStyle='#333';ctx.fillRect(mX-mR,mY-mR,mR*2,mR*2);
      // Lit side - depends on angle relative to sun (sun is to the right)
      const sunAngle=0;// Sun is at angle 0 (right)
      const relAngle=((moonAngle-sunAngle)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
      // The lit half faces the sun
      const litAngle=moonAngle+Math.PI;// opposite side from sun
      ctx.fillStyle='#e8e8d0';
      ctx.beginPath();ctx.arc(mX,mY,mR,litAngle-Math.PI/2,litAngle+Math.PI/2);
      // Terminator curve (elliptical)
      const phase=Math.cos(relAngle);
      ctx.ellipse(mX,mY,Math.abs(phase)*mR,mR,litAngle,litAngle+Math.PI/2,litAngle-Math.PI/2,phase>0);
      ctx.fill();
      ctx.restore();
      // Moon border
      ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(mX,mY,mR,0,Math.PI*2);ctx.stroke();
      // Phase name
      const normAngle=((relAngle/Math.PI*4+0.5)%8+8)%8;
      const phaseIdx=Math.floor(normAngle)%8;
      const phaseName=t('s_moon.'+phases[phaseIdx]);
      document.getElementById('mPhase').textContent=phaseName;
      // View from Earth (bottom)
      ctx.fillStyle='#fff';ctx.font='11px Outfit';ctx.textAlign='center';
      ctx.fillText('View from Earth:',cx,h-70);
      const vR=25;
      ctx.save();ctx.beginPath();ctx.arc(cx,h-35,vR,0,Math.PI*2);ctx.clip();
      ctx.fillStyle='#333';ctx.fillRect(cx-vR,h-35-vR,vR*2,vR*2);
      // Approximate illumination as seen from earth
      const earthViewPhase=Math.cos(relAngle);
      ctx.fillStyle='#e8e8d0';
      ctx.beginPath();ctx.arc(cx,h-35,vR,-Math.PI/2,Math.PI/2);
      ctx.ellipse(cx,h-35,Math.abs(earthViewPhase)*vR,vR,0,Math.PI/2,-Math.PI/2,earthViewPhase<0);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.beginPath();ctx.arc(cx,h-35,vR,0,Math.PI*2);ctx.stroke();
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(aid);
  }
});

// 4. STAR LIFE CYCLE
reg('space-star',{
  section:'space',icon:'⭐',tKey:'s_star.t',dKey:'s_star.d',tagKey:'s_star.tag',expTKey:'s_star.exp_t',expKey:'s_star.exp',
  render(el){
    let stage=0,aid,time=0;
    const stages=[
      {key:'nebula',color:'#8b5cf6',size:60,desc:'A vast cloud of gas and dust collapses under gravity...'},
      {key:'protostar',color:'#f59e0b',size:35,desc:'Gravity compresses the core, heating it to millions of degrees...'},
      {key:'mainseq',color:'#fbbf24',size:25,desc:'Nuclear fusion ignites! Hydrogen → Helium, releasing enormous energy for billions of years.'},
      {key:'redgiant',color:'#ef4444',size:55,desc:'Hydrogen fuel runs low. The star expands enormously, cooling its surface to red.'},
      {key:'supernova',color:'#ffffff',size:80,desc:'For massive stars: the core collapses, outer layers explode in a cataclysmic supernova!'},
      {key:'neutron',color:'#3b82f6',size:8,desc:'The remnant core is crushed to incredible density — a city-sized star spinning rapidly.'},
      {key:'blackhole',color:'#1a1a1a',size:15,desc:'For the most massive stars: gravity wins completely. Nothing escapes — not even light.'},
      {key:'whitedwarf',color:'#e0e0ff',size:10,desc:'For smaller stars: a glowing ember slowly cooling over trillions of years.'}
    ];
    function render2(){
      const s=stages[stage];
      el.innerHTML=`<canvas id="starCv" height="350"></canvas>
        <div style="text-align:center;margin:1rem 0">
          <span style="font-family:var(--mono);font-size:1.1rem;color:${s.color};font-weight:700">${t('s_star.'+s.key)}</span>
          <p style="color:var(--dim);margin-top:0.3rem;max-width:500px;margin-left:auto;margin-right:auto">${s.desc}</p>
        </div>
        <div class="controls" style="justify-content:center">
          <button class="btn" onclick="starPrev()" ${stage===0?'disabled':''}>← Previous</button>
          <span style="font-family:var(--mono);color:var(--dim)">${stage+1} / ${stages.length}</span>
          <button class="btn btn-p" onclick="starNext()" ${stage===stages.length-1?'disabled':''}>Next →</button>
        </div>
        <div style="display:flex;justify-content:center;gap:0.5rem;margin-top:0.5rem">
          ${stages.map((st,i)=>`<div style="width:10px;height:10px;border-radius:50%;background:${i===stage?st.color:'var(--border)'};cursor:pointer" onclick="starGo(${i})"></div>`).join('')}
        </div>`;
      drawStar();
    }
    window.starNext=()=>{if(stage<stages.length-1){stage++;cancelAnimationFrame(aid);render2()}};
    window.starPrev=()=>{if(stage>0){stage--;cancelAnimationFrame(aid);render2()}};
    window.starGo=i=>{stage=i;cancelAnimationFrame(aid);render2()};
    function drawStar(){
      const cv=document.getElementById('starCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=350;
      const ctx=setupCanvas(cv,w,h);const cx=w/2,cy=h/2;const s=stages[stage];time+=0.02;
      ctx.fillStyle='#050510';ctx.fillRect(0,0,w,h);
      for(let i=0;i<50;i++){ctx.fillStyle=`rgba(255,255,255,${0.15+(i%3)*0.1})`;ctx.fillRect((i*7919)%w,(i*6271)%h,1,1)}
      if(s.key==='nebula'){
        // Nebula - swirling gas cloud
        for(let i=0;i<40;i++){
          const a=i*0.4+time*0.3,r2=20+i*2+Math.sin(time+i)*8;
          ctx.beginPath();ctx.arc(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2,8+Math.random()*12,0,Math.PI*2);
          ctx.fillStyle=`hsla(${260+i*3},60%,50%,0.08)`;ctx.fill();
        }
      }else if(s.key==='supernova'){
        // Explosion
        const expand=(Math.sin(time*2)+1)*20;
        for(let i=0;i<30;i++){
          const a=i*Math.PI*2/30,r2=s.size+expand+Math.random()*30;
          ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);
          ctx.strokeStyle=`rgba(255,${200+Math.random()*55},${Math.random()*150},0.5)`;ctx.lineWidth=2+Math.random()*3;ctx.stroke();
        }
      }else if(s.key==='blackhole'){
        // Accretion disk
        for(let i=0;i<50;i++){
          const a=i*0.3+time,r2=25+i*0.8;
          ctx.beginPath();ctx.arc(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2*0.3,2,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,${100+i*3},0,${0.6-i*0.01})`;ctx.fill();
        }
      }
      // Star body
      const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,s.size*1.5);
      glow.addColorStop(0,s.color);
      glow.addColorStop(0.5,s.color+'80');
      glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,s.size*1.5,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,s.size+Math.sin(time*3)*2,0,Math.PI*2);
      ctx.fillStyle=s.color;ctx.fill();
      if(s.key==='blackhole'){
        ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx,cy,s.size-2,0,Math.PI*2);ctx.fill();
      }
      aid=requestAnimationFrame(drawStar);
    }
    render2();
    return()=>{cancelAnimationFrame(aid);delete window.starNext;delete window.starPrev;delete window.starGo};
  }
});

// 5. HOW TELESCOPES WORK
reg('space-tele',{
  section:'space',icon:'🔭',tKey:'s_tele.t',dKey:'s_tele.d',tagKey:'s_tele.tag',expTKey:'s_tele.exp_t',expKey:'s_tele.exp',
  render(el){
    let teleType='refract',aperture=80,aid;
    el.innerHTML=`<canvas id="teleCv" height="350"></canvas>
      <div class="controls" style="justify-content:center">
        <button class="btn btn-p" id="refBtn" onclick="setTele('refract')">${t('s_tele.refract')}</button>
        <button class="btn" id="reflBtn" onclick="setTele('reflect')">${t('s_tele.reflect')}</button>
        <div class="ctrl"><label>${t('s_tele.aperture')}</label><input type="range" id="telA" min="40" max="150" value="80"></div><span class="val" id="telAV">80</span>
      </div>`;
    document.getElementById('telA').oninput=e=>{aperture=+e.target.value;document.getElementById('telAV').textContent=aperture};
    window.setTele=t2=>{teleType=t2;
      document.getElementById('refBtn').className=t2==='refract'?'btn btn-p':'btn';
      document.getElementById('reflBtn').className=t2==='reflect'?'btn btn-p':'btn'};
    function draw(){
      const cv=document.getElementById('teleCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=350;
      const ctx=setupCanvas(cv,w,h);const cy=h/2;
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      // Optical axis
      ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(w,cy);ctx.stroke();ctx.setLineDash([]);
      const focal=aperture*1.2;
      if(teleType==='refract'){
        // REFRACTING TELESCOPE: objective lens → focal point → eyepiece lens → eye
        const objX=w*0.3,eyeX=w*0.7;
        // Objective lens
        ctx.strokeStyle='rgba(59,130,246,0.7)';ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(objX,cy,6,aperture/2,0,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='rgba(59,130,246,0.1)';ctx.fill();
        // Eyepiece lens
        ctx.beginPath();ctx.ellipse(eyeX,cy,4,30,0,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='rgba(59,130,246,0.1)';ctx.fill();
        // Focal point
        const fpX=(objX+eyeX)/2;
        ctx.fillStyle='rgba(245,158,11,0.7)';ctx.beginPath();ctx.arc(fpX,cy,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(245,158,11,0.5)';ctx.font='10px Space Mono';ctx.textAlign='center';
        ctx.fillText('Focus',fpX,cy+20);
        // Light rays (parallel from left → converge → diverge → eyepiece → parallel to eye)
        const rays=5;
        for(let i=0;i<rays;i++){
          const offset=(i-rays/2+0.5)/(rays/2)*aperture/2*0.8;
          ctx.strokeStyle=`rgba(255,255,100,${0.3+i*0.05})`;ctx.lineWidth=1.5;
          ctx.beginPath();
          // Incoming parallel ray
          ctx.moveTo(20,cy+offset);ctx.lineTo(objX,cy+offset);
          // Converge to focus
          ctx.lineTo(fpX,cy);
          // Diverge to eyepiece
          const eyeOffset=offset*0.4;
          ctx.lineTo(eyeX,cy+eyeOffset);
          // Exit parallel (magnified view)
          ctx.lineTo(w-40,cy+eyeOffset*2);
          ctx.stroke();
        }
        // Labels
        ctx.fillStyle='#3b82f6';ctx.font='11px Outfit';
        ctx.fillText('Objective',objX,cy-aperture/2-10);
        ctx.fillText('Eyepiece',eyeX,cy-40);
        ctx.fillStyle='#fff';ctx.font='bold 12px Outfit';ctx.textAlign='left';
        ctx.fillText('★ Distant star',30,cy-aperture/2-15);
        ctx.textAlign='right';ctx.fillText('👁 Eye',w-20,cy-20);
        // Magnification
        const mag=(focal/40).toFixed(1);
        ctx.fillStyle='var(--dim)';ctx.font='11px Space Mono';ctx.textAlign='center';
        ctx.fillText(`${t('s_tele.mag')}: ${mag}x`,w/2,30);
      }else{
        // REFLECTING TELESCOPE: primary mirror → secondary mirror → eyepiece
        const mirX=w*0.7,secX=w*0.4,eyeY=cy-aperture/2-20;
        // Primary mirror (concave)
        ctx.strokeStyle='rgba(139,92,246,0.7)';ctx.lineWidth=3;
        ctx.beginPath();
        ctx.arc(mirX+aperture*0.8,cy,aperture*0.8,Math.PI-0.5,Math.PI+0.5);ctx.stroke();
        // Secondary mirror (small flat)
        ctx.strokeStyle='rgba(245,158,11,0.7)';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(secX-8,cy-12);ctx.lineTo(secX+8,cy+12);ctx.stroke();
        // Eyepiece (on top)
        ctx.strokeStyle='rgba(59,130,246,0.7)';ctx.lineWidth=2;
        ctx.beginPath();ctx.ellipse(secX,eyeY,20,4,0,0,Math.PI*2);ctx.stroke();
        // Light rays
        const rays2=5;
        for(let i=0;i<rays2;i++){
          const offset=(i-rays2/2+0.5)/(rays2/2)*aperture/2*0.7;
          ctx.strokeStyle=`rgba(255,255,100,${0.25+i*0.05})`;ctx.lineWidth=1.5;
          ctx.beginPath();
          ctx.moveTo(20,cy+offset);ctx.lineTo(mirX,cy+offset); // incoming
          ctx.lineTo(secX,cy); // reflect to secondary
          ctx.lineTo(secX,eyeY); // up to eyepiece
          ctx.stroke();
        }
        ctx.fillStyle='#8b5cf6';ctx.font='11px Outfit';ctx.textAlign='center';
        ctx.fillText('Primary Mirror',mirX,cy+aperture/2+20);
        ctx.fillStyle='#f59e0b';ctx.fillText('Secondary',secX,cy+25);
        ctx.fillStyle='#3b82f6';ctx.fillText('Eyepiece',secX,eyeY-10);
        ctx.fillStyle='#fff';ctx.font='bold 12px Outfit';ctx.textAlign='left';
        ctx.fillText('★ Starlight',30,cy-aperture/2-15);
        ctx.textAlign='center';ctx.fillText('👁',secX,eyeY-30);
      }
      // Tube
      ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
      ctx.strokeRect(w*0.15,cy-aperture/2-5,w*0.65,aperture+10);
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>{cancelAnimationFrame(aid);delete window.setTele};
  }
});
