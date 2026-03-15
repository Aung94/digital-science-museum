// ═══════════════════════════════════════
//  AI & LARGE LANGUAGE MODELS EXHIBIT
// ═══════════════════════════════════════

reg('math-ai',{
  section:'math',icon:'🤖',tKey:'ai.t',dKey:'ai.d',tagKey:'ai.tag',expTKey:'ai.exp_t',expKey:'ai.exp',
  render(el){
    let cleanups=[];

    // ── TAB SYSTEM ──
    const tabs=[
      {id:'neural',label:()=>t('ai.tab_nn')},
      {id:'tokens',label:()=>t('ai.tab_tokens')},
      {id:'attention',label:()=>t('ai.tab_attention')},
      {id:'training',label:()=>t('ai.tab_scale')}
    ];

    el.innerHTML=`
      <div class="pi-banner" style="background:linear-gradient(135deg,rgba(59,130,246,0.15),rgba(236,72,153,0.12))">
        <div class="pi-symbol" style="font-size:2.5rem">🤖</div>
        <div class="pi-banner-text">
          <h3>${t('ai.nn_title')}</h3>
          <p>${t('ai.d')}</p>
        </div>
      </div>
      <div class="pi-tabs" id="aiTabs">
        ${tabs.map((tb,i)=>`<button class="pi-tab${i===0?' active':''}" data-tab="${tb.id}">${tb.label()}</button>`).join('')}
      </div>
      <div class="pi-content" id="aiContent"></div>`;

    const content=document.getElementById('aiContent');
    const tabBtns=el.querySelectorAll('.pi-tab');

    function switchTab(id){
      cleanups.forEach(fn=>fn());cleanups=[];
      tabBtns.forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
      const renderer={neural:renderNeural,tokens:renderTokens,attention:renderAttention,training:renderTraining}[id];
      if(renderer)renderer();
    }
    tabBtns.forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));

    // ════════════════════════════════════
    //  1. THE NEURAL NETWORK
    // ════════════════════════════════════
    function renderNeural(){
      content.innerHTML=`
        <h4 class="pi-sub">${t('ai.nn_title')}</h4>
        <p class="pi-info">${t('ai.nn_info')}</p>
        <canvas id="nnCv" height="480" style="width:100%;cursor:pointer"></canvas>
        <div class="controls" style="justify-content:center;margin-top:0.8rem">
          <button class="btn btn-p" id="nnFire">${t('ai.nn_fire')}</button>
          <button class="btn" id="nnRandom">${t('ai.nn_random')}</button>
          <button class="btn" id="nnReset">${t('m_primes.reset')}</button>
        </div>
        <div style="text-align:center;margin-top:0.5rem">
          <span style="font-family:var(--mono);font-size:0.75rem;color:var(--dim)">${t('ai.nn_hint')}</span>
        </div>`;

      const cv=document.getElementById('nnCv');
      const layers=[4,6,6,3]; // input, hidden1, hidden2, output
      const layerLabels=[['Text','Image','Audio','Code'],null,null,['Class A','Class B','Class C']];

      // Initialize network
      let weights=[], activations=[], animProgress=[];
      function initNetwork(){
        weights=[];activations=[];animProgress=[];
        for(let l=0;l<layers.length;l++){
          activations.push(new Array(layers[l]).fill(0));
          animProgress.push(new Array(layers[l]).fill(0));
          if(l>0){
            const w=[];
            for(let j=0;j<layers[l];j++){
              const row=[];
              for(let i=0;i<layers[l-1];i++) row.push((Math.random()-0.5)*2);
              w.push(row);
            }
            weights.push(w);
          }
        }
      }
      initNetwork();

      let animating=false, animFrame=0, raf;
      const ANIM_SPEED=0.04;

      function sigmoid(x){return 1/(1+Math.exp(-x))}

      function nodePos(l,n,w,h){
        const pad={l:90,r:90,t:50,b:50};
        const gw=w-pad.l-pad.r, gh=h-pad.t-pad.b;
        const x=pad.l+l/(layers.length-1)*gw;
        const spacing=gh/(layers[l]+1);
        const y=pad.t+spacing*(n+1);
        return {x,y};
      }

      function activationColor(val){
        // Cool (blue) → warm (gold → pink)
        if(val<0.3) return `rgba(59,130,246,${0.3+val})`;
        if(val<0.6) return `rgba(245,158,11,${val})`;
        return `rgba(236,72,153,${val})`;
      }

      function propagate(){
        for(let l=1;l<layers.length;l++){
          for(let j=0;j<layers[l];j++){
            let sum=0;
            for(let i=0;i<layers[l-1];i++){
              sum+=activations[l-1][i]*weights[l-1][j][i];
            }
            activations[l][j]=sigmoid(sum);
          }
        }
      }

      function draw(){
        const w=cv.parentElement.getBoundingClientRect().width,h=480;
        const ctx=setupCanvas(cv,w,h);
        ctx.fillStyle='#08080f';ctx.fillRect(0,0,w,h);

        // Draw connections
        for(let l=1;l<layers.length;l++){
          for(let j=0;j<layers[l];j++){
            for(let i=0;i<layers[l-1];i++){
              const from=nodePos(l-1,i,w,h);
              const to=nodePos(l,j,w,h);
              const wt=weights[l-1][j][i];
              const absW=Math.abs(wt);
              const srcAct=activations[l-1][i];
              const signalStrength=srcAct*absW;

              // Connection line
              ctx.strokeStyle=wt>0
                ?`rgba(16,185,129,${0.08+signalStrength*0.5})`
                :`rgba(239,68,68,${0.08+signalStrength*0.5})`;
              ctx.lineWidth=0.5+absW*2.5;
              ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();

              // Animated signal pulse
              if(animating && srcAct>0.1){
                const prog=animProgress[l][j];
                if(prog>0 && prog<1){
                  const px=from.x+(to.x-from.x)*prog;
                  const py=from.y+(to.y-from.y)*prog;
                  ctx.beginPath();ctx.arc(px,py,3+signalStrength*3,0,Math.PI*2);
                  ctx.fillStyle=`rgba(245,158,11,${0.6+signalStrength*0.4})`;ctx.fill();
                }
              }
            }
          }
        }

        // Draw nodes
        for(let l=0;l<layers.length;l++){
          for(let n=0;n<layers[l];n++){
            const {x,y}=nodePos(l,n,w,h);
            const act=activations[l][n];
            const r=14+act*8;

            // Glow
            if(act>0.2){
              const grad=ctx.createRadialGradient(x,y,r*0.5,x,y,r*2.5);
              grad.addColorStop(0,activationColor(act));
              grad.addColorStop(1,'rgba(0,0,0,0)');
              ctx.fillStyle=grad;
              ctx.beginPath();ctx.arc(x,y,r*2.5,0,Math.PI*2);ctx.fill();
            }

            // Node circle
            ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
            ctx.fillStyle=act>0.05?activationColor(act):'rgba(255,255,255,0.08)';
            ctx.fill();
            ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1.5;ctx.stroke();

            // Activation value
            if(act>0.01){
              ctx.fillStyle='#fff';ctx.font='bold 10px Space Mono';ctx.textAlign='center';ctx.textBaseline='middle';
              ctx.fillText(act.toFixed(2),x,y);
            }

            // Labels
            if(layerLabels[l]&&layerLabels[l][n]){
              ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='11px Outfit';ctx.textAlign=l===0?'right':'left';ctx.textBaseline='middle';
              ctx.fillText(layerLabels[l][n],l===0?x-r-8:x+r+8,y);
            }
          }
        }

        // Layer labels
        const labelNames=['Input\nLayer','Hidden\nLayer 1','Hidden\nLayer 2','Output\nLayer'];
        ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px Space Mono';ctx.textAlign='center';
        for(let l=0;l<layers.length;l++){
          const {x}=nodePos(l,0,w,h);
          const parts=labelNames[l].split('\n');
          parts.forEach((p,i)=>ctx.fillText(p,x,h-15+i*12));
        }

        // Animation loop
        if(animating){
          let allDone=true;
          for(let l=1;l<layers.length;l++){
            for(let n=0;n<layers[l];n++){
              if(animProgress[l][n]<1){
                animProgress[l][n]=Math.min(1,animProgress[l][n]+ANIM_SPEED*(l===1?1:animProgress[l-1][0]>0.5?1:0));
                if(animProgress[l][n]>=0.8 && activations[l][n]===0){
                  // Compute activation when signal arrives
                  let sum=0;
                  for(let i=0;i<layers[l-1];i++) sum+=activations[l-1][i]*weights[l-1][n][i];
                  activations[l][n]=sigmoid(sum);
                }
                allDone=false;
              }
            }
          }
          if(allDone) animating=false;
        }

        raf=requestAnimationFrame(draw);
      }

      function fireInput(nodeIdx){
        // Reset
        for(let l=0;l<layers.length;l++){
          activations[l].fill(0);
          animProgress[l].fill(0);
        }
        activations[0][nodeIdx]=1;
        for(let l=1;l<layers.length;l++) animProgress[l].fill(0);
        animProgress[0].fill(1);
        animating=true;
      }

      cv.onclick=e=>{
        const rect=cv.getBoundingClientRect();
        const mx=(e.clientX-rect.left)*(cv.width/DPR/rect.width);
        const my=(e.clientY-rect.top)*(cv.height/DPR/rect.height);
        const w=cv.width/DPR,h=cv.height/DPR;
        // Check if clicked on input node
        for(let n=0;n<layers[0];n++){
          const {x,y}=nodePos(0,n,w,h);
          if(Math.hypot(mx-x,my-y)<20){
            fireInput(n);
            return;
          }
        }
      };

      document.getElementById('nnFire').onclick=()=>{
        for(let l=0;l<layers.length;l++){
          activations[l].fill(0);
          animProgress[l].fill(0);
        }
        for(let n=0;n<layers[0];n++) activations[0][n]=0.5+Math.random()*0.5;
        animProgress[0].fill(1);
        animating=true;
      };
      document.getElementById('nnRandom').onclick=()=>{
        for(let l=1;l<layers.length;l++){
          for(let j=0;j<layers[l];j++){
            for(let i=0;i<layers[l-1];i++) weights[l-1][j][i]=(Math.random()-0.5)*2;
          }
        }
      };
      document.getElementById('nnReset').onclick=()=>{
        initNetwork();animating=false;
      };

      draw();
      cleanups.push(()=>cancelAnimationFrame(raf));
    }

    // ════════════════════════════════════
    //  2. HOW TOKENS WORK
    // ════════════════════════════════════
    function renderTokens(){
      content.innerHTML=`
        <h4 class="pi-sub">${t('ai.tokens_title')}</h4>
        <p class="pi-info">${t('ai.tokens_info')}</p>
        <div style="margin:1rem 0">
          <textarea id="tokInput" style="width:100%;height:80px;background:#0d0d1a;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-family:var(--mono);font-size:0.95rem;padding:0.8rem;resize:vertical;outline:none" placeholder="Type something... e.g. 'The quick brown fox jumps over the lazy dog'">The quick brown fox jumps over the lazy dog</textarea>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem">
          <button class="btn btn-p" id="tokTokenize">${t('ai.tokenize_btn')}</button>
          <button class="btn" id="tokExample1">Try: Hello world!</button>
          <button class="btn" id="tokExample2">Try: AI is amazing</button>
          <button class="btn" id="tokExample3">Try: 🤖🧠💡</button>
        </div>
        <div id="tokResult" style="min-height:120px"></div>
        <div id="tokStats" style="margin-top:1rem"></div>
        <div id="tokExplain" style="margin-top:1.5rem"></div>`;

      const COLORS=['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1','#14b8a6','#e879f9','#fb923c','#a3e635','#38bdf8'];

      // Simplified BPE-like tokenizer
      function tokenize(text){
        const tokens=[];
        let i=0;
        while(i<text.length){
          // Match common subword patterns
          let matched=false;
          // Common prefixes/suffixes
          const patterns=[
            /^(The|the|This|this|That|that|What|what|How|how|Why|why|Who|who)/,
            /^(ing|tion|ment|ness|able|ible|ful|less|ous|ive|ent|ant|ist|ism)/,
            /^(un|re|pre|dis|mis|over|under|out|non|sub|inter|trans)/,
            /^[A-Z][a-z]+/,          // Capitalized word
            /^[a-z]{1,6}/,           // Short lowercase
            /^[0-9]+\.?[0-9]*/,      // Numbers
            /^\s+/,                    // Whitespace
            /^[^\w\s]/,              // Punctuation / special
            /^[\u{1F600}-\u{1F9FF}]/u // Emoji
          ];
          const remaining=text.slice(i);
          for(const pat of patterns){
            const m=remaining.match(pat);
            if(m){
              tokens.push(m[0]);
              i+=m[0].length;
              matched=true;
              break;
            }
          }
          if(!matched){
            tokens.push(text[i]);
            i++;
          }
        }
        // Further split longer tokens to simulate subword tokenization
        const result=[];
        for(const tok of tokens){
          if(tok.length>4 && /^[a-z]+$/i.test(tok)){
            // Split long words into subwords
            const mid=Math.ceil(tok.length*0.6);
            result.push(tok.slice(0,mid));
            result.push(tok.slice(mid));
          } else {
            result.push(tok);
          }
        }
        return result;
      }

      function hashCode(s){let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h)+s.charCodeAt(i)|0;return Math.abs(h)}

      function renderTokens2(text){
        const tokens=tokenize(text);
        const resultEl=document.getElementById('tokResult');
        const statsEl=document.getElementById('tokStats');
        const explainEl=document.getElementById('tokExplain');

        // Token display
        let html='<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">';
        tokens.forEach((tok,i)=>{
          const color=COLORS[i%COLORS.length];
          const id=hashCode(tok)%50000;
          const isSpace=/^\s+$/.test(tok);
          const display=isSpace?'⎵'.repeat(tok.length):tok.replace(/</g,'&lt;');
          html+=`<div style="display:inline-flex;flex-direction:column;align-items:center;gap:2px">
            <span style="background:${color}22;border:1px solid ${color}55;color:${color};padding:4px 8px;border-radius:6px;font-family:var(--mono);font-size:0.95rem;white-space:pre">${display}</span>
            <span style="font-family:var(--mono);font-size:0.6rem;color:rgba(255,255,255,0.35)">${id}</span>
          </div>`;
        });
        html+='</div>';
        resultEl.innerHTML=html;

        // Stats
        const charCount=text.length;
        const ratio=(tokens.length/Math.max(1,charCount)).toFixed(2);
        statsEl.innerHTML=`
          <div style="display:flex;gap:2rem;flex-wrap:wrap;justify-content:center;font-family:var(--mono);font-size:0.85rem">
            <div><span style="color:var(--dim)">Characters:</span> <span style="color:#3b82f6">${charCount}</span></div>
            <div><span style="color:var(--dim)">Tokens:</span> <span style="color:#f59e0b;font-weight:bold">${tokens.length}</span></div>
            <div><span style="color:var(--dim)">Tokens/Char:</span> <span style="color:#10b981">${ratio}</span></div>
          </div>
          <div style="margin-top:1rem;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:1rem">
            <div style="font-family:var(--mono);font-size:0.8rem;color:var(--dim);margin-bottom:0.5rem">Token ID Sequence (what the model actually sees):</div>
            <div style="font-family:var(--mono);font-size:0.85rem;color:#f59e0b;word-break:break-all">
              [${tokens.map(tok=>hashCode(tok)%50000).join(', ')}]
            </div>
          </div>`;

        // Explanation
        explainEl.innerHTML=`
          <div style="background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:8px;padding:1rem">
            <h5 style="color:#3b82f6;margin:0 0 0.5rem 0;font-size:0.9rem">How Real LLMs Tokenize</h5>
            <ul style="margin:0;padding-left:1.2rem;font-size:0.85rem;color:var(--dim);line-height:1.7">
              <li>Models like GPT and Claude use <strong style="color:#f59e0b">Byte-Pair Encoding (BPE)</strong> — frequently seen character pairs merge into single tokens</li>
              <li>Common words like "the" are single tokens; rare words get split into subwords</li>
              <li>Each token maps to a number (ID) in a vocabulary of ~50,000-100,000 tokens</li>
              <li>The model only ever sees numbers — never actual text!</li>
              <li>Context window limits (e.g., 8K, 128K tokens) determine how much text the model can process at once</li>
            </ul>
          </div>`;
      }

      document.getElementById('tokTokenize').onclick=()=>renderTokens2(document.getElementById('tokInput').value);
      document.getElementById('tokExample1').onclick=()=>{document.getElementById('tokInput').value='Hello world!';renderTokens2('Hello world!')};
      document.getElementById('tokExample2').onclick=()=>{document.getElementById('tokInput').value='Artificial intelligence is transforming how we understand language and reasoning.';renderTokens2('Artificial intelligence is transforming how we understand language and reasoning.')};
      document.getElementById('tokExample3').onclick=()=>{document.getElementById('tokInput').value='🤖🧠💡 AI + Human = 🚀';renderTokens2('🤖🧠💡 AI + Human = 🚀')};

      // Initial render
      renderTokens2(document.getElementById('tokInput').value);
    }

    // ════════════════════════════════════
    //  3. ATTENTION MECHANISM
    // ════════════════════════════════════
    function renderAttention(){
      const sentence='The cat sat on the mat because it was tired';
      const words=sentence.split(' ');

      // Pre-defined attention weights (simplified, inspired by real patterns)
      // Rows = attending FROM, Cols = attending TO
      const attentionData=[
        //The   cat   sat   on    the   mat   because it  was   tired
        [0.50, 0.20, 0.05, 0.03, 0.10, 0.05, 0.02, 0.02, 0.01, 0.02], // The
        [0.15, 0.45, 0.10, 0.03, 0.05, 0.08, 0.02, 0.05, 0.02, 0.05], // cat
        [0.05, 0.30, 0.35, 0.08, 0.03, 0.05, 0.02, 0.05, 0.04, 0.03], // sat
        [0.03, 0.05, 0.15, 0.40, 0.15, 0.12, 0.03, 0.03, 0.02, 0.02], // on
        [0.20, 0.05, 0.03, 0.10, 0.40, 0.12, 0.03, 0.03, 0.02, 0.02], // the
        [0.03, 0.08, 0.12, 0.15, 0.15, 0.35, 0.03, 0.03, 0.03, 0.03], // mat
        [0.02, 0.08, 0.10, 0.03, 0.02, 0.05, 0.40, 0.15, 0.08, 0.07], // because
        [0.05, 0.45, 0.05, 0.02, 0.03, 0.05, 0.10, 0.15, 0.03, 0.07], // it → cat!
        [0.02, 0.08, 0.05, 0.02, 0.02, 0.03, 0.08, 0.20, 0.40, 0.10], // was
        [0.03, 0.25, 0.05, 0.02, 0.02, 0.03, 0.05, 0.15, 0.10, 0.30], // tired
      ];

      let selectedWord=-1;

      content.innerHTML=`
        <h4 class="pi-sub">${t('ai.attention_title')}</h4>
        <p class="pi-info">${t('ai.attention_info')}</p>
        <div id="attSentence" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:1.5rem 0;font-size:1.1rem"></div>
        <div id="attArrows" style="min-height:60px;margin-bottom:1rem"></div>
        <h5 style="color:#3b82f6;font-size:0.85rem;margin:1rem 0 0.5rem">Attention Heatmap</h5>
        <p style="font-size:0.8rem;color:var(--dim);margin-bottom:0.5rem">Each cell shows how much the row word "attends to" the column word. Brighter = stronger attention.</p>
        <canvas id="attCv" height="420" style="width:100%;cursor:pointer"></canvas>
        <div style="margin-top:1.5rem;background:rgba(236,72,153,0.06);border:1px solid rgba(236,72,153,0.15);border-radius:8px;padding:1rem">
          <h5 style="color:#ec4899;margin:0 0 0.5rem;font-size:0.9rem">Why Attention Matters</h5>
          <p style="font-size:0.85rem;color:var(--dim);line-height:1.7;margin:0">The <strong style="color:#f59e0b">Transformer architecture</strong> (2017) introduced self-attention, allowing every word to directly attend to every other word regardless of distance. Before this, models struggled with long-range dependencies. Attention is the key innovation behind GPT, Claude, and all modern LLMs. The formula: <span style="font-family:var(--mono);color:#3b82f6">Attention(Q,K,V) = softmax(QK&#x1D40;/√d)V</span></p>
        </div>`;

      const sentEl=document.getElementById('attSentence');

      function renderSentence(){
        sentEl.innerHTML=words.map((w,i)=>{
          const isSelected=i===selectedWord;
          const attentionFromSelected=selectedWord>=0?attentionData[selectedWord][i]:0;
          let bg='rgba(255,255,255,0.05)';let border='rgba(255,255,255,0.15)';let color='#fff';
          if(selectedWord>=0){
            if(i===selectedWord){
              bg='rgba(236,72,153,0.3)';border='#ec4899';color='#ec4899';
            } else if(attentionFromSelected>0.2){
              bg=`rgba(245,158,11,${attentionFromSelected})`;border='#f59e0b';color='#f59e0b';
            } else if(attentionFromSelected>0.1){
              bg=`rgba(59,130,246,${attentionFromSelected})`;border='#3b82f6';color='#3b82f6';
            } else {
              bg=`rgba(255,255,255,${attentionFromSelected*0.3})`;
            }
          }
          return `<span class="ai-word" data-i="${i}" style="padding:6px 12px;border-radius:8px;background:${bg};border:1px solid ${border};color:${color};cursor:pointer;font-family:var(--mono);transition:all 0.3s;font-weight:${isSelected?'bold':'normal'}">${w}${selectedWord>=0&&i!==selectedWord?`<br><span style="font-size:0.65rem;opacity:0.7">${(attentionFromSelected*100).toFixed(0)}%</span>`:''}</span>`;
        }).join('');

        sentEl.querySelectorAll('.ai-word').forEach(el=>{
          el.onclick=()=>{
            selectedWord=+el.dataset.i;
            renderSentence();
            drawHeatmap();
            renderArrows();
          };
        });
      }

      function renderArrows(){
        const arrowEl=document.getElementById('attArrows');
        if(selectedWord<0){
          arrowEl.innerHTML='<div style="text-align:center;font-size:0.85rem;color:var(--dim);padding:1rem">Click a word above to see its attention pattern</div>';
          return;
        }
        const top3=attentionData[selectedWord]
          .map((v,i)=>({i,v}))
          .filter(x=>x.i!==selectedWord)
          .sort((a,b)=>b.v-a.v)
          .slice(0,3);
        arrowEl.innerHTML=`<div style="text-align:center;font-size:0.85rem;color:var(--dim)">
          <strong style="color:#ec4899">"${words[selectedWord]}"</strong> attends most to:
          ${top3.map(x=>`<strong style="color:#f59e0b">"${words[x.i]}"</strong> (${(x.v*100).toFixed(0)}%)`).join(', ')}
        </div>`;
      }

      function drawHeatmap(){
        const cv=document.getElementById('attCv');
        const totalW=cv.parentElement.getBoundingClientRect().width;
        const cellSize=Math.min(40,Math.floor((totalW-120)/words.length));
        const labelW=70;
        const w=labelW+cellSize*words.length+20;
        const h=labelW+cellSize*words.length+40;
        cv.height=h;
        const ctx=setupCanvas(cv,totalW,h);
        ctx.fillStyle='#08080f';ctx.fillRect(0,0,totalW,h);

        const ox=(totalW-w)/2+labelW;
        const oy=labelW;

        // Column labels (top)
        ctx.save();
        for(let j=0;j<words.length;j++){
          const x=ox+j*cellSize+cellSize/2;
          ctx.save();
          ctx.translate(x,oy-8);
          ctx.rotate(-Math.PI/4);
          ctx.fillStyle=j===selectedWord?'#ec4899':'rgba(255,255,255,0.6)';
          ctx.font=`${j===selectedWord?'bold ':''}11px Space Mono`;
          ctx.textAlign='left';ctx.textBaseline='middle';
          ctx.fillText(words[j],0,0);
          ctx.restore();
        }
        ctx.restore();

        // Draw cells
        for(let i=0;i<words.length;i++){
          // Row label
          ctx.fillStyle=i===selectedWord?'#ec4899':'rgba(255,255,255,0.6)';
          ctx.font=`${i===selectedWord?'bold ':''}11px Space Mono`;
          ctx.textAlign='right';ctx.textBaseline='middle';
          ctx.fillText(words[i],ox-8,oy+i*cellSize+cellSize/2);

          for(let j=0;j<words.length;j++){
            const val=attentionData[i][j];
            const x=ox+j*cellSize;
            const y=oy+i*cellSize;

            // Cell color
            let r,g,b;
            if(val>0.3){r=245;g=158;b=11}      // Gold for high
            else if(val>0.15){r=59;g=130;b=246}  // Blue for medium
            else {r=255;g=255;b=255}              // White for low
            ctx.fillStyle=`rgba(${r},${g},${b},${val*1.5})`;
            ctx.fillRect(x+1,y+1,cellSize-2,cellSize-2);

            // Highlight selected row
            if(i===selectedWord){
              ctx.strokeStyle='rgba(236,72,153,0.5)';ctx.lineWidth=1;
              ctx.strokeRect(x+1,y+1,cellSize-2,cellSize-2);
            }

            // Cell border
            ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=0.5;
            ctx.strokeRect(x,y,cellSize,cellSize);

            // Value text for larger cells
            if(cellSize>=28){
              ctx.fillStyle=val>0.2?'#fff':'rgba(255,255,255,0.3)';
              ctx.font='9px Space Mono';ctx.textAlign='center';ctx.textBaseline='middle';
              ctx.fillText((val*100).toFixed(0),x+cellSize/2,y+cellSize/2);
            }
          }
        }

        // Legend
        const legY=oy+words.length*cellSize+15;
        ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Space Mono';ctx.textAlign='center';
        ctx.fillText('← Row word attends to column word → | Brighter = stronger attention',totalW/2,legY);
      }

      // Handle heatmap clicks
      const cv2=document.getElementById('attCv');
      cv2.onclick=e=>{
        const rect=cv2.getBoundingClientRect();
        const totalW=rect.width;
        const cellSize=Math.min(40,Math.floor((totalW-120)/words.length));
        const labelW=70;
        const w2=labelW+cellSize*words.length+20;
        const ox=(totalW-w2)/2+labelW;
        const oy=labelW;
        const mx=(e.clientX-rect.left);
        const my=(e.clientY-rect.top);
        const row=Math.floor((my-oy)/cellSize);
        if(row>=0&&row<words.length&&mx>=ox&&mx<=ox+cellSize*words.length){
          selectedWord=row;
          renderSentence();drawHeatmap();renderArrows();
        }
      };

      renderSentence();drawHeatmap();renderArrows();
    }

    // ════════════════════════════════════
    //  4. TRAINING AT SCALE
    // ════════════════════════════════════
    function renderTraining(){
      let temperature=0.7, raf;

      content.innerHTML=`
        <h4 class="pi-sub">${t('ai.scale_title')}</h4>
        <p class="pi-info">${t('ai.scale_info')}</p>

        <h5 style="color:#f59e0b;font-size:0.9rem;margin:1.5rem 0 0.8rem">Model Sizes (Parameters)</h5>
        <div id="modelBars" style="margin-bottom:2rem"></div>

        <h5 style="color:#3b82f6;font-size:0.9rem;margin:1.5rem 0 0.8rem">Training Data Scale</h5>
        <div id="dataScale" style="margin-bottom:2rem"></div>

        <h5 style="color:#ec4899;font-size:0.9rem;margin:1.5rem 0 0.8rem">Temperature: Controlling Randomness</h5>
        <p class="pi-info">Temperature controls how "creative" vs "deterministic" a model's output is. Low temperature = picks the most likely word. High temperature = more random, creative choices.</p>
        <div class="controls" style="justify-content:center;margin:1rem 0">
          <div class="ctrl"><label>Temperature</label><input type="range" id="tempSlider" min="0" max="200" value="70" step="1"></div>
          <span class="val" id="tempVal">0.70</span>
        </div>
        <div id="tempDemo" style="margin-top:1rem"></div>`;

      // === Model size bars ===
      const models=[
        {name:'GPT-2',params:1.5,year:2019,color:'#10b981'},
        {name:'GPT-3',params:175,year:2020,color:'#3b82f6'},
        {name:'GPT-4',params:1760,year:2023,color:'#8b5cf6',note:'(estimated ~1.76T MoE)'},
        {name:'Claude 3',params:null,year:2024,color:'#f59e0b',note:'(undisclosed)'},
        {name:'Llama 3',params:405,year:2024,color:'#ef4444'},
      ];

      const maxParams=1760;
      const barsEl=document.getElementById('modelBars');
      let barsHtml='';
      models.forEach(m=>{
        const widthPct=m.params?Math.max(3,Math.log10(m.params)/Math.log10(maxParams)*100):50;
        const label=m.params?`${m.params>=1000?(m.params/1000).toFixed(1)+'T':m.params+'B'} parameters`:'Parameters undisclosed';
        barsHtml+=`
          <div style="margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span style="font-family:var(--mono);font-size:0.85rem;color:#fff;min-width:80px">${m.name}</span>
              <span style="font-family:var(--mono);font-size:0.7rem;color:var(--dim)">${m.year}</span>
              ${m.note?`<span style="font-family:var(--mono);font-size:0.65rem;color:var(--dim)">${m.note}</span>`:''}
            </div>
            <div style="position:relative;height:28px;background:rgba(255,255,255,0.04);border-radius:6px;overflow:hidden">
              <div class="ai-bar-fill" style="width:0%;height:100%;background:linear-gradient(90deg,${m.color}88,${m.color});border-radius:6px;transition:width 1.2s cubic-bezier(.4,0,.2,1);display:flex;align-items:center;padding-left:10px" data-target="${widthPct}">
                <span style="font-family:var(--mono);font-size:0.75rem;color:#fff;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.5)">${label}</span>
              </div>
            </div>
          </div>`;
      });
      barsEl.innerHTML=barsHtml;

      // Animate bars in
      requestAnimationFrame(()=>{
        document.querySelectorAll('.ai-bar-fill').forEach(bar=>{
          bar.style.width=bar.dataset.target+'%';
        });
      });

      // === Training data scale ===
      const dataSources=[
        {name:'Books',amount:'~500K books',icon:'📚',size:40,color:'#f59e0b'},
        {name:'Web Pages',amount:'~1 trillion tokens',icon:'🌐',size:90,color:'#3b82f6'},
        {name:'Wikipedia',amount:'~6M articles',icon:'📖',size:25,color:'#10b981'},
        {name:'Code',amount:'~100B+ tokens',icon:'💻',size:55,color:'#8b5cf6'},
        {name:'Scientific Papers',amount:'~10M+ papers',icon:'🔬',size:35,color:'#ec4899'},
        {name:'Conversations',amount:'Billions of dialogues',icon:'💬',size:45,color:'#06b6d4'},
      ];

      const dataEl=document.getElementById('dataScale');
      let dataHtml='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">';
      dataSources.forEach(d=>{
        dataHtml+=`
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:1rem;text-align:center;transition:transform 0.3s;cursor:default" onmouseover="this.style.transform='scale(1.05)';this.style.borderColor='${d.color}44'" onmouseout="this.style.transform='scale(1)';this.style.borderColor='rgba(255,255,255,0.08)'">
            <div style="font-size:${Math.max(1.5,d.size/30)}rem;margin-bottom:0.4rem">${d.icon}</div>
            <div style="font-family:var(--mono);font-size:0.85rem;color:${d.color};font-weight:bold">${d.name}</div>
            <div style="font-family:var(--mono);font-size:0.7rem;color:var(--dim);margin-top:0.3rem">${d.amount}</div>
          </div>`;
      });
      dataHtml+='</div>';
      dataEl.innerHTML=dataHtml;

      // === Temperature demo ===
      const prompt='The meaning of life is';
      const wordProbs={
        // Each entry: [word, base_probability]
        options:[
          ['to',0.25],
          ['a',0.18],
          ['something',0.12],
          ['about',0.10],
          ['not',0.08],
          ['found',0.06],
          ['complex',0.05],
          ['subjective',0.04],
          ['love',0.04],
          ['42',0.03],
          ['unknown',0.03],
          ['purpose',0.02],
        ]
      };

      function softmaxWithTemp(probs,temp){
        temp=Math.max(0.01,temp);
        const logits=probs.map(p=>Math.log(Math.max(1e-10,p)));
        const scaled=logits.map(l=>l/temp);
        const maxL=Math.max(...scaled);
        const exps=scaled.map(l=>Math.exp(l-maxL));
        const sum=exps.reduce((a,b)=>a+b,0);
        return exps.map(e=>e/sum);
      }

      function renderTempDemo(){
        const temp=temperature;
        const baseProbs=wordProbs.options.map(x=>x[1]);
        const adjusted=softmaxWithTemp(baseProbs,temp);
        const maxProb=Math.max(...adjusted);

        const demoEl=document.getElementById('tempDemo');
        let html=`
          <div style="font-family:var(--mono);font-size:0.9rem;color:var(--dim);margin-bottom:1rem;text-align:center">
            Prompt: <span style="color:#fff">"${prompt}"</span>
            <span style="color:${temp<0.3?'#3b82f6':temp<0.8?'#10b981':'#ef4444'};margin-left:0.5rem">
              ${temp<0.3?'(Very Deterministic)':temp<0.5?'(Focused)':temp<0.8?'(Balanced)':temp<1.2?'(Creative)':'(Very Random)'}
            </span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">`;

        wordProbs.options.forEach((opt,i)=>{
          const prob=adjusted[i];
          const barW=Math.max(2,prob/maxProb*100);
          const isTop=prob===maxProb;
          const color=isTop?'#f59e0b':prob>0.1?'#3b82f6':'rgba(255,255,255,0.3)';
          html+=`
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-family:var(--mono);font-size:0.8rem;color:${isTop?'#f59e0b':'#fff'};min-width:90px;text-align:right;font-weight:${isTop?'bold':'normal'}">"${opt[0]}"</span>
              <div style="flex:1;height:20px;background:rgba(255,255,255,0.03);border-radius:4px;overflow:hidden">
                <div style="width:${barW}%;height:100%;background:${color};border-radius:4px;transition:width 0.4s"></div>
              </div>
              <span style="font-family:var(--mono);font-size:0.75rem;color:${color};min-width:50px">${(prob*100).toFixed(1)}%</span>
            </div>`;
        });

        html+=`</div>
          <div style="margin-top:1rem;display:flex;justify-content:center;gap:2rem;font-family:var(--mono);font-size:0.75rem">
            <span style="color:#3b82f6">🧊 T→0: Always pick top word</span>
            <span style="color:#10b981">⚖️ T=0.7: Balanced</span>
            <span style="color:#ef4444">🔥 T→2: Nearly random</span>
          </div>`;
        demoEl.innerHTML=html;
      }

      const slider=document.getElementById('tempSlider');
      slider.oninput=e=>{
        temperature=+e.target.value/100;
        document.getElementById('tempVal').textContent=temperature.toFixed(2);
        renderTempDemo();
      };

      renderTempDemo();
    }

    // Start with Neural Network tab
    renderNeural();

    return()=>{cleanups.forEach(fn=>fn())};
  }
});
