// ═══════════════════════════════════════
//  PI DAY SPECIAL EXHIBIT  π  3.14
// ═══════════════════════════════════════

reg('math-piday',{
  section:'math',icon:'π',tKey:'pi.t',dKey:'pi.d',tagKey:'pi.tag',expTKey:'pi.exp_t',expKey:'pi.exp',
  render(el){
    let cleanups=[];

    // ── TAB SYSTEM ──
    const tabs=[
      {id:'monte',label:()=>t('pi.tab_monte')},
      {id:'buffon',label:()=>t('pi.tab_buffon')},
      {id:'digits',label:()=>t('pi.tab_digits')},
      {id:'leibniz',label:()=>t('pi.tab_leibniz')},
      {id:'circle',label:()=>t('pi.tab_circle')}
    ];

    el.innerHTML=`
      <div class="pi-banner">
        <div class="pi-symbol">π</div>
        <div class="pi-banner-text">
          <h3>${t('pi.banner')}</h3>
          <p>π = 3.14159265358979323846...</p>
        </div>
      </div>
      <div class="pi-tabs" id="piTabs">
        ${tabs.map((tb,i)=>`<button class="pi-tab${i===0?' active':''}" data-tab="${tb.id}">${tb.label()}</button>`).join('')}
      </div>
      <div class="pi-content" id="piContent"></div>`;

    const content=document.getElementById('piContent');
    const tabBtns=document.querySelectorAll('.pi-tab');
    let activeTab='monte';

    function switchTab(id){
      cleanups.forEach(fn=>fn());cleanups=[];
      activeTab=id;
      tabBtns.forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
      const renderer={monte:renderMonte,buffon:renderBuffon,digits:renderDigits,leibniz:renderLeibniz,circle:renderCircle}[id];
      if(renderer)renderer();
    }
    tabBtns.forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));

    // ════════════════════════════════════
    //  1. MONTE CARLO PI ESTIMATION
    // ════════════════════════════════════
    function renderMonte(){
      let inside=0,total=0,points=[],running=false,raf,timer;
      content.innerHTML=`
        <h4 class="pi-sub">${t('pi.monte_title')}</h4>
        <p class="pi-info">${t('pi.monte_info')}</p>
        <div class="pi-flex">
          <canvas id="monteCv" width="400" height="400" style="max-width:100%"></canvas>
          <div class="pi-stats">
            <div class="pi-stat-row"><span class="pi-stat-label">${t('pi.inside_circle')}</span><span class="pi-stat-val" id="mcIn">0</span></div>
            <div class="pi-stat-row"><span class="pi-stat-label">${t('pi.total_points')}</span><span class="pi-stat-val" id="mcTotal">0</span></div>
            <div class="pi-stat-big">
              <div class="pi-stat-label">π ≈ 4 × (${t('pi.inside_circle')} / ${t('pi.total_points')})</div>
              <div class="pi-estimate" id="mcPi">—</div>
            </div>
            <div class="pi-stat-row"><span class="pi-stat-label">${t('pi.error')}</span><span class="pi-stat-val" id="mcErr">—</span></div>
          </div>
        </div>
        <div class="controls" style="justify-content:center;margin-top:1rem">
          <button class="btn btn-p" id="mcStart">${t('pi.start_rain')}</button>
          <button class="btn" id="mc10">+10</button>
          <button class="btn" id="mc100">+100</button>
          <button class="btn" id="mc1000">+1000</button>
          <button class="btn" id="mcReset">${t('m_primes.reset')}</button>
        </div>`;

      const cv=document.getElementById('monteCv');
      const sz=400;
      const ctx=setupCanvas(cv,sz,sz);

      function drawBg(){
        ctx.fillStyle='#0a0a18';ctx.fillRect(0,0,sz,sz);
        // Square border
        ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
        ctx.strokeRect(2,2,sz-4,sz-4);
        // Circle
        ctx.strokeStyle='rgba(245,158,11,0.4)';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(sz/2,sz/2,sz/2-2,0,Math.PI*2);ctx.stroke();
      }

      function addPoints(n){
        for(let i=0;i<n;i++){
          const x=Math.random(),y=Math.random();
          const dist=(x-0.5)**2+(y-0.5)**2;
          const isIn=dist<=0.25;
          if(isIn)inside++;
          total++;
          points.push({x,y,in:isIn});
        }
        redraw();
      }

      function redraw(){
        drawBg();
        for(const p of points){
          ctx.fillStyle=p.in?'rgba(16,185,129,0.7)':'rgba(239,68,68,0.5)';
          ctx.beginPath();ctx.arc(p.x*sz,p.y*sz,1.5,0,Math.PI*2);ctx.fill();
        }
        document.getElementById('mcIn').textContent=inside;
        document.getElementById('mcTotal').textContent=total;
        if(total>0){
          const est=4*inside/total;
          document.getElementById('mcPi').textContent=est.toFixed(6);
          document.getElementById('mcErr').textContent=(Math.abs(est-Math.PI)/Math.PI*100).toFixed(3)+'%';
        }
      }

      drawBg();

      document.getElementById('mcStart').onclick=()=>{
        if(running){running=false;document.getElementById('mcStart').textContent=t('pi.start_rain');return}
        running=true;document.getElementById('mcStart').textContent=t('pi.stop_rain');
        function rain(){if(!running)return;addPoints(5);timer=setTimeout(rain,30)}
        rain();
      };
      document.getElementById('mc10').onclick=()=>addPoints(10);
      document.getElementById('mc100').onclick=()=>addPoints(100);
      document.getElementById('mc1000').onclick=()=>addPoints(1000);
      document.getElementById('mcReset').onclick=()=>{
        inside=0;total=0;points=[];running=false;
        document.getElementById('mcStart').textContent=t('pi.start_rain');
        drawBg();redraw();
      };

      cleanups.push(()=>{running=false;clearTimeout(timer);cancelAnimationFrame(raf)});
    }

    // ════════════════════════════════════
    //  2. BUFFON'S NEEDLE
    // ════════════════════════════════════
    function renderBuffon(){
      let needles=[],crosses=0,total=0,running=false,timer;
      const W=600,H=400,gap=60; // line spacing

      content.innerHTML=`
        <h4 class="pi-sub">${t('pi.buffon_title')}</h4>
        <p class="pi-info">${t('pi.buffon_info')}</p>
        <canvas id="bufCv" height="${H}" style="width:100%"></canvas>
        <div class="pi-stats" style="display:flex;gap:2rem;justify-content:center;margin-top:0.8rem;flex-wrap:wrap">
          <div class="pi-stat-row"><span class="pi-stat-label">${t('pi.needles_dropped')}</span><span class="pi-stat-val" id="bfTotal">0</span></div>
          <div class="pi-stat-row"><span class="pi-stat-label">${t('pi.crossing')}</span><span class="pi-stat-val" id="bfCross">0</span></div>
          <div class="pi-stat-big" style="text-align:center">
            <div class="pi-stat-label">π ≈ 2L / (d × P)</div>
            <div class="pi-estimate" id="bfPi">—</div>
          </div>
        </div>
        <div class="controls" style="justify-content:center;margin-top:1rem">
          <button class="btn btn-p" id="bfStart">${t('pi.drop_needles')}</button>
          <button class="btn" id="bf10">+10</button>
          <button class="btn" id="bf100">+100</button>
          <button class="btn" id="bfReset">${t('m_primes.reset')}</button>
        </div>`;

      const cv=document.getElementById('bufCv');
      const w=cv.parentElement.getBoundingClientRect().width;
      const ctx=setupCanvas(cv,w,H);
      const needleLen=gap*0.8; // L = 0.8d

      function drawBg(){
        ctx.fillStyle='#0a0a18';ctx.fillRect(0,0,w,H);
        ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;
        for(let y=gap;y<H;y+=gap){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
      }

      function dropNeedles(n){
        for(let i=0;i<n;i++){
          const cx=Math.random()*w,cy=Math.random()*H;
          const ang=Math.random()*Math.PI;
          const dx=Math.cos(ang)*needleLen/2,dy=Math.sin(ang)*needleLen/2;
          const y1=cy-dy,y2=cy+dy;
          // Check crossing: does [y1,y2] span a horizontal line at y=k*gap?
          const minY=Math.min(y1,y2),maxY=Math.max(y1,y2);
          let cross=false;
          for(let ly=gap;ly<H;ly+=gap){if(minY<=ly&&maxY>=ly){cross=true;break}}
          if(cross)crosses++;
          total++;
          needles.push({x1:cx-dx,y1,x2:cx+dx,y2,cross});
        }
        redraw();
      }

      function redraw(){
        drawBg();
        for(const n of needles){
          ctx.strokeStyle=n.cross?'rgba(245,158,11,0.8)':'rgba(100,100,180,0.4)';
          ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(n.x1,n.y1);ctx.lineTo(n.x2,n.y2);ctx.stroke();
        }
        document.getElementById('bfTotal').textContent=total;
        document.getElementById('bfCross').textContent=crosses;
        if(crosses>0){
          const est=2*needleLen/(gap*(crosses/total));
          document.getElementById('bfPi').textContent=est.toFixed(6);
        }
      }
      drawBg();

      document.getElementById('bfStart').onclick=()=>{
        if(running){running=false;document.getElementById('bfStart').textContent=t('pi.drop_needles');return}
        running=true;document.getElementById('bfStart').textContent=t('pi.stop_rain');
        function drop(){if(!running)return;dropNeedles(3);timer=setTimeout(drop,50)}
        drop();
      };
      document.getElementById('bf10').onclick=()=>dropNeedles(10);
      document.getElementById('bf100').onclick=()=>dropNeedles(100);
      document.getElementById('bfReset').onclick=()=>{needles=[];crosses=0;total=0;running=false;
        document.getElementById('bfStart').textContent=t('pi.drop_needles');drawBg();redraw()};

      cleanups.push(()=>{running=false;clearTimeout(timer)});
    }

    // ════════════════════════════════════
    //  3. PI DIGIT EXPLORER
    // ════════════════════════════════════
    function renderDigits(){
      // First 1000 digits of Pi (after 3.)
      const PI_DIGITS='1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989';
      const colors=['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];

      content.innerHTML=`
        <h4 class="pi-sub">${t('pi.digits_title')}</h4>
        <p class="pi-info">${t('pi.digits_info')}</p>
        <div class="pi-digit-display" id="piDigitDisplay">
          <span class="pi-digit-big">3.</span>${PI_DIGITS.split('').map((d,i)=>`<span class="pi-dg" style="color:${colors[+d]}" data-i="${i+1}">${d}</span>`).join('')}
        </div>
        <div style="text-align:center;margin:1rem 0">
          <span style="font-family:var(--mono);font-size:0.75rem;color:var(--dim)">${t('pi.showing')} 1000 ${t('pi.digits_of_pi')}</span>
        </div>
        <h4 class="pi-sub" style="margin-top:1.5rem">${t('pi.freq_title')}</h4>
        <canvas id="freqCv" height="250" style="width:100%"></canvas>
        <div style="text-align:center;margin-top:0.5rem">
          <span style="font-family:var(--mono);font-size:0.75rem;color:var(--dim)">${t('pi.freq_info')}</span>
        </div>`;

      // Frequency chart
      const freq=new Array(10).fill(0);
      for(const d of PI_DIGITS)freq[+d]++;

      const cv=document.getElementById('freqCv');
      const w=cv.parentElement.getBoundingClientRect().width,h=250;
      const ctx=setupCanvas(cv,w,h);
      ctx.fillStyle='#0a0a18';ctx.fillRect(0,0,w,h);
      const pad=50,bw=(w-pad*2)/10*0.7,gp=(w-pad*2)/10;
      const maxF=Math.max(...freq);

      // Expected line
      const expH=100/maxF*(h-70);
      ctx.strokeStyle='rgba(236,72,153,0.4)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(pad-10,h-40-expH);ctx.lineTo(w-pad+10,h-40-expH);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='rgba(236,72,153,0.6)';ctx.font='10px Space Mono';ctx.textAlign='left';
      ctx.fillText(`${t('m_prob.expected')}: 100 (10%)`,pad,h-40-expH-5);

      for(let i=0;i<10;i++){
        const x=pad+i*gp;
        const barH=freq[i]/maxF*(h-70);
        ctx.fillStyle=colors[i];
        ctx.globalAlpha=0.8;
        ctx.fillRect(x,h-40-barH,bw,barH);
        ctx.globalAlpha=1;
        // Digit label
        ctx.fillStyle='#fff';ctx.font='bold 16px Outfit';ctx.textAlign='center';
        ctx.fillText(i,x+bw/2,h-20);
        // Count
        ctx.fillStyle='var(--dim)';ctx.font='11px Space Mono';
        ctx.fillText(freq[i],x+bw/2,h-44-barH);
        // Percentage
        ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='9px Space Mono';
        ctx.fillText((freq[i]/1000*100).toFixed(1)+'%',x+bw/2,h-56-barH);
      }
    }

    // ════════════════════════════════════
    //  4. LEIBNIZ SERIES CONVERGENCE
    // ════════════════════════════════════
    function renderLeibniz(){
      let terms=0,sum=0,history=[],running=false,timer,raf;
      const MAX_TERMS=5000;

      content.innerHTML=`
        <h4 class="pi-sub">${t('pi.leibniz_title')}</h4>
        <p class="pi-info">${t('pi.leibniz_info')}</p>
        <div style="text-align:center;font-family:var(--mono);font-size:1rem;color:var(--math);margin:0.8rem 0">
          π/4 = 1 - 1/3 + 1/5 - 1/7 + 1/9 - ...
        </div>
        <canvas id="leibCv" height="300" style="width:100%"></canvas>
        <div class="pi-stats" style="display:flex;gap:2rem;justify-content:center;margin-top:0.8rem;flex-wrap:wrap">
          <div class="pi-stat-row"><span class="pi-stat-label">${t('pi.terms')}</span><span class="pi-stat-val" id="lbTerms">0</span></div>
          <div class="pi-stat-big" style="text-align:center">
            <div class="pi-stat-label">${t('pi.current_sum')} × 4</div>
            <div class="pi-estimate" id="lbPi">—</div>
          </div>
          <div class="pi-stat-row"><span class="pi-stat-label">${t('pi.error')}</span><span class="pi-stat-val" id="lbErr">—</span></div>
        </div>
        <div class="controls" style="justify-content:center;margin-top:1rem">
          <button class="btn btn-p" id="lbStart">${t('pi.animate')}</button>
          <button class="btn" id="lb10">+10</button>
          <button class="btn" id="lb100">+100</button>
          <button class="btn" id="lb1000">+1000</button>
          <button class="btn" id="lbReset">${t('m_primes.reset')}</button>
        </div>`;

      const cv=document.getElementById('leibCv');

      function addTerms(n){
        for(let i=0;i<n&&terms<MAX_TERMS;i++){
          sum+=((terms%2===0)?1:-1)/(2*terms+1);
          terms++;
          if(terms<=200||terms%10===0)history.push({n:terms,val:sum*4});
        }
        drawChart();
      }

      function drawChart(){
        const w=cv.parentElement.getBoundingClientRect().width,h=300;
        const ctx=setupCanvas(cv,w,h);
        ctx.fillStyle='#0a0a18';ctx.fillRect(0,0,w,h);
        if(history.length<2)return;

        const pad={l:60,r:20,t:30,b:40};
        const gw=w-pad.l-pad.r,gh=h-pad.t-pad.b;

        // Find y range
        const vals=history.map(h2=>h2.val);
        let yMin=Math.min(...vals,Math.PI-0.5);
        let yMax=Math.max(...vals,Math.PI+0.5);
        const yRange=yMax-yMin;

        // Pi reference line
        const piY=pad.t+(yMax-Math.PI)/yRange*gh;
        ctx.strokeStyle='rgba(236,72,153,0.6)';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);
        ctx.beginPath();ctx.moveTo(pad.l,piY);ctx.lineTo(w-pad.r,piY);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='#ec4899';ctx.font='bold 12px Space Mono';ctx.textAlign='left';
        ctx.fillText('π = 3.14159...',pad.l+5,piY-8);

        // Plot series
        ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;ctx.beginPath();
        for(let i=0;i<history.length;i++){
          const x=pad.l+i/(history.length-1)*gw;
          const y=pad.t+(yMax-history[i].val)/yRange*gh;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Current point
        if(history.length>0){
          const last=history[history.length-1];
          const x=w-pad.r;
          const y=pad.t+(yMax-last.val)/yRange*gh;
          ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle='#f59e0b';ctx.fill();
        }

        // Axes
        ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,h-pad.b);ctx.lineTo(w-pad.r,h-pad.b);ctx.stroke();
        // Y labels
        ctx.fillStyle='var(--dim)';ctx.font='10px Space Mono';ctx.textAlign='right';
        for(let i=0;i<=4;i++){
          const val=yMin+i*(yRange/4);
          const y=h-pad.b-i*(gh/4);
          ctx.fillText(val.toFixed(2),pad.l-8,y+4);
        }
        // X label
        ctx.textAlign='center';ctx.fillText(`${t('pi.terms')}: ${terms}`,w/2,h-8);

        // Update stats
        document.getElementById('lbTerms').textContent=terms;
        if(terms>0){
          const est=sum*4;
          document.getElementById('lbPi').textContent=est.toFixed(8);
          document.getElementById('lbErr').textContent=(Math.abs(est-Math.PI)/Math.PI*100).toFixed(4)+'%';
        }
      }
      drawChart();

      document.getElementById('lbStart').onclick=()=>{
        if(running){running=false;document.getElementById('lbStart').textContent=t('pi.animate');return}
        running=true;document.getElementById('lbStart').textContent=t('pi.stop_rain');
        function step(){if(!running||terms>=MAX_TERMS){running=false;document.getElementById('lbStart').textContent=t('pi.animate');return}
          addTerms(1);timer=setTimeout(step,20)}
        step();
      };
      document.getElementById('lb10').onclick=()=>addTerms(10);
      document.getElementById('lb100').onclick=()=>addTerms(100);
      document.getElementById('lb1000').onclick=()=>addTerms(1000);
      document.getElementById('lbReset').onclick=()=>{terms=0;sum=0;history=[];running=false;
        document.getElementById('lbStart').textContent=t('pi.animate');drawChart()};

      cleanups.push(()=>{running=false;clearTimeout(timer)});
    }

    // ════════════════════════════════════
    //  5. CIRCLE — C/d = π
    // ════════════════════════════════════
    function renderCircle(){
      let radius=100,raf,rolling=false,rollAngle=0,rollTimer;

      content.innerHTML=`
        <h4 class="pi-sub">${t('pi.circle_title')}</h4>
        <p class="pi-info">${t('pi.circle_info')}</p>
        <canvas id="circleCv" height="420" style="width:100%;cursor:pointer"></canvas>
        <div class="controls" style="justify-content:center">
          <div class="ctrl"><label>${t('pi.radius')}</label><input type="range" id="cRad" min="30" max="160" value="100"></div><span class="val" id="cRadV">100</span>
          <button class="btn btn-p" id="cRoll">${t('pi.roll_circle')}</button>
          <button class="btn" id="cReset">${t('m_primes.reset')}</button>
        </div>`;

      const cv=document.getElementById('circleCv');
      document.getElementById('cRad').oninput=e=>{
        radius=+e.target.value;document.getElementById('cRadV').textContent=radius;
        rollAngle=0;rolling=false;document.getElementById('cRoll').textContent=t('pi.roll_circle');
      };

      function draw(){
        const w=cv.parentElement.getBoundingClientRect().width,h=420;
        const ctx=setupCanvas(cv,w,h);
        ctx.fillStyle='#0a0a18';ctx.fillRect(0,0,w,h);

        const R=radius;
        const C=2*Math.PI*R;
        const d=2*R;
        const groundY=h-80;
        const startX=60;

        // Ground line
        ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(startX,groundY);ctx.lineTo(w-20,groundY);ctx.stroke();

        // Circumference line (unrolled)
        const circumEnd=startX+C;
        ctx.strokeStyle='rgba(245,158,11,0.6)';ctx.lineWidth=3;ctx.setLineDash([8,4]);
        ctx.beginPath();ctx.moveTo(startX,groundY+30);ctx.lineTo(Math.min(circumEnd,w-20),groundY+30);ctx.stroke();ctx.setLineDash([]);
        // Label
        ctx.fillStyle='#f59e0b';ctx.font='bold 12px Space Mono';ctx.textAlign='center';
        const labelX=Math.min(startX+C/2,w/2);
        ctx.fillText(`C = 2πr = ${C.toFixed(1)}`,labelX,groundY+50);

        // Diameter markers
        ctx.strokeStyle='rgba(59,130,246,0.6)';ctx.lineWidth=2;
        const dMarks=Math.floor(C/d);
        for(let i=0;i<=dMarks;i++){
          const x=startX+i*d;
          if(x>w-20)break;
          ctx.beginPath();ctx.moveTo(x,groundY+24);ctx.lineTo(x,groundY+36);ctx.stroke();
          if(i<dMarks){
            ctx.fillStyle='#3b82f6';ctx.font='10px Space Mono';ctx.textAlign='center';
            ctx.fillText(`d${i>0?'×'+(i+1):''}`,x+d/2,groundY+65);
          }
        }
        // Show π marker
        const piX=startX+Math.PI*d;
        if(piX<w-20){
          ctx.strokeStyle='#ec4899';ctx.lineWidth=2;
          ctx.beginPath();ctx.moveTo(piX,groundY+20);ctx.lineTo(piX,groundY+40);ctx.stroke();
          ctx.fillStyle='#ec4899';ctx.font='bold 11px Space Mono';ctx.textAlign='center';
          ctx.fillText('π×d',piX,groundY+55);
        }

        // Rolling circle
        const dist=rollAngle*R;
        const cx=startX+dist;
        const cy=groundY-R;

        if(cx<w-20){
          // Circle
          ctx.strokeStyle='rgba(245,158,11,0.8)';ctx.lineWidth=2;
          ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();
          // Radius line (rotates as it rolls)
          ctx.strokeStyle='#ec4899';ctx.lineWidth=2;
          const rx=cx+Math.cos(-rollAngle)*R,ry=cy+Math.sin(-rollAngle)*R;
          ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(rx,ry);ctx.stroke();
          // Dot at contact point
          ctx.beginPath();ctx.arc(rx,ry,4,0,Math.PI*2);ctx.fillStyle='#ec4899';ctx.fill();
          // Center dot
          ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();

          // Diameter line
          ctx.strokeStyle='rgba(59,130,246,0.5)';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
          ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.stroke();ctx.setLineDash([]);
          ctx.fillStyle='#3b82f6';ctx.font='10px Space Mono';ctx.textAlign='center';
          ctx.fillText(`d = ${d}`,cx,cy-R-10);

          // Trail on ground showing distance rolled
          if(dist>0){
            ctx.strokeStyle='#10b981';ctx.lineWidth=3;
            ctx.beginPath();ctx.moveTo(startX,groundY);ctx.lineTo(startX+Math.min(dist,C),groundY);ctx.stroke();
          }
        }

        // Stats text
        ctx.fillStyle='var(--bright)';ctx.font='bold 14px Space Mono';ctx.textAlign='center';
        ctx.fillText(`C ÷ d = ${C.toFixed(1)} ÷ ${d} = ${(C/d).toFixed(6)} = π`,w/2,30);

        // Revolutions
        const revs=rollAngle/(2*Math.PI);
        ctx.fillStyle='var(--dim)';ctx.font='11px Space Mono';
        ctx.fillText(`${t('pi.revolutions')}: ${revs.toFixed(3)} | ${t('pi.distance')}: ${dist.toFixed(1)}`,w/2,52);

        raf=requestAnimationFrame(draw);
      }

      document.getElementById('cRoll').onclick=()=>{
        if(rolling){rolling=false;document.getElementById('cRoll').textContent=t('pi.roll_circle');return}
        rollAngle=0;rolling=true;document.getElementById('cRoll').textContent=t('pi.stop_rain');
        function step(){
          if(!rolling||rollAngle>=2*Math.PI){rolling=false;rollAngle=Math.min(rollAngle,2*Math.PI);
            document.getElementById('cRoll').textContent=t('pi.roll_circle');return}
          rollAngle+=0.02;rollTimer=setTimeout(step,16);
        }
        step();
      };
      document.getElementById('cReset').onclick=()=>{rollAngle=0;rolling=false;
        document.getElementById('cRoll').textContent=t('pi.roll_circle')};

      draw();
      cleanups.push(()=>{rolling=false;clearTimeout(rollTimer);cancelAnimationFrame(raf)});
    }

    // Start with Monte Carlo
    renderMonte();

    return()=>{cleanups.forEach(fn=>fn())};
  }
});
