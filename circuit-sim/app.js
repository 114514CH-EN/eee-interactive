/* Circuit simulator UI: editor, drawing, scope, Bode, smart analysis. Needs common.js, simkit.js, engine.js. */
(()=>{
const K=SimKit,{fmtSI,parseSI,key,eq,route,segDist,clamp}=K,{LIB,LED_COL}=CE;
const PAL=['--amp','--blue','--green','--purple','--red','--accent'];
const STORE='eee-circuit-sim:last',SAMPLES=1000,RING=2000;

/* ================= state ================= */
let els=[],uid=1,net=null,sim=null,running=false,tool='s',sel=new Set(),view='scope',showV=false,showNames=true;
let sweepMode='auto',sweep=0.1,initMode='zero',curP='',errMsg='',flashIds=null,flashT=0,autoFit=true;
const V=new K.View({gu:28,min:6,max:64});
const newId=()=>uid++;
const hist=new K.History(()=>ser(els,true),s=>{els=carry(deser(s,true));sel=new Set([...sel].filter(id=>els.some(e=>e.id===id)));rebuild('topo');});

/* ================= element helpers ================= */
function mkEl(t,o={}){const L=LIB[t];const e={t,id:newId(),...JSON.parse(JSON.stringify(L.p||{})),...o};if(L.pre&&!e.name)e.name=autoName(L.pre,e);return e;}
function autoName(pre){const used=new Set(els.map(e=>e.name));let i=1;while(used.has(pre+i))i++;return pre+i;}
const KEEP=['t','a','b','x','y','rot','flip','name','showI'];
function ser(list,ids){return JSON.stringify({v:2,e:list.map(e=>{const o={};if(ids)o.id=e.id;KEEP.forEach(k=>{const v=e[k];if(v!==undefined&&v!==false&&v!==0&&v!=='')o[k]=v;});
  Object.keys(LIB[e.t].p||{}).forEach(k=>{if(e[k]!==undefined)o[k]=e[k];});return o;})});}
function deser(s,ids){const d=JSON.parse(s);const list=(d.e||[]).filter(o=>LIB[o.t]).map(o=>{const e={...JSON.parse(JSON.stringify(LIB[o.t].p||{})),...o};if(!ids||!e.id)e.id=newId();else uid=Math.max(uid,e.id+1);
    if(LIB[o.t].fp){e.x=+e.x||0;e.y=+e.y||0;e.rot=e.rot||0;}else{e.a=e.a||[0,0];e.b=e.b||e.a;}return e;});return list;}
const terms=e=>CE.terms(e);
const isTwo=e=>!!LIB[e.t].two,isFp=e=>!!LIB[e.t].fp,isOne=e=>!!LIB[e.t].one;
const nameOf=e=>e.name||LIB[e.t].n;

/* ================= build / solve ================= */
let traces=[],bufT=new Float64Array(RING),bufs=[],head=0,count=0;
function rebuild(kind){
  if(kind==='topo'||!net){els=CE.normalize(els,newId);net=CE.build(els);
    if(!sim){sim=new CE.Sim(net);sim.resetState(initMode);}else sim.setNet(net);
    flowGraph();makeTraces(false);}
  else sim.dirty();
  errMsg='';
  if(!running){const r=sim.refresh();if(r)errMsg=r.message==='singular'?singularMsg(r.row):'这个电路求不出解（非线性元件不收敛）。';}
  ana.dirty=true;bode.dirty=true;scheduleAuto();
  updateDiag();saveLocal();Lab.draw(1);}
function commit(){autoFit=false;if(hist.commit())syncUndo();}
function stepSafe(n,h){try{for(let i=0;i<n;i++){sim.step(h);record();}return true;}
  catch(e){running=false;errMsg=e.message==='singular'?singularMsg(e.row):e.message==='noconv'?'非线性元件没有收敛（电路可能没有确定的工作点），已暂停。':'数值溢出，已暂停：电路里可能有理想电压源直接给电容 / 电感充电的回路。';updateDiag();return false;}}
function singularMsg(row){if(row<net.N){const bad=net.comps.filter(e=>e.nodes.includes(row));flashIds=new Set(bad.map(e=>e.id));
    return `电路无解：${bad.map(nameOf).slice(0,4).join('、')} 所在的节点电压无法确定（悬空，或被电压源约束成矛盾）。`;}
  const e=net.comps.find(c=>c.br===row);if(e)flashIds=new Set([e.id]);return `电路无解：${e?nameOf(e):'某个电压源'} 和其他电压源 / 电流表形成冲突的回路。`;}
function prefill(){if(!sim||!net.N)return;const h=sweep/SAMPLES;stepSafe(Math.round(SAMPLES*1.5),h);}
function resetSim(){if(!sim)return;sim.resetState(initMode);clearBufs();prefill();Lab.draw(1);}

/* ---------- traces / ring buffer ---------- */
function makeTraces(clear){const old=new Map(traces.map((t,i)=>[t.id,bufs[i]]));const T=[];let ci=0;
  els.filter(e=>e.t==='P').forEach(e=>T.push({id:'P'+e.id,name:e.name||'探针',unit:'V',col:PAL[ci++%PAL.length],el:e,get:()=>sim.V(sim.x,e.nodes[0])}));
  els.filter(e=>e.t==='VM'&&e.sc).forEach(e=>T.push({id:'VM'+e.id,name:e.name,unit:'V',col:PAL[ci++%PAL.length],el:e,get:()=>sim.V(sim.x,e.nodes[1])-sim.V(sim.x,e.nodes[0])}));
  els.filter(e=>(e.t==='AM'&&e.sc)||(e.showI&&e.t!=='AM'&&!isOne(e)&&e.t!=='w')).forEach(e=>T.push({id:'I'+e.id,name:'I('+nameOf(e)+')',unit:'A',col:PAL[ci++%PAL.length],el:e,get:()=>isTwo(e)?e.i:(e.ti?e.ti[0]:0)}));
  traces=T;bufs=T.map(t=>!clear&&old.has(t.id)?old.get(t.id):new Float64Array(RING));if(clear){head=0;count=0;}}
function clearBufs(){makeTraces(true);}
function record(){bufT[head]=sim.t;for(let j=0;j<traces.length;j++){const v=traces[j].get();bufs[j][head]=Number.isFinite(v)?v:0;}head=(head+1)%RING;count=Math.min(count+1,RING);}

/* ---------- wire current flow (for the moving dots) ---------- */
let wireOrder=[];
function flowGraph(){const adj=new Map();els.filter(e=>e.t==='w').forEach(w=>{const a=key(w.a),b=key(w.b);if(!adj.has(a))adj.set(a,[]);if(!adj.has(b))adj.set(b,[]);adj.get(a).push([b,w]);adj.get(b).push([a,w]);});
  const seen=new Set();wireOrder=[];for(const s of adj.keys()){if(seen.has(s))continue;seen.add(s);const q=[s];wireOrder.push([s,null,null]);
    while(q.length){const p=q.shift();for(const [nb,w] of adj.get(p)){if(seen.has(nb))continue;seen.add(nb);wireOrder.push([nb,p,w]);q.push(nb);}}}}
function wireCurrents(){const inj=new Map(),add=(k,v)=>inj.set(k,(inj.get(k)||0)+v);
  for(const e of net.comps){if(!e.ti)continue;terms(e).forEach((p,k)=>add(key(p),-(e.ti[k]||0)));}
  for(let i=wireOrder.length-1;i>=0;i--){const [p,par,w]=wireOrder[i];if(!w)continue;const fl=inj.get(p)||0;w.i=key(w.a)===p?fl:-fl;add(par,fl);}}

/* ================= auto time base from poles and source frequencies ================= */
const SW=[];[1e-5,1e-4,1e-3,1e-2,1e-1,1].forEach(d=>[1,2,5].forEach(m=>SW.push(+(d*m).toPrecision(2))));SW.push(10);
let autoT=0;function scheduleAuto(){clearTimeout(autoT);autoT=setTimeout(()=>{if(sweepMode==='auto'){const s=suggestSweep();if(s&&s!==sweep){sweep=s;clearBufs();if(!running){sim.resetState(initMode);prefill();}}}syncBar();Lab.draw(1);},60);}
function keepState(fn){const save=net.comps.map(e=>({st:{...e.st},i:e.i,ti:e.ti&&e.ti.slice(),p:e.p}));try{return fn();}finally{net.comps.forEach((e,i)=>{e.st=save[i].st;e.i=save[i].i;e.ti=save[i].ti;e.p=save[i].p;});sim.op=null;}}
function suggestSweep(){if(!net||!net.comps.length)return sweep;let poles=[];try{poles=keepState(()=>sim.poles().list);}catch(e){}
  const stable=poles.filter(p=>p[0]<-1e-9),slow=stable.length?Math.min(...stable.map(p=>-p[0])):0;
  const fs=net.comps.filter(e=>(e.t==='A'||e.t==='Q')&&e.f>0).map(e=>e.f),fmin=fs.length?Math.min(...fs):0;
  const osc=stable.filter(p=>p[1]>0).map(p=>2*Math.PI/p[1]);let want;
  const settle=slow?5/slow:0;
  if(fmin){const base=3/fmin;want=settle>base&&settle<12*base?settle:base;}
  else if(settle){want=settle;if(osc.length)want=Math.max(want,3*Math.max(...osc));}
  else want=0.01;
  return SW.find(v=>v>=want*0.98)||SW[SW.length-1];}

/* ================= diagnostics ================= */
let runDiag=[];
function updateDiag(){runDiag=[];if(!net)return;const d=[];
  if(errMsg)d.push({lv:'err',msg:errMsg,ids:flashIds?[...flashIds]:[]});
  for(const e of net.comps){
    if(e.t==='OA'&&e.st&&e.st.reg)d.push({lv:'info',msg:`${nameOf(e)} 输出饱和在 ${e.st.reg>0?'+':'−'}${fmtSI(e.vsat,'V')}（开环比较器、正反馈或增益太大时会这样）。`,ids:[e.id]});
    if(e.t==='LED'&&Math.abs(e.i||0)>0.03)d.push({lv:'warn',msg:`${nameOf(e)} 电流 ${fmtSI(e.i,'A')}，超过一般 LED 的 30 mA 上限，需要更大的限流电阻。`,ids:[e.id]});
    if(e.t==='LED'&&(e.vs!==undefined)&&false){}
    if(e.t==='R'&&Math.abs(e.p||0)>0.25)d.push({lv:'warn',msg:`${nameOf(e)} 功耗 ${fmtSI(e.p,'W')}，超过 ¼ W 电阻的额定功率。`,ids:[e.id]});
    if(e.t==='LMP'&&(e.p||0)>e.pr*1.3)d.push({lv:'warn',msg:`${nameOf(e)} 功率 ${fmtSI(e.p,'W')}，超过额定 ${fmtSI(e.pr,'W')}，灯丝会烧断。`,ids:[e.id]});}
  runDiag=d;renderDiag();}
function renderDiag(){const all=[...runDiag,...(net?net.diags:[])],ic={err:'✖',warn:'⚠',info:'ℹ'};
  const h=all.map((d,i)=>`<li class="${d.lv}" data-i="${i}">${ic[d.lv]} ${esc(d.msg)}</li>`).join('');if($('diag').innerHTML!==h){$('diag').innerHTML=h;$('diag')._all=all;}}
$('diag').addEventListener('click',ev=>{const li=ev.target.closest('li');if(!li)return;const d=$('diag')._all[+li.dataset.i];if(!d)return;sel=new Set(d.ids);flashIds=new Set(d.ids);flashT=performance.now();renderProps();Lab.draw(1);});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ================= drawing ================= */
let schCtx=null,SW_=0,SH_=0,drawQueued=false;
function scheduleDraw(){if(drawQueued)return;drawQueued=true;requestAnimationFrame(()=>{drawQueued=false;drawSch();});}
function mix(a,b,r){const h=c=>{c=c.trim();if(c[0]==='#'){if(c.length===4)c='#'+[...c.slice(1)].map(x=>x+x).join('');return [1,3,5].map(i=>parseInt(c.slice(i,i+2),16));}const m=c.match(/\d+/g);return m?m.slice(0,3).map(Number):[128,128,128];};
  const A=h(a),B=h(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*r)).join(',')})`;}
let vmax=1;function vcol(v){if(!Number.isFinite(v))return css('--muted');const r=clamp(v/(vmax||1),-1,1);return r>0.04?mix(css('--muted'),css('--green'),r):r<-0.04?mix(css('--muted'),css('--red'),-r):css('--muted');}
const nodeV=n=>sim&&n!==undefined?sim.V(sim.x,n):0;
function bbox(list=els){let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;list.forEach(e=>{const pts=terms(e);if(isFp(e))pts.push(...fpOutline(e));pts.forEach(([x,y])=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);});});
  return isFinite(x0)?[x0-1.5,y0-1.5,x1+2.8,y1+1.5]:[0,0,20,12];}
function fpOutline(e){const box={OA:[[0,-1.7],[4,1.7]],NPN:[[0,-2],[2.4,2]],XF:[[0,-1.3],[4,1.3]],POT:[[0,-2],[4,0.4]],SW2:[[0,-1.2],[3,1.2]]}[e.t];
  return [[box[0][0],box[0][1]],[box[1][0],box[0][1]],[box[1][0],box[1][1]],[box[0][0],box[1][1]]].map(([dx,dy])=>{const [x,y]=CE.rotPt(dx,dy,e.rot,e.flip);return [e.x+x,e.y+y];});}
function fitView(){const c=$('sch');const W=c.getBoundingClientRect().width||600,H=+c.dataset.h||440;V.fit(bbox(),W,H,20,window.EMBED_LAB?26:34);}

function drawSch(){const c=$('sch');const wide=(c.getBoundingClientRect().width||600)>=620;c.dataset.h=window.EMBED_LAB?300:wide?440:360;
  const [g,W,H]=fit(c);schCtx=g;SW_=W;SH_=H;const gu=V.gu,P=p=>[V.sx(p[0]),V.sy(p[1])];
  /* grid */
  const step=gu<10?2:1,x0=Math.floor(V.wx(0)),x1=Math.ceil(V.wx(W)),y0=Math.floor(V.wy(0)),y1=Math.ceil(V.wy(H));g.fillStyle=css('--grid');
  for(let i=x0;i<=x1;i++){if(i%step)continue;for(let j=y0;j<=y1;j++){if(j%step)continue;g.fillRect(V.sx(i)-1,V.sy(j)-1,2,2);}}
  if(!net)return;
  vmax=Math.max(1,...net.comps.map(e=>Math.max(...e.nodes.map(n=>Math.abs(nodeV(n))))));
  if(running||sim.t>0)wireCurrents();
  const imax=Math.max(1e-9,...els.map(e=>Math.abs(e.t==='w'?(e.i||0):isTwo(e)?(e.i||0):0)));
  const flash=flashIds&&performance.now()-flashT<2400?flashIds:null;
  /* wires */
  for(const e of els){if(e.t!=='w')continue;const A=P(e.a),B=P(e.b),s=sel.has(e.id);
    if(flash&&flash.has(e.id)){g.strokeStyle=css('--red');g.globalAlpha=.35;g.lineWidth=10;g.beginPath();g.moveTo(...A);g.lineTo(...B);g.stroke();g.globalAlpha=1;}
    g.strokeStyle=s?css('--accent'):vcol(nodeV(e.node));g.lineWidth=s?4:2.6;g.lineCap='round';g.beginPath();g.moveTo(...A);g.lineTo(...B);g.stroke();
    dots(g,A,B,e,imax,gu);}
  /* components */
  for(const e of els){if(e.t==='w')continue;const s=sel.has(e.id);
    if(flash&&flash.has(e.id))halo(g,e);
    if(isFp(e))drawFp(g,e,s);else if(isOne(e))drawOne(g,e,s);else{drawTwo(g,e,P(e.a),P(e.b),s);dots(g,P(e.a),P(e.b),e,imax,gu);}}
  /* junction dots */
  const cnt=new Map();els.forEach(e=>{if(e.t==='P'||e.t==='G')return;terms(e).forEach(p=>{const k=key(p);cnt.set(k,(cnt.get(k)||0)+1);});});
  g.fillStyle=css('--ink');cnt.forEach((n,k)=>{if(n>=3){const [x,y]=k.split(',').map(Number);g.beginPath();g.arc(V.sx(x),V.sy(y),Math.max(2.5,gu*0.12),0,7);g.fill();}});
  /* open terminals */
  cnt.forEach((n,k)=>{if(n===1){const [x,y]=k.split(',').map(Number);g.strokeStyle=css('--muted');g.lineWidth=1.2;g.beginPath();g.arc(V.sx(x),V.sy(y),Math.max(2.5,gu*0.1),0,7);g.stroke();}});
  if(showV)voltLabels(g);
  /* interaction overlays */
  if(drag&&drag.kind==='draw'&&drag.to){const pts=drag.tool==='w'?route(drag.from,drag.to,drag.vFirst):[drag.from,drag.to];g.strokeStyle=css('--accent');g.setLineDash([5,4]);g.lineWidth=2;g.beginPath();pts.forEach((p,i)=>{const q=P(p);i?g.lineTo(...q):g.moveTo(...q);});g.stroke();g.setLineDash([]);
    if(drag.tool!=='w'&&!eq(drag.from,drag.to)){g.globalAlpha=.6;drawTwo(g,ghostEl(drag.tool,{a:drag.from,b:drag.to}),P(drag.from),P(drag.to),false,true);g.globalAlpha=1;}}
  if(drag&&drag.kind==='box'){const [ax,ay]=drag.p0,[bx,by]=drag.p1;g.strokeStyle=css('--accent');g.fillStyle=css('--shade');g.setLineDash([4,3]);g.lineWidth=1;g.fillRect(Math.min(ax,bx),Math.min(ay,by),Math.abs(bx-ax),Math.abs(by-ay));g.strokeRect(Math.min(ax,bx),Math.min(ay,by),Math.abs(bx-ax),Math.abs(by-ay));g.setLineDash([]);}
  if(hover&&!drag&&tool!=='s'&&tool!=='x'&&tool!=='pan'){const L=LIB[tool];g.globalAlpha=.4;
    if(L.fp)drawFp(g,ghostEl(tool,{x:hover[0],y:hover[1],rot:ghostRot}),false,true);else if(L.one)drawOne(g,ghostEl(tool,{a:hover}),false,true);
    else if(tool!=='w'){const b=CE.rotPt(3,0,ghostRot);drawTwo(g,ghostEl(tool,{a:hover,b:[hover[0]+b[0],hover[1]+b[1]]}),P(hover),P([hover[0]+b[0],hover[1]+b[1]]),false,true);}
    g.globalAlpha=1;g.strokeStyle=css('--accent');g.lineWidth=1.5;g.beginPath();g.arc(V.sx(hover[0]),V.sy(hover[1]),Math.max(4,gu*0.18),0,7);g.stroke();}
  text(g,`t = ${fmtSI(sim.t,'s')}`,W-8,H-8,css('--muted'),11,'right');
  if(!els.length)text(g,'空电路：选一个工具在网格上拖动放元件，或点上面的预设',W/2,H/2,css('--muted'),13,'center');}
function ghostEl(t,o){return {t,...JSON.parse(JSON.stringify(LIB[t].p||{})),...o,nodes:[],st:{}};}
let ghostRot=0;
function halo(g,e){const pts=terms(e).map(p=>[V.sx(p[0]),V.sy(p[1])]);g.strokeStyle=css('--red');g.globalAlpha=.3;g.lineWidth=Math.max(10,V.gu*0.6);g.lineCap='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));if(pts.length===1)g.lineTo(pts[0][0]+0.1,pts[0][1]);g.stroke();g.globalAlpha=1;}
function dots(g,A,B,e,imax,gu){if(!running)return;const i=e.i||0;if(Math.abs(i)<imax*0.02||Math.abs(i)<1e-9)return;const L=Math.hypot(B[0]-A[0],B[1]-A[1]);if(L<2)return;
  const ux=(B[0]-A[0])/L,uy=(B[1]-A[1])/L,sp=gu*0.7,off=(((e.ph||0)%sp)+sp)%sp;g.fillStyle=css('--amp');for(let s=off;s<L;s+=sp){g.beginPath();g.arc(A[0]+ux*s,A[1]+uy*s,Math.max(1.8,gu*0.075),0,7);g.fill();}}
function voltLabels(g){const seen=new Set();g.font=`600 ${clamp(V.gu*0.38,9,12)}px ${css('--mono')}`;
  els.forEach(e=>{const pts=terms(e);(e.t==='w'?[e.a]:pts).forEach((p,k)=>{const n=e.t==='w'?e.node:e.nodes&&e.nodes[k];if(n===undefined||n<0||seen.has(n))return;seen.add(n);
    const s=fmtSI(nodeV(n),'V'),w=g.measureText(s).width+8,x=V.sx(p[0])+4,y=V.sy(p[1])-V.gu*0.35-12;g.fillStyle=css('--panel');g.globalAlpha=.88;g.fillRect(x,y,w,15);g.globalAlpha=1;g.strokeStyle=vcol(nodeV(n));g.lineWidth=1;g.strokeRect(x,y,w,15);g.fillStyle=css('--ink');g.fillText(s,x+4,y+11.5);});});}

/* ---- two-terminal symbols, drawn in a local frame along a→b ---- */
function drawTwo(g,e,A,B,isSel,ghost){const L=Math.hypot(B[0]-A[0],B[1]-A[1]);if(L<1)return;const u=V.gu,ink=isSel?css('--accent'):css('--ink');
  const va=ghost?0:nodeV(e.nodes&&e.nodes[0]),vb=ghost?0:nodeV(e.nodes&&e.nodes[1]);
  const s=Math.min(L-4,u*(e.t==='w'?0:1.7)),ang=Math.atan2(B[1]-A[1],B[0]-A[0]);
  g.save();g.translate((A[0]+B[0])/2,(A[1]+B[1])/2);g.rotate(ang);g.lineCap='round';g.lineJoin='round';
  const lead=(x0,x1,v)=>{g.strokeStyle=ghost?css('--muted'):vcol(v);g.lineWidth=2.6;g.beginPath();g.moveTo(x0,0);g.lineTo(x1,0);g.stroke();};
  const body=e.t==='VM'||e.t==='AM'||e.t==='I'||e.t==='A'||e.t==='Q'||e.t==='LMP'?u*0.5:s/2;
  lead(-L/2,-body,va);lead(body,L/2,vb);
  g.strokeStyle=ink;g.fillStyle=ink;g.lineWidth=isSel?3:2;const h=u*0.27;
  switch(e.t){
    case 'R':g.fillStyle=css('--panel');g.fillRect(-s/2,-h,s,2*h);g.strokeRect(-s/2,-h,s,2*h);break;
    case 'C':{const d=u*0.13;g.beginPath();g.moveTo(-s/2,0);g.lineTo(-d,0);g.moveTo(d,0);g.lineTo(s/2,0);g.moveTo(-d,-h*1.9);g.lineTo(-d,h*1.9);g.moveTo(d,-h*1.9);g.lineTo(d,h*1.9);g.stroke();break;}
    case 'L':{const n=4,r=s/n/2;g.beginPath();g.moveTo(-s/2,0);for(let i=0;i<n;i++){const c0=-s/2+r*(2*i+1);for(let k=0;k<=12;k++){const th=Math.PI-Math.PI*k/12;g.lineTo(c0+r*Math.cos(th),-r*Math.sin(th)*1.15);}}g.stroke();break;}
    case 'V':{const d=u*0.1;g.beginPath();g.moveTo(-s/2,0);g.lineTo(-d,0);g.moveTo(d,0);g.lineTo(s/2,0);g.moveTo(-d,-h*1.1);g.lineTo(-d,h*1.1);g.stroke();g.lineWidth=isSel?3:2;g.beginPath();g.moveTo(d,-h*2);g.lineTo(d,h*2);g.stroke();
      g.save();g.rotate(-ang);const [px,py]=rotv(d+u*0.28,-h*2.2,ang);g.font=`700 ${clamp(u*0.42,10,15)}px ${css('--mono')}`;g.textAlign='center';g.fillText('+',px,py+4);g.restore();break;}
    case 'I':case 'A':case 'Q':case 'VM':case 'AM':case 'LMP':{const r=u*0.5;
      if(e.t==='LMP'&&!ghost){const b=clamp((e.p||0)/e.pr,0,1.3);if(b>0.02){const gr=g.createRadialGradient(0,0,r*0.2,0,0,r*2.2);gr.addColorStop(0,'rgba(255,214,90,'+Math.min(0.9,b)+')');gr.addColorStop(1,'rgba(255,214,90,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,r*2.2,0,7);g.fill();}}
      g.fillStyle=css('--panel');g.beginPath();g.arc(0,0,r,0,7);g.fill();g.stroke();g.fillStyle=ink;
      if(e.t==='I'){g.beginPath();g.moveTo(-r*0.55,0);g.lineTo(r*0.45,0);g.stroke();g.beginPath();g.moveTo(r*0.6,0);g.lineTo(r*0.2,-r*0.28);g.lineTo(r*0.2,r*0.28);g.closePath();g.fill();}
      else if(e.t==='A'){g.beginPath();for(let k=0;k<=24;k++){const q=k/24,w=e.wave==='tri'?(q<0.25?4*q:q<0.75?2-4*q:4*q-4):e.wave==='saw'?(2*((q+0.5)%1)-1):Math.sin(2*Math.PI*q);g.lineTo(-r*0.62+1.24*r*q,-w*r*0.42);}g.stroke();plusSign(g,r,ang,ink,u);}
      else if(e.t==='Q'){g.beginPath();g.moveTo(-r*0.6,r*0.32);g.lineTo(-r*0.6,-r*0.32);g.lineTo(0,-r*0.32);g.lineTo(0,r*0.32);g.lineTo(r*0.6,r*0.32);g.lineTo(r*0.6,-r*0.32);g.stroke();plusSign(g,r,ang,ink,u);}
      else if(e.t==='LMP'){g.beginPath();const k=r*0.7;g.moveTo(-k,-k);g.lineTo(k,k);g.moveTo(-k,k);g.lineTo(k,-k);g.stroke();}
      else{g.save();g.rotate(-ang);g.font=`700 ${clamp(u*0.5,10,17)}px ${css('--body')}`;g.textAlign='center';g.textBaseline='middle';g.fillText(e.t==='VM'?'V':'A',0,1);g.restore();
        if(e.t==='VM')plusSign(g,r,ang,ink,u);else{g.beginPath();g.moveTo(r+u*0.15,-r*0.75);g.lineTo(r+u*0.5,-r*0.75);g.stroke();g.beginPath();g.moveTo(r+u*0.6,-r*0.75);g.lineTo(r+u*0.42,-r*0.88);g.lineTo(r+u*0.42,-r*0.62);g.closePath();g.fill();}}
      break;}
    case 'D':case 'Z':case 'LED':{const d=u*0.32;
      if(e.t==='LED'&&!ghost){const b=clamp((e.i||0)/0.02,0,1.5);if(b>0.03){const col=(LED_COL[e.col]||LED_COL.red).c,gr=g.createRadialGradient(0,0,d*0.3,0,0,d*3);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=Math.min(1,0.25+0.6*b);g.fillStyle=gr;g.beginPath();g.arc(0,0,d*3,0,7);g.fill();g.globalAlpha=1;}}
      g.beginPath();g.moveTo(-s/2,0);g.lineTo(s/2,0);g.stroke();g.fillStyle=e.t==='LED'?(LED_COL[e.col]||LED_COL.red).c:ink;g.beginPath();g.moveTo(-d,-d);g.lineTo(-d,d);g.lineTo(d,0);g.closePath();g.fill();g.strokeStyle=ink;g.stroke();
      g.beginPath();g.moveTo(d,-d);g.lineTo(d,d);if(e.t==='Z'){g.moveTo(d,-d);g.lineTo(d-d*0.45,-d*1.2);g.moveTo(d,d);g.lineTo(d+d*0.45,d*1.2);}g.stroke();
      if(e.t==='LED'){for(const o of [-0.1,0.45]){g.beginPath();g.moveTo(d*o,-d*1.2);g.lineTo(d*o+d*0.7,-d*2);g.stroke();g.beginPath();g.moveTo(d*o+d*0.8,-d*2.1);g.lineTo(d*o+d*0.35,-d*1.95);g.lineTo(d*o+d*0.62,-d*1.6);g.closePath();g.fill();}}
      break;}
    case 'S':{const d=s*0.32;g.beginPath();g.moveTo(-s/2,0);g.lineTo(-d,0);g.moveTo(d,0);g.lineTo(s/2,0);g.stroke();g.beginPath();g.arc(-d,0,2.6,0,7);g.arc(d,0,2.6,0,7);g.fill();
      g.beginPath();g.moveTo(-d,0);const ang2=e.on?0:-0.55;g.lineTo(-d+Math.cos(ang2)*2*d,Math.sin(ang2)*2*d);g.lineWidth=2.6;g.stroke();break;}
  }
  g.restore();
  if(!ghost&&showNames&&e.t!=='w')twoLabel(g,e,A,B,s);}
function rotv(x,y,ang){/* screen offset for a local point, un-rotated */const c=Math.cos(ang),s=Math.sin(ang);return [x*c-y*s,x*s+y*c].map((v,i)=>v);}
function plusSign(g,r,ang,ink,u){g.save();g.rotate(-ang);const c=Math.cos(ang),s=Math.sin(ang),lx=r+u*0.22,ly=-r*0.8,px=lx*c-ly*s,py=lx*s+ly*c;g.fillStyle=ink;g.font=`700 ${clamp(u*0.42,10,15)}px ${css('--mono')}`;g.textAlign='center';g.textBaseline='middle';g.fillText('+',px,py);g.restore();}
function valText(e){switch(e.t){case 'R':return fmtSI(e.v,'Ω');case 'C':return fmtSI(e.v,'F');case 'L':return fmtSI(e.v,'H');case 'V':return fmtSI(e.v,'V');case 'I':return fmtSI(e.v,'A');
  case 'A':return `${fmtSI(e.v,'V')}${e.wave==='tri'?' △':e.wave==='saw'?' ⟋':' ~'} ${fmtSI(e.f,'Hz')}${e.off?' +'+fmtSI(e.off,'V'):''}`;case 'Q':return `${fmtSI(e.lo||0,'V')}/${fmtSI(e.v,'V')} ${fmtSI(e.f,'Hz')}`;
  case 'Z':return 'Vz '+fmtSI(e.vz,'V');case 'LED':return (LED_COL[e.col]||LED_COL.red).n;case 'S':return e.on?'闭合':'断开';case 'LMP':return `${fmtSI(e.vr,'V')} ${fmtSI(e.pr,'W')}`;
  case 'VM':return fmtSI(nodeV(e.nodes&&e.nodes[1])-nodeV(e.nodes&&e.nodes[0]),'V');case 'AM':return fmtSI(e.i||0,'A');}return '';}
function twoLabel(g,e,A,B,s){const horiz=Math.abs(B[0]-A[0])>=Math.abs(B[1]-A[1]),cx=(A[0]+B[0])/2,cy=(A[1]+B[1])/2,u=V.gu,fs=clamp(u*0.36,9,13);
  const nm=e.name||'',vt=valText(e),meter=e.t==='VM'||e.t==='AM';
  g.font=`600 ${fs}px ${css('--mono')}`;const off=u*(meter||'IAQLMP'.includes(e.t)&&e.t!=='L'?0.78:0.55);
  if(horiz){g.textAlign='center';if(nm){g.fillStyle=css('--muted');g.fillText(nm,cx,cy-off-3);}if(vt){g.fillStyle=meter?css('--accent'):css('--ink');g.fillText(vt,cx,cy+off+fs);}}
  else{g.textAlign='left';if(nm){g.fillStyle=css('--muted');g.fillText(nm,cx+off+2,cy-3);}if(vt){g.fillStyle=meter?css('--accent'):css('--ink');g.fillText(vt,cx+off+2,cy+fs);}}
  g.textAlign='left';}

function drawOne(g,e,isSel,ghost){const X=V.sx(e.a[0]),Y=V.sy(e.a[1]),u=V.gu;g.lineWidth=2;
  if(e.t==='G'){g.strokeStyle=isSel?css('--accent'):css('--ink');g.beginPath();g.moveTo(X,Y);g.lineTo(X,Y+u*0.35);[0.42,0.28,0.13].forEach((w,k)=>{g.moveTo(X-u*w,Y+u*(0.35+k*0.15));g.lineTo(X+u*w,Y+u*(0.35+k*0.15));});g.stroke();return;}
  /* probe */const j=els.filter(q=>q.t==='P').indexOf(e),col=css(PAL[(j<0?0:j)%PAL.length]);g.fillStyle=col;g.beginPath();g.arc(X,Y,Math.max(4,u*0.22),0,7);g.fill();if(isSel){g.strokeStyle=css('--ink');g.lineWidth=2.5;g.stroke();}
  if(!ghost&&showNames){g.font=`700 ${clamp(u*0.4,10,14)}px ${css('--mono')}`;g.fillStyle=col;g.fillText(e.name||'P',X+u*0.3,Y-u*0.3);}}

/* ---- footprint symbols in local (rotated / mirrored) coordinates ---- */
function drawFp(g,e,isSel,ghost){const u=V.gu,ink=isSel?css('--accent'):css('--ink'),pv=k=>ghost?0:nodeV(e.nodes&&e.nodes[k]);
  g.save();g.translate(V.sx(e.x),V.sy(e.y));g.rotate((e.rot||0)*Math.PI/2);if(e.flip)g.scale(1,-1);g.lineCap='round';g.lineJoin='round';
  const L=(x0,y0,x1,y1,v)=>{g.strokeStyle=ghost?css('--muted'):vcol(v);g.lineWidth=2.6;g.beginPath();g.moveTo(x0*u,y0*u);g.lineTo(x1*u,y1*u);g.stroke();};
  const ln=(pts,w=2)=>{g.strokeStyle=ink;g.lineWidth=isSel?w+1:w;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x*u,y*u):g.moveTo(x*u,y*u));g.stroke();};
  switch(e.t){
    case 'OA':L(0,-1,0.6,-1,pv(0));L(0,1,0.6,1,pv(1));L(3.4,0,4,0,pv(2));g.fillStyle=css('--panel');g.beginPath();g.moveTo(0.6*u,-1.6*u);g.lineTo(3.4*u,0);g.lineTo(0.6*u,1.6*u);g.closePath();g.fill();ln([[0.6,-1.6],[3.4,0],[0.6,1.6],[0.6,-1.6]]);
      ln([[0.85,-1],[1.25,-1]]);ln([[0.85,1],[1.25,1]]);ln([[1.05,0.8],[1.05,1.2]]);
      if(!ghost&&e.st&&e.st.reg){g.fillStyle=css('--red');g.beginPath();g.arc(2.9*u,0,u*0.1,0,7);g.fill();}break;
    case 'NPN':L(0,0,0.75,0,pv(0));L(2,-2,2,-1.1,pv(1));L(2,1.1,2,2,pv(2));g.fillStyle=css('--panel');g.beginPath();g.arc(1.3*u,0,1.05*u,0,7);g.fill();g.strokeStyle=ink;g.lineWidth=1.5;g.stroke();
      ln([[0.75,-0.6],[0.75,0.6]],3);ln([[0.75,-0.25],[2,-1.1]]);ln([[0.75,0.25],[2,1.1]]);
      {const ax=2,ay=1.1,ang=Math.atan2(0.85,1.25);g.fillStyle=ink;g.beginPath();g.moveTo(ax*u,ay*u);g.lineTo(ax*u-Math.cos(ang-0.4)*u*0.38,ay*u-Math.sin(ang-0.4)*u*0.38);g.lineTo(ax*u-Math.cos(ang+0.4)*u*0.38,ay*u-Math.sin(ang+0.4)*u*0.38);g.closePath();g.fill();}break;
    case 'XF':L(0,-1,1.3,-1,pv(0));L(0,1,1.3,1,pv(1));L(2.7,-1,4,-1,pv(2));L(2.7,1,4,1,pv(3));
      for(const [cx,dir] of [[1.3,1],[2.7,-1]]){g.strokeStyle=ink;g.lineWidth=isSel?3:2;g.beginPath();const n=4,r=2/n/2;for(let i=0;i<n;i++){const c0=-1+r*(2*i+1);for(let k=0;k<=10;k++){const th=-Math.PI/2+Math.PI*k/10;g.lineTo((cx+dir*Math.cos(th)*r*1.2)*u,(c0+Math.sin(th)*r)*u);}}g.stroke();}
      ln([[1.88,-1.15],[1.88,1.15]]);ln([[2.12,-1.15],[2.12,1.15]]);g.fillStyle=ink;[[1.05,-1.25],[2.95,-1.25]].forEach(([x,y])=>{g.beginPath();g.arc(x*u,y*u,u*0.08,0,7);g.fill();});break;
    case 'POT':L(0,0,0.8,0,pv(0));L(3.2,0,4,0,pv(1));L(2,-2,2,-0.75,pv(2));g.fillStyle=css('--panel');g.fillRect(0.8*u,-0.27*u,2.4*u,0.54*u);g.strokeStyle=ink;g.lineWidth=isSel?3:2;g.strokeRect(0.8*u,-0.27*u,2.4*u,0.54*u);
      {const wx=0.8+2.4*clamp(e.pos??0.5,0,1);ln([[2,-0.75],[wx,-0.75],[wx,-0.42]]);g.fillStyle=ink;g.beginPath();g.moveTo(wx*u,-0.28*u);g.lineTo((wx-0.15)*u,-0.5*u);g.lineTo((wx+0.15)*u,-0.5*u);g.closePath();g.fill();}break;
    case 'SW2':L(0,0,0.7,0,pv(0));L(2.3,-1,3,-1,pv(1));L(2.3,1,3,1,pv(2));g.fillStyle=ink;[[0.7,0],[2.3,-1],[2.3,1]].forEach(([x,y])=>{g.beginPath();g.arc(x*u,y*u,2.8,0,7);g.fill();});
      ln([[0.7,0],[2.25,e.pos?0.88:-0.88]],2.6);break;
  }
  g.restore();
  if(!ghost&&showNames){const ol=fpOutline(e),xs=ol.map(p=>V.sx(p[0])),ys=ol.map(p=>V.sy(p[1])),fs=clamp(u*0.36,9,13);g.font=`600 ${fs}px ${css('--mono')}`;
    const tx=Math.max(...xs)+3,ty=Math.min(...ys)+fs;g.fillStyle=css('--muted');g.fillText(e.name||'',tx,ty);g.fillStyle=css('--ink');
    const vt=e.t==='OA'?(e.st&&e.st.reg?'饱和':''):e.t==='NPN'?'β='+e.bf:e.t==='XF'?`1 : ${+e.n.toPrecision(3)}`:e.t==='POT'?`${fmtSI(e.v,'Ω')} ${Math.round((e.pos??0.5)*100)}%`:e.t==='SW2'?`→${e.pos?2:1}`:'';
    if(vt)g.fillText(vt,tx,ty+fs+2);}}

/* ================= hit testing ================= */
const ptr=ev=>{const r=$('sch').getBoundingClientRect();return [ev.clientX-r.left,ev.clientY-r.top];};
const snap=([px,py])=>[Math.round(V.wx(px)),Math.round(V.wy(py))];
function hitTest([px,py]){const wx=V.wx(px),wy=V.wy(py);let best=null,bd=0.42;
  for(let i=els.length-1;i>=0;i--){const e=els[i];let d;
    if(isOne(e))d=Math.hypot(wx-e.a[0],wy-e.a[1])-0.05;
    else if(isFp(e)){const ol=fpOutline(e),xs=ol.map(p=>p[0]),ys=ol.map(p=>p[1]);d=wx>=Math.min(...xs)&&wx<=Math.max(...xs)&&wy>=Math.min(...ys)&&wy<=Math.max(...ys)?0.05:9;}
    else{d=segDist(wx,wy,e.a,e.b);if(e.t!=='w')d-=0.12;}
    if(d<bd){bd=d;best=e;}}
  return best;}
function nearEnd(e,[px,py]){if(!isTwo(e))return -1;const wx=V.wx(px),wy=V.wy(py);if(Math.hypot(wx-e.a[0],wy-e.a[1])<0.32)return 0;if(Math.hypot(wx-e.b[0],wy-e.b[1])<0.32)return 1;return -1;}

/* ================= editing operations ================= */
function addEl(e){els.push(e);return e;}
function deleteSel(){if(!sel.size)return;els=els.filter(e=>!sel.has(e.id));sel.clear();rebuild('topo');commit();renderProps();}
function rotPoint([x,y],[cx,cy]){return [cx-(y-cy),cy+(x-cx)];}
function rotateSel(){if(!sel.size){ghostRot=(ghostRot+1)%4;scheduleDraw();return;}const list=els.filter(e=>sel.has(e.id));let fn;
  if(list.length===1&&isTwo(list[0]))fn=e=>{e.b=rotPoint(e.b,e.a);};
  else if(list.length===1&&isFp(list[0]))fn=e=>{e.rot=((e.rot||0)+1)%4;};
  else{const b=bbox(list),c=[Math.round((b[0]+b[2])/2),Math.round((b[1]+b[3])/2)];fn=e=>{if(isFp(e)){[e.x,e.y]=rotPoint([e.x,e.y],c);e.rot=((e.rot||0)+1)%4;}else{e.a=rotPoint(e.a,c);if(isTwo(e))e.b=rotPoint(e.b,c);}};}
  els=transformSel(ser(els,true),new Set(sel),fn);rebuild('topo');commit();}
function flipSel(){if(!sel.size)return;els=transformSel(ser(els,true),new Set(sel),e=>{if(isTwo(e)){const t=e.a;e.a=e.b;e.b=t;}else if(isFp(e))e.flip=!e.flip;});rebuild('topo');commit();}
let clip=null;
function copySel(){const list=els.filter(e=>sel.has(e.id));if(list.length)clip=ser(list,false);}
function paste(at){if(!clip)return;const list=deser(clip,false),b=bbox(list),dx=at?at[0]-Math.round(b[0]+1):2,dy=at?at[1]-Math.round(b[1]+1.2):2;
  list.forEach(e=>{if(isFp(e)){e.x+=dx;e.y+=dy;}else{e.a=[e.a[0]+dx,e.a[1]+dy];if(isTwo(e))e.b=[e.b[0]+dx,e.b[1]+dy];}if(LIB[e.t].pre&&e.t!=='w')e.name=autoName(LIB[e.t].pre);els.push(e);});
  sel=new Set(list.map(e=>e.id));rebuild('topo');commit();renderProps();}
function carry(list){const m=new Map(els.map(e=>[e.id,e]));list.forEach(e=>{const o=m.get(e.id);if(o&&o.st&&o.t===e.t){e.st=o.st;e.i=o.i;e.ti=o.ti;e.p=o.p;}});return list;}
/* transform the selected elements; wires / parts that touched a moved terminal stay connected through L-shaped wires */
function transformSel(base,ids,fn){const list=carry(deser(base,true)),moved=new Map();
  for(const e of list){if(!ids.has(e.id))continue;const before=terms(e).map(p=>[p[0],p[1]]);fn(e);const after=terms(e);
    before.forEach((p,i)=>{const d=[after[i][0]-p[0],after[i][1]-p[1]];if(!moved.has(key(p))||d[0]||d[1])moved.set(key(p),d);});}
  const extra=[];
  for(const e of list){if(ids.has(e.id))continue;
    if(e.t==='w'){const ma=moved.get(key(e.a)),mb=moved.get(key(e.b));if(!ma&&!mb)continue;
      if(ma&&mb&&ma[0]===mb[0]&&ma[1]===mb[1]){e.a=[e.a[0]+ma[0],e.a[1]+ma[1]];e.b=[e.b[0]+mb[0],e.b[1]+mb[1]];continue;}
      const A=ma?[e.a[0]+ma[0],e.a[1]+ma[1]]:e.a,B=mb?[e.b[0]+mb[0],e.b[1]+mb[1]]:e.b;const pts=route(B,A,e.a[0]===e.b[0]);e.b=pts[0];e.a=pts[1];for(let i=1;i+1<pts.length;i++)extra.push({t:'w',a:pts[i],b:pts[i+1],id:newId()});}
    else terms(e).forEach(p=>{const m=moved.get(key(p));if(m&&(m[0]||m[1])){const pts=route(p,[p[0]+m[0],p[1]+m[1]]);for(let i=0;i+1<pts.length;i++)extra.push({t:'w',a:pts[i],b:pts[i+1],id:newId()});}});}
  return list.concat(extra);}
function applyMove(base,ids,dx,dy,endpoint){
  return transformSel(base,ids,e=>{
    if(endpoint&&endpoint.id===e.id){const k=endpoint.k?'b':'a',o=e[k];let np=[o[0]+dx,o[1]+dy];if(e.t!=='w'){const other=e[endpoint.k?'a':'b'];np=Math.abs(np[0]-other[0])>=Math.abs(np[1]-other[1])?[np[0],other[1]]:[other[0],np[1]];}e[k]=np;return;}
    if(endpoint)return;if(isFp(e)){e.x+=dx;e.y+=dy;}else{e.a=[e.a[0]+dx,e.a[1]+dy];if(isTwo(e))e.b=[e.b[0]+dx,e.b[1]+dy];}});}

/* ================= pointer interaction ================= */
let drag=null,hover=null,spaceDown=false;const sch=$('sch'),tip=K.tooltip($('schWrap')),gest=K.gestures(sch,V,()=>{autoFit=false;scheduleDraw();});
sch.addEventListener('contextmenu',ev=>ev.preventDefault());
sch.addEventListener('pointerdown',ev=>{if(gest.down(ev)){drag=null;return;}const p=ptr(ev),g=snap(p);sch.setPointerCapture(ev.pointerId);tip.hide();
  if(ev.button===1||ev.button===2||tool==='pan'||spaceDown){drag={kind:'pan',last:p};return;}
  if(tool==='x'){const h=hitTest(p);if(h){sel=new Set([h.id]);deleteSel();}return;}
  if(tool==='s'){const h=hitTest(p);
    if(h){const one=sel.size===1&&sel.has(h.id),end=one?nearEnd(h,p):-1;
      if(ev.shiftKey){sel.has(h.id)?sel.delete(h.id):sel.add(h.id);renderProps();scheduleDraw();return;}
      if(!sel.has(h.id))sel=new Set([h.id]);renderProps();
      drag={kind:'move',g0:g,base:ser(els,true),ids:new Set(sel),hit:h,end:end>=0?{id:h.id,k:end}:null,moved:false};scheduleDraw();return;}
    if(ev.pointerType==='touch'){drag={kind:'pan',last:p};return;}
    if(!ev.shiftKey)sel.clear();renderProps();drag={kind:'box',p0:p,p1:p,add:ev.shiftKey};scheduleDraw();return;}
  const L=LIB[tool];if(L.one||L.fp){drag={kind:'place',g0:g};return;}
  drag={kind:'draw',tool,from:g,to:g,vFirst:false};scheduleDraw();});
sch.addEventListener('pointermove',ev=>{if(gest.move(ev)){drag=null;return;}const p=ptr(ev),g=snap(p);
  if(!drag){hover=g;hoverTip(ev,p);scheduleDraw();return;}
  if(drag.kind==='pan'){V.pan(p[0]-drag.last[0],p[1]-drag.last[1]);drag.last=p;autoFit=false;scheduleDraw();return;}
  if(drag.kind==='box'){drag.p1=p;scheduleDraw();return;}
  if(drag.kind==='move'){const dx=g[0]-drag.g0[0],dy=g[1]-drag.g0[1];if(dx!==drag.dx||dy!==drag.dy){drag.dx=dx;drag.dy=dy;drag.moved=drag.moved||!!(dx||dy);els=applyMove(drag.base,drag.ids,dx,dy,drag.end);scheduleDraw();}return;}
  if(drag.kind==='draw'){const dx=g[0]-drag.from[0],dy=g[1]-drag.from[1];
    if(drag.tool==='w'){if(!drag.dirSet&&(dx||dy)){drag.vFirst=Math.abs(dy)>Math.abs(dx);drag.dirSet=true;}drag.to=g;}
    else drag.to=Math.abs(dx)>=Math.abs(dy)?[g[0],drag.from[1]]:[drag.from[0],g[1]];scheduleDraw();}
  hover=g;});
sch.addEventListener('pointerup',ev=>{gest.up(ev);if(!drag)return;const d=drag;drag=null;const p=ptr(ev),g=snap(p);
  if(d.kind==='pan'){scheduleDraw();return;}
  if(d.kind==='box'){const [ax,ay]=[V.wx(d.p0[0]),V.wy(d.p0[1])],[bx,by]=[V.wx(d.p1[0]),V.wy(d.p1[1])],x0=Math.min(ax,bx),x1=Math.max(ax,bx),y0=Math.min(ay,by),y1=Math.max(ay,by);
    if(Math.abs(bx-ax)+Math.abs(by-ay)>0.3)els.forEach(e=>{const pts=terms(e);if(pts.every(([x,y])=>x>=x0&&x<=x1&&y>=y0&&y<=y1))sel.add(e.id);});renderProps();scheduleDraw();return;}
  if(d.kind==='move'){if(d.moved){rebuild('topo');commit();}else if(d.hit&&(d.hit.t==='S'||d.hit.t==='SW2')&&!ev.shiftKey){toggleSwitch(d.hit);}renderProps();scheduleDraw();return;}
  if(d.kind==='place'){const L=LIB[tool];const e=L.fp?mkEl(tool,{x:g[0],y:g[1],rot:ghostRot}):mkEl(tool,{a:g,b:g});if(L.one&&els.some(q=>q.t===tool&&eq(q.a,g)))return;addEl(e);sel=new Set([e.id]);rebuild('topo');commit();renderProps();return;}
  if(d.kind==='draw'){let to=d.to;
    if(d.tool==='w'){if(eq(d.from,to))return;const pts=route(d.from,to,d.vFirst);for(let i=0;i+1<pts.length;i++)addEl({t:'w',a:pts[i],b:pts[i+1],id:newId()});}
    else{if(eq(d.from,to)){const r=CE.rotPt(3,0,ghostRot);to=[d.from[0]+r[0],d.from[1]+r[1]];}const e=addEl(mkEl(d.tool,{a:d.from,b:to}));sel=new Set([e.id]);}
    rebuild('topo');commit();renderProps();}});
sch.addEventListener('pointerleave',()=>{hover=null;tip.hide();if(!drag)scheduleDraw();});
sch.addEventListener('wheel',ev=>{if(!(ev.ctrlKey||ev.metaKey))return;ev.preventDefault();const p=ptr(ev);V.zoomAt(p[0],p[1],Math.exp(-ev.deltaY*0.0022));autoFit=false;scheduleDraw();},{passive:false});
sch.addEventListener('dblclick',ev=>{const h=hitTest(ptr(ev));if(h){sel=new Set([h.id]);renderProps();const f=$('props').querySelector('input[type=text]:not(#pName),input[type=number]');if(f){f.focus();f.select&&f.select();}}});
function toggleSwitch(e){if(e.t==='S')e.on=e.on?0:1;else e.pos=e.pos?0:1;sim.beNext=true;rebuild('topo');commit();}

function hoverTip(ev,p){if(tool!=='s'||!net){tip.hide();return;}const h=hitTest(p);if(!h){tip.hide();return;}
  if(h.t==='w'){tip.show(`<b>导线</b> <span class="m">节点电压</span> ${fmtSI(nodeV(h.node),'V')}`+(running||sim.t>0?`<br><span class="m">电流</span> ${fmtSI(Math.abs(h.i||0),'A')}`:''),ev.clientX,ev.clientY);return;}
  tip.show(inspectHTML(h),ev.clientX,ev.clientY);}
function inspectHTML(e){const L=LIB[e.t];let h=`<b>${esc(nameOf(e))}</b> <span class="m">${L.n}${valText(e)&&e.t!=='VM'&&e.t!=='AM'?' · '+esc(valText(e)):''}</span>`;
  if(e.t==='G')return h+'<br>0 V 参考点';if(e.t==='P')return h+`<br>对地电压 ${fmtSI(nodeV(e.nodes[0]),'V')}`;
  if(!e.nodes)return h;
  if(isTwo(e)){const v=nodeV(e.nodes[0])-nodeV(e.nodes[1]);h+=`<br><span class="m">两端电压</span> ${fmtSI(-v,'V')} <span class="m">(终点相对起点)</span><br><span class="m">电流（起点→终点）</span> ${fmtSI(e.i||0,'A')}`;
    if(e.t!=='VM'&&e.t!=='AM')h+=`<br><span class="m">${LIB[e.t].src?'输出功率':'消耗功率'}</span> ${fmtSI(LIB[e.t].src?-(e.p||0):(e.p||0),'W')}`;
    if(e.t==='C')h+=`<br><span class="m">储能 ½CV²</span> ${fmtSI(0.5*e.v*v*v,'J')}`;if(e.t==='L')h+=`<br><span class="m">储能 ½LI²</span> ${fmtSI(0.5*e.v*(e.i||0)**2,'J')}`;
    if(e.t==='D'||e.t==='LED'||e.t==='Z')h+=`<br><span class="m">状态</span> ${(e.i||0)>1e-4?'正向导通':(e.t==='Z'&&-v>e.vz*0.9)?'反向击穿（稳压）':'截止'}`;}
  else if(e.t==='NPN'){const [b,c,em]=e.nodes.map(nodeV),vbe=b-em,vce=c-em,ib=e.ti?e.ti[0]:0,ic=e.ti?e.ti[1]:0;const reg=vbe<0.5?'截止':vce<0.25?'饱和':'放大';
    h+=`<br><span class="m">V<sub>BE</sub></span> ${fmtSI(vbe,'V')} <span class="m">V<sub>CE</sub></span> ${fmtSI(vce,'V')}<br><span class="m">I<sub>B</sub></span> ${fmtSI(ib,'A')} <span class="m">I<sub>C</sub></span> ${fmtSI(ic,'A')}<br><span class="m">工作区</span> ${reg}${reg==='放大'&&ib>1e-12?` <span class="m">I<sub>C</sub>/I<sub>B</sub></span> ${(ic/ib).toFixed(0)}`:''}`;}
  else if(e.t==='OA'){const [m,p,o]=e.nodes.map(nodeV);h+=`<br><span class="m">V+</span> ${fmtSI(p,'V')} <span class="m">V−</span> ${fmtSI(m,'V')}<br><span class="m">输出</span> ${fmtSI(o,'V')} · ${e.st.reg?'饱和':'线性区（V+ ≈ V−）'}`;}
  else if(e.t==='XF'){const [p1,p2,s1,s2]=e.nodes.map(nodeV);h+=`<br><span class="m">初级</span> ${fmtSI(p1-p2,'V')} <span class="m">次级</span> ${fmtSI(s1-s2,'V')}<br><span class="m">次级电流</span> ${fmtSI(e.ti?e.ti[2]:0,'A')}`;}
  else if(e.t==='POT'){const [a,b,w]=e.nodes.map(nodeV);h+=`<br><span class="m">滑动端电压</span> ${fmtSI(w,'V')}（A ${fmtSI(a,'V')}，B ${fmtSI(b,'V')}）`;}
  else if(e.t==='SW2')h+=`<br>公共端接到 ${e.pos?2:1}`;
  return h;}

/* ================= keyboard ================= */
addEventListener('keydown',ev=>{const tg=document.activeElement&&document.activeElement.tagName;if(/INPUT|SELECT|TEXTAREA/.test(tg))return;if(window.EMBED_LAB&&!sch.matches(':hover')&&document.activeElement!==sch)return;
  const k=ev.key,mod=ev.ctrlKey||ev.metaKey;
  if(mod&&(k==='z'||k==='Z')){ev.preventDefault();ev.shiftKey?redo():undo();return;}if(mod&&(k==='y'||k==='Y')){ev.preventDefault();redo();return;}
  if(mod&&k==='c'){copySel();return;}if(mod&&k==='v'){ev.preventDefault();paste(hover);return;}if(mod&&k==='d'){ev.preventDefault();copySel();paste();return;}
  if(mod&&k==='a'){ev.preventDefault();sel=new Set(els.map(e=>e.id));renderProps();scheduleDraw();return;}
  if(k==='Delete'||k==='Backspace'){if(sel.size){ev.preventDefault();deleteSel();}return;}
  if(k==='Escape'){setTool('s');sel.clear();renderProps();scheduleDraw();return;}
  if(k==='r'||k==='R'){rotateSel();return;}if(k==='f'||k==='F'){flipSel();return;}
  if(k===' '){ev.preventDefault();toggleRun();return;}
  const sc={w:'w',W:'w',v:'s'};if(sc[k]){setTool(sc[k]);return;}});

/* ================= props panel ================= */
const LOGS={R:[0,7,'Ω'],C:[-12,-2,'F'],L:[-6,1,'H'],I:[-6,0,'A']};
function renderProps(){const p=$('props');const list=els.filter(e=>sel.has(e.id));
  if(!list.length){p.innerHTML=tool==='s'?'<span>点元件看数值和电压电流（悬停也行）；拖动移动，拖空白处框选，<span class="kbd">R</span> 旋转，<span class="kbd">F</span> 翻转，双击改数值</span>':
    tool==='w'?'<span>从一点拖到另一点画导线（斜着拖会自动拐直角）</span>':tool==='x'?'<span>点要删除的元件或导线</span>':tool==='pan'?'<span>拖动画布平移</span>':
    `<span>${LIB[tool].two?'在网格上拖动放置，或单击放一个默认长度的':'单击放置'}「${LIB[tool].n}」${LIB[tool].two||LIB[tool].fp?'，放之前按 <span class="kbd">R</span> 旋转':''}</span>`;return;}
  if(list.length>1){p.innerHTML=`<b>已选 ${list.length} 个</b> <button data-a="rot">旋转 R</button> <button data-a="dup">复制一份</button> <button data-a="del">删除</button>`;return;}
  const e=list[0],L=LIB[e.t];let h=`<b>${L.n}</b>`;
  if(L.pre&&e.t!=='w')h+=` <label>名字 <input type="text" id="pName" value="${esc(e.name||'')}" style="width:62px"></label>`;
  const num=(k,lab,u,w=70)=>` <label>${lab} <input type="text" data-k="${k}" value="${fmtSI(e[k],'').trim()}" style="width:${w}px"> ${u}</label>`;
  switch(e.t){
    case 'R':case 'C':case 'L':case 'I':{const [lo,hi,u]=LOGS[e.t];h+=num('v','数值',u)+` <input type="range" data-log="v" min="${lo}" max="${hi}" step="0.01" value="${Math.log10(Math.abs(e.v)||1)}" style="width:130px" aria-label="对数滑块">`;break;}
    case 'V':h+=num('v','电压','V')+` <input type="range" data-lin="v" min="-30" max="30" step="0.1" value="${e.v}" style="width:120px" aria-label="电压滑块">`;break;
    case 'A':h+=num('v','幅值','V')+num('f','频率','Hz')+num('off','偏置','V',56)+num('ph','相位','°',46)+` <label>波形 <select data-k="wave"><option value="sin">正弦</option><option value="tri">三角</option><option value="saw">锯齿</option></select></label>`;break;
    case 'Q':h+=num('v','高电平','V',56)+num('lo','低电平','V',56)+num('f','频率','Hz')+num('duty','占空比','%',46);break;
    case 'Z':h+=num('vz','稳压值','V',56);break;
    case 'LED':h+=` <label>颜色 <select data-k="col">${Object.entries(LED_COL).map(([k,c])=>`<option value="${k}">${c.n}（${c.vf} V）</option>`).join('')}</select></label>`;break;
    case 'LMP':h+=num('vr','额定电压','V',56)+num('pr','额定功率','W',56);break;
    case 'S':h+=` <button data-a="tog">${e.on?'断开':'闭合'}</button>`;break;case 'SW2':h+=` <button data-a="tog">拨到 ${e.pos?1:2}</button>`;break;
    case 'POT':h+=num('v','总阻值','Ω')+` <label>滑动端 <input type="range" data-lin="pos" min="0" max="1" step="0.01" value="${e.pos}" style="width:120px"></label>`;break;
    case 'OA':h+=num('vsat','饱和电压 ±','V',56)+num('A','开环增益','',70);break;
    case 'NPN':h+=num('bf','β','',56);break;
    case 'XF':h+=num('n','匝数比 N₂/N₁','',62);break;
    case 'VM':case 'AM':h+=` <label><input type="checkbox" data-c="sc" ${e.sc?'checked':''}> 显示在示波器</label>`;break;}
  if(isTwo(e)&&!['w','VM','AM'].includes(e.t))h+=` <label><input type="checkbox" data-c="showI" ${e.showI?'checked':''}> 示波器看电流</label>`;
  if(e.t!=='w')h+=` <button data-a="rot" title="快捷键 R">旋转</button>`+(isTwo(e)||isFp(e)?` <button data-a="flip" title="快捷键 F">${isTwo(e)?'反向':'镜像'}</button>`:'');
  h+=` <button data-a="del">删除</button> <span id="pLive" class="live"></span>`;
  p.innerHTML=h;p.querySelectorAll('select[data-k]').forEach(s=>s.value=e[s.dataset.k]);liveProps();}
function liveProps(){const s=$('pLive');if(!s)return;const list=els.filter(e=>sel.has(e.id));if(list.length!==1||!list[0].nodes){s.textContent='';return;}const e=list[0];
  if(isTwo(e)&&e.t!=='w'){const v=nodeV(e.nodes[1])-nodeV(e.nodes[0]);s.textContent=`V = ${fmtSI(v,'V')}，I = ${fmtSI(e.i||0,'A')}${e.t!=='VM'&&e.t!=='AM'?`，P = ${fmtSI(LIB[e.t].src?-(e.p||0):(e.p||0),'W')}`:''}`;}else s.textContent='';}
$('props').addEventListener('change',ev=>{const t=ev.target,e=els.find(q=>sel.has(q.id));if(!e)return;
  if(t.id==='pName'){e.name=t.value.trim()||e.name;makeTraces(false);rebuild('param');commit();return;}
  if(t.dataset.k){const k=t.dataset.k;if(t.tagName==='SELECT')e[k]=t.value;else{const v=parseSI(t.value);if(!Number.isFinite(v)){t.value=fmtSI(e[k],'').trim();return;}
      const pos=['f','vr','pr','vz','bf','n','A','vsat'].includes(k)||(k==='v'&&'R C L POT A'.split(' ').includes(e.t));if(pos&&v<=0){t.value=fmtSI(e[k],'').trim();return;}
      e[k]=k==='duty'?clamp(v,1,99):v;}
    rebuild('param');commit();renderProps();return;}
  if(t.dataset.c){e[t.dataset.c]=t.checked;makeTraces(false);rebuild('param');commit();return;}
  if(t.dataset.log||t.dataset.lin){commit();}});
$('props').addEventListener('input',ev=>{const t=ev.target,e=els.find(q=>sel.has(q.id));if(!e)return;
  if(t.dataset.log){e[t.dataset.log]=+(10**+t.value).toPrecision(3);}else if(t.dataset.lin){e[t.dataset.lin]=+t.value;}else return;
  const f=$('props').querySelector(`input[data-k="${t.dataset.log||t.dataset.lin}"]`);if(f)f.value=fmtSI(e[t.dataset.log||t.dataset.lin],'').trim();rebuild('param');});
$('props').addEventListener('click',ev=>{const a=ev.target.dataset&&ev.target.dataset.a;if(!a)return;const e=els.find(q=>sel.has(q.id));
  if(a==='del')deleteSel();else if(a==='rot')rotateSel();else if(a==='flip')flipSel();else if(a==='dup'){copySel();paste();}else if(a==='tog'&&e){toggleSwitch(e);renderProps();}});

/* ================= toolbar ================= */
const TOOLS=[['编辑',[['s','选择'],['w','导线'],['pan','平移'],['x','删除']]],
  ['无源',[['R','电阻'],['C','电容'],['L','电感'],['POT','电位器'],['S','开关'],['SW2','双掷开关'],['LMP','灯泡']]],
  ['电源',[['V','直流源'],['I','电流源'],['A','信号源'],['Q','方波源'],['G','接地']]],
  ['半导体',[['D','二极管'],['Z','稳压管'],['LED','LED'],['NPN','NPN'],['OA','运放'],['XF','变压器']]],
  ['测量',[['P','探针'],['VM','电压表'],['AM','电流表']]]];
$('tools').innerHTML=TOOLS.map(([g,list])=>`<div class="toolgrp"><span>${g}</span>${list.map(([k,n])=>`<button data-t="${k}" title="${LIB[k]?LIB[k].n:n}">${n}</button>`).join('')}</div>`).join('');
$('tools').addEventListener('click',ev=>{const b=ev.target.closest('[data-t]');if(b)setTool(b.dataset.t);});
function setTool(t){tool=t;if(t!=='s')sel.clear();ghostRot=0;pressGroup('#tools [data-t]',b=>b.dataset.t===tool);sch.style.cursor=t==='s'?'default':t==='pan'?'grab':t==='x'?'not-allowed':'crosshair';renderProps();scheduleDraw();}
$('sweep').innerHTML='<option value="auto">自动</option>'+SW.map(v=>`<option value="${v}">${fmtSI(v,'s')}</option>`).join('');
function syncBar(){$('run').textContent=running?'❚❚ 暂停':'▶ 运行';$('run').setAttribute('aria-pressed',running);$('sweep').value=sweepMode==='auto'?'auto':String(sweep);
  const o=$('sweep').querySelector('option[value=auto]');o.textContent=sweepMode==='auto'?`自动（${fmtSI(sweep,'s')}）`:'自动';$('showV').setAttribute('aria-pressed',showV);$('init').value=initMode;syncUndo();}
function syncUndo(){$('undo').disabled=!hist.canUndo;$('redo').disabled=!hist.canRedo;}
function undo(){if(hist.undo()){syncUndo();renderProps();}}function redo(){if(hist.redo()){syncUndo();renderProps();}}
function toggleRun(){running=!running;if(running){errMsg='';updateDiag();}syncBar();Lab.kick(anim);Lab.draw(1);}
$('run').addEventListener('click',toggleRun);$('reset').addEventListener('click',()=>{errMsg='';resetSim();});
$('undo').addEventListener('click',undo);$('redo').addEventListener('click',redo);
$('clear').addEventListener('click',()=>{els=[];sel.clear();running=false;curP='';sweepMode='auto';rebuild('topo');resetSim();commit();syncBar();pressPresets();});
$('zin').addEventListener('click',()=>{V.zoomAt(SW_/2,SH_/2,1.25);autoFit=false;scheduleDraw();});$('zout').addEventListener('click',()=>{V.zoomAt(SW_/2,SH_/2,0.8);autoFit=false;scheduleDraw();});
$('zfit').addEventListener('click',()=>{autoFit=true;fitView();scheduleDraw();});
$('showV').addEventListener('click',()=>{showV=!showV;syncBar();scheduleDraw();});
$('sweep').addEventListener('change',ev=>{const v=ev.target.value;if(v==='auto'){sweepMode='auto';sweep=suggestSweep();}else{sweepMode='fixed';sweep=+v;}clearBufs();resetSim();syncBar();});
$('init').addEventListener('change',ev=>{initMode=ev.target.value;resetSim();});
$('share').addEventListener('click',async()=>{const s=await K.encode(ser(els,false));const url=location.href.split('#')[0].replace(/[?&]p=[^&]*/,'')+'#c='+s;history.replaceState(null,'','#c='+s);
  const ok=await K.copyText(url);flashMsg(ok?'链接已复制：打开它就能看到这个电路':'已更新地址栏，复制地址栏里的链接即可分享');});
$('png').addEventListener('click',()=>K.download($('sch'),'circuit.png'));
function flashMsg(m){const s=$('status');s.textContent=m;clearTimeout(s._t);s._t=setTimeout(()=>s.textContent='',3500);}
let saveT=0;function saveLocal(){clearTimeout(saveT);saveT=setTimeout(()=>{if(els.length)K.store.set(STORE,ser(els,false));},400);}

/* ================= scope ================= */
let trig=true,curs=[],scopeFrame=null;
$('trig').addEventListener('click',()=>{trig=!trig;$('trig').setAttribute('aria-pressed',trig);drawScope();});
$('scope').addEventListener('click',ev=>{if(!scopeFrame)return;const r=$('scope').getBoundingClientRect(),x=ev.clientX-r.left,{pl,pr,W}=scopeFrame,f=(x-pl)/(W-pl-pr);if(f<0||f>1)return;
  if(curs.length>=2)curs=[];curs.push(f);drawScope();});
$('scope').addEventListener('dblclick',()=>{curs=[];drawScope();});
function windowIdx(){const n=Math.min(count,SAMPLES);if(!n)return null;const idx=k=>(head-count+k+RING)%RING;let start=count-n;
  if(trig&&traces.length&&count>=SAMPLES+10){const j=0,b=bufs[j];let lo=Infinity,hi=-Infinity;for(let k=count-SAMPLES;k<count;k++){const v=b[idx(k)];if(v<lo)lo=v;if(v>hi)hi=v;}
    if(hi-lo>1e-9){const lv=(hi+lo)/2;for(let k=count-SAMPLES;k>=1;k--){if(b[idx(k-1)]<lv&&b[idx(k)]>=lv){start=k;break;}}}}
  return {n,at:k=>idx(start+k)};}
function drawScope(){const c=$('scope');const [g,W,H]=fit(c);scopeFrame=null;
  if(!traces.length){text(g,'放「探针」、在电压表 / 电流表上勾「显示在示波器」，或给元件勾「示波器看电流」',W/2,H/2,css('--muted'),12,'center');setStats('');return;}
  const w=windowIdx();if(!w){text(g,'按 ▶ 运行',W/2,H/2,css('--muted'),12,'center');return;}
  const {n,at}=w,tv=traces.map((t,j)=>[t,j]).filter(([t])=>t.unit==='V'),ti=traces.map((t,j)=>[t,j]).filter(([t])=>t.unit==='A');
  const rng=list=>{let lo=Infinity,hi=-Infinity;list.forEach(([,j])=>{for(let k=0;k<n;k++){const v=bufs[j][at(k)];if(v<lo)lo=v;if(v>hi)hi=v;}});if(!isFinite(lo))return [-1,1];if(hi-lo<1e-9){const m=Math.max(Math.abs(hi),1e-3);hi+=m*0.5;lo-=m*0.5;}const p=(hi-lo)*0.08;return [lo-p,hi+p];};
  const [v0,v1]=rng(tv),[i0,i1]=rng(ti),t0=bufT[at(0)],pl=50,pr=ti.length?58:12,pt=14,pb=24;scopeFrame={pl,pr,W,t0};
  const X=k=>pl+(W-pl-pr)*k/(SAMPLES-1),YV=v=>pt+(H-pt-pb)*(v1-v)/(v1-v0),YI=v=>pt+(H-pt-pb)*(i1-v)/(i1-i0);
  g.strokeStyle=css('--grid');g.lineWidth=1;for(let k=0;k<=10;k++){const x=pl+(W-pl-pr)*k/10;g.beginPath();g.moveTo(x,pt);g.lineTo(x,H-pb);g.stroke();}for(let k=0;k<=4;k++){const y=pt+(H-pt-pb)*k/4;g.beginPath();g.moveTo(pl,y);g.lineTo(W-pr,y);g.stroke();}
  if(tv.length){[v0,(v0+v1)/2,v1].forEach(v=>label(g,fmtSI(Math.abs(v)<(v1-v0)*1e-3?0:v,'V'),2,YV(v)+4,css('--muted'),10,'400'));if(v0<0&&v1>0){g.strokeStyle=css('--muted');g.beginPath();g.moveTo(pl,YV(0));g.lineTo(W-pr,YV(0));g.stroke();}}
  if(ti.length)[i0,(i0+i1)/2,i1].forEach(v=>label(g,fmtSI(Math.abs(v)<(i1-i0)*1e-3?0:v,'A'),W-pr+4,YI(v)+4,css('--muted'),10,'400'));
  traces.forEach((tr,j)=>{const Y=tr.unit==='V'?YV:YI;g.strokeStyle=css(tr.col);g.lineWidth=2;g.beginPath();for(let k=0;k<n;k++){const x=X(k),y=Y(bufs[j][at(k)]);k?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();});
  /* legend */let lx=pl+4;g.font=`600 11px ${css('--mono')}`;traces.forEach(tr=>{g.fillStyle=css(tr.col);g.fillText(tr.name,lx,pt+11);lx+=g.measureText(tr.name).width+12;});
  text(g,`${fmtSI(sweep/10,'s')}/格`+(trig?' · 触发':''),W-pr,H-6,css('--muted'),11,'right');text(g,`${fmtSI(t0,'s')} 起`,pl,H-6,css('--muted'),11);
  /* cursors */
  let curInfo='';curs.forEach((f,i)=>{const x=pl+(W-pl-pr)*f;g.strokeStyle=css('--accent');g.setLineDash([4,3]);g.beginPath();g.moveTo(x,pt);g.lineTo(x,H-pb);g.stroke();g.setLineDash([]);label(g,i?'B':'A',x+3,H-pb-4,css('--accent'),11);});
  if(curs.length){const k=f=>Math.round(f*(n-1)),vals=f=>traces.map((tr,j)=>`${tr.name} ${fmtSI(bufs[j][at(k(f))],tr.unit)}`).join('，');
    curInfo=`<tr><td colspan="7" style="color:var(--accent)">光标 A：t = ${fmtSI(bufT[at(k(curs[0]))],'s')}；${vals(curs[0])}`+(curs[1]!==undefined?`<br>光标 B：t = ${fmtSI(bufT[at(k(curs[1]))],'s')}；${vals(curs[1])}<br>Δt = ${fmtSI(Math.abs(bufT[at(k(curs[1]))]-bufT[at(k(curs[0]))]),'s')}，1/Δt = ${fmtSI(1/Math.abs(bufT[at(k(curs[1]))]-bufT[at(k(curs[0]))]||1e-30),'Hz')}`:'（再点一下放光标 B，双击清除）')+'</td></tr>';}
  if(running&&performance.now()-(drawScope._t||0)<300&&!curs.length)return;drawScope._t=performance.now();
  /* measurements */
  const meas=traces.map((tr,j)=>{let s=0,s2=0,lo=Infinity,hi=-Infinity;for(let k=0;k<n;k++){const v=bufs[j][at(k)];s+=v;s2+=v*v;if(v<lo)lo=v;if(v>hi)hi=v;}const mean=s/n;
    const xs=[],xf=[];if(hi-lo>1e-9*Math.max(1,Math.abs(hi))){const lv=(hi+lo)/2;for(let k=1;k<n;k++){const a=bufs[j][at(k-1)],b=bufs[j][at(k)],tc=()=>bufT[at(k-1)]+(lv-a)/(b-a)*(bufT[at(k)]-bufT[at(k-1)]);if(a<lv&&b>=lv)xs.push(tc());else if(a>=lv&&b<lv)xf.push(tc());}}
    const per=L=>L.length>=2?(L[L.length-1]-L[0])/(L.length-1):NaN,P=Number.isFinite(per(xs))?per(xs):per(xf);const f=P>0?1/P:NaN;return {tr,mean,rms:Math.sqrt(s2/n),lo,hi,f,xs};});
  const ref=meas[0];setStats('<tr><th>波形</th><th>平均</th><th>RMS</th><th>峰峰</th><th>最大 / 最小</th><th>频率</th><th>相位（对第一条）</th></tr>'+meas.map((m,i)=>{let ph='—';
    if(i&&isFinite(m.f)&&isFinite(ref.f)&&Math.abs(m.f-ref.f)<0.05*ref.f&&m.xs.length&&ref.xs.length){const T=1/ref.f,d=m.xs[0]-ref.xs.reduce((b,x)=>Math.abs(x-m.xs[0])<Math.abs(b-m.xs[0])?x:b,ref.xs[0]);let deg=-d/T*360;deg=((deg+180)%360+360)%360-180;ph=`${Math.abs(deg).toFixed(1)}° ${deg>0.5?'超前':deg<-0.5?'滞后':'同相'}`;}
    const zero=v=>Math.abs(v)<1e-4*Math.max(Math.abs(m.hi),Math.abs(m.lo),1e-12)?0:v;
    return `<tr><td><span class="sw" style="background:var(${m.tr.col})"></span>${esc(m.tr.name)}</td><td>${fmtSI(zero(m.mean),m.tr.unit)}</td><td>${fmtSI(m.rms,m.tr.unit)}</td><td>${fmtSI(m.hi-m.lo,m.tr.unit)}</td><td>${fmtSI(zero(m.hi),m.tr.unit)} / ${fmtSI(zero(m.lo),m.tr.unit)}</td><td>${isFinite(m.f)?fmtSI(m.f,'Hz'):'—'}</td><td>${i?ph:'参考'}</td></tr>`;}).join('')+curInfo);}
let statsHTML='';function setStats(h){if(h!==statsHTML){statsHTML=h;$('stats').innerHTML=h;}}

/* ================= Bode ================= */
const bode={dirty:true,data:null};
function bodeOptions(){const ins=net?net.comps.filter(e=>'AQVI'.includes(e.t)&&LIB[e.t].src):[],outs=net?net.comps.filter(e=>e.t==='P'||e.t==='VM'||e.t==='AM'):[];
  const fill=(s,list,f)=>{const cur=s.value;s.innerHTML=list.map(e=>`<option value="${e.id}">${esc(f(e))}</option>`).join('');if(list.some(e=>String(e.id)===cur))s.value=cur;};
  fill($('bIn'),ins,e=>`${nameOf(e)}（${LIB[e.t].n}）`);fill($('bOut'),outs,e=>e.t==='P'?`${nameOf(e)} 对地电压`:e.t==='VM'?`${nameOf(e)} 读数`:`${nameOf(e)} 电流`);
  if(!$('bOut').dataset.touched){const lastP=outs.filter(e=>e.t==='P');const pick=lastP.length>1?lastP[lastP.length-1]:outs[0];if(pick)$('bOut').value=pick.id;}}
['bIn','bOut'].forEach(id=>$(id).addEventListener('change',()=>{$(id).dataset.touched=1;bode.dirty=true;drawBode();}));
function computeBode(){const inp=net.comps.find(e=>String(e.id)===$('bIn').value),o=net.comps.find(e=>String(e.id)===$('bOut').value);if(!inp||!o)return null;
  const out=o.t==='P'?{kind:'node',n:o.nodes[0]}:o.t==='VM'?{kind:'diff',p:o.nodes[1],q:o.nodes[0]}:{kind:'cur',br:o.br};
  sim.op=null;let ps=[];try{ps=sim.poles().list;}catch(e){}const mags=ps.map(p=>Math.hypot(p[0],p[1])/(2*Math.PI)).filter(f=>f>1e-3);
  const fsrc=inp.f||0;let lo=mags.length?Math.min(...mags):(fsrc||1000),hi=mags.length?Math.max(...mags):(fsrc||1000);if(fsrc){lo=Math.min(lo,fsrc);hi=Math.max(hi,fsrc);}
  const f0=Math.pow(10,Math.floor(Math.log10(lo))-1.5),f1=Math.pow(10,Math.ceil(Math.log10(hi))+1.5);
  let r=sim.acSweep(inp,out,clamp(f0,1e-2,1e7),clamp(f1,10,1e9),301);
  /* refine around the magnitude peak and around −3 dB crossings so sharp resonances are not under-sampled */
  {const pk=r.reduce((b,x,i)=>x[1]>r[b][1]?i:b,0);if(pk>0&&pk<r.length-1){const fine=sim.acSweep(inp,out,r[pk-1][0],r[pk+1][0],121);r=r.slice(0,pk-1).concat(fine,r.slice(pk+2));}}
  /* unwrap phase */let off=0;for(let i=1;i<r.length;i++){let d=r[i][2]+off-r[i-1][2];if(d>Math.PI)off-=2*Math.PI;else if(d<-Math.PI)off+=2*Math.PI;r[i][2]+=off;}
  return {r,inp,o,isI:o.t==='AM'};}
function drawBode(){if(view!=='bode')return;bodeOptions();if(bode.dirty&&net){try{bode.data=keepState(computeBode);}catch(e){bode.data=null;}bode.dirty=false;}
  const c=$('bodeC');const [g,W,H]=fit(c),d=bode.data;if(!d){text(g,'需要一个信号源作输入，和一个探针 / 电压表 / 电流表作输出',W/2,H/2,css('--muted'),12,'center');$('bStats').innerHTML='';return;}
  const r=d.r.filter(x=>isFinite(x[1])),db=r.map(x=>20*Math.log10(x[1]+1e-300)),u0=Math.log10(r[0][0]),u1=Math.log10(r[r.length-1][0]),h1=Math.floor(H*0.56);
  const mx=Math.ceil((Math.max(...db)+3)/10)*10,mn=Math.max(Math.floor((Math.min(...db)-3)/10)*10,mx-100);const xt=[];for(let k=Math.ceil(u0);k<=Math.floor(u1);k++)xt.push(k);
  const a=axes(g,W,h1,{x0:u0,x1:u1,y0:mn,y1:mx,xt,yt:[mn,Math.round((mn+mx)/2),mx],xf:v=>fmtSI(10**v,'Hz',1),title:d.isI?'|I/V_in| (dB, 以 1 S 为 0 dB)':'|H| = 输出 / 输入 (dB)',pl:48,pb:18});
  plot(g,a.X,a.Y,u=>{const i=Math.round((u-u0)/(u1-u0)*(r.length-1));return db[clamp(i,0,r.length-1)];},u0,u1,css('--blue'),2.4,r.length);
  const pk=db.indexOf(Math.max(...db)),ref=db[pk],cross=[];for(let i=1;i<db.length;i++){if((db[i-1]-(ref-3))*(db[i]-(ref-3))<0){const t=(ref-3-db[i-1])/(db[i]-db[i-1]);cross.push(Math.pow(10,Math.log10(r[i-1][0])+t*(Math.log10(r[i][0])-Math.log10(r[i-1][0]))));}}
  cross.forEach((f,i)=>{const x=a.X(Math.log10(f));g.strokeStyle=css('--red');g.setLineDash([4,4]);g.beginPath();g.moveTo(x,a.pt);g.lineTo(x,h1-a.pb);g.stroke();g.setLineDash([]);
    g.font=`600 11px ${css('--mono')}`;const s=fmtSI(f,'Hz'),w=g.measureText(s).width;label(g,s,i===0&&cross.length>1?Math.max(a.pl+2,x-w-4):Math.min(x+4,W-w-4),a.pt+12+(i%2)*13,css('--red'),11);});
  if(d.inp.f){const x=a.X(Math.log10(d.inp.f));g.strokeStyle=css('--accent');g.beginPath();g.moveTo(x,a.pt);g.lineTo(x,h1-a.pb);g.stroke();}
  g.save();g.translate(0,h1);const ph=r.map(x=>x[2]*180/Math.PI),pmn=Math.floor(Math.min(...ph)/90)*90,pmx=Math.ceil(Math.max(...ph)/90)*90||90;const yt=[];for(let v=pmn;v<=pmx;v+=pmx-pmn>360?180:90)yt.push(v);
  const b=axes(g,W,H-h1,{x0:u0,x1:u1,y0:pmn===pmx?pmn-90:pmn,y1:pmx,xt,yt,xf:v=>fmtSI(10**v,'Hz',1),title:'相位 (°)',pl:48,pt:16,pb:20});
  plot(g,b.X,b.Y,u=>{const i=Math.round((u-u0)/(u1-u0)*(r.length-1));return ph[clamp(i,0,r.length-1)];},u0,u1,css('--amp'),2.2,r.length);g.restore();
  /* table */const at=f=>{const i=r.findIndex(x=>x[0]>=f);return i<0?r[r.length-1]:r[i];};let rows='';
  if(d.inp.f){const x=at(d.inp.f);rows+=`<tr><td>信号源频率 ${fmtSI(d.inp.f,'Hz')}</td><td>${x[1]>1e-15?`${(20*Math.log10(x[1])).toFixed(2)} dB（×${x[1].toPrecision(3)}）`:'0（输出与这个输入无关）'}</td><td>${x[1]>1e-15?(x[2]*180/Math.PI).toFixed(1)+'°':'—'}</td></tr>`;}
  const peakIsInterior=pk>2&&pk<r.length-3;
  rows+=`<tr><td>${peakIsInterior?'峰值（谐振）':'通带增益'}</td><td>${isFinite(ref)&&ref>-290?ref.toFixed(2)+' dB':'0'}${peakIsInterior?` @ ${fmtSI(r[pk][0],'Hz')}`:''}</td><td>${(ph[pk]).toFixed(1)}°</td></tr>`;
  rows+=`<tr><td>−3 dB 频率</td><td colspan="2">${cross.length?cross.map(f=>fmtSI(f,'Hz')).join('、'):'范围内没有'}${cross.length===2?`；带宽 ${fmtSI(cross[1]-cross[0],'Hz')}，Q ≈ ${(r[pk][0]/(cross[1]-cross[0])).toPrecision(3)}`:''}</td></tr>`;
  $('bStats').innerHTML='<tr><th></th><th>增益</th><th>相位</th></tr>'+rows;}

/* ================= smart analysis ================= */
const ana={dirty:true};
function drawAna(){if(view!=='ana'||!ana.dirty||!net)return;ana.dirty=false;const box=$('anaBox');let h='';
  const diags=[...runDiag,...net.diags];
  h+=`<h3>电路体检</h3>`+(diags.length?'<ul class="diag">'+diags.map(d=>`<li class="${d.lv}">${{err:'✖',warn:'⚠',info:'ℹ'}[d.lv]} ${esc(d.msg)}</li>`).join('')+'</ul>':'<p class="ok">✓ 没发现连线问题：没有悬空端子、短路的电源或矛盾的电压源回路。</p>');
  if(!net.comps.length){box.innerHTML=h;return;}
  /* DC operating point */
  keepState(()=>{let op;try{op=sim.dcop('dc');}catch(e){op={ok:false};}
  if(op.ok){const V=n=>n<0?0:op.x[n];let ps=0,pd=0;const rows=net.comps.filter(e=>e.t!=='P'&&e.t!=='G').map(e=>{const p=e.p||0;if(LIB[e.t].src)ps-=p;else if(p>0)pd+=p;
      let v='',i='',note='';if(isTwo(e)){v=fmtSI(V(e.nodes[1])-V(e.nodes[0]),'V');i=fmtSI(e.i||0,'A');}
      if(e.t==='NPN'){const [b,c,em]=e.nodes.map(V);v=`V_BE ${fmtSI(b-em,'V')}，V_CE ${fmtSI(c-em,'V')}`;i=`I_C ${fmtSI(e.ti[1],'A')}`;note=b-em<0.5?'截止':c-em<0.25?'饱和':'放大区';}
      if(e.t==='OA'){v=`输出 ${fmtSI(V(e.nodes[2]),'V')}`;note=e.st.reg?'饱和':'线性（虚短）';}
      if(e.t==='C')note='直流时开路';if(e.t==='L')note='直流时短路';if(e.t==='D'||e.t==='LED')note=(e.i||0)>1e-4?'导通':'截止';if(e.t==='Z')note=(e.i||0)<-1e-4?'击穿稳压':(e.i||0)>1e-4?'正向导通':'截止';
      if(e.t==='A')note='只取直流偏置';if(e.t==='Q')note='取低电平';
      return `<tr><td>${esc(nameOf(e))}</td><td>${v}</td><td>${i}</td><td>${e.t==='VM'||e.t==='AM'?'':fmtSI(LIB[e.t].src?-p:p,'W')}</td><td>${note}</td></tr>`;}).join('');
    h+=`<h3>直流工作点 <small>（电容开路、电感短路、信号源只留直流分量）</small></h3><div class="scroll"><table class="mini"><tr><th>元件</th><th>电压（终点 − 起点）</th><th>电流</th><th>功率</th><th>说明</th></tr>${rows}</table></div><p class="m">电源送出 ${fmtSI(ps,'W')}，元件消耗 ${fmtSI(pd,'W')}${Math.abs(ps-pd)<1e-6*Math.max(ps,1e-9)+1e-12?'（功率守恒 ✓）':''}</p>`;}
  else h+=`<h3>直流工作点</h3><p class="m">求不出直流工作点：${esc(op.err||'')}</p>`;
  /* poles */
  let P={list:[]};try{P=sim.poles();}catch(e){}
  const nR=net.comps.filter(e=>e.t==='C'||e.t==='L').length;
  if(nR){h+=`<h3>动态特性 <small>（固有频率 = det(Y(s)) 的根，非线性元件在工作点线性化）</small></h3>`;
    if(P.tooMany)h+='<p class="m">储能元件太多（> 14 个），不计算极点。</p>';
    else if(!P.list.length)h+='<p class="m">没有找到有限的固有频率（可能所有电容都被理想电压源钉住，或电感串在电流源里）。</p>';
    else{h+='<div class="poles"><canvas id="sPlane" height="190" aria-label="s 平面极点图"></canvas><div><table class="mini"><tr><th>极点 s</th><th>解释</th></tr>'+P.list.map(([re,im])=>{
        const m=Math.hypot(re,im);let s=im>0?`${fmtSI(re,'')} ± j${fmtSI(im,'')}`:fmtSI(re,'');let ex;
        if(re>1e-9*m)ex=`<span style="color:var(--red)">在右半平面：不稳定，响应会指数增长（振荡或冲到饱和）</span>`;
        else if(im>0){const z=-re/m;ex=`欠阻尼振荡：f<sub>d</sub> = ${fmtSI(im/2/Math.PI,'Hz')}，ζ = ${z.toFixed(3)}，Q = ${(1/(2*z)).toPrecision(3)}，包络 τ = ${fmtSI(-1/re,'s')}`+(z<1e-6?'（无阻尼，等幅振荡）':'');}
        else ex=`指数衰减：τ = 1/|s| = ${fmtSI(-1/re,'s')}，约 5τ = ${fmtSI(-5/re,'s')} 到稳态`;
        return `<tr><td>${s}<small> s⁻¹</small></td><td>${ex}</td></tr>`;}).join('')+'</table>';
      const cplx=P.list.filter(p=>p[1]>0),real=P.list.filter(p=>p[1]===0);
      if(P.list.length===1&&!cplx.length)h+='<p class="m">一阶电路：响应是单个指数，τ 决定快慢。</p>';
      else if(real.length===2&&!cplx.length&&P.list.length===2)h+=`<p class="m">两个不同的实极点：<b>过阻尼</b>（不振荡，慢的那个极点决定稳定时间）。</p>`;
      else if(cplx.length===1&&P.list.length===1){const z=-cplx[0][0]/Math.hypot(...cplx[0]);h+=`<p class="m">一对共轭复极点：<b>${z<0.999?'欠阻尼':'接近临界阻尼'}</b>，阶跃响应会${z<0.999?'过冲并振荡':'刚好不振荡'}。</p>`;}
      h+='</div></div>';}
    /* per element Thévenin resistance and time constant */
    const rx=net.comps.filter(e=>e.t==='C'||e.t==='L').map(e=>{const R=e.t==='C'?sim.rth(e.nodes[0],e.nodes[1]):sim.rth(e.nodes[0],e.nodes[1],[e]);
      const tau=e.t==='C'?R*e.v:e.v/R;return `<tr><td>${esc(nameOf(e))} ${fmtSI(e.v,e.t==='C'?'F':'H')}</td><td>${Number.isFinite(R)&&R<1e12?fmtSI(R,'Ω'):'∞（没有直流通路）'}</td><td>${Number.isFinite(tau)&&tau>0&&tau<1e6?fmtSI(tau,'s'):'—'}</td></tr>`;}).join('');
    h+=`<h4>每个储能元件「看到」的戴维宁电阻</h4><p class="m">把这个元件拿掉，其他电源置零（电压源短路、电流源开路），其余电容开路、电感短路，从它两端看进去的电阻。一阶电路的时间常数就是 τ = R<sub>th</sub>C 或 L/R<sub>th</sub>。</p><table class="mini"><tr><th>元件</th><th>R<sub>th</sub></th><th>τ</th></tr>${rx}</table>`;}
  /* Thevenin at voltmeters */
  const vms=net.comps.filter(e=>e.t==='VM');
  h+=`<h3>戴维宁 / 诺顿等效</h3>`;
  if(!vms.length)h+='<p class="m">在任意两点之间放一个「电压表」，这里就会算出从这两点看进去的戴维宁等效（直流）。</p>';
  else if(op.ok)h+='<table class="mini"><tr><th>端口</th><th>V<sub>th</sub>（开路电压）</th><th>R<sub>th</sub></th><th>I<sub>N</sub> = V<sub>th</sub>/R<sub>th</sub></th><th>接多大负载功率最大</th></tr>'+vms.map(e=>{
      const Vth=(e.nodes[1]<0?0:op.x[e.nodes[1]])-(e.nodes[0]<0?0:op.x[e.nodes[0]]),R=sim.rth(e.nodes[1],e.nodes[0]);const ok=Number.isFinite(R)&&R<1e12;
      return `<tr><td>${esc(nameOf(e))} 两端</td><td>${fmtSI(Vth,'V')}</td><td>${ok?fmtSI(R,'Ω'):'∞'}</td><td>${ok&&R>1e-9?fmtSI(Vth/R,'A'):'—'}</td><td>${ok&&R>1e-9?`R<sub>L</sub> = ${fmtSI(R,'Ω')} 时 P<sub>max</sub> = ${fmtSI(Vth*Vth/(4*R),'W')}`:'—'}</td></tr>`;}).join('')+'</table>';
  box.innerHTML=h;const sp=$('sPlane');if(sp)drawSPlane(sp,P.list);});}
function drawSPlane(c,list){const [g,W,H]=fit(c);const all=list.flatMap(([r,i])=>[[r,i],[r,-i]]),m=Math.max(...all.map(p=>Math.max(Math.abs(p[0]),Math.abs(p[1]))))*1.25||1;
  const cx=W*0.62,cy=H/2,s=Math.min(W*0.55,H*0.45)/m;g.strokeStyle=css('--grid');g.lineWidth=1;g.beginPath();g.moveTo(8,cy);g.lineTo(W-8,cy);g.moveTo(cx,6);g.lineTo(cx,H-6);g.stroke();
  g.fillStyle=css('--fillB');g.fillRect(8,6,cx-8,H-12);text(g,'稳定（左半平面）',12,18,css('--muted'),11);text(g,'σ',W-16,cy-6,css('--muted'),12);text(g,'jω',cx+6,16,css('--muted'),12);
  all.forEach(([r,i])=>{const x=cx+r*s,y=cy-i*s;g.strokeStyle=r>0?css('--red'):css('--blue');g.lineWidth=2.4;g.beginPath();g.moveTo(x-6,y-6);g.lineTo(x+6,y+6);g.moveTo(x-6,y+6);g.lineTo(x+6,y-6);g.stroke();});}

/* ================= views ================= */
document.querySelectorAll('#lab1 [data-v]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.v;syncView();Lab.draw(1);}));
function syncView(){pressGroup('#lab1 [data-v]',b=>b.dataset.v===view);['scope','bode','ana'].forEach(v=>$('v_'+v).style.display=view===v?'':'none');}

/* ================= presets ================= */
const PRE={};
function B(){const L=[];const api={add:(t,a,b,o={})=>{const e=mkEl(t,{a,b,...o});els.push(e);return e;},fp:(t,p,o={})=>{const e=mkEl(t,{x:p[0],y:p[1],rot:0,...o});els.push(e);return e;},
  one:(t,p,o={})=>{const e=mkEl(t,{a:p,b:p,...o});els.push(e);return e;},w:(...pts)=>{for(let i=0;i+1<pts.length;i++)els.push({t:'w',a:pts[i],b:pts[i+1],id:newId()});}};return api;}
PRE.rc={n:'RC 充放电',g:0,sw:2,f(b){b.add('Q',[3,9],[3,4],{v:5,f:1});b.w([3,4],[6,4]);b.add('R',[6,4],[12,4],{v:1000,showI:true});b.w([12,4],[15,4]);b.add('C',[15,4],[15,9],{v:1e-4});b.w([15,9],[3,9]);b.one('G',[9,9]);b.one('P',[3,4],{name:'Vin'});b.one('P',[15,4],{name:'Vc'});}};
PRE.spdt={n:'RC：手动充 / 放电',g:0,sw:5,f(b){b.add('V',[2,9],[2,3],{v:10});b.w([2,3],[6,3]);b.fp('SW2',[9,4],{pos:1,rot:2});b.w([6,5],[6,9]);b.add('R',[9,4],[14,4],{v:1000,showI:true});b.add('C',[14,4],[14,9],{v:470e-6});b.w([14,9],[2,9]);b.one('G',[8,9]);b.one('P',[14,4],{name:'Vc'});}};
PRE.rlc={n:'RLC 阶跃（欠阻尼）',g:0,sw:0.1,f(b){b.add('Q',[2,9],[2,3],{v:5,f:10});b.w([2,3],[5,3]);b.add('R',[5,3],[9,3],{v:20});b.add('L',[9,3],[14,3],{v:0.1,showI:true});b.w([14,3],[17,3]);b.add('C',[17,3],[17,9],{v:1e-4});b.w([17,9],[2,9]);b.one('G',[9,9]);b.one('P',[2,3],{name:'Vin'});b.one('P',[17,3],{name:'Vc'});}};
PRE.rl={n:'交流 RL：电流滞后',g:0,sw:0.04,f(b){b.add('A',[2,9],[2,3],{v:10,f:50});b.w([2,3],[5,3]);b.add('L',[5,3],[11,3],{v:0.05,showI:true});b.w([11,3],[14,3]);b.add('R',[14,3],[14,9],{v:10});b.w([14,9],[2,9]);b.one('G',[8,9]);b.one('P',[2,3],{name:'Vs'});b.one('P',[14,3],{name:'VR'});}};
PRE.lpf={n:'RC 低通滤波',g:0,sw:0.005,v:'bode',f(b){b.add('A',[2,9],[2,3],{v:1,f:1000});b.w([2,3],[5,3]);b.add('R',[5,3],[11,3],{v:1000});b.w([11,3],[14,3]);b.add('C',[14,3],[14,9],{v:1e-7});b.w([14,9],[2,9]);b.one('G',[8,9]);b.one('P',[2,3],{name:'Vin'});b.one('P',[14,3],{name:'Vout'});}};
PRE.res={n:'串联 RLC 谐振',g:0,sw:0.005,v:'bode',f(b){b.add('A',[2,9],[2,3],{v:1,f:1592});b.w([2,3],[4,3]);b.add('L',[4,3],[9,3],{v:0.01});b.add('C',[9,3],[13,3],{v:1e-6});b.w([13,3],[15,3]);b.add('R',[15,3],[15,9],{v:10});b.w([15,9],[2,9]);b.one('G',[8,9]);b.one('P',[2,3],{name:'Vin'});b.one('P',[15,3],{name:'VR'});}};
PRE.thev={n:'惠斯通电桥 + 戴维宁',g:0,sw:0.01,v:'ana',f(b){b.add('V',[2,10],[2,2],{v:10});b.w([2,2],[8,2]);b.w([8,2],[14,2]);b.add('R',[8,2],[8,6],{v:1000});b.add('R',[8,6],[8,10],{v:2000});b.add('R',[14,2],[14,6],{v:3000});b.add('R',[14,6],[14,10],{v:4000});
  b.w([2,10],[8,10]);b.w([8,10],[14,10]);b.add('VM',[8,6],[14,6]);b.one('G',[5,10]);}};
PRE.half={n:'半波整流 + 滤波',g:1,sw:0.1,f(b){b.add('A',[2,9],[2,3],{v:12,f:50});b.w([2,3],[5,3]);b.add('D',[5,3],[9,3],{showI:true});b.w([9,3],[18,3]);b.add('S',[13,3],[13,5]);b.add('C',[13,5],[13,9],{v:470e-6});b.add('R',[18,3],[18,9],{v:100});b.w([18,9],[2,9]);b.one('G',[8,9]);b.one('P',[2,3],{name:'Vs'});b.one('P',[18,3],{name:'Vout'});}};
PRE.bridge={n:'桥式全波整流',g:1,sw:0.1,f(b){b.add('A',[12,6],[8,6],{v:12,f:50,showI:true});b.add('D',[8,6],[8,2]);b.add('D',[8,10],[8,6]);b.add('D',[12,6],[12,2]);b.add('D',[12,10],[12,6]);b.w([8,2],[20,2]);b.w([8,10],[20,10]);
  b.add('S',[16,2],[16,4]);b.add('C',[16,4],[16,10],{v:470e-6});b.add('R',[20,2],[20,10],{v:100});b.one('G',[14,10]);b.one('P',[20,2],{name:'Vout'});}};
PRE.xfmr={n:'变压器 + 整流稳压',g:1,sw:0.1,f(b){b.add('A',[2,8],[2,4],{v:325,f:50});b.w([2,4],[4,4]);b.w([2,8],[4,8]);b.fp('XF',[4,5],{n:0.05});b.w([4,6],[4,8]);b.one('G',[2,8]);
  b.w([8,4],[10,4]);b.w([8,6],[8,8],[14,8]);b.add('D',[10,4],[14,4]);b.add('C',[14,4],[14,8],{v:1000e-6});b.w([14,4],[16,4]);b.add('R',[16,4],[20,4],{v:220});b.add('Z',[20,8],[20,4],{vz:9.1});b.w([14,8],[20,8]);b.w([20,4],[23,4]);b.add('R',[23,4],[23,8],{v:1000});b.w([20,8],[23,8]);
  b.one('G',[17,8]);b.one('P',[14,4],{name:'Vc'});b.one('P',[23,4],{name:'Vout'});}};
PRE.zener={n:'稳压管稳压',g:1,sw:0.04,f(b){b.add('A',[2,9],[2,3],{v:3,f:50,off:12});b.w([2,3],[4,3]);b.add('R',[4,3],[9,3],{v:470});b.w([9,3],[13,3]);b.add('Z',[9,9],[9,3],{vz:5.1,showI:true});b.add('R',[13,3],[13,9],{v:1000});b.w([13,9],[2,9]);b.one('G',[6,9]);b.one('P',[2,3],{name:'Vin'});b.one('P',[13,3],{name:'Vout'});}};
PRE.led={n:'LED 与限流电阻',g:1,sw:0.01,v:'ana',f(b){b.add('V',[2,9],[2,3],{v:9});b.w([2,3],[4,3]);b.add('S',[4,3],[7,3]);b.add('R',[7,3],[11,3],{v:330});b.add('AM',[11,3],[14,3]);b.add('LED',[14,3],[14,9]);b.w([14,9],[2,9]);b.one('G',[8,9]);b.add('VM',[16,9],[16,3]);b.w([14,3],[16,3]);b.w([14,9],[16,9]);}};
PRE.npn={n:'NPN 三极管开关',g:1,sw:1,f(){}};
PRE.inv={n:'反相放大器（运放）',g:1,sw:0.005,f(b){b.add('A',[3,10],[3,5],{v:0.5,f:1000});b.w([3,5],[5,5]);b.add('R',[5,5],[9,5],{v:1000,name:'R1'});b.w([9,5],[10,5]);b.fp('OA',[10,6]);b.w([9,5],[9,2]);b.add('R',[9,2],[15,2],{v:10000,name:'Rf'});b.w([15,2],[15,6]);b.w([14,6],[15,6]);b.w([15,6],[17,6]);b.add('R',[17,6],[17,10],{v:10000,name:'RL'});
  b.w([10,7],[10,10]);b.w([3,10],[10,10]);b.w([10,10],[17,10]);b.one('G',[7,10]);b.one('P',[3,5],{name:'Vin'});b.one('P',[17,6],{name:'Vout'});}};
PRE.schmitt={n:'施密特触发器',g:1,sw:0.2,f(b){b.add('A',[3,10],[3,5],{v:10,f:10,wave:'tri'});b.w([3,5],[10,5]);b.fp('OA',[10,6]);b.w([14,6],[17,6]);b.add('R',[17,6],[17,9],{v:10000,name:'R1'});b.w([17,9],[10,9]);b.w([10,7],[10,9]);b.add('R',[10,9],[10,12],{v:10000,name:'R2'});
  b.w([3,10],[3,12],[10,12]);b.one('G',[6,12]);b.one('P',[3,5],{name:'Vin'});b.one('P',[17,6],{name:'Vout'});}};
PRE.npn.f=function(b){b.add('Q',[2,12],[2,7],{v:5,f:2});b.w([2,7],[3,7]);b.add('R',[3,7],[8,7],{v:10000,name:'Rb'});b.fp('NPN',[8,7]);b.w([10,9],[10,12]);
  b.add('V',[17,12],[17,0],{v:9});b.w([17,0],[10,0]);b.add('R',[10,0],[10,3],{v:470,name:'Rc'});b.add('LED',[10,3],[10,5]);b.w([2,12],[17,12]);b.one('G',[6,12]);b.one('P',[2,7],{name:'Vin'});b.one('P',[10,5],{name:'Vc'});};
function loadPreset(k){const p=PRE[k];if(!p)return;els=[];sel.clear();running=false;curP=k;p.f(B());sweepMode='fixed';sweep=p.sw;view=p.v||'scope';$('bOut').dataset.touched='';
  errMsg='';flashIds=null;sim=null;net=null;rebuild('topo');sim.resetState(initMode);clearBufs();prefill();hist.reset();syncUndo();autoFit=true;fitView();syncView();syncBar();pressPresets();renderProps();Lab.draw(1);}
function pressPresets(){pressGroup('#presets [data-p]',b=>b.dataset.p===curP);const ps=$('pSel');if(ps)ps.value=curP||'';}
$('presets').innerHTML=[['基础电路',0],['半导体与运放',1]].map(([t,gi])=>`<div class="btns" role="group" aria-label="${t}"><span class="grp">${t}</span>${Object.entries(PRE).filter(([,p])=>p.g===gi).map(([k,p])=>`<button data-p="${k}">${p.n}</button>`).join('')}</div>`).join('');
$('presets').addEventListener('click',ev=>{const b=ev.target.closest('[data-p]');if(b)loadPreset(b.dataset.p);});
$('presets').insertAdjacentHTML('beforeend',`<label class="psel">预设 <select id="pSel"><option value="">— 选一个预设电路 —</option>${[['基础电路',0],['半导体与运放',1]].map(([t,gi])=>`<optgroup label="${t}">${Object.entries(PRE).filter(([,p])=>p.g===gi).map(([k,p])=>`<option value="${k}">${p.n}</option>`).join('')}</optgroup>`).join('')}</select></label>`);
$('pSel').addEventListener('change',ev=>{if(ev.target.value)loadPreset(ev.target.value);});

/* ================= main draw / animation ================= */
function lab1(){if(!net)return;if(autoFit)fitView();drawSch();if(view==='scope')drawScope();else if(view==='bode')drawBode();else drawAna();liveProps();}
Lab.add(1,lab1,{sch:300,scope:150,bodeC:220});
let simAcc=0,lastDiag=0;
const anim=Lab.anim(1,sch,dt=>{const spd=+$('speed').value,h=sweep/SAMPLES;simAcc+=dt*spd*(SAMPLES/2);let n=Math.min(Math.floor(simAcc),600);simAcc=Math.min(simAcc-n,60);
  const t0=performance.now();let done=0;while(done<n){const k=Math.min(50,n-done);if(!stepSafe(k,h))break;done+=k;if(performance.now()-t0>14){simAcc=0;break;}}
  const imax=Math.max(1e-9,...els.map(e=>Math.abs((e.t==='w'||isTwo(e))?(e.i||0):0)));for(const e of els)if(e.t==='w'||isTwo(e))e.ph=(e.ph||0)+(e.i||0)/imax*V.gu*3*dt;
  drawSch();if(view==='scope')drawScope();if(performance.now()-lastDiag>500){lastDiag=performance.now();updateDiag();liveProps();}if(!running)syncBar();},()=>running);/* user pressed Run: runs even with reduced motion */
new ResizeObserver(()=>{if(autoFit&&net)fitView();scheduleDraw();}).observe($('schWrap'));
addEventListener('keyup',ev=>{if(ev.key===' ')spaceDown=false;});

/* ================= startup ================= */
async function boot(){const m=/#c=([\w-]+)/.exec(location.hash),qp=new URLSearchParams(location.search).get('p');
  if(m){try{const s=await K.decode(m[1]);els=deser(s,false);curP='';sim=null;net=null;rebuild('topo');sim.resetState(initMode);clearBufs();prefill();hist.reset();autoFit=true;fitView();syncView();syncBar();renderProps();flashMsg('已载入分享的电路');Lab.draw(1);return;}catch(e){}}
  loadPreset(PRE[qp]?qp:'rc');
  const last=K.store.get(STORE);if(last&&!qp&&!window.EMBED_LAB){$('restore').hidden=false;}}
$('restore').addEventListener('click',()=>{const last=K.store.get(STORE);if(!last)return;try{els=deser(last,false);curP='';sim=null;net=null;rebuild('topo');sim.resetState(initMode);clearBufs();prefill();hist.reset();autoFit=true;fitView();syncBar();pressPresets();renderProps();Lab.draw(1);$('restore').hidden=true;}catch(e){}});
setTool('s');syncView();boot();Lab.start();
window.__V=V;window.__dbg=()=>drag;window.__circuit={get els(){return els;},get net(){return net;},get sim(){return sim;},loadPreset,rebuild,ser:()=>ser(els,false),PRE};
})();
