// ═══════════════════════════════════════
//  MATH EXHIBITS (5)
// ═══════════════════════════════════════

// 1. PRIME NUMBER SIEVE
reg('math-primes',{
  section:'math',icon:'🔍',tKey:'m_primes.t',dKey:'m_primes.d',tagKey:'m_primes.tag',expTKey:'m_primes.exp_t',expKey:'m_primes.exp',
  render(el){
    const N=200,cols=window.innerWidth<600?10:15;
    let sieve=new Array(N+1).fill(0),cf=2,primeCount=0,timer=null;
    function grid(){let s='';for(let i=2;i<=N;i++){s+=`<div class="num-cell" data-n="${i}" id="sc${i}">${i}</div>`}return s}
    el.innerHTML=`
      <div style="text-align:center;font-family:var(--mono);font-size:1.1rem;color:var(--math);margin-bottom:0.5rem">
        ${t('m_primes.found')}: <span id="pc">0</span> <span id="sStatus" style="margin-left:1rem;color:var(--dim)"></span>
      </div>
      <div class="num-grid" id="sGrid" style="grid-template-columns:repeat(${cols},1fr)">${grid()}</div>
      <div class="controls" style="justify-content:center">
        <button class="btn btn-p" onclick="sStart()">${t('m_primes.start')}</button>
        <button class="btn" onclick="sStep()">${t('m_primes.step')}</button>
        <button class="btn" onclick="sReset()">${t('m_primes.reset')}</button>
      </div>`;
    function upd(){
      for(let i=2;i<=N;i++){const c=document.getElementById('sc'+i);if(!c)continue;c.className='num-cell';
        if(sieve[i]===1)c.classList.add('prime');else if(sieve[i]===2)c.classList.add('composite');
        if(i===cf&&timer)c.classList.add('current');}
      document.getElementById('pc').textContent=primeCount;
    }
    window.sStep=()=>{
      if(cf*cf>N){for(let i=2;i<=N;i++){if(sieve[i]===0){sieve[i]=1;primeCount++}}
        if(timer){clearInterval(timer);timer=null}document.getElementById('sStatus').textContent='✓ Complete!';upd();return}
      if(sieve[cf]===2){cf++;window.sStep();return}
      sieve[cf]=1;primeCount++;document.getElementById('sStatus').textContent=`${t('m_primes.checking')} ${cf}`;
      for(let m=cf*cf;m<=N;m+=cf){if(sieve[m]===0)sieve[m]=2}cf++;upd();
    };
    window.sStart=()=>{if(timer)return;timer=setInterval(()=>window.sStep(),300)};
    window.sReset=()=>{if(timer){clearInterval(timer);timer=null}sieve=new Array(N+1).fill(0);cf=2;primeCount=0;
      document.getElementById('sGrid').innerHTML=grid();document.getElementById('sStatus').textContent='';upd()};
    return()=>{if(timer)clearInterval(timer);delete window.sStep;delete window.sStart;delete window.sReset};
  }
});

// 2. FRACTAL EXPLORER
reg('math-fractals',{
  section:'math',icon:'🌀',tKey:'m_fractals.t',dKey:'m_fractals.d',tagKey:'m_fractals.tag',expTKey:'m_fractals.exp_t',expKey:'m_fractals.exp',
  render(el){
    let depth=6,angle=25,ratio=0.7,wind=0,mode='tree';
    // Mandelbrot state
    let cx2=-0.5,cy2=0,zoom=200,maxI=80;
    el.innerHTML=`
      <div class="fractal-tabs" style="display:flex;gap:0;margin-bottom:1rem">
        <button class="btn fractal-tab active" id="ftTree" onclick="window._fracMode('tree')">🌳 ${t('m_fractals.tree')}</button>
        <button class="btn fractal-tab" id="ftMandel" onclick="window._fracMode('mandel')">🔮 ${t('m_fractals.mandel')}</button>
      </div>
      <canvas id="fracCv" height="500"></canvas>
      <div id="fInfo" style="font-family:var(--mono);font-size:0.75rem;color:var(--dim);padding:0.3rem 0"></div>
      <div id="treeControls" class="controls">
        <div class="ctrl"><label>${t('m_fractals.depth')}</label><input type="range" id="fDepth" min="1" max="13" value="6"></div><span class="val" id="fDepthV">6</span>
        <div class="ctrl"><label>${t('m_fractals.angle')}</label><input type="range" id="fAngle" min="5" max="60" value="25"></div><span class="val" id="fAngleV">25°</span>
        <div class="ctrl"><label>${t('m_fractals.ratio')}</label><input type="range" id="fRatio" min="50" max="85" value="70"></div><span class="val" id="fRatioV">0.70</span>
        <div class="ctrl"><label>${t('m_fractals.wind')}</label><input type="range" id="fWind" min="-30" max="30" value="0"></div><span class="val" id="fWindV">0°</span>
      </div>
      <div id="mandelControls" class="controls" style="display:none">
        <div class="ctrl"><label>${t('m_fractals.detail')}</label><input type="range" id="fI" min="20" max="300" value="80"></div><span class="val" id="fIV">80</span>
        <button class="btn" onclick="window._fracRst()">Reset</button>
      </div>`;
    const cv=document.getElementById('fracCv');
    // Tree controls
    document.getElementById('fDepth').oninput=e=>{depth=+e.target.value;document.getElementById('fDepthV').textContent=depth;drawTree()};
    document.getElementById('fAngle').oninput=e=>{angle=+e.target.value;document.getElementById('fAngleV').textContent=angle+'°';drawTree()};
    document.getElementById('fRatio').oninput=e=>{ratio=e.target.value/100;document.getElementById('fRatioV').textContent=ratio.toFixed(2);drawTree()};
    document.getElementById('fWind').oninput=e=>{wind=+e.target.value;document.getElementById('fWindV').textContent=wind+'°';drawTree()};
    // Mandelbrot controls
    document.getElementById('fI').oninput=e=>{maxI=+e.target.value;document.getElementById('fIV').textContent=maxI;drawMandel()};
    window._fracRst=()=>{cx2=-0.5;cy2=0;zoom=200;maxI=80;document.getElementById('fI').value=80;document.getElementById('fIV').textContent=80;drawMandel()};
    cv.onclick=e=>{if(mode==='mandel'){const r=cv.getBoundingClientRect();cx2+=(e.clientX-r.left-r.width/2)/zoom;cy2+=(e.clientY-r.top-r.height/2)/zoom;zoom*=2;drawMandel()}};
    cv.oncontextmenu=e=>{if(mode==='mandel'){e.preventDefault();zoom=Math.max(50,zoom/2);drawMandel()}};
    cv.onmousemove=e=>{if(mode==='mandel'){const r=cv.getBoundingClientRect();const re=cx2+(e.clientX-r.left-r.width/2)/zoom;const im=cy2+(e.clientY-r.top-r.height/2)/zoom;
      document.getElementById('fInfo').textContent=`${re.toFixed(6)} + ${im.toFixed(6)}i | ${t('m_fractals.zoom')}: ${(zoom/200).toFixed(1)}x`}};
    window._fracMode=m=>{
      mode=m;
      document.getElementById('ftTree').classList.toggle('active',m==='tree');
      document.getElementById('ftMandel').classList.toggle('active',m==='mandel');
      document.getElementById('treeControls').style.display=m==='tree'?'':'none';
      document.getElementById('mandelControls').style.display=m==='mandel'?'':'none';
      cv.style.cursor=m==='mandel'?'crosshair':'default';
      document.getElementById('fInfo').textContent='';
      if(m==='tree')drawTree();else drawMandel();
    };
    function drawTree(){
      const r=cv.parentElement.getBoundingClientRect();const w=Math.floor(r.width),h=500;
      cv.width=w;cv.height=h;cv.style.width=w+'px';cv.style.height=h+'px';
      const ctx=cv.getContext('2d');
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      // Auto-scale trunk so tree fits canvas at any depth
      const cosA=Math.cos(angle*Math.PI/180);
      const rc=ratio*cosA;
      const totalH=rc>=1?depth:(1-Math.pow(rc,depth))/(1-rc);
      const startLen=Math.min(h*0.24,(h*0.65)/totalH);
      const totalBranches=Math.pow(2,depth+1)-2;
      let branchCount=0;
      function branch(x,y,len,a,d2){
        if(d2<=0||len<1)return;
        const progress=1-d2/depth;
        const x2=x+Math.sin(a*Math.PI/180)*len;
        const y2=y-Math.cos(a*Math.PI/180)*len;
        // Color gradient: brown trunk → green leaves
        const hue=30+progress*90;
        const sat=40+progress*40;
        const lum=25+progress*35;
        ctx.strokeStyle=`hsl(${hue},${sat}%,${lum}%)`;
        ctx.lineWidth=Math.max(1,d2*1.8);
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();
        // Leaf dots at tips
        if(d2<=2){
          ctx.beginPath();ctx.arc(x2,y2,Math.max(2,3-d2+Math.random()*2),0,Math.PI*2);
          ctx.fillStyle=`hsla(${100+Math.random()*40},${60+Math.random()*30}%,${45+Math.random()*20}%,0.8)`;
          ctx.fill();
        }
        const windA=wind*(1-d2/depth);
        branch(x2,y2,len*ratio,a-angle+windA,d2-1);
        branch(x2,y2,len*ratio,a+angle+windA,d2-1);
      }
      // Ground
      const grd=ctx.createLinearGradient(0,h-30,0,h);
      grd.addColorStop(0,'rgba(34,80,34,0.3)');grd.addColorStop(1,'rgba(34,80,34,0)');
      ctx.fillStyle=grd;ctx.fillRect(0,h-30,w,30);
      branch(w/2,h-10,startLen,0+wind*0.3,depth);
      // Branch count label
      const info=document.getElementById('fInfo');
      if(info)info.textContent=`${t('m_fractals.branches')}: ${Math.pow(2,depth)-1} | ${t('m_fractals.depth')}: ${depth}`;
    }
    function drawMandel(){
      const r=cv.parentElement.getBoundingClientRect();const w=Math.floor(r.width),h=500;
      cv.width=w;cv.height=h;cv.style.width=w+'px';cv.style.height=h+'px';
      const ctx=cv.getContext('2d');
      const img=ctx.createImageData(w,h);const d=img.data;
      for(let py=0;py<h;py++){for(let px=0;px<w;px++){
        const x0=cx2+(px-w/2)/zoom,y0=cy2+(py-h/2)/zoom;let x=0,y=0,i=0;
        while(x*x+y*y<=4&&i<maxI){const xt=x*x-y*y+x0;y=2*x*y+y0;x=xt;i++}
        const idx=(py*w+px)*4;
        if(i===maxI){d[idx]=d[idx+1]=d[idx+2]=0}else{
          const t2=i/maxI;d[idx]=Math.floor(9*(1-t2)*t2*t2*t2*255);d[idx+1]=Math.floor(15*(1-t2)*(1-t2)*t2*t2*255);d[idx+2]=Math.floor(8.5*(1-t2)*(1-t2)*(1-t2)*t2*255)}
        d[idx+3]=255;
      }}
      ctx.putImageData(img,0,0);
    }
    drawTree();
    return()=>{delete window._fracMode;delete window._fracRst};
  }
});

// 3. PYTHAGOREAN THEOREM
reg('math-pythag',{
  section:'math',icon:'📐',tKey:'m_pythag.t',dKey:'m_pythag.d',tagKey:'m_pythag.tag',expTKey:'m_pythag.exp_t',expKey:'m_pythag.exp',
  render(el){
    let a=120,b=160,aid;
    el.innerHTML=`<canvas id="pythCv" height="400"></canvas>
      <div class="controls">
        <div class="ctrl"><label>${t('m_pythag.side_a')}</label><input type="range" id="pA" min="40" max="200" value="120"></div><span class="val" id="pAV">120</span>
        <div class="ctrl"><label>${t('m_pythag.side_b')}</label><input type="range" id="pB" min="40" max="200" value="160"></div><span class="val" id="pBV">160</span>
      </div>`;
    document.getElementById('pA').oninput=e=>{a=+e.target.value;document.getElementById('pAV').textContent=a};
    document.getElementById('pB').oninput=e=>{b=+e.target.value;document.getElementById('pBV').textContent=b};
    function draw(){
      const cv=document.getElementById('pythCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=400;
      const ctx=setupCanvas(cv,w,h);
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      const c=Math.sqrt(a*a+b*b);const scale=Math.min(0.5,Math.min((w-40)/(b+c+20),(h-40)/(a+c+20)));
      const sa=a*scale,sb=b*scale,sc=c*scale;
      const ox=w/2-sb/2,oy=h/2+sa/2;
      // Triangle
      ctx.strokeStyle='#fff';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+sb,oy);ctx.lineTo(ox,oy-sa);ctx.closePath();ctx.stroke();
      // Right angle marker
      ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
      ctx.strokeRect(ox,oy-12,12,12);
      // Square on a (left)
      ctx.fillStyle='rgba(59,130,246,0.2)';ctx.strokeStyle='#3b82f6';ctx.lineWidth=1.5;
      ctx.fillRect(ox-sa,oy-sa,sa,sa);ctx.strokeRect(ox-sa,oy-sa,sa,sa);
      ctx.fillStyle='#3b82f6';ctx.font='bold 13px Space Mono';ctx.textAlign='center';
      ctx.fillText(`a²=${a*a}`,ox-sa/2,oy-sa/2+5);
      // Square on b (bottom)
      ctx.fillStyle='rgba(245,158,11,0.2)';ctx.strokeStyle='#f59e0b';
      ctx.fillRect(ox,oy,sb,sb);ctx.strokeRect(ox,oy,sb,sb);
      ctx.fillStyle='#f59e0b';
      ctx.fillText(`b²=${b*b}`,ox+sb/2,oy+sb/2+5);
      // Square on c (hypotenuse) - rotated
      const ang=Math.atan2(sa,sb);
      ctx.save();ctx.translate(ox+sb,oy);ctx.rotate(-ang);
      ctx.fillStyle='rgba(236,72,153,0.2)';ctx.strokeStyle='#ec4899';
      ctx.fillRect(0,-sc,sc,sc);ctx.strokeRect(0,-sc,sc,sc);
      ctx.fillStyle='#ec4899';ctx.textAlign='center';
      ctx.fillText(`c²=${Math.round(c*c)}`,sc/2,-sc/2+5);
      ctx.restore();
      // Labels on sides
      ctx.fillStyle='#fff';ctx.font='bold 14px Outfit';
      ctx.textAlign='center';
      ctx.fillText(`a=${a}`,ox-12,oy-sa/2);
      ctx.fillText(`b=${b}`,ox+sb/2,oy+16);
      ctx.fillText(`c=${c.toFixed(1)}`,ox+sb/2+20,oy-sa/2-10);
      // Equation
      ctx.fillStyle='#fff';ctx.font='bold 16px Space Mono';
      ctx.fillText(`${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a+b*b}`,w/2,30);
      ctx.fillText(`c = √${a*a+b*b} = ${c.toFixed(2)}`,w/2,52);
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(aid);
  }
});

// 4. PROBABILITY & STATISTICS
reg('math-prob',{
  section:'math',icon:'🎲',tKey:'m_prob.t',dKey:'m_prob.d',tagKey:'m_prob.tag',expTKey:'m_prob.exp_t',expKey:'m_prob.exp',
  render(el){
    const counts=[0,0,0,0,0,0];let totalRolls=0,lastRoll=0,aid;
    el.innerHTML=`<canvas id="probCv" height="300"></canvas>
      <div class="controls" style="justify-content:center">
        <button class="btn btn-p" onclick="rollDice(1)">${t('m_prob.roll')} 1×</button>
        <button class="btn" onclick="rollDice(10)">10×</button>
        <button class="btn" onclick="rollDice(100)">100×</button>
        <button class="btn" onclick="rollDice(1000)">1000×</button>
        <button class="btn" onclick="resetDice()">${t('m_primes.reset')}</button>
      </div>
      <div style="text-align:center;font-family:var(--mono);font-size:0.85rem;color:var(--dim);margin-top:0.5rem">
        ${t('m_prob.rolls')}: <span id="dTotal" style="color:var(--math)">0</span>
      </div>`;
    window.rollDice=(n)=>{
      for(let i=0;i<n;i++){const r=Math.floor(Math.random()*6);counts[r]++;lastRoll=r+1;totalRolls++}
      document.getElementById('dTotal').textContent=totalRolls;
    };
    window.resetDice=()=>{counts.fill(0);totalRolls=0;lastRoll=0;document.getElementById('dTotal').textContent=0};
    function draw(){
      const cv=document.getElementById('probCv');if(!cv)return;
      const w=cv.parentElement.getBoundingClientRect().width,h=300;
      const ctx=setupCanvas(cv,w,h);
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      const pad=50,bw=(w-pad*2)/6*0.7,gap=(w-pad*2)/6;
      const maxH=h-80;
      const maxCount=Math.max(1,...counts);
      // Expected line
      if(totalRolls>0){
        const expH=totalRolls/6/maxCount*maxH;
        ctx.strokeStyle='rgba(236,72,153,0.5)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
        ctx.beginPath();ctx.moveTo(pad-10,h-40-expH);ctx.lineTo(w-pad+10,h-40-expH);ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle='rgba(236,72,153,0.7)';ctx.font='10px Space Mono';ctx.textAlign='left';
        ctx.fillText(`${t('m_prob.expected')}: ${(totalRolls/6).toFixed(0)}`,pad,h-40-expH-5);
      }
      // Bars
      for(let i=0;i<6;i++){
        const x=pad+i*gap;
        const barH=maxCount>0?counts[i]/maxCount*maxH:0;
        ctx.fillStyle=lastRoll===i+1?'#f59e0b':'rgba(245,158,11,0.6)';
        ctx.fillRect(x,h-40-barH,bw,barH);
        // Face
        ctx.fillStyle='#fff';ctx.font='bold 16px Outfit';ctx.textAlign='center';
        ctx.fillText(i+1,x+bw/2,h-22);
        // Count
        ctx.fillStyle='var(--dim)';ctx.font='11px Space Mono';
        ctx.fillText(counts[i],x+bw/2,h-44-barH);
        // Percentage
        if(totalRolls>0){
          ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='9px Space Mono';
          ctx.fillText((counts[i]/totalRolls*100).toFixed(1)+'%',x+bw/2,h-56-barH);
        }
      }
      // Die face display
      if(lastRoll>0){
        ctx.fillStyle='#f59e0b';ctx.font='bold 48px Outfit';ctx.textAlign='center';
        ctx.fillText('⚀⚁⚂⚃⚄⚅'[lastRoll-1],w-60,50);
      }
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>{cancelAnimationFrame(aid);delete window.rollDice;delete window.resetDice};
  }
});

// 5. TRIGONOMETRY & UNIT CIRCLE
reg('math-trig',{
  section:'math',icon:'📊',tKey:'m_trig.t',dKey:'m_trig.d',tagKey:'m_trig.tag',expTKey:'m_trig.exp_t',expKey:'m_trig.exp',
  render(el){
    let angle=Math.PI/4,aid,dragging=false;
    el.innerHTML=`<canvas id="trigCv" height="400" style="cursor:pointer"></canvas>
      <div style="text-align:center;font-family:var(--mono);font-size:0.9rem;margin-top:0.5rem">
        <span>θ = <span id="tAngle" style="color:var(--math)">45°</span></span>
        <span style="margin-left:1.5rem">${t('m_trig.sin')} = <span id="tSin" style="color:#ff6b6b">0.707</span></span>
        <span style="margin-left:1.5rem">${t('m_trig.cos')} = <span id="tCos" style="color:#3b82f6">0.707</span></span>
        <span style="margin-left:1.5rem">${t('m_trig.tan')} = <span id="tTan" style="color:#10b981">1.000</span></span>
      </div>
      <p style="font-size:0.8rem;color:var(--dim);text-align:center;margin-top:0.3rem">Click and drag on the circle to change angle</p>`;
    const cv=document.getElementById('trigCv');
    function getAngle(e){
      const r=cv.getBoundingClientRect(),w=r.width;
      const cx=w*0.35,cy=200;
      const mx=(e.clientX||e.touches?.[0]?.clientX)-r.left-cx;
      const my=(e.clientY||e.touches?.[0]?.clientY)-r.top-cy;
      return Math.atan2(-my,mx);
    }
    cv.onmousedown=cv.ontouchstart=e=>{dragging=true;angle=getAngle(e);e.preventDefault()};
    cv.onmouseup=cv.ontouchend=()=>{dragging=false};
    cv.onmousemove=cv.ontouchmove=e=>{if(dragging)angle=getAngle(e)};
    // Store wave history
    const history=[];
    function draw(){
      if(!document.getElementById('trigCv'))return;
      const w=cv.parentElement.getBoundingClientRect().width,h=400;
      const ctx=setupCanvas(cv,w,h);
      ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);
      const R=Math.min(130,w*0.25),cx=w*0.35,cy=h/2;
      const cosV=Math.cos(angle),sinV=Math.sin(angle);
      const tanV=Math.abs(cosV)<0.01?Infinity:sinV/cosV;
      // Update display
      const deg=((angle*180/Math.PI)%360+360)%360;
      document.getElementById('tAngle').textContent=deg.toFixed(1)+'°';
      document.getElementById('tSin').textContent=sinV.toFixed(3);
      document.getElementById('tCos').textContent=cosV.toFixed(3);
      document.getElementById('tTan').textContent=Math.abs(tanV)>100?'∞':tanV.toFixed(3);
      // Circle
      ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();
      // Axes
      ctx.strokeStyle='rgba(255,255,255,0.1)';
      ctx.beginPath();ctx.moveTo(cx-R-20,cy);ctx.lineTo(cx+R+20,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy-R-20);ctx.lineTo(cx,cy+R+20);ctx.stroke();
      // Angle arc
      ctx.strokeStyle='rgba(245,158,11,0.5)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(cx,cy,25,0,-angle,angle<0);ctx.stroke();
      // Radius line
      const px=cx+cosV*R,py=cy-sinV*R;
      ctx.strokeStyle='#fff';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);ctx.stroke();
      // Point
      ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fillStyle='#f59e0b';ctx.fill();
      // cos line (horizontal)
      ctx.strokeStyle='#3b82f6';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,cy);ctx.stroke();
      ctx.fillStyle='#3b82f6';ctx.font='11px Space Mono';ctx.textAlign='center';
      ctx.fillText('cos',cx+cosV*R/2,cy+16);
      // sin line (vertical)
      ctx.strokeStyle='#ff6b6b';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(px,cy);ctx.lineTo(px,py);ctx.stroke();
      ctx.fillStyle='#ff6b6b';ctx.textAlign='left';
      ctx.fillText('sin',px+8,cy-sinV*R/2);
      // Wave graph on right side
      history.unshift({sin:sinV,cos:cosV});
      if(history.length>150)history.pop();
      const gx=cx+R+50,gw=w-gx-20;
      // Sin wave
      ctx.strokeStyle='#ff6b6b';ctx.lineWidth=1.5;ctx.beginPath();
      for(let i=0;i<history.length&&i<gw;i++){
        const gy=cy-history[i].sin*R;
        i===0?ctx.moveTo(gx+i,gy):ctx.lineTo(gx+i,gy);
      }
      ctx.stroke();
      // Cos wave
      ctx.strokeStyle='#3b82f6';ctx.lineWidth=1.5;ctx.beginPath();
      for(let i=0;i<history.length&&i<gw;i++){
        const gy=cy-history[i].cos*R;
        i===0?ctx.moveTo(gx+i,gy):ctx.lineTo(gx+i,gy);
      }
      ctx.stroke();
      // Connect point to wave
      ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(gx,cy-sinV*R);ctx.stroke();ctx.setLineDash([]);
      aid=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(aid);
  }
});
