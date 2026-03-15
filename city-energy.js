// ═══════════════════════════════════════
//  CITY ENERGY SIMULATOR — Yangon Energy Mix
//  Isometric 3D interactive city with power plants
// ═══════════════════════════════════════

reg('physics-city-energy',{
  section:'physics',icon:'🏙️',
  tKey:'city.t',dKey:'city.d',tagKey:'city.tag',
  expTKey:'city.exp_t',expKey:'city.exp',
  render(el){
    // ── Energy source data (real-world values) ──
    const SOURCES={
      coal:  {co2:820, cost:65, cap:0.85, dispatch:true, color:'#555',label:'Coal'},
      gas:   {co2:490, cost:50, cap:0.87, dispatch:true, color:'#f59e0b',label:'Natural Gas'},
      solar: {co2:41,  cost:35, cap:0.25, dispatch:false,color:'#facc15',label:'Solar'},
      wind:  {co2:11,  cost:40, cap:0.35, dispatch:false,color:'#38bdf8',label:'Wind'},
      hydro: {co2:24,  cost:45, cap:0.50, dispatch:false,color:'#10b981',label:'Hydro'}
    };
    const SRC_KEYS=['coal','gas','solar','wind','hydro'];

    // ── State ──
    let mix={coal:40,gas:20,solar:15,wind:10,hydro:15};
    let greenSpace=30;
    let rotation=0;
    let animId,hour=8,autoTime=false,timeId;
    let dragStart=null,dragRot=rotation;

    // ── City grid 12x12 ──
    // R=residential, C=commercial, I=industrial, P=park, W=water, G=pagoda
    // Xc=coal plant, Xg=gas plant, Xs=solar farm, Xw=wind turbine, Xh=hydro
    const BASE_GRID=[
      ['W','W','W','C','C','R','R','R','P','R','R','R'],
      ['W','W','C','C','C','R','R','P','P','R','R','R'],
      ['W','C','C','C','I','R','R','R','R','R','P','R'],
      ['R','R','C','G','C','R','I','R','R','R','R','R'],
      ['R','R','R','C','R','R','R','R','P','R','R','R'],
      ['R','R','R','R','R','P','R','R','R','R','R','R'],
      ['R','I','R','R','R','P','P','R','R','R','R','P'],
      ['R','R','R','R','R','R','R','R','I','R','R','R'],
      ['P','R','R','P','R','R','R','R','R','Xw','R','R'],
      ['P','P','R','R','R','R','R','Xs','Xs','Xw','R','R'],
      ['R','R','R','R','R','R','Xg','Xs','Xs','R','R','Xh'],
      ['R','R','R','R','R','Xc','Xc','R','R','R','Xh','Xh']
    ];
    const GS=12; // grid size

    const HEIGHTS={R:1.5,C:3,I:2,P:0.3,W:0,G:4,Xc:2,Xg:1.8,Xs:0.3,Xw:0.2,Xh:1.5};

    // ── Calculations ──
    function calcMetrics(){
      const total=SRC_KEYS.reduce((s,k)=>s+mix[k],0)||1;
      let co2=0,cost=0,reliability=0;
      for(const k of SRC_KEYS){
        const pct=mix[k]/total;const s=SOURCES[k];
        co2+=s.co2*pct; cost+=s.cost*pct;
        let hourCap=s.cap;
        if(k==='solar') hourCap=solarCap(hour);
        if(k==='wind') hourCap=windCap(hour);
        reliability+=hourCap*pct;
      }
      const fossilPct=(mix.coal+mix.gas)/total;
      const heatIsland=fossilPct*8 - greenSpace*0.1;
      const aqi=Math.round(co2/820*300*(1-greenSpace/200));
      const renewPct=(mix.solar+mix.wind+mix.hydro)/total*100;
      return{co2:Math.round(co2),cost:Math.round(cost),reliability:Math.round(reliability*100),
             heatIsland:Math.max(0,heatIsland).toFixed(1),aqi:Math.min(300,Math.max(10,aqi)),
             renewPct:Math.round(renewPct),fossilPct:Math.round(fossilPct*100)};
    }
    function solarCap(h){ if(h<5||h>19)return 0; return 0.25*Math.exp(-0.5*Math.pow((h-12)/3,2))/0.25; }
    function windCap(h){ return 0.35*(0.7+0.3*Math.sin((h/24)*Math.PI*2+Math.PI)); }

    // ── HTML ──
    el.innerHTML=`
      <div style="position:relative">
        <canvas id="cityCv" height="520" style="cursor:grab"></canvas>
        <div id="cityTime" style="position:absolute;top:12px;left:12px;font-family:var(--mono);font-size:0.85rem;color:#fff;
          background:rgba(0,0,0,0.6);padding:4px 10px;border-radius:8px"></div>
        <div style="position:absolute;top:12px;right:12px;display:flex;gap:6px">
          <button class="btn" onclick="window._cityRot(-1)" style="padding:4px 10px;font-size:1rem">↶</button>
          <button class="btn" onclick="window._cityRot(1)" style="padding:4px 10px;font-size:1rem">↷</button>
          <button class="btn" id="cityPlayBtn" onclick="window._cityToggleTime()" style="padding:4px 10px;font-size:0.85rem">▶ ${t('city.day_cycle')}</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem">
        <div>
          <h4 style="color:var(--bright);margin-bottom:0.6rem;font-size:0.9rem">⚡ ${t('city.energy_mix')}</h4>
          ${SRC_KEYS.map(k=>`<div class="ctrl" style="margin-bottom:0.5rem">
            <label style="display:flex;justify-content:space-between">
              <span style="color:${SOURCES[k].color}">${SOURCES[k].label}</span>
              <span id="city_${k}_v" class="val" style="font-size:0.8rem">${mix[k]}%</span>
            </label>
            <input type="range" id="city_${k}" min="0" max="100" value="${mix[k]}" style="width:100%">
          </div>`).join('')}
          <div class="ctrl" style="margin-bottom:0.5rem;margin-top:0.8rem">
            <label style="display:flex;justify-content:space-between">
              <span style="color:#22c55e">🌳 ${t('city.green_space')}</span>
              <span id="city_green_v" class="val" style="font-size:0.8rem">${greenSpace}%</span>
            </label>
            <input type="range" id="city_green" min="0" max="60" value="${greenSpace}" style="width:100%">
          </div>
          <div class="ctrl" style="margin-top:0.5rem">
            <label style="display:flex;justify-content:space-between">
              <span>🕐 ${t('city.hour')}</span>
              <span id="city_hour_v" class="val" style="font-size:0.8rem">${hour}:00</span>
            </label>
            <input type="range" id="city_hour" min="0" max="23" step="1" value="${hour}" style="width:100%">
          </div>
        </div>
        <div class="info" id="cityInfo"></div>
      </div>
      <div id="cityReliability" style="margin-top:1rem"></div>`;

    // ── Event Listeners ──
    for(const k of SRC_KEYS){
      document.getElementById('city_'+k).oninput=e=>{
        mix[k]=+e.target.value;
        document.getElementById('city_'+k+'_v').textContent=mix[k]+'%';
        updateInfo();
      };
    }
    document.getElementById('city_green').oninput=e=>{
      greenSpace=+e.target.value;
      document.getElementById('city_green_v').textContent=greenSpace+'%';
      updateInfo();
    };
    document.getElementById('city_hour').oninput=e=>{
      hour=+e.target.value;
      document.getElementById('city_hour_v').textContent=hour+':00';
      updateInfo();
    };
    window._cityRot=d=>{rotation=(rotation+d+4)%4};
    window._cityToggleTime=()=>{
      autoTime=!autoTime;
      const btn=document.getElementById('cityPlayBtn');
      if(btn) btn.textContent=autoTime?'⏸ '+t('city.pause'):'▶ '+t('city.day_cycle');
    };

    // Mouse/touch rotation
    const cv=document.getElementById('cityCv');
    cv.addEventListener('mousedown',e=>{dragStart=e.clientX;dragRot=rotation;cv.style.cursor='grabbing'});
    document.addEventListener('mousemove',e=>{
      if(dragStart!==null){
        const dx=e.clientX-dragStart;
        if(Math.abs(dx)>60){rotation=(dragRot+(dx>0?1:-1)+4)%4;dragStart=e.clientX;dragRot=rotation}
      }
    });
    document.addEventListener('mouseup',()=>{dragStart=null;if(cv)cv.style.cursor='grab'});

    // ── Isometric helpers ──
    const TW=38,TH=19;
    function isoProject(gx,gy,cx,cy){
      let rx=gx,ry=gy;
      for(let r=0;r<rotation;r++){const tmp=rx;rx=(GS-1)-ry;ry=tmp}
      return{x:cx+(rx-ry)*TW,y:cy+(rx+ry)*TH,depth:rx+ry};
    }
    function getGridCell(gx,gy){
      const base=BASE_GRID[gy]?.[gx]||'R';
      if(base==='W'||base==='G'||base.startsWith('X')) return base;
      const hash=(gx*7+gy*13+3)%100;
      if(hash<greenSpace && base!=='I') return 'P';
      return base;
    }

    // ══════════════════════════════════
    //  DRAWING FUNCTIONS
    // ══════════════════════════════════
    const T=performance.now.bind(performance);

    // Iso diamond (ground tile)
    function drawGround(ctx,sx,sy,col){
      const w=TW*0.95,h=TH*0.95;
      ctx.fillStyle=col;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+w,sy-h);ctx.lineTo(sx,sy-2*h);ctx.lineTo(sx-w,sy-h);ctx.closePath();ctx.fill();
    }

    // Generic iso box
    function drawBox(ctx,sx,sy,bw,bh2,ht,topC,leftC,rightC){
      // Top
      ctx.fillStyle=topC;ctx.beginPath();
      ctx.moveTo(sx,sy-ht);ctx.lineTo(sx+bw,sy-bh2-ht);ctx.lineTo(sx,sy-2*bh2-ht);ctx.lineTo(sx-bw,sy-bh2-ht);ctx.closePath();ctx.fill();
      // Left
      ctx.fillStyle=leftC;ctx.beginPath();
      ctx.moveTo(sx-bw,sy-bh2-ht);ctx.lineTo(sx,sy-ht);ctx.lineTo(sx,sy);ctx.lineTo(sx-bw,sy-bh2);ctx.closePath();ctx.fill();
      // Right
      ctx.fillStyle=rightC;ctx.beginPath();
      ctx.moveTo(sx+bw,sy-bh2-ht);ctx.lineTo(sx,sy-ht);ctx.lineTo(sx,sy);ctx.lineTo(sx+bw,sy-bh2);ctx.closePath();ctx.fill();
    }

    // ── WATER ──
    function drawWater(ctx,sx,sy,gx,gy){
      const t2=T()/800;
      const wave=Math.sin(t2+gx*0.7+gy*0.5)*1.5;
      const w=TW*0.95,h=TH*0.95;
      const shimmer=0.45+Math.sin(t2*0.6+gx+gy)*0.08;
      ctx.fillStyle=`rgba(25,70,150,${shimmer})`;
      ctx.beginPath();ctx.moveTo(sx,sy+wave);ctx.lineTo(sx+w,sy-h+wave);ctx.lineTo(sx,sy-2*h+wave);ctx.lineTo(sx-w,sy-h+wave);ctx.closePath();ctx.fill();
      // Wave highlights
      ctx.strokeStyle=`rgba(100,180,255,0.15)`;ctx.lineWidth=0.5;
      for(let i=0;i<3;i++){
        const wy=sy-h+wave+i*5-5;
        ctx.beginPath();ctx.moveTo(sx-w*0.5+i*8,wy);
        ctx.quadraticCurveTo(sx,wy-2+Math.sin(t2+i)*1.5,sx+w*0.5-i*5,wy);ctx.stroke();
      }
    }

    // ── PARK / GREEN SPACE ──
    function drawPark(ctx,sx,sy,gx,gy){
      // Grass ground
      drawGround(ctx,sx,sy,'#15532a');
      // Grass texture dots
      ctx.fillStyle='#1a7a35';
      for(let i=0;i<5;i++){
        const ox=(((gx*3+gy*7+i*11)%20)-10)*1.5;
        const oy=(((gx*5+gy*3+i*7)%12)-6)*0.8;
        ctx.beginPath();ctx.arc(sx+ox,sy-TH+oy,1.2,0,Math.PI*2);ctx.fill();
      }
      // Determine tree arrangement by hash
      const hash=(gx*31+gy*17)%5;
      if(hash<3){
        // Group of trees
        drawTree(ctx,sx-6,sy-TH-2,gx,gy,0);
        drawTree(ctx,sx+5,sy-TH+1,gx,gy,1);
        if(hash<2) drawTree(ctx,sx-1,sy-TH-6,gx,gy,2);
      } else if(hash===3){
        // Single big tree + flower bed
        drawBigTree(ctx,sx,sy-TH-2,gx,gy);
        drawFlowers(ctx,sx+10,sy-TH+3,gx,gy);
      } else {
        // Bush garden with path
        drawBushes(ctx,sx,sy,gx,gy);
      }
    }

    function drawTree(ctx,tx,ty,gx,gy,idx){
      const sway=Math.sin(T()/1500+gx+gy+idx)*1;
      // Trunk
      ctx.fillStyle='#5c3a1e';
      ctx.fillRect(tx-1,ty+3,2.5,9);
      // Canopy layers (lush)
      const cols=['#166534','#15803d','#22c55e'];
      for(let i=0;i<3;i++){
        ctx.fillStyle=cols[i];
        ctx.beginPath();
        ctx.arc(tx+sway*(i===0?1:0.5)+((i-1)*2.5),ty-i*3+1,6-i*0.8,0,Math.PI*2);
        ctx.fill();
      }
    }

    function drawBigTree(ctx,tx,ty,gx,gy){
      const sway=Math.sin(T()/1200+gx+gy)*1.5;
      // Thick trunk
      ctx.fillStyle='#5c3a1e';
      ctx.beginPath();ctx.moveTo(tx-2.5,ty+12);ctx.lineTo(tx-1.5,ty+3);ctx.lineTo(tx+1.5,ty+3);ctx.lineTo(tx+2.5,ty+12);ctx.closePath();ctx.fill();
      // Large canopy
      ctx.fillStyle='#14532d';
      ctx.beginPath();ctx.arc(tx+sway,ty-3,10,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#16a34a';
      ctx.beginPath();ctx.arc(tx+sway-3,ty-6,7,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#22c55e';
      ctx.beginPath();ctx.arc(tx+sway+3,ty-1,6,0,Math.PI*2);ctx.fill();
      // Highlight
      ctx.fillStyle='rgba(74,222,128,0.3)';
      ctx.beginPath();ctx.arc(tx+sway-2,ty-7,4,0,Math.PI*2);ctx.fill();
    }

    function drawFlowers(ctx,fx,fy,gx,gy){
      const cols=['#f472b6','#fb923c','#facc15','#a78bfa','#f87171'];
      for(let i=0;i<4;i++){
        const ox=((i*7+gx)%8)-4;
        const oy=((i*5+gy)%6)-3;
        ctx.fillStyle=cols[(i+gx+gy)%cols.length];
        ctx.beginPath();ctx.arc(fx+ox*2,fy+oy-2,2,0,Math.PI*2);ctx.fill();
        // Stem
        ctx.strokeStyle='#15803d';ctx.lineWidth=0.7;
        ctx.beginPath();ctx.moveTo(fx+ox*2,fy+oy);ctx.lineTo(fx+ox*2,fy+oy+4);ctx.stroke();
      }
    }

    function drawBushes(ctx,sx,sy,gx,gy){
      // Small stone path
      ctx.fillStyle='#78716c';
      ctx.fillRect(sx-1,sy-TH-1,2,6);
      // Bushes
      const bushCols=['#14532d','#166534','#15803d'];
      for(let i=0;i<4;i++){
        const bx=sx+((i*11+gx)%14-7)*2;
        const by=sy-TH+((i*7+gy)%8-4);
        ctx.fillStyle=bushCols[i%3];
        ctx.beginPath();ctx.arc(bx,by-2,4+((gx+i)%3),0,Math.PI*2);ctx.fill();
      }
    }

    // ── COAL POWER PLANT ──
    function drawCoalPlant(ctx,sx,sy,metrics){
      const w=TW*0.85,h=TH*0.85;
      // Dark ground pad
      drawGround(ctx,sx,sy,'#292524');
      // Main building (dark industrial)
      drawBox(ctx,sx,sy,w*0.7,h*0.7,28,'#44403c','#373432','#292524');
      // Smokestack 1
      ctx.fillStyle='#57534e';
      ctx.fillRect(sx-8,sy-h-28-35,5,35);
      // Smokestack 2
      ctx.fillRect(sx+4,sy-h-28-30,4,30);
      // Red stripe on stacks
      ctx.fillStyle='#ef4444';
      ctx.fillRect(sx-8,sy-h-28-35,5,3);
      ctx.fillRect(sx+4,sy-h-28-30,4,3);
      // Conveyor belt hint
      ctx.fillStyle='#78716c';
      ctx.fillRect(sx+w*0.3,sy-14,12,3);
      // Coal pile
      ctx.fillStyle='#1c1917';
      ctx.beginPath();ctx.arc(sx+w*0.5,sy-8,5,Math.PI,0);ctx.fill();
      ctx.fillStyle='#292524';
      ctx.beginPath();ctx.arc(sx+w*0.5,sy-8,3,Math.PI,0);ctx.fill();

      // Smoke (dynamic based on coal %)
      if(mix.coal>5){
        const intensity=Math.min(1,mix.coal/60);
        const t2=T()/1000;
        for(let s=0;s<5;s++){
          const px=sx-6+Math.sin(t2*1.5+s*1.3)*4;
          const py=sy-h-63-s*10-Math.abs(Math.sin(t2*0.8+s))*6;
          const r=3+s*1.5+Math.sin(t2+s)*1;
          ctx.globalAlpha=intensity*(0.5-s*0.08);
          ctx.fillStyle=metrics.aqi>150?'#78716c':'#a8a29e';
          ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();
        }
        // Stack 2 smoke
        for(let s=0;s<3;s++){
          const px=sx+6+Math.sin(t2*1.2+s*1.5+2)*3;
          const py=sy-h-58-s*9;
          ctx.globalAlpha=intensity*(0.35-s*0.08);
          ctx.fillStyle='#a8a29e';
          ctx.beginPath();ctx.arc(px,py,2.5+s*1.2,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }
    }

    // ── NATURAL GAS PLANT ──
    function drawGasPlant(ctx,sx,sy,metrics){
      const w=TW*0.8,h=TH*0.8;
      drawGround(ctx,sx,sy,'#1c1917');
      // Main turbine building
      drawBox(ctx,sx-4,sy,w*0.6,h*0.6,22,'#78716c','#57534e','#44403c');
      // Gas turbine cylinder
      ctx.fillStyle='#a8a29e';
      ctx.beginPath();ctx.ellipse(sx+6,sy-h-20,6,3,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#78716c';
      ctx.fillRect(sx+0,sy-h-20,12,18);
      // Single smokestack (smaller than coal)
      ctx.fillStyle='#d6d3d1';
      ctx.fillRect(sx-2,sy-h-22-22,4,22);
      ctx.fillStyle='#f59e0b';
      ctx.fillRect(sx-2,sy-h-22-22,4,2);
      // Small gas flame at top
      if(mix.gas>5){
        const t2=T()/400;
        ctx.fillStyle='#f59e0b';
        ctx.beginPath();ctx.arc(sx,sy-h-46+Math.sin(t2)*1,2.5+Math.sin(t2*1.3)*0.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fbbf24';
        ctx.beginPath();ctx.arc(sx,sy-h-48+Math.sin(t2*1.5)*0.8,1.5,0,Math.PI*2);ctx.fill();
      }
      // Light vapor
      if(mix.gas>10){
        const t2=T()/1200;
        for(let s=0;s<3;s++){
          ctx.globalAlpha=0.12;
          ctx.fillStyle='#e7e5e4';
          ctx.beginPath();ctx.arc(sx+Math.sin(t2+s)*3,sy-h-50-s*8,2+s,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }
    }

    // ── SOLAR FARM ──
    function drawSolarFarm(ctx,sx,sy,gx,gy){
      drawGround(ctx,sx,sy,'#1a1a2e');
      const w=TW*0.7,h=TH*0.7;
      const isDay=hour>=6&&hour<18;
      const panelGlow=isDay?Math.max(0.3,solarCap(hour)):0.08;

      // 2x2 panel array
      for(let row=0;row<2;row++){
        for(let col=0;col<2;col++){
          const px=sx+(col-0.5)*14+(row-0.5)*2;
          const py=sy-TH+(row-0.5)*7-(col-0.5)*4;
          // Panel support
          ctx.fillStyle='#71717a';ctx.fillRect(px-0.5,py,1,5);
          // Panel face (angled toward sun)
          ctx.fillStyle=isDay?`rgba(59,130,246,${panelGlow*0.8})`:'#1e293b';
          ctx.beginPath();
          ctx.moveTo(px-6,py-1);ctx.lineTo(px+6,py-3);
          ctx.lineTo(px+6,py-7);ctx.lineTo(px-6,py-5);ctx.closePath();ctx.fill();
          // Grid lines on panel
          ctx.strokeStyle='rgba(148,163,184,0.3)';ctx.lineWidth=0.3;
          ctx.beginPath();ctx.moveTo(px,py-1.5);ctx.lineTo(px,py-6.5);ctx.stroke();
          ctx.beginPath();ctx.moveTo(px-6,py-3);ctx.lineTo(px+6,py-5);ctx.stroke();
          // Sun reflection glint
          if(isDay && panelGlow>0.5){
            ctx.fillStyle=`rgba(250,250,250,${(panelGlow-0.5)*0.4})`;
            ctx.beginPath();ctx.arc(px+2,py-4,1.5,0,Math.PI*2);ctx.fill();
          }
        }
      }
      // Status LED
      ctx.fillStyle=isDay?'#22c55e':'#ef4444';
      ctx.beginPath();ctx.arc(sx+w*0.6,sy-4,1.5,0,Math.PI*2);ctx.fill();
    }

    // ── WIND TURBINE ──
    function drawWindTurbine(ctx,sx,sy,gx,gy){
      drawGround(ctx,sx,sy,'#1e293b');
      const isActive=mix.wind>5;
      const t2=T()/1000;
      const speed=isActive?windCap(hour)*3:0;
      const angle=t2*speed+gx*2+gy;

      // Tower (tall tapered pole)
      const towerH=55;
      ctx.strokeStyle='#d4d4d8';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.moveTo(sx,sy-4);ctx.lineTo(sx,sy-4-towerH);ctx.stroke();
      // Taper
      ctx.strokeStyle='#a1a1aa';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(sx,sy-20);ctx.lineTo(sx,sy-4-towerH);ctx.stroke();

      // Nacelle (hub housing)
      ctx.fillStyle='#e4e4e7';
      ctx.fillRect(sx-3,sy-4-towerH-2,6,5);
      ctx.fillStyle='#d4d4d8';
      ctx.beginPath();ctx.arc(sx,sy-4-towerH,3,0,Math.PI*2);ctx.fill();

      // Blades (3 blades)
      const hubY=sy-4-towerH;
      const bladeLen=22;
      ctx.lineWidth=1.8;ctx.lineCap='round';
      for(let b=0;b<3;b++){
        const a=angle+b*(Math.PI*2/3);
        const bx=sx+Math.cos(a)*bladeLen;
        const by=hubY+Math.sin(a)*bladeLen*0.3; // perspective squish
        ctx.strokeStyle='#f4f4f5';
        ctx.beginPath();ctx.moveTo(sx,hubY);ctx.lineTo(bx,by);ctx.stroke();
        // Blade width taper
        ctx.strokeStyle='rgba(244,244,245,0.4)';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(sx,hubY);
        ctx.lineTo(sx+Math.cos(a)*bladeLen*0.5,hubY+Math.sin(a)*bladeLen*0.15);ctx.stroke();
        ctx.lineWidth=1.8;
      }
      ctx.lineCap='butt';

      // Hub center dot
      ctx.fillStyle='#ef4444';
      ctx.beginPath();ctx.arc(sx,hubY,1.5,0,Math.PI*2);ctx.fill();

      // Base platform
      ctx.fillStyle='#374151';
      ctx.beginPath();ctx.arc(sx,sy-3,5,0,Math.PI*2);ctx.fill();

      // Motion blur hint when spinning fast
      if(speed>1.5){
        ctx.globalAlpha=0.08;ctx.strokeStyle='#fff';ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(sx,hubY,bladeLen*0.9,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha=1;
      }
    }

    // ── HYDRO POWER ──
    function drawHydroPlant(ctx,sx,sy,gx,gy){
      const w=TW*0.9,h=TH*0.9;
      // Dam wall
      drawBox(ctx,sx,sy,w*0.8,h*0.8,24,'#6b7280','#4b5563','#374151');
      // Water in front (reservoir)
      const t2=T()/1000;
      ctx.fillStyle='rgba(30,90,180,0.6)';
      ctx.beginPath();
      ctx.moveTo(sx-w*0.8,sy-h*0.8);
      ctx.lineTo(sx,sy);ctx.lineTo(sx+w*0.8,sy-h*0.8);
      ctx.lineTo(sx,sy-2*h*0.8);ctx.closePath();ctx.fill();
      // Water surface shimmer
      ctx.fillStyle='rgba(100,180,255,0.2)';
      ctx.beginPath();ctx.arc(sx-5+Math.sin(t2)*3,sy-h*0.8,3,0,Math.PI*2);ctx.fill();

      // Spillway water cascade
      ctx.strokeStyle='rgba(96,165,250,0.5)';ctx.lineWidth=1.5;
      for(let i=0;i<3;i++){
        const wy=sy-12+i*4;
        ctx.beginPath();
        ctx.moveTo(sx-3+i*2,wy-24);
        ctx.quadraticCurveTo(sx-1+i*2,wy-12+Math.sin(t2*2+i)*2,sx+1+i*2,wy);
        ctx.stroke();
      }
      // Mist at base
      for(let i=0;i<3;i++){
        ctx.globalAlpha=0.15;ctx.fillStyle='#bfdbfe';
        ctx.beginPath();ctx.arc(sx+Math.sin(t2+i)*5,sy-2-i*2,3+Math.sin(t2*1.5+i)*1,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
      // Blue accent stripe
      ctx.fillStyle='#3b82f6';
      ctx.fillRect(sx-w*0.5,sy-24-1,w,2);
      // Turbine intake circles
      ctx.fillStyle='#1e293b';
      ctx.beginPath();ctx.arc(sx-5,sy-14,3,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(sx+5,sy-14,3,0,Math.PI*2);ctx.fill();
    }

    // ── BUILDINGS ──
    function drawBuilding(ctx,sx,sy,type,bh,metrics,gx,gy){
      const w=TW*0.9,h=TH*0.9;
      const height=bh*18;

      if(type==='W') return drawWater(ctx,sx,sy,gx,gy);
      if(type==='P') return drawPark(ctx,sx,sy,gx,gy);
      if(type==='Xc') return drawCoalPlant(ctx,sx,sy,metrics);
      if(type==='Xg') return drawGasPlant(ctx,sx,sy,metrics);
      if(type==='Xs') return drawSolarFarm(ctx,sx,sy,gx,gy);
      if(type==='Xw') return drawWindTurbine(ctx,sx,sy,gx,gy);
      if(type==='Xh') return drawHydroPlant(ctx,sx,sy,gx,gy);

      // Color by type
      let topCol,leftCol,rightCol;
      if(type==='G'){topCol='#fbbf24';leftCol='#d97706';rightCol='#b45309'}
      else if(type==='C'){topCol='#475569';leftCol='#334155';rightCol='#1e293b'}
      else if(type==='I'){topCol='#525252';leftCol='#404040';rightCol='#262626'}
      else{topCol='#64748b';leftCol='#475569';rightCol='#334155'}

      drawBox(ctx,sx,sy,w,h,height,topCol,leftCol,rightCol);

      // Windows
      if(height>20 && type!=='G'){
        const nightGlow=hour<6||hour>19?0.6:0.12;
        ctx.globalAlpha=nightGlow;
        ctx.fillStyle='rgba(250,240,150,0.5)';
        for(let wy=0;wy<height-10;wy+=12){
          ctx.fillRect(sx-w*0.5,sy-wy-15,3,4);
          ctx.fillRect(sx-w*0.2,sy-wy-15,3,4);
          ctx.fillRect(sx+w*0.1,sy-wy-h-15,3,4);
          ctx.fillRect(sx+w*0.4,sy-wy-h-15,3,4);
        }
        ctx.globalAlpha=1;
      }

      // Rooftop solar panels (on commercial/residential when solar is high)
      if(mix.solar>30 && (type==='C'||type==='R') && height>25){
        const hash2=(gx*11+gy*3)%10;
        if(hash2<mix.solar/15){
          const isDay=hour>=6&&hour<18;
          ctx.fillStyle=isDay?'rgba(59,130,246,0.6)':'#1e293b';
          // Small panel on roof
          ctx.beginPath();
          ctx.moveTo(sx-w*0.4,sy-height-h*0.3);ctx.lineTo(sx+w*0.1,sy-height-h*0.6);
          ctx.lineTo(sx+w*0.4,sy-height-h*0.3);ctx.lineTo(sx-w*0.1,sy-height);ctx.closePath();ctx.fill();
          ctx.strokeStyle='rgba(148,163,184,0.25)';ctx.lineWidth=0.3;
          ctx.beginPath();ctx.moveTo(sx,sy-height-h*0.3);ctx.lineTo(sx,sy-height-h*0.15);ctx.stroke();
        }
      }

      // Pagoda
      if(type==='G'){
        // Multi-tier spire
        ctx.fillStyle='#fbbf24';
        ctx.beginPath();ctx.moveTo(sx,sy-height-30);ctx.lineTo(sx-6,sy-height);ctx.lineTo(sx+6,sy-height);ctx.closePath();ctx.fill();
        ctx.fillStyle='#f59e0b';
        ctx.beginPath();ctx.moveTo(sx,sy-height-30);ctx.lineTo(sx-3,sy-height-10);ctx.lineTo(sx+3,sy-height-10);ctx.closePath();ctx.fill();
        // Orb on top
        ctx.shadowColor='#fbbf24';ctx.shadowBlur=12;
        ctx.fillStyle='#fde047';
        ctx.beginPath();ctx.arc(sx,sy-height-32,2.5,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
        // Platform rings
        ctx.strokeStyle='rgba(251,191,36,0.3)';ctx.lineWidth=0.5;
        ctx.beginPath();ctx.arc(sx,sy-height-5,w*0.6,0,Math.PI*2);ctx.stroke();
      }

      // Industrial smoke
      if(type==='I' && metrics.fossilPct>20){
        const sAlpha=Math.min(0.4,metrics.fossilPct/180);
        const t2=T()/1000;
        for(let s=0;s<3;s++){
          ctx.globalAlpha=sAlpha*(0.5-s*0.12);
          ctx.fillStyle='#9ca3af';
          ctx.beginPath();ctx.arc(sx+Math.sin(t2*2+s*2)*4,sy-height-10-s*10,3+s*1.5,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }
    }

    // ══════════════════════════════════
    //  MAIN DRAW LOOP
    // ══════════════════════════════════
    function draw(){
      const cvEl=document.getElementById('cityCv');if(!cvEl)return;
      const w=cvEl.parentElement.getBoundingClientRect().width;
      const h=520;
      const ctx=setupCanvas(cvEl,w,h);
      const cx=w/2,cy=210;
      const metrics=calcMetrics();

      // Sky
      const isNight=hour<5||hour>20;
      const isDawn=hour>=5&&hour<7;
      const isDusk=hour>=18&&hour<=20;
      let skyTop,skyBot;
      if(isNight){skyTop='#070711';skyBot='#121228'}
      else if(isDawn||isDusk){skyTop='#1a0825';skyBot='#c2410c'}
      else{
        const p=Math.min(1,metrics.aqi/200);
        skyTop=lerpColor('#1a365d','#4a3520',p);
        skyBot=lerpColor('#7dd3fc','#c4a882',p);
      }
      const skyG=ctx.createLinearGradient(0,0,0,h);
      skyG.addColorStop(0,skyTop);skyG.addColorStop(1,skyBot);
      ctx.fillStyle=skyG;ctx.fillRect(0,0,w,h);

      // Stars
      if(isNight){
        for(let i=0;i<40;i++){
          const sx2=((i*137+42)%w),sy2=((i*73+11)%160);
          ctx.fillStyle=`rgba(255,255,255,${Math.sin(T()/500+i)*0.3+0.5})`;
          ctx.beginPath();ctx.arc(sx2,sy2,0.7+((i%3)*0.3),0,Math.PI*2);ctx.fill();
        }
      }
      // Sun / Moon
      if(!isNight){
        const sunA=((hour-6)/12)*Math.PI;
        const sunX=cx+Math.cos(sunA-Math.PI/2)*w*0.35;
        const sunY=cy-100-Math.sin(sunA-Math.PI/2)*90;
        const sg=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,35);
        sg.addColorStop(0,'rgba(255,220,100,0.8)');sg.addColorStop(0.5,'rgba(255,220,100,0.2)');sg.addColorStop(1,'rgba(255,220,100,0)');
        ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sunX,sunY,35,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(sunX,sunY,9,0,Math.PI*2);ctx.fill();
      } else {
        ctx.fillStyle='rgba(200,200,220,0.7)';ctx.beginPath();ctx.arc(cx+120,55,12,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=skyTop;ctx.beginPath();ctx.arc(cx+125,51,10,0,Math.PI*2);ctx.fill();
      }

      // Tiles
      const tiles=[];
      for(let gy=0;gy<GS;gy++){
        for(let gx=0;gx<GS;gx++){
          const type=getGridCell(gx,gy);
          const proj=isoProject(gx,gy,cx,cy);
          const bh=HEIGHTS[type]||1;
          const hVar=type==='C'?((gx*3+gy*7)%5)*0.4:type==='R'?((gx*5+gy*3)%3)*0.2:0;
          tiles.push({gx,gy,type,sx:proj.x,sy:proj.y,depth:proj.depth,bh:bh+hVar});
        }
      }
      tiles.sort((a,b)=>a.depth-b.depth);
      for(const t2 of tiles) drawBuilding(ctx,t2.sx,t2.sy,t2.type,t2.bh,metrics,t2.gx,t2.gy);

      // Pollution haze
      if(metrics.aqi>50){
        ctx.fillStyle=`rgba(120,100,80,${Math.min(0.3,(metrics.aqi-50)/400)})`;
        ctx.fillRect(0,0,w,h);
      }
      // Heat shimmer
      if(metrics.heatIsland>2){
        ctx.fillStyle=`rgba(200,80,30,${Math.min(0.12,(metrics.heatIsland-2)/8)})`;
        ctx.fillRect(0,h*0.55,w,h*0.45);
      }

      // City label
      ctx.textAlign='center';
      ctx.font='600 12px var(--mono)';ctx.fillStyle='rgba(255,255,255,0.45)';
      ctx.fillText('YANGON',cx,h-14);
      ctx.font='400 9px "Padauk",sans-serif';
      ctx.fillText('ရန်ကုန်',cx,h-3);

      animId=requestAnimationFrame(draw);
    }

    function lerpColor(a,b,t2){
      const ah=parseInt(a.slice(1),16),bh2=parseInt(b.slice(1),16);
      const ar=(ah>>16)&255,ag=(ah>>8)&255,ab2=ah&255;
      const br=(bh2>>16)&255,bg=(bh2>>8)&255,bb=bh2&255;
      const rr=Math.round(ar+(br-ar)*t2),rg=Math.round(ag+(bg-ag)*t2),rb=Math.round(ab2+(bb-ab2)*t2);
      return'#'+(1<<24|rr<<16|rg<<8|rb).toString(16).slice(1);
    }

    // ── Info & Reliability (unchanged logic) ──
    function updateInfo(){
      const m=calcMetrics();
      const el2=document.getElementById('cityInfo');
      if(!el2)return;
      const co2G=m.co2<150?'🟢':m.co2<400?'🟡':'🔴';
      const aqiG=m.aqi<50?'🟢':m.aqi<150?'🟡':'🔴';
      const relG=m.reliability>70?'🟢':m.reliability>40?'🟡':'🔴';
      const heatG=m.heatIsland<2?'🟢':m.heatIsland<4?'🟡':'🔴';
      el2.innerHTML=`
        <h4 style="color:var(--bright);margin-bottom:0.5rem">📊 ${t('city.metrics')}</h4>
        <div class="info-row"><span class="l">${co2G} CO₂ ${t('city.emissions')}</span><span class="v">${m.co2} g/kWh</span></div>
        <div class="info-row"><span class="l">${aqiG} ${t('city.air_quality')}</span><span class="v">AQI ${m.aqi}</span></div>
        <div class="info-row"><span class="l">${relG} ${t('city.reliability')}</span><span class="v">${m.reliability}%</span></div>
        <div class="info-row"><span class="l">${heatG} ${t('city.heat_island')}</span><span class="v">+${m.heatIsland}°C</span></div>
        <div class="info-row"><span class="l">🌿 ${t('city.renew_pct')}</span><span class="v" style="color:${m.renewPct>60?'#22c55e':m.renewPct>30?'#f59e0b':'#ef4444'}">${m.renewPct}%</span></div>
        <div class="info-row"><span class="l">💰 ${t('city.cost')}</span><span class="v">$${m.cost}/MWh</span></div>
        <div style="margin-top:0.8rem;padding:0.6rem;background:rgba(139,92,246,0.08);border-radius:8px;border-left:3px solid ${m.co2<200&&m.reliability>60?'#22c55e':'#ef4444'}">
          <div style="font-size:0.8rem;font-weight:700;color:var(--bright)">${getVerdict(m)}</div>
          <div style="font-size:0.72rem;color:var(--dim);margin-top:0.2rem">${getAdvice(m)}</div>
        </div>`;
      // Reliability
      const relEl=document.getElementById('cityReliability');
      if(!relEl)return;
      const total=SRC_KEYS.reduce((s,k)=>s+mix[k],0)||1;
      relEl.innerHTML=`
        <h4 style="color:var(--bright);margin-bottom:0.4rem;font-size:0.85rem">⏰ ${t('city.daily_reliability')}</h4>
        <div style="display:flex;gap:2px;height:36px;align-items:flex-end;background:var(--bg3);border-radius:8px;padding:4px;border:1px solid var(--border)">
          ${Array.from({length:24},(_,i)=>{
            let rel=0;
            for(const k of SRC_KEYS){const pct=mix[k]/total;let cap=SOURCES[k].cap;
              if(k==='solar')cap=solarCap(i);if(k==='wind')cap=windCap(i);rel+=cap*pct}
            const pct2=Math.round(rel*100);const col=pct2>70?'#22c55e':pct2>40?'#f59e0b':'#ef4444';
            const hh=Math.max(4,pct2/100*30);
            return`<div title="${i}:00 — ${pct2}%" style="flex:1;background:${col};height:${hh}px;border-radius:2px;opacity:${i===hour?1:0.5};${i===hour?'box-shadow:0 0 6px '+col:''}"></div>`;
          }).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:var(--dim);margin-top:2px;font-family:var(--mono)">
          <span>0:00</span><span>6:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
        </div>`;
    }
    function getVerdict(m){
      if(m.co2<100&&m.reliability>70&&m.heatIsland<2)return'🌟 '+t('city.verdict_excellent');
      if(m.co2<250&&m.reliability>55)return'✅ '+t('city.verdict_good');
      if(m.co2<500)return'⚠️ '+t('city.verdict_moderate');
      return'🚨 '+t('city.verdict_poor');
    }
    function getAdvice(m){
      if(m.reliability<40)return t('city.advice_reliability');
      if(m.co2>600)return t('city.advice_carbon');
      if(m.heatIsland>4)return t('city.advice_heat');
      if(m.co2<100&&m.reliability>70)return t('city.advice_perfect');
      return t('city.advice_balance');
    }

    // Auto time
    function tick(){
      if(autoTime){hour=(hour+1)%24;
        const hs=document.getElementById('city_hour');
        if(hs){hs.value=hour;document.getElementById('city_hour_v').textContent=hour+':00'}
        updateInfo();
      }
      timeId=setTimeout(tick,800);
    }

    updateInfo();draw();tick();
    function updateTimeDisplay(){
      const el3=document.getElementById('cityTime');
      if(el3) el3.textContent=`${String(hour).padStart(2,'0')}:00 ${hour>=6&&hour<18?'☀️':'🌙'}`;
      requestAnimationFrame(updateTimeDisplay);
    }
    updateTimeDisplay();

    return()=>{cancelAnimationFrame(animId);clearTimeout(timeId);delete window._cityRot;delete window._cityToggleTime};
  }
});
