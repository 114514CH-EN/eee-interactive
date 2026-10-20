/* 「化简 · 卡诺图」 tab of the logic simulator: enter a function (expression, Σm / ∏M with don't-cares, a truth-table bit
   string, or click the map), get the K-map (1–6 variables) with prime-implicant groups, canonical / complete / minimal
   forms, NAND / NOR / XOR forms with a cost table, and three worked methods (K-map steps, Quine–McCluskey, algebra),
   plus a checker for a student's own answer. Needs common.js, simkit.js, engine.js, bool.js. */
const KMapUI=(()=>{
const KC=['--blue','--amp','--green','--purple','--red','--accent'];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const gray=k=>k===0?[0]:k===1?[0,1]:[0,1,3,2];
const bin=(x,n)=>n?x.toString(2).padStart(n,'0'):'';
const cov=(p,x,n)=>((x^p.v)&~p.m&((1<<n)-1))===0;
const colOf=i=>KC[i%KC.length];
const CIRC=k=>String.fromCharCode(9312+Math.min(k,19));

/* ================= K-map drawing (shared with the truth-table tab) ================= */
function layout(n,W){const inner=Math.min(n,4),top=n-inner,rb=inner<=1?0:inner<=3?1:2,cb=inner-rb,R=1<<rb,C=1<<cb,S=1<<top;
  const mL=rb?36:10,mT=36,tT=top?20:0,gap=20;let per=S===1?1:2;
  const fitCell=p=>Math.floor((W-6-p*mL-(p-1)*gap)/(p*C));
  let cell=Math.min(n<=2?64:n===3?58:n===4?52:42,fitCell(per));if(per>1&&cell<26){per=1;cell=Math.min(42,fitCell(1));}cell=Math.max(cell,20);
  const bw=mL+C*cell,bh=tT+mT+R*cell,rowsB=Math.ceil(S/per),blocks=[];
  for(let s=0;s<S;s++){const col=per===1?0:s&1,row=per===1?s:s>>1;blocks.push({s,x:3+col*(bw+gap)+mL,y:4+row*(bh+gap)+tT+mT});}
  return {n,inner,top,rb,cb,R,C,S,cell,mL,mT,tT,blocks,H:8+rowsB*bh+(rowsB-1)*gap,ro:gray(rb),co:gray(cb)};}
function runs(idx,N){if(idx.length===N)return [{a:0,b:N-1}];const s=new Set(idx),out=[];let i=0;
  while(i<N){if(s.has(i)){let j=i;while(j+1<N&&s.has(j+1))j++;out.push({a:i,b:j});i=j+1;}else i++;}
  if(out.length===2&&out[0].a===0&&out[1].b===N-1){out[0].pre=1;out[1].post=1;}return out;}
function rr(g,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);}
/* o: {names, t (0/1/'X' per minterm), groups:[{p,color,style:'solid'|'dash'|'faint',hot,label}], marks: Map(m→'ring'|'left'|'bad'), mode:'sop'|'pos', hover} */
function draw(cv,o){const names=o.names,n=names.length,t=o.t;
  const W0=Math.max(200,cv.getBoundingClientRect().width||cv.parentElement.clientWidth||320);
  if(!n){cv.dataset.h=44;const [g,W]=fit(cv);text(g,`常数 ${t[0]}：没有变量，不需要卡诺图`,W/2,26,css('--muted'),12,'center');return null;}
  const L=layout(n,W0);cv.dataset.h=L.H;const [g]=fit(cv);const mono=css('--mono'),ink=css('--ink'),mut=css('--muted'),line=css('--line');
  const inn=names.slice(L.top),rN=inn.slice(0,L.rb).join(''),cN=inn.slice(L.rb).join(''),emph=o.mode==='pos'?0:1,cell=L.cell;
  const mk=(s,i,j)=>(s<<L.inner)|(L.ro[i]<<L.cb)|L.co[j];
  const groups=(o.groups||[]).map((G,k)=>({...G,k})).sort((a,b)=>(a.hot?1:0)-(b.hot?1:0)),labelled=new Set();
  for(const B of L.blocks){const cw=L.C*cell,ch=L.R*cell;
    if(L.top){g.font=`600 12.5px ${mono}`;g.fillStyle=css('--accent');g.fillText(names.slice(0,L.top).join('')+' = '+bin(B.s,L.top),B.x-L.mL+4,B.y-L.mT-6);}
    g.font=`600 11.5px ${mono}`;g.fillStyle=mut;
    L.co.forEach((c,j)=>{const s=bin(c,L.cb);g.fillText(s,B.x+j*cell+cell/2-g.measureText(s).width/2,B.y-7);});
    if(L.rb)L.ro.forEach((r,i)=>{const s=bin(r,L.rb);g.fillText(s,B.x-8-g.measureText(s).width,B.y+i*cell+cell/2+4);});
    g.font=`600 12px ${mono}`;g.fillStyle=ink;const corner=(rN?rN+'＼':'')+cN;g.fillText(corner,Math.max(2,B.x-L.mL+2),B.y-22);
    for(let i=0;i<L.R;i++)for(let j=0;j<L.C;j++){const m=mk(B.s,i,j),x=B.x+j*cell,y=B.y+i*cell,v=t[m],mark=o.marks&&o.marks.get(m);
      if(mark==='bad'){g.fillStyle=css('--red');g.globalAlpha=.16;g.fillRect(x,y,cell,cell);g.globalAlpha=1;}
      g.strokeStyle=line;g.lineWidth=1;g.strokeRect(x+.5,y+.5,cell,cell);
      const e=v===emph,sv=v==='X'?'X':String(v);g.font=`${e||v==='X'?'700 ':''}${Math.round(cell*0.38)}px ${mono}`;g.fillStyle=v==='X'?css('--amp'):e?ink:mut;if(!e&&v!=='X')g.globalAlpha=.6;
      g.fillText(sv,x+cell/2-g.measureText(sv).width/2,y+cell/2+cell*0.14);g.globalAlpha=1;
      if(cell>=30){g.font=`9px ${mono}`;g.fillStyle=mut;g.fillText(String(m),x+3,y+11);}
      if(mark==='ring'||mark==='left'){g.strokeStyle=mark==='ring'?css('--accent'):css('--red');g.lineWidth=2;if(mark==='left')g.setLineDash([3,3]);g.beginPath();g.arc(x+cell/2,y+cell/2,cell*0.3,0,7);g.stroke();g.setLineDash([]);}
      if(mark==='bad'){g.strokeStyle=css('--red');g.lineWidth=2;g.strokeRect(x+2.5,y+2.5,cell-5,cell-5);}
      if(o.hover===m){g.strokeStyle=css('--accent');g.lineWidth=2.5;g.strokeRect(x+1.5,y+1.5,cell-3,cell-3);}}
    g.strokeStyle=ink;g.lineWidth=1.5;g.strokeRect(B.x+.5,B.y+.5,cw,ch);
    /* groups: wrap-around pieces run past the edge and are clipped, so they look open */
    g.save();g.beginPath();g.rect(B.x-1,B.y-1,cw+2,ch+2);g.clip();
    for(const G of groups){const p=G.p,rows=[],cols=[];
      for(let i=0;i<L.R;i++)for(let j=0;j<L.C;j++)if(cov(p,mk(B.s,i,j),n)){rows.push(i);break;}
      if(!rows.length)continue;
      for(let j=0;j<L.C;j++)for(let i=0;i<L.R;i++)if(cov(p,mk(B.s,i,j),n)){cols.push(j);break;}
      const ins=(3+(G.k%5)*2.3)*Math.min(1,cell/42),col=css(G.color),rad=Math.min(cell*0.34,14),faint=G.style==='faint';
      g.strokeStyle=col;g.fillStyle=col;
      runs(rows,L.R).forEach(ry=>runs(cols,L.C).forEach(rx=>{let x0=B.x+rx.a*cell+ins,x1=B.x+(rx.b+1)*cell-ins,y0=B.y+ry.a*cell+ins,y1=B.y+(ry.b+1)*cell-ins;
        if(rx.pre)x0=B.x-cell;if(rx.post)x1=B.x+cw+cell;if(ry.pre)y0=B.y-cell;if(ry.post)y1=B.y+ch+cell;
        g.beginPath();rr(g,x0,y0,x1-x0,y1-y0,rad);g.globalAlpha=G.hot?.24:faint?.03:.09;g.fill();
        g.globalAlpha=faint?.45:1;g.lineWidth=G.hot?3.6:faint?1.4:2.4;g.setLineDash(G.style==='dash'||faint?[5,4]:[]);g.stroke();g.setLineDash([]);g.globalAlpha=1;
        if(G.label&&!labelled.has(G.k)){labelled.add(G.k);g.font=`700 10.5px ${mono}`;const lx=Math.max(x0,B.x)+4,ly=Math.max(y0,B.y)+12,w=g.measureText(G.label).width;
          g.fillStyle=css('--panel');g.globalAlpha=.85;g.fillRect(lx-2,ly-10,w+4,13);g.globalAlpha=1;g.fillStyle=col;g.fillText(G.label,lx,ly);}}));}
    g.restore();}
  L.hit=(x,y)=>{for(const B of L.blocks){const j=Math.floor((x-B.x)/cell),i=Math.floor((y-B.y)/cell);if(i>=0&&i<L.R&&j>=0&&j<L.C)return mk(B.s,i,j);}return -1;};
  return L;}

/* ================= tab state ================= */
let H={};
const st={A:null,mode:'sop',sol:{sop:0,pos:0},step:-1,hide:false,sub:'res',hot:null,hover:-1,chk:null,L:null};
const EX=[["A'B + AC","F = A'B + AC"],['四变量 Σm','F(A,B,C,D) = Σm(0,2,5,7,8,10,13,15)'],['带无关项','F(A,B,C,D) = Σm(1,3,7,11,15) + d(0,2,5)'],
  ['七段 a 段（BCD）','a(A,B,C,D) = Σm(0,2,3,5,6,7,8,9) + d(10,11,12,13,14,15)'],['两个解（循环）','F(A,B,C) = Σm(0,1,2,5,6,7)'],['∏M','F(A,B,C,D) = ∏M(0,1,4,5,10,11,14)'],
  ['五变量','F(A,B,C,D,E) = Σm(0,2,4,6,9,11,13,15,17,21,25,27,29,31)'],['异或','F = A ⊕ B ⊕ C'],['真值表 0/1 串','F = 0001 0111']];
const node=(p,side)=>side==='sop'?BL.prodNode(p,st.A.names):BL.sumNode(p,st.A.names);
const piHTML=(p,side)=>{const e=node(p,side);return side==='pos'&&e.t==='or'?'('+BL.htm(e)+')':BL.htm(e);};
const piTxt=(p,side)=>{const e=node(p,side);return side==='pos'&&e.t==='or'?'('+BL.txt(e)+')':BL.txt(e);};
const chip=(p,side,E,inner)=>`<span class="pi" data-pi="${p.i}" data-side="${side}" style="--c:var(${colOf(p.i)})">${inner||piHTML(p,side)}${E&&E.includes(p)?'<sup title="本质质蕴含项">*</sup>':''}</span>`;
const chips=(list,side,E)=>list.length?list.map(p=>chip(p,side,E)).join(side==='sop'?' + ':''):(side==='sop'?'0':'1');
const lab=(p,side)=>chip(p,side,null,'P'+(p.i+1));
const ms=a=>a.map(x=>'m'+x).join('、');
const curSol=side=>{const sd=st.A[side];return sd.sols[Math.min(st.sol[side],sd.sols.length-1)]||[];};
const visible=()=>$('v_km').style.display!=='none'&&$('kMap').getBoundingClientRect().width>0;

function showErr(m){const e=$('kErr');e.hidden=!m;e.textContent=m?'✖ '+m:'';}
function setText(text){$('kExpr').value=text;let spec;try{spec=BL.parseFn(text);}catch(e){showErr(e.message);return false;}
  showErr('');st.A=BL.analyse(spec);st.sol={sop:0,pos:0};st.step=st.hide?0:-1;st.hot=null;st.hover=-1;
  st.chk=$('kAns').value.trim()?BL.check(st.A,$('kAns').value):null;render();return true;}
function setSpec(spec){return setText(BL.specText(spec.name||'F',spec.vars,spec.on,spec.dc||[]));}
function toggle(m){const A=st.A,v=A.t[m],on=A.on.filter(x=>x!==m),dc=A.dc.filter(x=>x!==m);if(v===0)on.push(m);else if(v===1)dc.push(m);
  const step=st.step;setText(BL.specText(A.name,A.names,on.sort((a,b)=>a-b),dc.sort((a,b)=>a-b)));st.step=step;render();}

/* ================= results ================= */
function renderRes(){const A=st.A,box=$('kRes');if(!A){box.innerHTML='';return;}
  const nm=esc(A.name),L=a=>a.join(', ')||'—';
  if(!A.n){box.innerHTML=`<p class="kfn"><b>${nm}</b> = ${A.t[0]}</p><p class="okp">常数，没有变量，不用化简。</p>`;box.classList.remove('spoil');return;}
  let h=`<p class="kfn"><b>${nm}</b>(${A.names.map(esc).join(', ')}) = Σm(${L(A.on)})${A.dc.length?` + d(${A.dc.join(', ')})`:''}<br><span>= ∏M(${L(A.off)})${A.dc.length?` · d(${A.dc.join(', ')})`:''}</span></p>`;
  if(A.konst!==null){box.innerHTML=h+`<p class="okp">函数恒为 ${A.konst}${A.dc.length?`（无关项都取 ${A.konst}）`:''}，不用化简。</p>`;box.classList.remove('spoil');return;}
  const fx=(l,e)=>`<p class="expr"><span class="lab">${l}</span>${nm} = ${BL.htm(e)}</p>`;
  const big=(l,e,c)=>c>12?`<details><summary>${l}（${c} 项，点开）</summary><p class="expr">${nm} = ${BL.htm(e)}</p></details>`:fx(l,e);
  h+=`<div class="ksec"><h4>标准形式</h4>${big('标准与或式 · 最小项之和',A.canonSOP,A.on.length)}${big('标准或与式 · 最大项之积',A.canonPOS,A.off.length)}</div>`;
  h+=`<div class="ksec"><h4>完全和 <small>所有质蕴含项之和：${A.sop.P.length} 个，* 是本质的</small></h4><p class="expr">${nm} = ${chips(A.sop.P,'sop',A.sop.E)}</p>
    <details><summary>完全积（所有质蕴含式之积，${A.pos.P.length} 个）</summary><p class="expr">${nm} = ${chips(A.pos.P,'pos',A.pos.E)}</p></details></div>`;
  h+=solBlock('sop')+solBlock('pos');
  h+=`<div class="ksec"><h4>其他写法</h4>${fx('与非–与非',A.nand)}${fx('或非–或非',A.nor)}${A.anf&&A.anf.tree.t==='xor'&&!A.anf.long?fx('异或（Reed–Muller）',A.anf.tree):''}
    <div class="scroll"><table class="mini kcost"><tr><th>写法</th><th>字面量</th><th>门</th><th>反相器</th></tr>${A.costs.map(r=>{const b=A.cheapest&&r.k===A.cheapest.k;return `<tr${b?' class="best"':''}><td>${r.name}${b?' ★':''}</td><td>${r.c.lit}</td><td>${r.c.gates}</td><td>${r.c.inv}</td></tr>`;}).join('')}</table></div>
    <p class="m">★ 实现起来最省（门 + 反相器最少，异或门按两个门算）。门数不含反相器，超过 4 输入的门按 4 输入拆开算；与非–与非、或非–或非的门数和对应的与或式、或与式一样。</p></div>`;
  h+=`<div class="btns"><button data-kg="sop" class="play">用最简与或式生成电路</button><button data-kg="pos">用最简或与式生成电路</button><button data-kg="nand">全与非电路</button><button data-kg="nor">全或非电路</button><button id="kCopy">复制最简式</button><button id="kShare">分享这个函数</button></div>`;
  if(st.hide)h=`<button class="unspoil">答案先藏起来了：自己圈完再点这里看</button>`+h;
  box.innerHTML=h;box.classList.toggle('spoil',st.hide);}
function solBlock(side){const A=st.A,sd=A[side],trees=side==='sop'?A.sopTrees:A.posTrees,k=Math.min(st.sol[side],sd.sols.length-1),sol=sd.sols[k],c=BL.cost(trees[k],side);
  let h=`<div class="ksec${st.mode===side?' cur':''}"><h4>${side==='sop'?'最简与或式':'最简或与式'} <small>${c.terms} 项 · ${c.lit} 个字面量</small></h4>`;
  if(sd.sols.length>1)h+=`<div class="btns ksol">${sd.sols.map((s,i)=>`<button data-sol="${side}:${i}" aria-pressed="${i===k}">解 ${i+1}</button>`).join('')}<span class="m">有 ${sd.sols.length}${sd.more?' 个以上':' 个'}同样简的答案</span></div>`;
  h+=`<p class="expr big">${esc(A.name)} = ${chips(sol,side,sd.E)}</p>`;
  if(side==='sop'){const hz=LE.hazards(A.on,A.dc,A.n,sol);if(hz.length){const fix=[...new Map(hz.filter(x=>x.fix).map(x=>[x.fix.v+'/'+x.fix.m,x.fix])).values()];
    h+=`<p class="haz">⚠ 有 ${hz.length} 处静态 1 冒险（相邻的 1 不在同一个圈里，如 m${hz[0].a} ↔ m${hz[0].b}）。补上冗余项 ${fix.map(p=>`<span class="expr">${BL.htm(BL.prodNode(p,A.names))}</span>`).join('、')} 可以消除，代价是多用门。</p>`;}}
  return h+'</div>';}

/* ================= worked methods ================= */
function stepsHTML(){const A=st.A,side=st.mode,sd=A[side],SOP=side==='sop',one=SOP?'1':'0',nm=esc(A.name);
  if(A.konst!==null)return `<p class="m">函数恒为 ${A.konst}，没有要圈的。</p>`;
  const sol=curSol(side),tm=p=>`<span class="expr">${piHTML(p,side)}</span>`,L=p=>lab(p,side);
  const S=[];
  S.push({t:'填卡诺图',b:`把 Σm 里的 ${A.on.length} 个格子填 1，其余填 0${A.dc.length?'，无关项 d(…) 填 X':''}。${A.n>=2?'行、列按格雷码 00 01 11 10 排，所以相邻两格只差一个变量；最左和最右、最上和最下也算相邻':''}${A.n===5?`；两张图同一位置的格子也相邻（只差 ${esc(A.names[0])}）`:A.n===6?'；左右相邻或上下相邻的两张图，同一位置的格子也相邻':''}。${SOP?'':'这次要圈的是 <b>0</b>（求或与式）。'}`});
  S.push({t:'找出所有质蕴含项（最大的圈）',b:`把相邻的 ${one} 圈起来：每个圈的格子数是 1、2、4、8…，形状是长方形（可以绕到对边），而且要尽量大${A.dc.length?'；X 可以圈进来帮忙，也可以不圈':''}。不能再扩大的圈叫<b>${SOP?'质蕴含项':'质蕴含式'}</b>，一共 ${sd.P.length} 个：<ul class="kpl">${sd.P.map(p=>`<li>${L(p)} ${tm(p)}　<span class="m">${p.cells.length} 格：${ms(p.cells)}</span></li>`).join('')}</ul>`});
  S.push({t:'先选本质质蕴含项',b:sd.ess.length?`有的 ${one} 只在一个圈里，那个圈非选不可（本质质蕴含项）：<ul class="kpl">${sd.ess.map(e=>`<li>${ms(e.why)} 只在 ${L(e.p)} 里 → 选 ${tm(e.p)}</li>`).join('')}</ul>`:`没有本质质蕴含项：每个 ${one} 都至少在两个圈里（循环覆盖），只能比较不同的选法。`});
  const chosen=sol.filter(p=>!sd.E.includes(p)),unused=sd.P.filter(p=>!sol.includes(p));
  S.push({t:`盖住剩下的 ${one}`,b:!sd.left.length?`本质质蕴含项已经盖住了所有的 ${one}。${unused.length?`${unused.map(L).join('、')} ${unused.length>1?'都是':'是'}多余的，不选。`:''}`:
    `本质质蕴含项还没盖住 ${ms(sd.left)}。用最少的圈盖住它们（圈一样多时选字面量少的，也就是更大的圈）：${chosen.map(p=>`选 ${L(p)} ${tm(p)}，盖住 ${ms(p.hit.filter(x=>sd.left.includes(x)))}`).join('；')}。${sd.sols.length>1?`还有别的选法一样简（共 ${sd.sols.length}${sd.more?'+':''} 种，用上面的「解 1 / 解 2」切换）。`:''}${unused.length?`${unused.map(L).join('、')} 不用选。`:''}`});
  const desc=p=>{const keep=[],gone=[];A.names.forEach((v,i)=>{const b=A.n-1-i;if(p.m>>b&1)gone.push(esc(v));else keep.push(`${esc(v)}=${p.v>>b&1}`);});return `${keep.join(' ')} 不变${gone.length?`，${gone.join('、')} 会变`:''}`;};
  S.push({t:'写出结果',b:`${SOP?'每个圈写成一个<b>乘积项</b>：圈里取值不变的变量留下，取 1 写原变量，取 0 写反变量；会变的变量消掉。再把乘积项加起来。':'每个圈写成一个<b>和项</b>：圈里取值不变的变量留下，取 0 写原变量，取 1 写反变量（和圈 1 时正好相反）；会变的消掉。再把和项乘起来。'}
    <ul class="kpl">${sol.map(p=>`<li>${L(p)}：${desc(p)} → ${tm(p)}</li>`).join('')}</ul><p class="expr big">${nm} = ${chips(sol,side,sd.E)}</p>`});
  const cur=st.step;
  return `<div class="kstepnav btns"><button id="kPrev"${cur===0?' disabled':''}>‹ 上一步</button><button id="kNext"${cur===4?' disabled':''}>下一步 ›</button><button id="kAll" aria-pressed="${cur<0}">看最终结果</button><span class="m">${cur<0?'点某一步，卡诺图就停在那一步':`第 ${cur+1} / 5 步`}</span></div>
    <ol class="ksteps">${S.map((s,i)=>`<li data-st="${i}" class="${cur===i?'on':''}${st.hide&&i>cur?' hid':''}"><b>${s.t}</b><div>${st.hide&&i>cur?'<span class="m">（点「下一步」再看）</span>':s.b}</div></li>`).join('')}</ol>`;}
function qmHTML(){const A=st.A,side=st.mode,SOP=side==='sop',sd=A[side];if(A.konst!==null)return `<p class="m">函数恒为 ${A.konst}。</p>`;
  const tg=SOP?A.on:A.off,cols=BL.qm(tg,A.dc,A.n),byKey=new Map(sd.P.map(p=>[p.v+'/'+p.m,p])),D=new Set(A.dc),tm=p=>`<span class="expr">${piHTML(p,side)}</span>`,L=p=>lab(p,side),sol=curSol(side);
  let h=`<p class="m">对所有的 <b>${SOP?'1':'0'}</b>${A.dc.length?'（和无关项）':''}做。${SOP?'':'圈 0 得到的是 F̅ 的乘积项，每一项取反（德摩根）就是或与式里的和项。'}同一列里，只差一位、而且「-」位置相同的两项合并成下一列的一项，合并过的打 ✓；<b>没打 ✓ 的就是质蕴含项</b>。</p>`;
  h+='<div class="qmcols">'+cols.map((col,ci)=>{let last=-1,rows='';col.forEach(it=>{if(it.ones!==last){last=it.ones;rows+=`<tr class="grp"><td colspan="3">${it.ones} 个 1</td></tr>`;}
      const p=!it.used&&byKey.get(it.v+'/'+it.m);rows+=`<tr><td>${it.ms.map(x=>D.has(x)?`<i>${x}</i>`:x).join(',')}</td><td class="pat">${it.pat}</td><td>${it.used?'✓':p?L(p):'<span class="m">只含 d</span>'}</td></tr>`;});
    return `<table class="mini qm"><tr><th colspan="3">第 ${ci+1} 列${ci===0?' · 按 1 的个数分组':''}</th></tr><tr><th>${ci===0?(SOP?'最小项':'最大项'):'合并的项'}</th><th>二进制</th><th></th></tr>${rows}</table>`;}).join('')+'</div>';
  if(A.dc.length)h+='<p class="m">斜体数字是无关项。只由无关项合成的项（「只含 d」）不需要盖住任何东西，不算。</p>';
  const only=x=>sd.P.filter(p=>cov(p,x,A.n)).length===1;
  h+=`<h4>质蕴含项表</h4><p class="m">行是质蕴含项，列是要盖住的${SOP?'最小项':'最大项'}。一列只有一个 × 的（⊗），那一行就是本质质蕴含项。</p>
    <div class="scroll"><table class="mini pich"><tr><th></th>${tg.map(x=>`<th>${x}</th>`).join('')}</tr>${sd.P.map(p=>`<tr class="${sd.E.includes(p)?'ess':''}"><td>${L(p)} ${tm(p)}</td>${tg.map(x=>cov(p,x,A.n)?(only(x)?'<td class="o1">⊗</td>':'<td>×</td>'):'<td></td>').join('')}</tr>`).join('')}
    <tr class="cv"><td>本质项已盖住</td>${tg.map(x=>`<td>${sd.left.includes(x)?'':'✓'}</td>`).join('')}</tr></table></div>`;
  if(sd.left.length){const pt=sd.pet,Pn=i=>'P'+(i+1);h+=`<h4>剩下的列：Petrick 方法</h4><p class="m">${ms(sd.left)} 还没盖住。每一列至少要选一个能盖住它的质蕴含项，写成「和之积」：</p>
      <p class="expr">P = ${pt.cols.map(c=>'('+c.ps.map(Pn).join(' + ')+')').join('')}</p>`;
    if(pt.big)h+='<p class="m">项太多，展开会很长；这里直接用分支限界搜索出最少的组合。</p>';
    else{const bestSets=pt.sets.filter(s=>s.length*100+s.reduce((a,p)=>a+p.lits,0)===pt.best);
      h+=`<p class="expr">= ${pt.sets.slice(0,12).map(s=>s.map(p=>Pn(p.i)).join('')).join(' + ')}${pt.sets.length>12?' + …':''}</p><p class="m">展开后每个乘积项就是一种能盖住所有剩下列的选法（已经用吸收律 X + XY = X 化简）。项数最少、字面量最少的是：${bestSets.map(s=>s.map(p=>Pn(p.i)).join('')).join('、')}${bestSets.length>1?'，都可以':''}。</p>`;}}
  return h+`<h4>结果</h4><p class="expr big">${esc(A.name)} = ${chips(sol,side,sd.E)}</p>`;}
function algHTML(){const A=st.A;if(A.konst!==null)return `<p class="m">函数恒为 ${A.konst}。</p>`;
  const sol=curSol('sop'),r=BL.algebra(A,sol);let h='';
  if(st.mode==='pos')h+='<p class="m">代数推导按与或式做。或与式可以先对 F̅ 用同样的办法求出最简与或式，再用德摩根定理 (XY)̅ = X̅ + Y̅ 取反。</p>';
  if(r.big)return h+'<p class="m">最小项太多（超过 16 个或超过 5 个变量），代数推导会写得很长；看「卡诺图步骤」或「表格法」。</p>';
  const rows=[];if(A.ast)rows.push({e:BL.fromAst(A.ast),why:'原式'});rows.push(...r.steps);
  h+=`<div class="scroll"><table class="alg">${rows.map((s,i)=>`<tr><td class="lhs">${i?'=':esc(A.name)+' ='}</td><td class="expr">${BL.htm(s.e)}</td><td class="why">${s.why}</td></tr>`).join('')}</table></div>`;
  return h+'<p class="m">用到的定律：分配律 XY + XZ = X(Y + Z)，互补律 X̅ + X = 1，重叠律 X + X = X。和卡诺图是同一件事：相邻两格只差一个变量，合起来那个变量就消掉了。</p>';}
function renderChk(){const R=st.chk,box=$('kChkRes'),A=st.A;
  if(!R||!A){box.innerHTML='<p class="m">输入你自己化简出来的式子（与或式、或与式或任意表达式），检查是否等价、是不是最简、每一项圈得对不对。卡诺图上会画出你的圈。</p>';return;}
  if(R.err){box.innerHTML=`<p class="haz">✖ ${esc(R.err)}</p>`;return;}
  const fn=R.form==='pos'?'或与式':R.form==='sop'?'与或式':'形式',asg=x=>A.names.map((v,i)=>`${esc(v)}=${(x>>(A.n-1-i))&1}`).join(' ');let h='';
  if(R.ok){h+=`<p class="okp">✓ 和原函数等价${A.dc.length?'（无关项的格子不比较）':''}。</p>`;
    h+=R.minimal?`<p class="okp">✓ 已经是最简${fn}：${R.c.terms} 项、${R.c.lit} 个字面量。</p>`:`<p class="warnp">还不是最简。最简${fn}是 <span class="expr">${BL.htm(R.best)}</span>（${R.bc.terms} 项、${R.bc.lit} 个字面量），你的是 ${R.c.terms} 项、${R.c.lit} 个字面量。</p>`;}
  else{h+='<p class="haz">✖ 和原函数不等价。卡诺图上红底的格子就是不对的地方。</p>';
    const lst=a=>a.slice(0,8).map(x=>`m${x}（${asg(x)}）`).join('、')+(a.length>8?'……':'');
    if(R.miss.length)h+=`<p class="haz">应该是 1，你的式子给出 0：${lst(R.miss)}</p>`;if(R.wrong.length)h+=`<p class="haz">应该是 0，你的式子给出 1：${lst(R.wrong)}</p>`;}
  if(R.items){h+=`<h4>逐项检查</h4><ul class="kitems">${R.items.map((it,k)=>`<li><b>${CIRC(k)}</b> <span class="expr">${it.node?(R.form==='pos'&&it.node.t==='or'?'('+BL.htm(it.node)+')':BL.htm(it.node)):'—'}</span>　${it.notes.length?it.notes.map(n=>`<span class="${n.lv==='err'?'haz':'warnp'}">${esc(n.s)}</span>`).join('；'):'<span class="okp">✓ 圈得对（不能再扩大）</span>'}</li>`).join('')}</ul>`;
    if(R.uncov&&R.uncov.length)h+=`<p class="haz">没被任何一项盖住：${ms(R.uncov)}（漏圈了）。</p>`;}
  else h+='<p class="m">不是与或式也不是或与式，只检查了等价性和字面量数。</p>';
  box.innerHTML=h;}
function renderSub(){const box=$('kSub'),chk=st.sub==='chk',res=st.sub==='res';$('kChk').hidden=!chk;box.hidden=chk||res;$('kRes').hidden=!res;
  pressGroup('#v_km [data-ks]',b=>b.dataset.ks===st.sub);if(!st.A){box.innerHTML='';return;}
  if(st.hide&&st.sub!=='steps'&&st.sub!=='chk'){box.innerHTML='<p class="m">答案先藏起来了。取消「先自己做」再看这一页。</p>';return;}
  if(res)return;if(!chk)box.innerHTML=st.sub==='qm'?qmHTML():st.sub==='alg'?algHTML():stepsHTML();else renderChk();}

/* ================= map ================= */
function drawMap(){const A=st.A,cv=$('kMap');if(!A||!visible())return;
  let side=st.hot?st.hot.side:st.mode,emph=side;const groups=[],marks=new Map(),sd=A[side],sol=curSol(side);let note='';
  const G=(p,style,label)=>({p,color:colOf(p.i),style,label,hot:!!(st.hot&&st.hot.side===side&&st.hot.i===p.i)});
  if(st.sub==='chk'&&st.chk&&!st.chk.err){const R=st.chk;emph=R.form==='pos'?'pos':'sop';
    (R.items||[]).forEach((it,k)=>{if(it.c.zero)return;const err=it.notes.some(n=>n.lv==='err');groups.push({p:it.c,color:err?'--red':KC[k%KC.length],style:it.notes.length?'dash':'solid',label:CIRC(k)});});
    R.miss.concat(R.wrong).forEach(x=>marks.set(x,'bad'));note=R.items?'画的是你的答案：①②… 是你的每一项；红圈 = 圈到了不该圈的格子，虚线 = 还能改进；红底格子 = 和原函数不一样。':'红底格子 = 你的式子和原函数不一样的地方。';}
  else if(A.konst===null){const step=st.sub==='steps'?st.step:-1;
    if(step===0)note='第 1 步：只填数，还没圈。';
    else if(step===1){sd.P.forEach(p=>groups.push(G(p,'dash','P'+(p.i+1))));note=`虚线：所有 ${sd.P.length} 个质蕴含项（最大的圈）。`;}
    else if(step===2){sd.P.forEach(p=>groups.push(G(p,sd.E.includes(p)?'solid':'faint',sd.E.includes(p)?'P'+(p.i+1):'')));sd.ess.forEach(e=>e.why.forEach(x=>marks.set(x,'ring')));note='实线：本质质蕴含项；绿色圆圈：只有它能盖住的格子。';}
    else if(step===3){sd.P.forEach(p=>groups.push(G(p,sol.includes(p)?'solid':'faint',sol.includes(p)?'P'+(p.i+1):'')));sd.left.forEach(x=>marks.set(x,'left'));note=sd.left.length?'红色虚线圆圈：本质项没盖住、要另外选圈的格子。':'本质项已经盖住所有格子。';}
    else{const hp=st.hot?sd.P[st.hot.i]:null;sol.forEach(p=>groups.push(G(p,hp&&p!==hp?'faint':'solid','')));if(hp&&!sol.includes(hp))groups.push(G(hp,'solid',''));
      if(st.hide&&step<0)groups.length=0;note=st.hide?'先自己圈：点「下一步」一步步看。':`${side==='sop'?'圈 1：最简与或式':'圈 0：最简或与式'}。点格子切换 0 → 1 → X；悬停看是哪个最小项、在哪些圈里。`;}}
  st.L=draw(cv,{names:A.names,t:A.t,groups,marks,mode:emph,hover:st.hover});$('kMapNote').textContent=note;}
function render(){if(!st.A)return;pressGroup('#v_km [data-km]',b=>b.dataset.km===st.mode);renderRes();renderSub();drawMap();}

/* ================= events ================= */
function init(hooks){H=hooks;
  $('kEx').innerHTML=EX.map(([l,f])=>`<button data-kex="${esc(f)}">${esc(l)}</button>`).join('');
  $('kN').innerHTML=[1,2,3,4,5,6].map(n=>`<option${n===4?' selected':''}>${n}</option>`).join('');
  const root=$('v_km'),tip=SimKit.tooltip($('kMapWrap'));
  root.addEventListener('click',ev=>{const b=ev.target.closest('button,[data-st],[data-ks]');if(!b||!root.contains(b))return;const d=b.dataset;
    if(d.kex){setText(d.kex);return;}
    if(d.km){st.mode=d.km;st.hot=null;render();return;}
    if(d.ks){st.sub=d.ks;if(d.ks==='steps'&&!st.hide&&st.step<0)st.step=0;renderSub();drawMap();return;}
    if(d.sol){const [s,i]=d.sol.split(':');st.sol[s]=+i;render();return;}
    if(d.kg){const A=st.A;if(!A)return;const sp={name:A.name,vars:A.names,on:A.on,dc:A.dc,ast:null,cover:curSol('sop'),coverOff:curSol('pos')};H.generate&&H.generate([sp],d.kg);return;}
    if(b.id==='kCopy'){const e=st.mode==='sop'?st.A.sopTrees[Math.min(st.sol.sop,st.A.sopTrees.length-1)]:st.A.posTrees[Math.min(st.sol.pos,st.A.posTrees.length-1)];
      SimKit.copyText(`${st.A.name} = ${BL.txt(e)}`).then(ok=>H.flash&&H.flash(ok?'已复制：'+BL.txt(e):BL.txt(e)));return;}
    if(b.id==='kShare'){const u=location.origin+location.pathname+'?v=km&f='+encodeURIComponent($('kExpr').value);SimKit.copyText(u).then(ok=>H.flash&&H.flash(ok?'链接已复制':u));return;}
    if(b.classList.contains('unspoil')){st.hide=false;$('kHide').checked=false;st.step=-1;st.sub='res';render();return;}
    if(b.id==='kPrev'){st.step=Math.max(0,(st.step<0?5:st.step)-1);renderSub();drawMap();return;}
    if(b.id==='kNext'){st.step=Math.min(4,st.step+1);renderSub();drawMap();return;}
    if(b.id==='kAll'){if(st.hide){st.step=4;}else st.step=-1;renderSub();drawMap();return;}
    if(d.st!==undefined&&!(st.hide&&+d.st>st.step)){st.step=+d.st===st.step&&!st.hide?-1:+d.st;renderSub();drawMap();return;}});
  root.addEventListener('mouseover',ev=>{const c=ev.target.closest('[data-pi]');if(!c||st.sub==='chk')return;const h={side:c.dataset.side,i:+c.dataset.pi};if(!st.hot||st.hot.side!==h.side||st.hot.i!==h.i){st.hot=h;drawMap();}});
  root.addEventListener('mouseout',ev=>{const c=ev.target.closest('[data-pi]');if(c&&!c.contains(ev.relatedTarget)&&st.hot){st.hot=null;drawMap();}});
  $('kGo').addEventListener('click',()=>setText($('kExpr').value));
  $('kExpr').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();setText($('kExpr').value);}});
  $('kBlank').addEventListener('click',()=>{const n=+$('kN').value;setText(BL.specText('F','ABCDEF'.slice(0,n).split(''),[],[]));});
  $('kImport').addEventListener('click',()=>{const T=H.getTT&&H.getTT();if(!T||T.err){showErr(T?T.err:'没有电路');return;}const o=T.outs[+$('kOut').value||0];if(!o)return;setSpec({name:o.name,vars:T.names,on:o.on,dc:[]});H.flash&&H.flash(`已导入「${o.name}」的真值表`);});
  $('kHide').addEventListener('change',ev=>{st.hide=ev.target.checked;st.step=st.hide?0:-1;st.sub=st.hide&&st.sub!=='chk'?'steps':st.sub==='steps'?'res':st.sub;render();});
  const runCheck=()=>{if(!st.A)return;st.chk=BL.check(st.A,$('kAns').value);renderChk();drawMap();};
  $('kAnsGo').addEventListener('click',runCheck);$('kAns').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();runCheck();}});
  const cv=$('kMap'),loc=ev=>{const r=cv.getBoundingClientRect();return [ev.clientX-r.left,ev.clientY-r.top];};
  cv.addEventListener('pointermove',ev=>{if(!st.L||!st.A)return;const m=st.L.hit(...loc(ev));if(m!==st.hover){st.hover=m;drawMap();}
    if(m<0){tip.hide();return;}const A=st.A,sd=A[st.mode],by=sd.P.filter(p=>cov(p,m,A.n));
    tip.show(`<b>m${m}</b> = ${bin(m,A.n)}　${A.names.map((v,i)=>`${esc(v)}=${(m>>(A.n-1-i))&1}`).join(' ')}<br>${esc(A.name)} = ${A.t[m]}${!st.hide&&A.konst===null&&by.length?`<br>在 ${by.map(p=>`P${p.i+1} ${esc(piTxt(p,st.mode))}`).join('、')} 里`:''}<br><span style="opacity:.7">点一下改成 ${A.t[m]===0?1:A.t[m]===1?'X':0}</span>`,ev.clientX,ev.clientY);});
  cv.addEventListener('pointerleave',()=>{tip.hide();if(st.hover>=0){st.hover=-1;drawMap();}});
  cv.addEventListener('click',ev=>{if(!st.L||!st.A)return;const m=st.L.hit(...loc(ev));if(m>=0){tip.hide();toggle(m);}});
  new ResizeObserver(()=>drawMap()).observe($('kMapWrap'));
  renderChk();setText($('kExpr').value);}
/* called when the tab becomes visible */
function show(){const T=H.getTT&&H.getTT(),sel=$('kOut');sel.innerHTML=T&&!T.err?T.outs.map((o,j)=>`<option value="${j}">${esc(o.name)}</option>`).join(''):'<option value="">（没有）</option>';
  $('kImport').disabled=!(T&&!T.err);render();}
return {init,show,draw,setText,setSpec,get state(){return st;}};
})();
