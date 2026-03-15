// ═══════════════════════════════════════
//  RIEMANN ZETA FUNCTION EXHIBIT
// ═══════════════════════════════════════

reg('math-riemann',{
  section:'math',icon:'ζ',
  tKey:'riemann.t',dKey:'riemann.d',tagKey:'riemann.tag',
  expTKey:'riemann.exp_t',expKey:'riemann.exp',
  render(el){
    // First 30 non-trivial zeros (imaginary parts; real part = 1/2)
    const ZEROS=[
      14.134725,21.022040,25.010858,30.424876,32.935062,
      37.586178,40.918719,43.327073,48.005151,49.773832,
      52.970321,56.446248,59.347044,60.831779,65.112544,
      67.079811,69.546402,72.067158,75.704691,77.144840,
      79.337375,82.910381,84.735493,87.425275,88.809111,
      92.491899,94.651344,95.870634,98.831194,101.317851
    ];

    // Precompute primes up to 200
    function sieve(n){
      const is=new Uint8Array(n+1);is[0]=is[1]=1;
      for(let i=2;i*i<=n;i++){if(!is[i])for(let j=i*i;j<=n;j+=i)is[j]=1;}
      const p=[];for(let i=2;i<=n;i++)if(!is[i])p.push(i);return p;
    }
    const primes=sieve(200);
    function piCount(x){let c=0;for(const p of primes)if(p<=x)c++;else break;return c;}

    // Li(x) — logarithmic integral approximation via numerical integration
    function li(x){
      if(x<=2)return 0;
      let s=0;const steps=500;const dx=(x-2)/steps;
      for(let i=0;i<steps;i++){
        const t=2+dx*(i+0.5);
        s+=dx/Math.log(t);
      }
      return s;
    }

    // Reconstruction: R(x) using zeros — Riemann's explicit formula (simplified)
    // R(x) ≈ Li(x) - sum over zeros: Li(x^rho)
    // where rho = 1/2 + i*gamma_k
    // We approximate Li(x^rho) contribution as -2*Re(Ei(rho*ln(x)))
    // Simplified: contribution of zero gamma_k ≈ -2*cos(gamma_k * ln(x)) / sqrt(x) * (1/log(x))
    // More accurate approximation for the exhibit:
    function reconstruct(x, numZeros){
      if(x<2)return 0;
      let val=li(x);
      const lnx=Math.log(x);
      const sqrtx=Math.sqrt(x);
      // Each zero pair contributes oscillatory correction
      for(let k=0;k<numZeros;k++){
        const g=ZEROS[k];
        // Approximate: -2 * Re( li(x^(1/2 + ig)) )
        // ≈ -2 * cos(g*ln(x)) * li(sqrt(x)) / sqrt(x) ... simplified for visual
        // Better: direct oscillatory term from explicit formula
        // Term ≈ -2 * cos(g * lnx) / (sqrt(x) * sqrt(0.25 + g*g)) * sqrt(x)
        // Visually tuned version:
        val -= 2 * Math.cos(g * lnx) / Math.sqrt(0.25 + g*g) * 1.2;
      }
      // Subtract ln(2) and 1/(x^2-1) small terms
      val -= Math.log(2);
      return val;
    }

    let activeTab=0, aids=[];
    const tabLabels=[t('riemann.tab1'),t('riemann.tab2'),t('riemann.tab3')];

    el.innerHTML=`
      <div class="controls" style="justify-content:center;margin-bottom:0.8rem;flex-wrap:wrap;gap:0.4rem">
        ${tabLabels.map((lb,i)=>`<button class="btn ${i===0?'btn-p':''}" id="rTab${i}">${lb}</button>`).join('')}
      </div>
      <div id="rMount"></div>`;

    function setTab(idx){
      activeTab=idx;
      // Clean up previous
      aids.forEach(id=>cancelAnimationFrame(id));aids=[];
      document.querySelectorAll('[id^="rTab"]').forEach((b,i)=>{
        b.className=i===idx?'btn btn-p':'btn';
      });
      const mount=document.getElementById('rMount');
      if(idx===0)renderCriticalLine(mount);
      else if(idx===1)renderPrimeStaircase(mount);
      else renderGrandConnection(mount);
    }

    // Attach tab click handlers
    window._rSetTab=setTab;
    for(let i=0;i<3;i++){
      document.getElementById('rTab'+i).onclick=()=>window._rSetTab(i);
    }

    // ═══════════════════════════════════════
    // TAB 1: Critical Line Visualization
    // ═══════════════════════════════════════
    function renderCriticalLine(mount){
      mount.innerHTML=`
        <canvas id="rCv1" height="460"></canvas>
        <p style="text-align:center;font-family:var(--mono);font-size:0.8rem;color:var(--dim);margin-top:0.4rem">
          ${t('riemann.cl_info')}
        </p>`;
      const cv=document.getElementById('rCv1');
      let hoverIdx=-1, glowPhase=0;

      cv.onmousemove=e=>{
        const rect=cv.getBoundingClientRect();
        const mx=e.clientX-rect.left, my=e.clientY-rect.top;
        const w=rect.width, h=460;
        const padL=70, padR=30, padT=40, padB=50;
        const plotW=w-padL-padR, plotH=h-padT-padB;
        const maxIm=110;
        hoverIdx=-1;
        for(let i=0;i<ZEROS.length;i++){
          const zy=padT+plotH-(ZEROS[i]/maxIm)*plotH;
          const zx=padL+0.5*plotW; // Re=0.5 mapped
          if(Math.abs(mx-zx)<14&&Math.abs(my-zy)<14){hoverIdx=i;break;}
        }
      };
      cv.onmouseleave=()=>{hoverIdx=-1;};

      function draw(){
        if(!document.getElementById('rCv1'))return;
        glowPhase+=0.03;
        const w=cv.parentElement.getBoundingClientRect().width, h=460;
        const ctx=setupCanvas(cv,w,h);
        ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);

        const padL=70, padR=30, padT=40, padB=50;
        const plotW=w-padL-padR, plotH=h-padT-padB;
        const maxIm=110;

        // Critical strip (0 < Re(s) < 1)
        const x0=padL+0*plotW; // Re=0
        const x1=padL+1*plotW; // Re=1
        ctx.fillStyle='rgba(59,130,246,0.06)';
        ctx.fillRect(x0,padT,x1-x0,plotH);

        // Critical strip borders
        ctx.strokeStyle='rgba(59,130,246,0.3)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
        ctx.beginPath();ctx.moveTo(x0,padT);ctx.lineTo(x0,padT+plotH);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x1,padT);ctx.lineTo(x1,padT+plotH);ctx.stroke();
        ctx.setLineDash([]);

        // Labels for Re=0 and Re=1
        ctx.fillStyle='rgba(59,130,246,0.5)';ctx.font='11px Space Mono';ctx.textAlign='center';
        ctx.fillText('Re=0',x0,padT+plotH+16);
        ctx.fillText('Re=1',x1,padT+plotH+16);

        // Critical line Re(s)=1/2
        const xHalf=padL+0.5*plotW;
        ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(xHalf,padT);ctx.lineTo(xHalf,padT+plotH);ctx.stroke();
        ctx.fillStyle='#f59e0b';ctx.font='bold 12px Space Mono';
        ctx.fillText('Re(s) = ½',xHalf,padT+plotH+16);

        // Title
        ctx.fillStyle='#fff';ctx.font='bold 14px Outfit';ctx.textAlign='center';
        ctx.fillText(t('riemann.cl_title'),w/2,24);

        // Im axis labels
        ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Space Mono';ctx.textAlign='right';
        for(let im=0;im<=100;im+=10){
          const y=padT+plotH-(im/maxIm)*plotH;
          ctx.fillText(im+'i',padL-8,y+4);
          ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=0.5;
          ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(padL+plotW,y);ctx.stroke();
        }

        // Axis labels
        ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px Space Mono';ctx.textAlign='center';
        ctx.save();ctx.translate(16,padT+plotH/2);ctx.rotate(-Math.PI/2);
        ctx.fillText('Im(s)',0,0);ctx.restore();
        ctx.fillText('Re(s)',padL+plotW/2,padT+plotH+36);

        // Plot zeros as glowing dots
        for(let i=0;i<ZEROS.length;i++){
          const zy=padT+plotH-(ZEROS[i]/maxIm)*plotH;
          const zx=xHalf;
          const isHover=(i===hoverIdx);
          const pulse=0.6+0.4*Math.sin(glowPhase+i*0.5);
          const r=isHover?8:4+2*pulse;

          // Glow
          const grad=ctx.createRadialGradient(zx,zy,0,zx,zy,r*3);
          grad.addColorStop(0,isHover?'rgba(236,72,153,0.8)':'rgba(236,72,153,'+0.4*pulse+')');
          grad.addColorStop(1,'rgba(236,72,153,0)');
          ctx.fillStyle=grad;
          ctx.beginPath();ctx.arc(zx,zy,r*3,0,Math.PI*2);ctx.fill();

          // Dot
          ctx.fillStyle=isHover?'#ec4899':'rgba(236,72,153,'+(0.6+0.4*pulse)+')';
          ctx.beginPath();ctx.arc(zx,zy,r,0,Math.PI*2);ctx.fill();

          // Label on hover
          if(isHover){
            ctx.fillStyle='#fff';ctx.font='bold 11px Space Mono';ctx.textAlign='left';
            ctx.fillText('½ + '+ZEROS[i].toFixed(6)+'i',zx+14,zy+4);
            ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px Space Mono';
            ctx.fillText('Zero #'+(i+1),zx+14,zy+18);
          }
        }

        // Legend
        ctx.fillStyle='rgba(59,130,246,0.3)';ctx.fillRect(w-180,padT+4,12,12);
        ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px Space Mono';ctx.textAlign='left';
        ctx.fillText(t('riemann.strip'),w-164,padT+14);

        ctx.fillStyle='#f59e0b';
        ctx.beginPath();ctx.arc(w-174,padT+30,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.5)';
        ctx.fillText(t('riemann.cline'),w-164,padT+34);

        ctx.fillStyle='#ec4899';
        ctx.beginPath();ctx.arc(w-174,padT+50,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.5)';
        ctx.fillText(t('riemann.zeros_lbl'),w-164,padT+54);

        // Count
        ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px Space Mono';ctx.textAlign='center';
        ctx.fillText(t('riemann.showing_n').replace('{n}','30'),w/2,padT+plotH+48);

        aids.push(requestAnimationFrame(draw));
      }
      draw();
    }

    // ═══════════════════════════════════════
    // TAB 2: Prime Staircase
    // ═══════════════════════════════════════
    function renderPrimeStaircase(mount){
      let xMax=100;
      mount.innerHTML=`
        <canvas id="rCv2" height="420"></canvas>
        <div class="controls" style="justify-content:center;margin-top:0.5rem">
          <div class="ctrl"><label>${t('riemann.x_range')}</label>
            <input type="range" id="rSlider2" min="10" max="200" value="100"></div>
          <span class="val" id="rVal2">100</span>
        </div>
        <p style="text-align:center;font-family:var(--mono);font-size:0.8rem;color:var(--dim);margin-top:0.3rem">
          ${t('riemann.ps_info')}
        </p>`;
      const sl=document.getElementById('rSlider2');
      sl.oninput=e=>{xMax=+e.target.value;document.getElementById('rVal2').textContent=xMax;};

      function draw(){
        const cv=document.getElementById('rCv2');if(!cv)return;
        const w=cv.parentElement.getBoundingClientRect().width, h=420;
        const ctx=setupCanvas(cv,w,h);
        ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);

        const padL=60, padR=20, padT=40, padB=60;
        const plotW=w-padL-padR, plotH=h-padT-padB;
        const yMax=piCount(xMax)*1.3||10;

        // Title
        ctx.fillStyle='#fff';ctx.font='bold 14px Outfit';ctx.textAlign='center';
        ctx.fillText(t('riemann.ps_title'),w/2,24);

        // Grid
        ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=0.5;
        for(let y=0;y<=yMax;y+=Math.max(1,Math.floor(yMax/8))){
          const py=padT+plotH-(y/yMax)*plotH;
          ctx.beginPath();ctx.moveTo(padL,py);ctx.lineTo(padL+plotW,py);ctx.stroke();
          ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px Space Mono';ctx.textAlign='right';
          ctx.fillText(y,padL-8,py+4);
        }
        for(let x=0;x<=xMax;x+=Math.max(1,Math.floor(xMax/10))){
          const px=padL+(x/xMax)*plotW;
          ctx.beginPath();ctx.moveTo(px,padT);ctx.lineTo(px,padT+plotH);ctx.stroke();
          ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px Space Mono';ctx.textAlign='center';
          ctx.fillText(x,px,padT+plotH+16);
        }

        // Axis labels
        ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px Space Mono';ctx.textAlign='center';
        ctx.fillText('x',padL+plotW/2,padT+plotH+36);
        ctx.save();ctx.translate(16,padT+plotH/2);ctx.rotate(-Math.PI/2);
        ctx.fillText('π(x)',0,0);ctx.restore();

        // Draw Li(x) approximation first (behind)
        ctx.strokeStyle='#10b981';ctx.lineWidth=2;ctx.setLineDash([6,4]);
        ctx.beginPath();
        let started=false;
        for(let px=0;px<=plotW;px+=1){
          const x=2+(px/plotW)*(xMax-2);
          const y=li(x);
          const sx=padL+px;
          const sy=padT+plotH-(y/yMax)*plotH;
          if(!started){ctx.moveTo(sx,sy);started=true;}
          else ctx.lineTo(sx,sy);
        }
        ctx.stroke();ctx.setLineDash([]);

        // Draw prime staircase π(x)
        ctx.strokeStyle='#f59e0b';ctx.lineWidth=2.5;
        ctx.beginPath();
        let prevCount=0;
        ctx.moveTo(padL,padT+plotH);
        for(let i=2;i<=xMax;i++){
          const count=piCount(i);
          const px1=padL+((i-1)/xMax)*plotW;
          const px2=padL+(i/xMax)*plotW;
          const py1=padT+plotH-(prevCount/yMax)*plotH;
          const py2=padT+plotH-(count/yMax)*plotH;
          // Horizontal line, then step up
          ctx.lineTo(px2,py1);
          if(count!==prevCount){
            ctx.lineTo(px2,py2);
            // Mark the prime with a dot
            ctx.save();
            ctx.fillStyle='rgba(245,158,11,0.7)';
            ctx.beginPath();ctx.arc(px2,py2,3,0,Math.PI*2);ctx.fill();
            ctx.restore();
            ctx.beginPath();ctx.moveTo(px2,py2);
          }
          prevCount=count;
        }
        ctx.stroke();

        // Legend
        const lgX=padL+10, lgY=padT+10;
        ctx.fillStyle='#f59e0b';ctx.font='bold 11px Space Mono';ctx.textAlign='left';
        ctx.fillRect(lgX,lgY,16,3);
        ctx.fillText('π(x) — '+t('riemann.prime_count'),lgX+22,lgY+5);

        ctx.strokeStyle='#10b981';ctx.lineWidth=2;ctx.setLineDash([6,4]);
        ctx.beginPath();ctx.moveTo(lgX,lgY+20);ctx.lineTo(lgX+16,lgY+20);ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle='#10b981';
        ctx.fillText('Li(x) — '+t('riemann.li_approx'),lgX+22,lgY+24);

        // Stats
        const pc=piCount(xMax);
        const lv=li(xMax);
        ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='11px Space Mono';ctx.textAlign='center';
        ctx.fillText(`π(${xMax}) = ${pc}    Li(${xMax}) ≈ ${lv.toFixed(1)}    ${t('riemann.error_lbl')}: ${(lv-pc).toFixed(1)}`,w/2,padT+plotH+50);

        aids.push(requestAnimationFrame(draw));
      }
      draw();
    }

    // ═══════════════════════════════════════
    // TAB 3: The Grand Connection
    // ═══════════════════════════════════════
    function renderGrandConnection(mount){
      let numZ=1;
      mount.innerHTML=`
        <canvas id="rCv3" height="440"></canvas>
        <div class="controls" style="justify-content:center;margin-top:0.5rem">
          <div class="ctrl"><label>${t('riemann.num_zeros')}</label>
            <input type="range" id="rSlider3" min="0" max="30" value="1"></div>
          <span class="val" id="rVal3">1</span>
        </div>
        <p style="text-align:center;font-family:var(--mono);font-size:0.8rem;color:var(--dim);margin-top:0.3rem">
          ${t('riemann.gc_info')}
        </p>`;
      const sl=document.getElementById('rSlider3');
      sl.oninput=e=>{numZ=+e.target.value;document.getElementById('rVal3').textContent=numZ;};

      function draw(){
        const cv=document.getElementById('rCv3');if(!cv)return;
        const w=cv.parentElement.getBoundingClientRect().width, h=440;
        const ctx=setupCanvas(cv,w,h);
        ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);

        const padL=60, padR=20, padT=50, padB=60;
        const plotW=w-padL-padR, plotH=h-padT-padB;
        const xMax=100;
        const yMax=piCount(xMax)*1.3||10;

        // Title
        ctx.fillStyle='#fff';ctx.font='bold 14px Outfit';ctx.textAlign='center';
        ctx.fillText(t('riemann.gc_title'),w/2,20);
        ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px Space Mono';
        ctx.fillText(t('riemann.zeros_used').replace('{n}',numZ),w/2,38);

        // Grid
        ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=0.5;
        for(let y=0;y<=yMax;y+=Math.max(1,Math.floor(yMax/8))){
          const py=padT+plotH-(y/yMax)*plotH;
          ctx.beginPath();ctx.moveTo(padL,py);ctx.lineTo(padL+plotW,py);ctx.stroke();
          ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px Space Mono';ctx.textAlign='right';
          ctx.fillText(y,padL-8,py+4);
        }
        for(let x=0;x<=xMax;x+=10){
          const px=padL+(x/xMax)*plotW;
          ctx.beginPath();ctx.moveTo(px,padT);ctx.lineTo(px,padT+plotH);ctx.stroke();
          ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px Space Mono';ctx.textAlign='center';
          ctx.fillText(x,px,padT+plotH+16);
        }

        // Draw prime staircase π(x) — background reference
        ctx.strokeStyle='rgba(245,158,11,0.35)';ctx.lineWidth=2;
        ctx.beginPath();
        let prevCount=0;
        ctx.moveTo(padL,padT+plotH);
        for(let i=2;i<=xMax;i++){
          const count=piCount(i);
          const px2=padL+(i/xMax)*plotW;
          const py1=padT+plotH-(prevCount/yMax)*plotH;
          const py2=padT+plotH-(count/yMax)*plotH;
          ctx.lineTo(px2,py1);
          if(count!==prevCount){ctx.lineTo(px2,py2);}
          prevCount=count;
        }
        ctx.stroke();

        // Draw Li(x) smooth (no zeros)
        if(numZ===0){
          ctx.strokeStyle='#3b82f6';ctx.lineWidth=2.5;
          ctx.beginPath();
          let s2=false;
          for(let px=0;px<=plotW;px+=1){
            const x=2+(px/plotW)*(xMax-2);
            const y=li(x);
            const sx=padL+px;
            const sy=padT+plotH-(y/yMax)*plotH;
            if(!s2){ctx.moveTo(sx,sy);s2=true;}
            else ctx.lineTo(sx,sy);
          }
          ctx.stroke();
        }

        // Draw reconstruction with zeros
        if(numZ>0){
          // Glow effect for the reconstruction line
          ctx.strokeStyle='rgba(236,72,153,0.15)';ctx.lineWidth=6;
          ctx.beginPath();
          let s3=false;
          for(let px=0;px<=plotW;px+=2){
            const x=2+(px/plotW)*(xMax-2);
            const y=reconstruct(x,numZ);
            const sx=padL+px;
            const sy=padT+plotH-(y/yMax)*plotH;
            if(sy<padT-20||sy>padT+plotH+20)continue;
            if(!s3){ctx.moveTo(sx,sy);s3=true;}
            else ctx.lineTo(sx,sy);
          }
          ctx.stroke();

          // Main reconstruction line
          ctx.strokeStyle='#ec4899';ctx.lineWidth=2.5;
          ctx.beginPath();
          s3=false;
          for(let px=0;px<=plotW;px+=1){
            const x=2+(px/plotW)*(xMax-2);
            const y=reconstruct(x,numZ);
            const sx=padL+px;
            const sy=padT+plotH-(y/yMax)*plotH;
            if(sy<padT-20||sy>padT+plotH+20){s3=false;continue;}
            if(!s3){ctx.moveTo(sx,sy);s3=true;}
            else ctx.lineTo(sx,sy);
          }
          ctx.stroke();
        }

        // Legend
        const lgX=padL+10, lgY=padT+6;
        ctx.fillStyle='rgba(245,158,11,0.5)';ctx.fillRect(lgX,lgY,16,3);
        ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px Space Mono';ctx.textAlign='left';
        ctx.fillText('π(x) — '+t('riemann.actual'),lgX+22,lgY+5);

        if(numZ===0){
          ctx.strokeStyle='#3b82f6';ctx.lineWidth=2;
          ctx.beginPath();ctx.moveTo(lgX,lgY+18);ctx.lineTo(lgX+16,lgY+18);ctx.stroke();
          ctx.fillStyle='#3b82f6';
          ctx.fillText('Li(x) — '+t('riemann.smooth'),lgX+22,lgY+22);
        } else {
          ctx.strokeStyle='#ec4899';ctx.lineWidth=2;
          ctx.beginPath();ctx.moveTo(lgX,lgY+18);ctx.lineTo(lgX+16,lgY+18);ctx.stroke();
          ctx.fillStyle='#ec4899';
          ctx.fillText(t('riemann.recon')+' ('+numZ+' '+t('riemann.zeros_word')+')',lgX+22,lgY+22);
        }

        // Insight text
        ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px Space Mono';ctx.textAlign='center';
        if(numZ===0){
          ctx.fillText(t('riemann.hint0'),w/2,padT+plotH+40);
        } else if(numZ<=5){
          ctx.fillText(t('riemann.hint_few'),w/2,padT+plotH+40);
        } else if(numZ<=15){
          ctx.fillText(t('riemann.hint_mid'),w/2,padT+plotH+40);
        } else {
          ctx.fillText(t('riemann.hint_many'),w/2,padT+plotH+40);
        }
        ctx.fillText(t('riemann.axis_x'),padL+plotW/2,padT+plotH+56);

        aids.push(requestAnimationFrame(draw));
      }
      draw();
    }

    // Start with first tab
    setTab(0);

    return()=>{
      aids.forEach(id=>cancelAnimationFrame(id));
      delete window._rSetTab;
    };
  }
});
