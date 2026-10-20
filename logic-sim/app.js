/* Logic simulator UI: editor, drawing, logic analyser, truth table + K-map, state diagram, synthesis. Needs common.js, simkit.js, engine.js. */
(()=>{
const K=SimKit,{key,eq,route,segDist,clamp}=K,{LIB}=LE;
const STORE='eee-logic-sim:last',HIST=200;

/* ================= state ================= */
let comps=[],wires=[],uid=1,net=null,sim=null,running=false,tool='s',sel=new Set(),view='la',curP='',autoFit=true,flashIds=null,flashT=0,hl=null,hlPath=null;
let hist2=[],cursor=null;
const V=new K.View({gu:24,min:6,max:56});
const newId=()=>uid++;
const all=()=>comps.concat(wires);
const hist=new K.History(()=>ser(true),s=>{load(s,true);sel=new Set([...sel].filter(id=>all().some(e=>e.id===id)));rebuild(true);});

/* ================= serialisation ================= */
const KEEP=['t','x','y','name','n','d','half','ph','on','v','edge','init','q0'];
function ser(ids,list){const C=list?list.filter(e=>!e.a):comps,W=list?list.filter(e=>e.a):wires;
  return JSON.stringify({v:2,c:C.map(c=>{const o={};if(ids)o.id=c.id;KEEP.forEach(k=>{if(c[k]!==undefined&&c[k]!==''&&!(k==='d'&&c[k]===1)&&!(k==='n'&&c[k]===2))o[k]=c[k];});return o;}),w:W.map(w=>ids?[w.a,w.b,w.id]:[w.a,w.b])});}
function parse(s,ids){const d=JSON.parse(s);const C=(d.c||[]).filter(o=>LIB[o.t]).map(o=>{const c={d:1,...o};if(!ids||!c.id)c.id=newId();else uid=Math.max(uid,c.id+1);if(LIB[c.t].gate&&!LIB[c.t].one)c.n=c.n||2;return c;});
  const W=(d.w||[]).map(w=>{const o={a:w[0],b:w[1],id:ids&&w[2]?w[2]:newId()};uid=Math.max(uid,o.id+1);return o;});return {C,W};}
function load(s,ids){const {C,W}=parse(s,ids);comps=C;wires=W;}
const isW=e=>!!e.a;
function autoName(t){const base=t==='IN'?'ABCDEFGH'.split(''):t==='OUT'?'TUVWXYZ'.split(''):t==='CLK'?['CLK','CK2','CK3']:t==='BTN'?['BT1','BT2','BT3']:t==='HEX'?['HEX1','HEX2']:['n1','n2','n3','n4','n5','n6','n7','n8'];
  const used=new Set(comps.map(c=>c.name));for(const s of base)if(!used.has(s))return s;let i=1;while(used.has(t+i))i++;return t+i;}
function mkComp(t,x,y){const c={t,x,y,id:newId(),d:1};if(LIB[t].gate&&!LIB[t].one)c.n=2;if('IN OUT CLK LBL BTN HEX'.split(' ').includes(t))c.name=autoName(t);if(t==='CLK')c.half=8;if(t==='CONST'){c.v=1;c.name='1';}if(t==='IN')c.on=0;return c;}

/* ================= build / simulate ================= */
let traces=[];
function rebuild(topo=true){wires=LE.normalize(comps,wires,newId);net=LE.build(comps,wires);const old=sim;sim=new LE.Sim(net);
  if(old&&old.net){/* keep flip-flop states and tick when only editing */sim.tick=old.tick;}
  makeTraces();settle();tt.dirty=true;sd.dirty=true;renderDiag();saveLocal();Lab.draw(1);}
function makeTraces(){const T=[],seen=new Set(),nets=new Set();const tr=(c,nn,kind)=>{if(nn==null||seen.has(c.name)||nets.has(nn))return;seen.add(c.name);nets.add(nn);T.push({name:c.name||'?',net:nn,kind});};
  comps.filter(c=>c.t==='CLK').forEach(c=>tr(c,c.outs[0],'clk'));comps.filter(c=>c.t==='IN'||c.t==='BTN').forEach(c=>tr(c,c.outs[0],'in'));
  comps.filter(c=>c.t==='LBL').forEach(c=>tr(c,c.net,'lbl'));comps.filter(c=>c.t==='OUT').forEach(c=>tr(c,c.ins[0],'out'));traces=T;hist2=[];record();}
function record(){hist2.push({t:sim.tick,v:traces.map(t=>sim.val[t.net]),hex:comps.filter(c=>c.t==='HEX').map(c=>hexVal(c)),o:comps.filter(c=>c.t==='OUT').map(c=>sim.val[c.ins[0]])});if(hist2.length>HIST)hist2.shift();}
function step(){sim.step();record();}
function settle(){for(let i=0;i<30;i++)step();}
function hexVal(c){const v=c.ins.map(i=>sim.rd(i));return v.some(x=>x==='X')?'X':v.reduce((a,b)=>a*2+b,0);}
function resetSim(){sim.reset();hist2=[];record();settle();Lab.draw(1);}
function commit(){autoFit=false;if(hist.commit())syncUndo();}

/* ================= diagnostics ================= */
function renderDiag(){const d=net?net.diags:[],ic={err:'✖',warn:'⚠',info:'ℹ'};const h=d.map((x,i)=>`<li class="${x.lv}" data-i="${i}">${ic[x.lv]} ${esc(x.msg)}</li>`).join('');if($('diag').innerHTML!==h)$('diag').innerHTML=h;}
$('diag').addEventListener('click',ev=>{const li=ev.target.closest('li');if(!li)return;const d=net.diags[+li.dataset.i];if(!d)return;sel=new Set(d.ids);flashIds=new Set(d.ids);flashT=performance.now();renderProps();Lab.draw(1);});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ================= drawing ================= */
const vc=v=>v===1?css('--green'):v==='X'?css('--red'):v==='Z'?css('--line'):css('--muted');
let SW_=0,SH_=0,drawQueued=false,lblLeft=new Set();
function scheduleDraw(){if(drawQueued)return;drawQueued=true;requestAnimationFrame(()=>{drawQueued=false;drawSch();});}
function bbox(C=comps,W=wires){let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;const ext=(x,y)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);};
  C.forEach(c=>{const b=LE.box(c);ext(c.x+b[0],c.y+b[1]);ext(c.x+b[2],c.y+b[3]);LE.pins(c).forEach(q=>ext(...q.p));if(c.t==='LBL')ext(c.x+2.2,c.y);});W.forEach(w=>{ext(...w.a);ext(...w.b);});
  return isFinite(x0)?[x0-1,y0-1.2,x1+1.5,y1+1.2]:[0,0,30,16];}
function fitView(){const c=$('sch');V.fit(bbox(),c.getBoundingClientRect().width||600,+c.dataset.h||440,16,window.EMBED_LAB?24:30);}
function drawSch(){const c=$('sch');const wide=(c.getBoundingClientRect().width||600)>=620;c.dataset.h=window.EMBED_LAB?300:wide?440:360;
  const [g,W,H]=fit(c);SW_=W;SH_=H;const gu=V.gu,P=p=>[V.sx(p[0]),V.sy(p[1])],fs=clamp(gu*0.42,8,14);
  const step=gu<10?2:1,x0=Math.floor(V.wx(0)),x1=Math.ceil(V.wx(W)),y0=Math.floor(V.wy(0)),y1=Math.ceil(V.wy(H));g.fillStyle=css('--grid');
  for(let i=x0;i<=x1;i++){if(i%step)continue;for(let j=y0;j<=y1;j++){if(j%step)continue;g.fillRect(V.sx(i)-1,V.sy(j)-1,2,2);}}
  if(!net)return;const flash=flashIds&&performance.now()-flashT<2400?flashIds:null;
  wires.forEach(w=>{const v=sim.val[w.net],s=sel.has(w.id),h=hl!==null&&w.net===hl;
    if(flash&&flash.has(w.id)){g.strokeStyle=css('--red');g.globalAlpha=.3;g.lineWidth=10;g.beginPath();g.moveTo(...P(w.a));g.lineTo(...P(w.b));g.stroke();g.globalAlpha=1;}
    if(h){g.strokeStyle=css('--accent');g.globalAlpha=.25;g.lineWidth=9;g.beginPath();g.moveTo(...P(w.a));g.lineTo(...P(w.b));g.stroke();g.globalAlpha=1;}
    g.strokeStyle=s?css('--accent'):vc(v);g.lineWidth=s?4:v===1?3:2.2;g.lineCap='round';g.beginPath();g.moveTo(...P(w.a));g.lineTo(...P(w.b));g.stroke();});
  const cnt=new Map();wires.forEach(w=>[w.a,w.b].forEach(p=>cnt.set(key(p),(cnt.get(key(p))||0)+1)));comps.forEach(c=>LE.pins(c).forEach(q=>cnt.set(key(q.p),(cnt.get(key(q.p))||0)+1)));
  g.fillStyle=css('--ink');cnt.forEach((n,k)=>{if(n>=3){const [x,y]=k.split(',').map(Number);g.beginPath();g.arc(V.sx(x),V.sy(y),Math.max(2.2,gu*0.12),0,7);g.fill();}});
  lblLeft=new Set();comps.forEach(c=>{if(c.t!=='LBL')LE.pins(c).forEach(q=>{if(q.io==='i')lblLeft.add(key(q.p));});});
  comps.forEach(c=>{if(flash&&flash.has(c.id)){const b=LE.box(c);g.fillStyle=css('--red');g.globalAlpha=.18;g.fillRect(V.sx(c.x+b[0])-4,V.sy(c.y+b[1])-4,(b[2]-b[0])*gu+8,(b[3]-b[1])*gu+8);g.globalAlpha=1;}
    if(hlPath&&hlPath.has(c.id)){const b=LE.box(c);g.strokeStyle=css('--purple');g.lineWidth=2;g.setLineDash([4,3]);g.strokeRect(V.sx(c.x+b[0])-4,V.sy(c.y+b[1])-4,(b[2]-b[0])*gu+8,(b[3]-b[1])*gu+8);g.setLineDash([]);}
    drawComp(g,c,P,fs,false);});
  if(drag&&drag.kind==='draw'&&drag.to){const pts=route(drag.from,drag.to,drag.vFirst);g.strokeStyle=css('--accent');g.setLineDash([5,4]);g.lineWidth=2;g.beginPath();pts.forEach((p,i)=>{const q=P(p);i?g.lineTo(...q):g.moveTo(...q);});g.stroke();g.setLineDash([]);}
  if(drag&&drag.kind==='box'){const [ax,ay]=drag.p0,[bx,by]=drag.p1;g.strokeStyle=css('--accent');g.fillStyle=css('--shade');g.setLineDash([4,3]);g.lineWidth=1;g.fillRect(Math.min(ax,bx),Math.min(ay,by),Math.abs(bx-ax),Math.abs(by-ay));g.strokeRect(Math.min(ax,bx),Math.min(ay,by),Math.abs(bx-ax),Math.abs(by-ay));g.setLineDash([]);}
  if(hover&&!drag&&LIB[tool]){g.globalAlpha=.35;drawComp(g,{...mkComp(tool,hover[0],hover[1]),name:'',out:[0,1,0,0],ins:[],outs:[]},P,fs,true);g.globalAlpha=1;}
  else if(hover&&!drag&&tool==='w'){g.strokeStyle=css('--accent');g.lineWidth=1.5;g.beginPath();g.arc(V.sx(hover[0]),V.sy(hover[1]),Math.max(4,gu*0.18),0,7);g.stroke();}
  text(g,`第 ${sim.tick} 拍`,W-8,H-8,css('--muted'),11,'right');
  if(!comps.length)text(g,'空电路：选元件点一下放下，导线从一点拖到另一点；或者到「生成电路」里输入表达式',W/2,H/2,css('--muted'),13,'center');}
function drawComp(g,c,P,fs,ghost){const L=LIB[c.t],u=V.gu,[X,Y]=P([c.x,c.y]),ink=sel.has(c.id)?css('--accent'):css('--ink');g.lineWidth=2;g.strokeStyle=ink;g.fillStyle=ink;g.lineCap='round';g.lineJoin='round';
  const pv=i=>ghost||!c.ins?0:sim.val[c.ins[i]],ov=j=>ghost||!c.out?0:c.out[j];
  const lead=(a,b,v)=>{g.strokeStyle=vc(v);g.lineWidth=v===1?3:2.2;g.beginPath();g.moveTo(...P(a));g.lineTo(...P(b));g.stroke();g.strokeStyle=ink;g.lineWidth=2;};
  if(L.gate){const one=L.one,n=c.n||2,ys=n<=2?[-1,1]:n===3?[-1,0,1]:[-2,-1,1,2],x0=c.x+0.6,x1=c.x+(one?2.1:3.3),h=one?0.7:n>=4?2.4:1.25,bub=c.t.startsWith('N')&&c.t!=='NOT'||c.t==='XNOR'||c.t==='NOT';
    if(one){lead([c.x,c.y],[x0,c.y],pv(0));lead([x1+(bub?0.25:0),c.y],[c.x+3,c.y],ov(0));}
    else{ys.forEach((dy,k)=>lead([c.x,c.y+dy],[x0+0.25,c.y+dy],pv(k)));lead([x1+(bub?0.25:0),c.y],[c.x+4,c.y],ov(0));}
    g.fillStyle=css('--panel');g.beginPath();const Lx=x0*u+V.ox,R=x1*u+V.ox,T=(c.y-h)*u+V.oy,B=(c.y+h)*u+V.oy,M=c.y*u+V.oy;
    if(one){g.moveTo(Lx,T);g.lineTo(R,M);g.lineTo(Lx,B);g.closePath();}
    else if(c.t==='AND'||c.t==='NAND'){g.moveTo(Lx,T);g.lineTo((Lx+R)/2,T);g.arc((Lx+R)/2,M,(B-T)/2,-Math.PI/2,Math.PI/2);g.lineTo(Lx,B);g.closePath();}
    else{const xo=c.t.startsWith('X')?0.25*u:0;g.moveTo(Lx+xo,T);g.quadraticCurveTo(Lx+xo+(R-Lx)*0.6,T,R,M);g.quadraticCurveTo(Lx+xo+(R-Lx)*0.6,B,Lx+xo,B);g.quadraticCurveTo(Lx+xo+(R-Lx)*0.3,M,Lx+xo,T);g.closePath();
      if(xo){g.fill();g.stroke();g.beginPath();g.moveTo(Lx,T);g.quadraticCurveTo(Lx+(R-Lx)*0.3,M,Lx,B);}}
    g.fill();g.stroke();if(bub){g.beginPath();g.arc(R+u*0.13,M,u*0.13,0,7);g.fill();g.stroke();}
    if(n>=4&&!one&&(c.t==='AND'||c.t==='NAND')){/* extend input edge */g.beginPath();g.moveTo(Lx,(c.y-2)*u+V.oy);g.lineTo(Lx,(c.y+2)*u+V.oy);g.stroke();}
    if((c.d||1)>1&&!ghost)text(g,`${c.d} 拍`,(Lx+R)/2,B+fs+1,css('--purple'),fs*0.85,'center');return;}
  if(L.ff||L.latch||L.blk){const b=LE.box(c),Lx=V.sx(c.x+b[0]),R=V.sx(c.x+b[2]),T=V.sy(c.y+b[1]),B=V.sy(c.y+b[3]);
    let oi=0,ii=0;L.pins.forEach(([dx,dy,io])=>{const p=[c.x+dx,c.y+dy];if(io==='i'){const v=pv(ii++);if(dy>=b[3])lead(p,[p[0],c.y+b[3]],v);else lead(p,[c.x+b[0],p[1]],v);}else lead([c.x+b[2],p[1]],p,ov(oi++));});
    g.fillStyle=css('--panel');g.beginPath();if(c.t.startsWith('MUX')){g.moveTo(Lx,T);g.lineTo(R,T+(B-T)*0.18);g.lineTo(R,B-(B-T)*0.18);g.lineTo(Lx,B);g.closePath();}else g.rect(Lx,T,R-Lx,B-T);g.fill();g.stroke();g.fillStyle=ink;
    L.pins.forEach(([dx,dy,io,lb])=>{const y=V.sy(c.y+dy);if(lb==='>'){g.beginPath();g.moveTo(Lx,y-u*0.25);g.lineTo(Lx+u*0.3,y);g.lineTo(Lx,y+u*0.25);g.stroke();if(c.edge==='f'){g.beginPath();g.arc(Lx-u*0.13,y,u*0.12,0,7);g.stroke();}}
      else if(dy>=b[3])text(g,lb,V.sx(c.x+dx),B-3,ink,fs*0.85,'center');else text(g,lb,io==='i'?Lx+u*0.12:R-u*0.12,y+fs*0.35,ink,fs*0.9,io==='i'?'left':'right');});
    const nm={DFF:'D',TFF:'T',JKFF:'JK',SRFF:'SR',DLATCH:'锁存',MUX2:'MUX',MUX4:'MUX',DEC2:'2→4',FA:'Σ'}[c.t];text(g,nm,(Lx+R)/2,(T+B)/2+fs*0.35+(L.ff&&c.t!=='DFF'&&c.t!=='TFF'?u*0.9:0)+(c.t==='DLATCH'?0:0),css('--muted'),fs,'center');return;}
  if(c.t==='IN'||c.t==='BTN'||c.t==='CONST'||c.t==='CLK'){lead([c.x+0.45,c.y],[c.x+1,c.y],ov(0));const v=ov(0);g.fillStyle=v===1?css('--green'):css('--panel');g.beginPath();
    if(c.t==='BTN'){g.arc(X-u*0.15,Y,u*0.5,0,7);}else g.roundRect?g.roundRect(X-u*0.75,Y-u*0.45,u*1.2,u*0.9,c.t==='CONST'?2:5):g.rect(X-u*0.75,Y-u*0.45,u*1.2,u*0.9);g.fill();g.stroke();
    if(c.t==='CLK'){g.strokeStyle=v===1?css('--panel'):ink;g.beginPath();g.moveTo(X-u*0.55,Y+u*0.2);g.lineTo(X-u*0.35,Y+u*0.2);g.lineTo(X-u*0.35,Y-u*0.2);g.lineTo(X-u*0.1,Y-u*0.2);g.lineTo(X-u*0.1,Y+u*0.2);g.lineTo(X+u*0.15,Y+u*0.2);g.lineTo(X+u*0.15,Y-u*0.2);g.lineTo(X+u*0.35,Y-u*0.2);g.stroke();}
    else label(g,String(v===1?1:0),X-u*0.25,Y+fs*0.38,v===1?css('--panel'):ink,fs*1.1);
    if(c.t!=='CONST')text(g,c.name||'',X-u*0.15,Y-u*0.62,ink,fs,'center');return;}
  if(c.t==='OUT'){const v=pv(0);lead([c.x-1,c.y],[c.x-0.4,c.y],v);g.beginPath();g.arc(X,Y,u*0.4,0,7);g.fillStyle=v===1?css('--amp'):v==='X'?css('--red'):css('--panel');g.fill();g.stroke();text(g,c.name||'',X+u*0.55,Y+fs*0.35,ink,fs);return;}
  if(c.t==='HEX'){const b=LE.box(c);LE.LIB.HEX.pins.forEach(([dx,dy,io,lb],i)=>{lead([c.x+dx,c.y+dy],[c.x+b[0],c.y+dy],pv(i));text(g,lb,V.sx(c.x+b[0])+3,V.sy(c.y+dy)+fs*0.35,css('--muted'),fs*0.75);});
    const Lx=V.sx(c.x+b[0]),T=V.sy(c.y+b[1]),Wd=(b[2]-b[0])*u,Hd=(b[3]-b[1])*u;g.fillStyle=css('--panel');g.fillRect(Lx,T,Wd,Hd);g.strokeRect(Lx,T,Wd,Hd);
    const val=ghost||!c.ins?0:hexVal(c);seg7(g,Lx+Wd*0.36,T+Hd*0.12,Wd*0.5,Hd*0.76,val);if(c.name)text(g,c.name,Lx+Wd/2,T-4,ink,fs*0.85,'center');return;}
  if(c.t==='LBL'){const v=ghost||!net?0:sim.val[c.net];g.font=`600 ${fs}px ${css('--mono')}`;const w=g.measureText(c.name||'?').width+u*0.4;g.fillStyle=css('--panel');g.strokeStyle=sel.has(c.id)?css('--accent'):vc(v);g.lineWidth=1.6;
    const sg=!ghost&&lblLeft.has(key([c.x,c.y]))?-1:1;g.beginPath();g.moveTo(X,Y);g.lineTo(X+sg*u*0.25,Y-u*0.3);g.lineTo(X+sg*(u*0.25+w),Y-u*0.3);g.lineTo(X+sg*(u*0.25+w),Y+u*0.3);g.lineTo(X+sg*u*0.25,Y+u*0.3);g.closePath();g.fill();g.stroke();
    label(g,c.name||'?',sg>0?X+u*0.42:X-u*0.42-w+u*0.4,Y+fs*0.36,v===1?css('--green'):v==='X'?css('--red'):ink,fs);}}
const SEG={0:'abcdef',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgedc',7:'abc',8:'abcdefg',9:'abcdfg',10:'abcefg',11:'fegcd',12:'afed',13:'bcdeg',14:'afged',15:'afge'};
function seg7(g,x,y,w,h,v){const on=v==='X'?'g':SEG[v]||'',t=Math.max(2,w*0.16),pts={a:[[0,0],[1,0]],b:[[1,0],[1,0.5]],c:[[1,0.5],[1,1]],d:[[0,1],[1,1]],e:[[0,0.5],[0,1]],f:[[0,0],[0,0.5]],g:[[0,0.5],[1,0.5]]};
  g.lineCap='round';for(const s of 'abcdefg'){const [[a,b],[c2,d]]=pts[s];g.strokeStyle=on.includes(s)?(v==='X'?css('--red'):css('--red')):css('--grid');g.globalAlpha=on.includes(s)?1:0.6;g.lineWidth=t;g.beginPath();g.moveTo(x+a*w,y+b*h);g.lineTo(x+c2*w,y+d*h);g.stroke();}g.globalAlpha=1;}

/* ================= hit testing & editing ================= */
const ptr=ev=>{const r=$('sch').getBoundingClientRect();return [ev.clientX-r.left,ev.clientY-r.top];};
const snap=([px,py])=>[Math.round(V.wx(px)),Math.round(V.wy(py))];
function hitTest([px,py]){const wx=V.wx(px),wy=V.wy(py);
  for(let i=comps.length-1;i>=0;i--){const c=comps[i],b=LE.box(c);if(wx>=c.x+b[0]&&wx<=c.x+b[2]&&wy>=c.y+b[1]&&wy<=c.y+b[3])return c;}
  let best=null,bd=0.3;wires.forEach(w=>{const d=segDist(wx,wy,w.a,w.b);if(d<bd){bd=d;best=w;}});return best;}
function netAt([px,py]){const wx=V.wx(px),wy=V.wy(py);for(const w of wires)if(segDist(wx,wy,w.a,w.b)<0.3)return w.net;
  for(const c of comps){for(const [k,q] of LE.pins(c).entries())if(Math.hypot(wx-q.p[0],wy-q.p[1])<0.35){return q.io==='i'?c.ins[LE.pins(c).filter(z=>z.io==='i').indexOf(q)]:q.io==='o'?c.outs[LE.pins(c).filter(z=>z.io==='o').indexOf(q)]:c.net;}if(c.t==='LBL'){const b=LE.box(c);if(wx>=c.x+b[0]&&wx<=c.x+b[2]&&Math.abs(wy-c.y)<0.4)return c.net;}}return null;}
function carry(list){const m=new Map(comps.map(c=>[c.id,c]));list.forEach(c=>{const o=m.get(c.id);if(o&&o.t===c.t){['s','q','out','prev','ins','outs','net'].forEach(k=>{if(o[k]!==undefined)c[k]=o[k];});}});return list;}
function transformSel(base,ids,dx,dy){const {C,W}=parse(base,true);carry(C);const moved=new Set();
  C.forEach(c=>{if(!ids.has(c.id))return;LE.pins(c).forEach(q=>moved.add(key(q.p)));c.x+=dx;c.y+=dy;});
  W.forEach(w=>{if(ids.has(w.id)){moved.add(key(w.a));moved.add(key(w.b));}});
  const sh=p=>[p[0]+dx,p[1]+dy],keep=[],jobs=[];
  W.forEach(w=>{if(ids.has(w.id)){w.a=sh(w.a);w.b=sh(w.b);keep.push(w);return;}const ma=moved.has(key(w.a)),mb=moved.has(key(w.b));
    if((!ma&&!mb)||(!dx&&!dy)){keep.push(w);return;}if(ma&&mb){w.a=sh(w.a);w.b=sh(w.b);keep.push(w);return;}
    jobs.push({from:ma?w.b:w.a,to:ma?sh(w.a):sh(w.b),v:w.a[0]===w.b[0]});});
  if(dx||dy)C.forEach(c=>{if(ids.has(c.id))return;LE.pins(c).forEach(q=>{if(moved.has(key(q.p)))jobs.push({from:q.p,to:sh(q.p)});});});
  const boxes=C.map(c=>{const b=LE.box(c);return [c.x+b[0],c.y+b[1],c.x+b[2],c.y+b[3]];}),pins=C.flatMap(c=>LE.pins(c).map(q=>key(q.p)));
  jobs.forEach(j=>{const ob={segs:keep.map(w=>[w.a,w.b]),pts:new Set([...pins,...keep.flatMap(w=>[key(w.a),key(w.b)])]),boxes};ob.pts.delete(key(j.from));ob.pts.delete(key(j.to));
    const p=K.smartRoute(j.from,j.to,ob,j.v);for(let i=0;i+1<p.length;i++)keep.push({a:p[i],b:p[i+1],id:newId()});});
  return {C,W:keep};}
function deleteSel(){if(!sel.size)return;comps=comps.filter(c=>!sel.has(c.id));wires=wires.filter(w=>!sel.has(w.id));sel.clear();rebuild();commit();renderProps();}
let clip=null;function copySel(){const list=all().filter(e=>sel.has(e.id));if(list.length)clip=ser(false,list);}
function paste(at){if(!clip)return;const {C,W}=parse(clip,false),b=bbox(C,W),dx=at?at[0]-Math.round(b[0]+1):3,dy=at?at[1]-Math.round(b[1]+1.2):3;
  C.forEach(c=>{c.x+=dx;c.y+=dy;if(c.t!=='LBL'&&c.name&&comps.some(d=>d.name===c.name))c.name=autoName(c.t);});W.forEach(w=>{w.a=[w.a[0]+dx,w.a[1]+dy];w.b=[w.b[0]+dx,w.b[1]+dy];});
  comps.push(...C);wires.push(...W);sel=new Set([...C,...W].map(e=>e.id));rebuild();commit();renderProps();}

/* ================= pointer interaction ================= */
let drag=null,hover=null;const sch=$('sch'),tip=K.tooltip($('schWrap')),gest=K.gestures(sch,V,()=>{autoFit=false;scheduleDraw();});
sch.addEventListener('contextmenu',ev=>ev.preventDefault());
sch.addEventListener('pointerdown',ev=>{if(gest.down(ev)){drag=null;return;}const p=ptr(ev),g=snap(p);sch.setPointerCapture(ev.pointerId);tip.hide();
  if(ev.button===1||ev.button===2||tool==='pan'){drag={kind:'pan',last:p};return;}
  if(tool==='x'){const h=hitTest(p);if(h){sel=new Set([h.id]);deleteSel();}return;}
  if(tool==='s'){const h=hitTest(p);
    if(h){if(ev.shiftKey){sel.has(h.id)?sel.delete(h.id):sel.add(h.id);renderProps();scheduleDraw();return;}
      if(!sel.has(h.id))sel=new Set([h.id]);renderProps();
      if(h.t==='BTN'){h.down=1;if(!running){for(let i=0;i<6;i++)step();}scheduleDraw();drag={kind:'btn',c:h};return;}
      drag={kind:'move',g0:g,base:ser(true),ids:new Set(sel),hit:h,moved:false};scheduleDraw();return;}
    if(ev.pointerType==='touch'){drag={kind:'pan',last:p};return;}
    if(!ev.shiftKey)sel.clear();renderProps();drag={kind:'box',p0:p,p1:p};scheduleDraw();return;}
  if(tool==='w'){drag={kind:'draw',from:g,to:g};return;}
  if(LIB[tool])drag={kind:'place',g0:g};});
sch.addEventListener('pointermove',ev=>{if(gest.move(ev)){drag=null;return;}const p=ptr(ev),g=snap(p);
  if(!drag){hover=g;hoverTip(ev,p);scheduleDraw();return;}
  if(drag.kind==='pan'){V.pan(p[0]-drag.last[0],p[1]-drag.last[1]);drag.last=p;autoFit=false;scheduleDraw();return;}
  if(drag.kind==='box'){drag.p1=p;scheduleDraw();return;}
  if(drag.kind==='move'){const dx=g[0]-drag.g0[0],dy=g[1]-drag.g0[1];if(dx!==drag.dx||dy!==drag.dy){drag.dx=dx;drag.dy=dy;drag.moved=drag.moved||!!(dx||dy);const r=transformSel(drag.base,drag.ids,dx,dy);comps=r.C;wires=r.W;scheduleDraw();}return;}
  if(drag.kind==='draw'){const dx=g[0]-drag.from[0],dy=g[1]-drag.from[1];if(!drag.dirSet&&(dx||dy)){drag.vFirst=Math.abs(dy)>Math.abs(dx);drag.dirSet=true;}drag.to=g;scheduleDraw();}
  hover=g;});
sch.addEventListener('pointerup',ev=>{gest.up(ev);if(!drag)return;const d=drag;drag=null;const p=ptr(ev),g=snap(p);
  if(d.kind==='pan'){scheduleDraw();return;}
  if(d.kind==='btn'){d.c.down=0;if(!running)for(let i=0;i<6;i++)step();Lab.draw(1);return;}
  if(d.kind==='box'){const [ax,ay]=[V.wx(d.p0[0]),V.wy(d.p0[1])],[bx,by]=[V.wx(d.p1[0]),V.wy(d.p1[1])],x0=Math.min(ax,bx),x1=Math.max(ax,bx),y0=Math.min(ay,by),y1=Math.max(ay,by),inb=([x,y])=>x>=x0&&x<=x1&&y>=y0&&y<=y1;
    if(Math.abs(bx-ax)+Math.abs(by-ay)>0.3){comps.forEach(c=>{if(LE.pins(c).every(q=>inb(q.p))&&inb([c.x,c.y]))sel.add(c.id);});wires.forEach(w=>{if(inb(w.a)&&inb(w.b))sel.add(w.id);});}renderProps();scheduleDraw();return;}
  if(d.kind==='move'){if(d.moved){rebuild();commit();}else if(d.hit&&d.hit.t==='IN'&&!ev.shiftKey){d.hit.on=d.hit.on?0:1;if(!running)for(let i=0;i<12;i++)step();renderProps();Lab.draw(1);}scheduleDraw();return;}
  if(d.kind==='place'){const c=mkComp(tool,g[0],g[1]);comps.push(c);sel=new Set([c.id]);rebuild();commit();renderProps();return;}
  if(d.kind==='draw'){if(eq(d.from,d.to))return;const pts=route(d.from,d.to,d.vFirst);for(let i=0;i+1<pts.length;i++)wires.push({a:pts[i],b:pts[i+1],id:newId()});rebuild();commit();}});
sch.addEventListener('pointerleave',()=>{hover=null;hl=null;tip.hide();if(!drag)scheduleDraw();});
sch.addEventListener('wheel',ev=>{if(!(ev.ctrlKey||ev.metaKey))return;ev.preventDefault();const p=ptr(ev);V.zoomAt(p[0],p[1],Math.exp(-ev.deltaY*0.0022));autoFit=false;scheduleDraw();},{passive:false});
sch.addEventListener('dblclick',ev=>{const h=hitTest(ptr(ev));if(h&&!isW(h)){sel=new Set([h.id]);renderProps();const f=$('props').querySelector('input');if(f){f.focus();f.select&&f.select();}}});
const vs=v=>v==='Z'?'悬空（按 0）':v==='X'?'X（冲突）':String(v);
function hoverTip(ev,p){if(tool!=='s'||!net){tip.hide();hl=null;return;}const n=netAt(p);hl=n;const h=hitTest(p);
  if(h&&!isW(h)){const L=LIB[h.t];let s=`<b>${esc(h.name||L.n)}</b> <span class="m">${L.n}${L.gate&&!L.one?` · ${h.n||2} 输入 · 延迟 ${h.d||1} 拍`:''}</span>`;
    const ipins=LE.pins(h).filter(q=>q.io==='i'),opins=LE.pins(h).filter(q=>q.io==='o');
    if(h.ins&&h.ins.length)s+='<br><span class="m">输入</span> '+h.ins.map((nn,i)=>`${ipins[i].lab&&ipins[i].lab!=='>'?ipins[i].lab+'=':''}${vs(sim.val[nn])}`).join(' ');
    if(h.outs&&h.outs.length)s+='<br><span class="m">输出</span> '+h.outs.map((nn,i)=>`${opins[i].lab?opins[i].lab+'=':''}${vs(h.out[i])}`).join(' ');
    if(L.ff)s+=`<br><span class="m">状态 Q</span> ${vs(h.s)} · ${h.edge==='f'?'下降沿':'上升沿'}触发`;if(h.t==='IN')s+='<br><span class="m">点一下切换</span>';if(h.t==='BTN')s+='<br><span class="m">按住为 1</span>';
    tip.show(s,ev.clientX,ev.clientY);return;}
  if(n!==null){const d=net.drivers[n].map(([c])=>c.name||LIB[c.t].n),r=net.readers[n].length;tip.show(`<b>网络</b> = ${vs(sim.val[n])}<br><span class="m">驱动</span> ${d.length?esc(d.join('、')):'无（悬空）'}<br><span class="m">接到</span> ${r} 个输入`,ev.clientX,ev.clientY);return;}
  tip.hide();}

/* ================= keyboard ================= */
addEventListener('keydown',ev=>{const tg=document.activeElement&&document.activeElement.tagName;if(/INPUT|SELECT|TEXTAREA/.test(tg))return;if(window.EMBED_LAB&&!sch.matches(':hover'))return;
  const k=ev.key,mod=ev.ctrlKey||ev.metaKey;
  if(mod&&(k==='z'||k==='Z')){ev.preventDefault();ev.shiftKey?redo():undo();return;}if(mod&&(k==='y'||k==='Y')){ev.preventDefault();redo();return;}
  if(mod&&k==='c'){copySel();return;}if(mod&&k==='v'){ev.preventDefault();paste(hover);return;}if(mod&&k==='d'){ev.preventDefault();copySel();paste();return;}
  if(mod&&k==='a'){ev.preventDefault();sel=new Set(all().map(e=>e.id));renderProps();scheduleDraw();return;}
  if(k==='Delete'||k==='Backspace'){if(sel.size){ev.preventDefault();deleteSel();}return;}
  if(k==='Escape'){setTool('s');sel.clear();renderProps();scheduleDraw();return;}
  if(k===' '){ev.preventDefault();toggleRun();return;}if(k==='.'||k==='>'){step();Lab.draw(1);return;}
  if(k==='w'||k==='W'){setTool('w');return;}
  if(/^[a-h]$/i.test(k)&&!mod){const c=comps.find(c=>c.t==='IN'&&c.name&&c.name.toLowerCase()===k.toLowerCase());if(c){c.on=c.on?0:1;if(!running)for(let i=0;i<12;i++)step();Lab.draw(1);}}});

/* ================= props ================= */
function renderProps(){const p=$('props'),list=all().filter(e=>sel.has(e.id));
  if(!list.length){p.innerHTML=tool==='s'?'<span>点开关切换 0 / 1（也可以按键盘上和开关同名的字母）；悬停看任意一根线的值和驱动；拖动移动，拖空白处框选</span>':tool==='w'?'<span>从一点拖到另一点画导线（斜着拖自动拐直角）</span>':tool==='x'?'<span>点要删除的元件或导线</span>':tool==='pan'?'<span>拖动画布平移</span>':`<span>点网格放置「${LIB[tool].n}」（半透明的是它的位置）</span>`;return;}
  if(list.length>1){p.innerHTML=`<b>已选 ${list.length} 个</b> <button data-a="dup">复制一份</button> <button data-a="del">删除</button>`;return;}
  const c=list[0];if(isW(c)){p.innerHTML='<b>导线</b> <button data-a="del">删除</button>';return;}const L=LIB[c.t];let h=`<b>${L.n}</b>`;
  if('IN OUT CLK LBL BTN HEX'.split(' ').includes(c.t))h+=` <label>名字 <input type="text" data-k="name" value="${esc(c.name||'')}" style="width:70px"></label>`;
  if(L.gate&&!L.one)h+=` <label>输入数 <select data-k="n">${[2,3,4].map(v=>`<option${(c.n||2)===v?' selected':''}>${v}</option>`).join('')}</select></label>`;
  if(L.gate)h+=` <label>延迟 <input type="number" data-k="d" min="1" max="9" value="${c.d||1}" style="width:52px"> 拍</label>`;
  if(c.t==='CLK')h+=` <label>半周期 <input type="number" data-k="half" min="1" max="60" value="${c.half||8}" style="width:52px"> 拍</label>`;
  if(L.ff)h+=` <label>触发沿 <select data-k="edge"><option value="r"${c.edge!=='f'?' selected':''}>上升沿</option><option value="f"${c.edge==='f'?' selected':''}>下降沿</option></select></label> <label>复位后 Q = <select data-k="init"><option value="0"${!c.init?' selected':''}>0</option><option value="1"${c.init?' selected':''}>1</option></select></label>`;
  if(c.t==='IN')h+=` <button data-a="tog">切换（现在 ${c.on?1:0}）</button>`;if(c.t==='CONST')h+=` <button data-a="tog">改成 ${c.v?0:1}</button>`;
  h+=` <button data-a="del">删除</button>`;p.innerHTML=h;}
$('props').addEventListener('change',ev=>{const t=ev.target,c=comps.find(q=>sel.has(q.id));if(!c||!t.dataset.k)return;const k=t.dataset.k;
  if(k==='name'){c.name=t.value.trim()||c.name;}else if(k==='edge')c.edge=t.value;else if(k==='n')c.n=+t.value;else if(k==='init')c.init=+t.value;
  else{const v=Math.round(+t.value);if(!(v>=1))return;c[k]=clamp(v,1,k==='half'?60:9);}rebuild();commit();renderProps();});
$('props').addEventListener('click',ev=>{const a=ev.target.dataset&&ev.target.dataset.a;if(!a)return;const c=comps.find(q=>sel.has(q.id));
  if(a==='del')deleteSel();else if(a==='dup'){copySel();paste();}else if(a==='tog'&&c){if(c.t==='IN')c.on=c.on?0:1;else{c.v=c.v?0:1;c.name=String(c.v);}if(!running)for(let i=0;i<12;i++)step();rebuild(false);commit();renderProps();}});

/* ================= toolbar ================= */
const TOOLS=[['编辑',[['s','选择'],['w','导线'],['pan','平移'],['x','删除']]],['输入输出',[['IN','开关'],['BTN','按钮'],['CONST','常量'],['CLK','时钟'],['OUT','LED'],['HEX','数码管'],['LBL','标签']]],
  ['门',[['NOT','非'],['BUF','缓冲'],['AND','与'],['OR','或'],['NAND','与非'],['NOR','或非'],['XOR','异或'],['XNOR','同或']]],['时序',[['DFF','D'],['TFF','T'],['JKFF','JK'],['SRFF','SR'],['DLATCH','D 锁存']]],
  ['模块',[['MUX2','MUX 2:1'],['MUX4','MUX 4:1'],['DEC2','译码 2–4'],['FA','全加器']]]];
$('tools').innerHTML=TOOLS.map(([g,l])=>`<div class="toolgrp"><span>${g}</span>${l.map(([k,n])=>`<button data-t="${k}" title="${LIB[k]?LIB[k].n:n}">${n}</button>`).join('')}</div>`).join('');
$('tools').addEventListener('click',ev=>{const b=ev.target.closest('[data-t]');if(b)setTool(b.dataset.t);});
function setTool(t){tool=t;if(t!=='s')sel.clear();pressGroup('#tools [data-t]',b=>b.dataset.t===tool);sch.style.cursor=t==='s'?'default':t==='pan'?'grab':t==='x'?'not-allowed':'crosshair';renderProps();scheduleDraw();}
function syncBar(){$('run').textContent=running?'❚❚ 暂停':'▶ 运行';$('run').setAttribute('aria-pressed',running);syncUndo();}
function syncUndo(){$('undo').disabled=!hist.canUndo;$('redo').disabled=!hist.canRedo;}
function undo(){if(hist.undo()){syncUndo();renderProps();}}function redo(){if(hist.redo()){syncUndo();renderProps();}}
function toggleRun(){running=!running;syncBar();Lab.kick(anim);Lab.draw(1);}
$('run').addEventListener('click',toggleRun);$('stepb').addEventListener('click',()=>{step();Lab.draw(1);});$('reset').addEventListener('click',resetSim);
$('undo').addEventListener('click',undo);$('redo').addEventListener('click',redo);
$('clear').addEventListener('click',()=>{comps=[];wires=[];sel.clear();running=false;curP='';rebuild();commit();syncBar();pressPresets();});
$('zin').addEventListener('click',()=>{V.zoomAt(SW_/2,SH_/2,1.25);autoFit=false;scheduleDraw();});$('zout').addEventListener('click',()=>{V.zoomAt(SW_/2,SH_/2,0.8);autoFit=false;scheduleDraw();});
$('zfit').addEventListener('click',()=>{autoFit=true;fitView();scheduleDraw();});
$('share').addEventListener('click',async()=>{const s=await K.encode(ser(false));const url=location.href.split('#')[0].replace(/[?&]p=[^&]*/,'')+'#c='+s;history.replaceState(null,'','#c='+s);const ok=await K.copyText(url);flashMsg(ok?'链接已复制：打开它就能看到这个电路':'已更新地址栏，复制地址栏里的链接即可分享');});
$('png').addEventListener('click',()=>K.download($('sch'),'logic.png'));
function flashMsg(m){const s=$('status');s.textContent=m;clearTimeout(s._t);s._t=setTimeout(()=>s.textContent='',3500);}
let saveT=0;function saveLocal(){clearTimeout(saveT);saveT=setTimeout(()=>{if(comps.length)K.store.set(STORE,ser(false));},400);}

/* ================= logic analyser ================= */
$('la').addEventListener('click',ev=>{const f=laFrame;if(!f)return;const r=$('la').getBoundingClientRect(),x=ev.clientX-r.left;if(x<f.L||x>f.R){cursor=null;drawLA();return;}const i=f.off+Math.floor((x-f.L)/(f.R-f.L)*f.N);cursor=hist2[i]?hist2[i].t:null;drawLA();});
let laFrame=null;
function drawLA(){const c=$('la'),hexs=comps.filter(c=>c.t==='HEX'),outs=comps.filter(c=>c.t==='OUT'),bus=outs.length>=2;const rows=traces.length+hexs.length+(bus?1:0),rh=window.EMBED_LAB?16:20;c.dataset.h=Math.max(70,rows*rh+34);const [g,W,H]=fit(c);
  if(!rows){text(g,'放开关、时钟、LED、数码管或网络标签，它们会出现在逻辑分析仪里',W/2,H/2,css('--muted'),12,'center');laFrame=null;return;}
  const L=70,R=W-8,N=Math.max(40,Math.min(HIST,Math.floor((R-L)/3/10)*10)),off=Math.max(0,hist2.length-N),X=i=>L+(R-L)*(i-off)/N,amp=rh*0.6;laFrame={L,R,N,off};
  const gs=(R-L)/N*10<14?20:10,ls=(R-L)/N*20<44?40:20;
  g.strokeStyle=css('--grid');g.lineWidth=1;for(let k=0;k<=N;k+=gs){const x=L+(R-L)*k/N;g.beginPath();g.moveTo(x,4);g.lineTo(x,H-18);g.stroke();}
  traces.forEach((tr,j)=>{const yb=8+j*rh+amp,col=tr.kind==='out'?css('--amp'):tr.kind==='clk'?css('--muted'):tr.kind==='in'?css('--blue'):css('--purple');label(g,tr.name,4,yb-amp/2+4,col,11);let pv=null;
    for(let i=off;i<hist2.length;i++){const v=hist2[i].v[j],x0=X(i),x1=X(i+1);
      if(v==='X'){g.fillStyle=css('--red');g.globalAlpha=.35;g.fillRect(x0,yb-amp,x1-x0,amp);g.globalAlpha=1;}
      else{const y=v===1?yb-amp:yb;g.strokeStyle=v==='Z'?css('--line'):col;g.lineWidth=2;g.beginPath();if(pv!=null&&pv!=='X'&&pv!==v&&v!=='Z'&&pv!=='Z'){g.moveTo(x0,v===1?yb:yb-amp);g.lineTo(x0,y);}else g.moveTo(x0,y);g.lineTo(x1,y);g.stroke();
        if(v===1&&tr.kind!=='clk'){g.fillStyle=col;g.globalAlpha=.1;g.fillRect(x0,yb-amp,x1-x0,amp);g.globalAlpha=1;}}pv=v;}});
  const busRow=(j,name,valAt,col)=>{const yb=8+j*rh+amp;label(g,name,4,yb-amp/2+4,col,11);let start=off;for(let i=off+1;i<=hist2.length;i++){if(i<hist2.length&&valAt(i)===valAt(start))continue;const x0=X(start),x1=X(i),v=valAt(start);
      g.strokeStyle=col;g.lineWidth=1.4;g.beginPath();g.moveTo(x0+2,yb-amp);g.lineTo(x1-2,yb-amp);g.lineTo(x1,yb-amp/2);g.lineTo(x1-2,yb);g.lineTo(x0+2,yb);g.lineTo(x0,yb-amp/2);g.closePath();g.stroke();
      if(x1-x0>14){g.font=`600 10px ${css('--mono')}`;g.fillStyle=col;const s=String(v);g.fillText(s,(x0+x1)/2-g.measureText(s).width/2,yb-amp/2+3.5);}start=i;}};
  let j=traces.length;hexs.forEach((h,k)=>busRow(j++,h.name||'HEX',i=>{const v=hist2[i].hex[k];return v==='X'?'X':v===undefined?'':v.toString(16).toUpperCase();},css('--red')));
  if(bus){busRow(j++,'LED 数值',i=>{const v=(hist2[i].o||[]).map(x=>x==='Z'?0:x);return v.some(x=>x!==0&&x!==1)?'X':v.reduce((a,b)=>a*2+b,0);},css('--accent'));}
  for(let k=0;k<N;k+=ls){const i=off+k;if(hist2[i])text(g,String(hist2[i].t),X(i)+(X(i+1)-X(i))/2,H-4,css('--muted'),10,'center');}
  if(cursor!==null){const i=hist2.findIndex(h=>h.t===cursor);if(i>=0){const x=X(i)+(X(i+1)-X(i))/2;g.strokeStyle=css('--accent');g.setLineDash([4,3]);g.beginPath();g.moveTo(x,2);g.lineTo(x,H-16);g.stroke();g.setLineDash([]);
      $('laInfo').textContent=`第 ${cursor} 拍：`+traces.map((tr,q)=>`${tr.name}=${hist2[i].v[q]==='Z'?0:hist2[i].v[q]}`).join('  ');}}else $('laInfo').textContent='点波形放光标，看那一拍所有信号的值';
  /* glitches on outputs */let gl=0;traces.forEach((tr,q)=>{if(tr.kind!=='out')return;let run=1;for(let i=1;i<hist2.length;i++){if(hist2[i].v[q]===hist2[i-1].v[q])run++;else{if(i-run>0&&run<=3&&hist2[i].v[q]===hist2[i-run-1].v[q])gl++;run=1;}}});
  $('laGlitch').textContent=gl?`输出上有 ${gl} 个 ≤ 3 拍的短脉冲（毛刺），可能是冒险：到「真值表」里看冒险检测。`:'';}

/* ================= truth table, K-maps, hazards, critical path ================= */
const tt={dirty:true};
function computeTT(){const seq=comps.some(c=>LIB[c.t].ff||LIB[c.t].latch)||!!LE.combLoop(net);
  /* inputs: switches, plus clocks used as test signals when there is no memory element */
  const ins=comps.filter(c=>c.t==='IN'||(!seq&&c.t==='CLK')).sort((a,b)=>a.y-b.y||a.x-b.x),outs=comps.filter(c=>c.t==='OUT').sort((a,b)=>a.y-b.y||a.x-b.x);
  if(!ins.length||!outs.length)return {err:'真值表需要至少一个「开关」和一个「LED」。'};if(ins.length>6)return {err:'输入超过 6 个，表太大了。'};
  const set=(c,v)=>{if(c.t==='CLK')c.force=v;else c.on=v;};const save=ins.map(c=>c.t==='CLK'?c.force:c.on),n=ins.length,rows=[];const s2=new LE.Sim(net);
  for(let m=0;m<1<<n;m++){ins.forEach((c,i)=>set(c,(m>>(n-1-i))&1));s2.reset();s2.settle(200);rows.push(outs.map(o=>s2.rd(o.ins[0])));}
  ins.forEach((c,i)=>{if(c.t==='CLK')delete c.force;else c.on=save[i];});sim.reset();settle();
  return {ins,outs,rows,n,seq,names:ins.map(c=>c.name)};}
function drawTT(){if(view!=='tt')return;const box=$('ttBox');if(!net){box.innerHTML='';return;}const T=computeTT();if(T.err){box.innerHTML=`<p class="m">${T.err}</p>`;return;}
  const {ins,outs,rows,n,seq,names}=T;let h='';const glitches=seq?[]:LE.glitchScan(net,ins,outs);sim.reset();settle();
  if(seq)h+='<p class="warnp">⚠ 电路里有触发器 / 锁存器或反馈环路，这里只是「从复位开始稳定后」的结果，不能完整描述时序电路；去「状态图」看时序行为。</p>';
  h+=`<div class="scroll"><table class="mini tt"><tr><th>#</th>${names.map(s=>`<th>${esc(s)}</th>`).join('')}${outs.map(o=>`<th class="o">${esc(o.name)}</th>`).join('')}</tr>`+rows.map((r,m)=>`<tr><td>${m}</td>${names.map((_,i)=>`<td>${(m>>(n-1-i))&1}</td>`).join('')}${r.map(v=>`<td class="v${v}">${v}</td>`).join('')}</tr>`).join('')+'</table></div>';
  outs.forEach((o,j)=>{const on=rows.map((r,m)=>r[j]===1?m:-1).filter(m=>m>=0),off=rows.map((r,m)=>r[j]===0?m:-1).filter(m=>m>=0),xs=rows.map((r,m)=>r[j]==='X'?m:-1).filter(m=>m>=0);
    const cover=LE.minCover(on,[],n),coverOff=LE.minCover(off,[],n),hz=on.length&&on.length<1<<n?LE.hazards(on,[],n,cover):[],ess=LE.essential(on,[],n);
    h+=`<div class="outblk"><h3>${esc(o.name)} = Σm(${on.join(', ')||'—'})</h3>`;
    h+=`<p class="expr"><span class="lab">最小和 SOP</span> ${esc(o.name)} = ${fmtExpr(LE.sopText(cover,names,on,n))}</p><p class="expr"><span class="lab">最小积 POS</span> ${esc(o.name)} = ${fmtExpr(LE.posText(coverOff,names,off,n))}</p>`;
    if(xs.length)h+=`<p class="m">有 ${xs.length} 行输出是 X（冲突或不确定），化简时按 0 处理。</p>`;
    if(n>=1&&n<=6)h+=`<div class="kmrow"><canvas class="km${n>=5?' wide':''}" data-j="${j}" height="160" aria-label="${esc(o.name)} 的卡诺图"></canvas><div class="kmnote">${cover.map((p,k)=>`<span class="pi" style="--c:var(${KC[k%KC.length]})">${fmtExpr(LE.termText(p,names,false))}${ess.some(e=>e.v===p.v&&e.m===p.m)?' <small>本质</small>':''}</span>`).join('')}</div></div>`;
    if(hz.length)h+=`<p class="haz">⚠ 理论（按最小和）有静态 1 冒险 ${hz.length} 处：${hz.map(x=>`${bin(x.a,n)} ↔ ${bin(x.b,n)}（只差 ${names[n-1-Math.log2(x.a^x.b)]}，没有一个乘积项同时盖住它们）`).join('；')}。加上冗余项 ${[...new Set(hz.map(x=>LE.termText(x.fix,names,false)))].map(fmtExpr).join('、')} 就能消除；或者到「生成电路」选「无冒险 SOP」。</p>`;
    else if(on.length&&on.length<1<<n)h+='<p class="okp">✓ 理论：最小和没有静态 1 冒险（相邻的 1 都被同一个乘积项盖住）。</p>';
    if(!seq){const g=glitches.filter(x=>x.out===j);if(g.length){const seen=new Set(),items=[];g.forEach(x=>{const k=x.from+'>'+x.to;if(seen.has(k))return;seen.add(k);
        const other=names.map((nm,i)=>i===x.bit?null:`${nm}=${(x.from>>(n-1-i))&1}`).filter(Boolean).join(' ');items.push(`${esc(names[x.bit])} ${(x.from>>(n-1-x.bit))&1}→${(x.to>>(n-1-x.bit))&1}${other?'（'+esc(other)+'）':''}：${x.kind==='static'?`本应保持 ${x.level}，却出现 ${x.width} 拍的 ${1-x.level}`:`变化中来回跳了 ${x.width} 次`}`);});
        h+=`<p class="haz">🔬 实测这个电路（按当前门延迟）：${items.length} 种单输入变化会产生毛刺——${items.slice(0,6).join('；')}${items.length>6?'……':''}。</p>`;}
      else h+='<p class="okp">🔬 实测这个电路：任何一个输入单独变化，输出都不会出现毛刺。</p>';}
    h+=`<div class="btns"><button data-kopen="${j}" class="play">化简步骤 · 卡诺图 →</button><button data-re="${j}" data-style="sop">用最小和重画这个电路</button><button data-re="${j}" data-style="nand">全与非实现</button><button data-re="${j}" data-style="nor">全或非实现</button></div></div>`;});
  const cp=LE.criticalPath(net);if(cp&&cp.path.length)h+=`<h3>关键路径</h3><p class="m">最长的门延迟路径是 <b>${cp.t} 拍</b>：${cp.path.map(c=>esc(c.name||LIB[c.t].n)).join(' → ')}。输入变化后最多要等这么久输出才稳定；时钟周期必须比它长。<button id="cpShow" class="small">在图上标出</button></p>`;
  box.innerHTML=h;box.querySelectorAll('canvas.km').forEach(cv=>{const j=+cv.dataset.j,on=rows.map((r,m)=>r[j]===1?m:-1).filter(m=>m>=0);
    KMapUI.draw(cv,{names,t:rows.map(r=>r[j]===1?1:0),groups:LE.minCover(on,[],n).map((p,k)=>({p,color:KC[k%KC.length],style:'solid'})),mode:'sop'});});
  box.querySelectorAll('[data-kopen]').forEach(bt=>bt.addEventListener('click',()=>{const j=+bt.dataset.kopen;openKM({name:outs[j].name,vars:names,on:rows.map((r,m)=>r[j]===1?m:-1).filter(m=>m>=0),dc:[]});}));
  const b=$('cpShow');if(b)b.addEventListener('click',()=>{hlPath=new Set(cp.path.map(c=>c.id));setTimeout(()=>{hlPath=null;scheduleDraw();},4000);scheduleDraw();$('sch').scrollIntoView({block:'center',behavior:'smooth'});});
  box.querySelectorAll('[data-re]').forEach(bt=>bt.addEventListener('click',()=>{const j=+bt.dataset.re,on=rows.map((r,m)=>r[j]===1?m:-1).filter(m=>m>=0);
    const specs=outs.map((o,k)=>({name:o.name,vars:names,on:rows.map((r,m)=>r[k]===1?m:-1).filter(m=>m>=0),dc:[],ast:null}));generate(specs,bt.dataset.style);}));}
const KC=['--blue','--amp','--green','--purple','--red','--accent'];
const bin=(m,n)=>m.toString(2).padStart(n,'0');
const fmtExpr=s=>esc(s).replace(/([A-Za-z][a-z0-9_]*)'/g,'<span class="ov">$1</span>');
function openKM(spec){view='km';syncView();if(typeof spec==='string')KMapUI.setText(spec);else KMapUI.setSpec(spec);$('v_km').scrollIntoView({block:'start',behavior:'smooth'});}
/* ================= state diagram ================= */
const sd={dirty:true};
function drawSD(){if(view!=='sd')return;const box=$('sdBox');if(!net){box.innerHTML='';return;}const r=LE.stateAnalysis(net);if(r.err){box.innerHTML=`<p class="m">${r.err}</p>`;return;}
  const {ffs,ins,outs,rows,states,nF,nI,mealy}=r,sn=s=>bin(s,nF),un=u=>nI?ins.map((c,i)=>`${c.name}=${(u>>(nI-1-i))&1}`).join(' '):'';
  const init=r.init;
  const used=states.filter(s=>s.used),unused=states.filter(s=>!s.used),locked=states.filter(s=>s.lock);
  let h=`<p class="m">状态编码 <b>${ffs.map(c=>esc(c._nm)).join(' ')}</b>（从左到右），${nI?`外部输入 ${ins.map(c=>esc(c.name)).join('、')}，`:''}${outs.length?(mealy?'输出和输入有关（<b>Mealy</b> 型）':'输出只取决于状态（<b>Moore</b> 型）'):''}。${r.sync?'':'⚠ 触发器的时钟不是同一个时钟源，下面按「同时触发」近似。'}</p>`;
  h+=`<p class="m">复位后从 <b>${sn(init)}</b> 出发能到 ${used.length} 个状态；${unused.length?`有 ${unused.length} 个状态用不到（${unused.map(s=>sn(s.s)).join('、')}）`:'所有状态都会用到'}${locked.length?`，<span style="color:var(--red)">其中 ${locked.map(s=>sn(s.s)).join('、')} 进去就再也回不到正常循环（锁死 / lock-out）</span>`:unused.length?'，它们最终都会回到正常循环（能自启动）':''}。</p>`;
  h+=`<canvas id="sdC" height="${nF<=3?320:400}" aria-label="状态图"></canvas>`;
  h+=`<div class="scroll"><table class="mini"><tr><th>现态 ${ffs.map(c=>esc(c._nm)).join('')}</th>${nI?'<th>输入</th>':''}<th>次态</th>${outs.map(o=>`<th>${esc(o.name)}</th>`).join('')}</tr>`+rows.map(x=>`<tr${states[x.s].used?'':' class="unused"'}><td>${sn(x.s)}</td>${nI?`<td>${un(x.u)}</td>`:''}<td>${x.ns===null?'X':sn(x.ns)}</td>${x.out.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')+'</table></div>';
  box.innerHTML=h;drawStateCanvas($('sdC'),r,init);sim.reset();settle();}
function drawStateCanvas(cv,r,init){const [g,W,H]=fit(cv);const {states,rows,nF,nI,ins,outs,mealy}=r,N=states.length,cx=W/2,cy=H/2+14,RR=Math.min(W*0.36,H*0.32),rad=Math.max(14,Math.min(26,RR*Math.PI/N*0.55));
  const pos=states.map((s,i)=>{const a=-Math.PI/2+2*Math.PI*i/N;return [cx+RR*Math.cos(a),cy+RR*Math.sin(a)];});
  /* group transitions */const edges=new Map();rows.forEach(x=>{if(x.ns===null)return;const k=x.s+'>'+x.ns;if(!edges.has(k))edges.set(k,{a:x.s,b:x.ns,us:[]});edges.get(k).us.push(x);});
  g.lineWidth=1.6;edges.forEach(e=>{const [x0,y0]=pos[e.a],[x1,y1]=pos[e.b],col=states[e.a].used?css('--ink'):css('--muted');g.strokeStyle=col;g.fillStyle=col;
    const lab=edgeLabel(e.us,nI,mealy&&outs.length);
    if(e.a===e.b){const a=Math.atan2(y0-cy,x0-cx),lx=x0+Math.cos(a)*rad*1.55,ly=y0+Math.sin(a)*rad*1.55;g.beginPath();g.arc(lx,ly,rad*0.62,0,7);g.stroke();
      if(lab){g.font=`11px ${css('--mono')}`;const tx=x0+Math.cos(a)*rad*2.6,ty=y0+Math.sin(a)*rad*2.6;g.fillText(lab,tx-g.measureText(lab).width/2,ty+4);}return;}
    const back=edges.has(e.b+'>'+e.a),dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,bend=back?L*0.18:L*0.06,mx=(x0+x1)/2+nx*bend,my=(y0+y1)/2+ny*bend;
    const sx=x0+(mx-x0)/Math.hypot(mx-x0,my-y0)*rad,sy=y0+(my-y0)/Math.hypot(mx-x0,my-y0)*rad,ex=x1+(mx-x1)/Math.hypot(mx-x1,my-y1)*(rad+2),ey=y1+(my-y1)/Math.hypot(mx-x1,my-y1)*(rad+2);
    g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(mx,my,ex,ey);g.stroke();const an=Math.atan2(ey-my,ex-mx);g.beginPath();g.moveTo(ex,ey);g.lineTo(ex-9*Math.cos(an-0.4),ey-9*Math.sin(an-0.4));g.lineTo(ex-9*Math.cos(an+0.4),ey-9*Math.sin(an+0.4));g.closePath();g.fill();
    if(lab){g.font=`11px ${css('--mono')}`;g.fillStyle=css('--accent');const w=g.measureText(lab).width,tx=mx+nx*8,ty=my+ny*8;g.fillStyle=css('--panel');g.fillRect(tx-w/2-2,ty-9,w+4,13);g.fillStyle=css('--accent');g.fillText(lab,tx-w/2,ty+1);}});
  states.forEach((s,i)=>{const [x,y]=pos[i];g.beginPath();g.arc(x,y,rad,0,7);g.fillStyle=s.lock?'rgba(196,58,49,.15)':s.used?css('--panel'):css('--bg');g.fill();g.strokeStyle=s.lock?css('--red'):s.used?css('--ink'):css('--muted');g.lineWidth=s.s===init?3:1.6;if(!s.used)g.setLineDash([4,3]);g.stroke();g.setLineDash([]);
    g.font=`600 ${clamp(rad*0.55,10,14)}px ${css('--mono')}`;g.fillStyle=s.used?css('--ink'):css('--muted');const t=bin(s.s,nF);g.fillText(t,x-g.measureText(t).width/2,y+4);
    if(!mealy&&outs.length){const o=rows.find(q=>q.s===s.s).out.join('');g.font=`10px ${css('--mono')}`;g.fillStyle=css('--amp');g.fillText('/'+o,x-g.measureText('/'+o).width/2,y+rad*0.62+4);}
    if(s.s===init){g.strokeStyle=css('--accent');g.lineWidth=2;g.beginPath();g.moveTo(x-rad-18,y-rad-8);g.lineTo(x-rad*0.75,y-rad*0.75);g.stroke();}});
  text(g,'粗边框 = 复位状态；虚线 = 用不到的状态；红色 = 锁死'+(nI?`；箭头上是输入 ${ins.map(c=>c.name).join('')}`:'')+(mealy?' / 输出':''),8,14,css('--muted'),11);}
function edgeLabel(us,nI,withOut){const groups=new Map();us.forEach(x=>{const o=withOut?x.out.join(''):'';if(!groups.has(o))groups.set(o,[]);groups.get(o).push(x.u);});
  return [...groups.entries()].map(([o,ms])=>{let inp='';if(nI){if(ms.length===1<<nI)inp=withOut?'X':'';else inp=LE.minCover(ms,[],nI).map(p=>{let t='';for(let b=nI-1;b>=0;b--)t+=p.m>>b&1?'X':(p.v>>b&1);return t;}).join(',');}
    return inp+(withOut?'/'+o:'');}).filter(Boolean).join(' ; ');}
/* ================= generate from expression / truth table ================= */
function generate(specs,style){comps=[];wires=[];sel.clear();running=false;curP='';const r=LE.synth(specs,style,newId);comps=r.comps;wires=r.wires;rebuild();hist.commit();syncUndo();autoFit=true;fitView();view='la';syncView();syncBar();pressPresets();Lab.draw(1);
  flashMsg(`已生成：${comps.filter(c=>LIB[c.t].gate).length} 个门（按 Ctrl+Z 撤销）`);}
function genPreview(){const lines=$('gExpr').value.split(/\n|;/).map(s=>s.trim()).filter(Boolean),out=$('gPrev');if(!lines.length){out.innerHTML='';return null;}
  const specs=[],names='FGHPQR'.split('');let html='';try{lines.forEach((l,i)=>{const s=LE.parseSpec(l,names[i]||'F'+i);specs.push(s);const n=s.vars.length,cover=LE.minCover(s.on,s.dc,n),off=[...Array(1<<n).keys()].filter(k=>!s.on.includes(k)&&!s.dc.includes(k));
      html+=`<p class="expr"><b>${esc(s.name)}</b>(${s.vars.join(', ')}) = Σm(${s.on.join(', ')||'—'})${s.dc.length?` + d(${s.dc.join(', ')})`:''}<br><span class="lab">最小和</span> ${fmtExpr(LE.sopText(cover,s.vars,s.on,n))}　<span class="lab">最小积</span> ${fmtExpr(LE.posText(LE.minCover(off,s.dc,n),s.vars,off,n))} <button class="small" data-kline="${esc(l)}">卡诺图 · 化简步骤 →</button></p>`;});
    out.innerHTML=html;return specs;}catch(e){out.innerHTML=`<p class="haz">✖ ${esc(e.message)}</p>`;return null;}}
$('gExpr').addEventListener('input',genPreview);
$('gPrev').addEventListener('click',ev=>{const b=ev.target.closest('[data-kline]');if(b)openKM(b.dataset.kline);});
$('gGo').addEventListener('click',()=>{const specs=genPreview();if(!specs)return;const st=document.querySelector('input[name=gStyle]:checked').value;if(st==='direct'&&specs.some(s=>!s.ast)){flashMsg('Σm / ∏M 写法没有「原式」，已改用最小和');}generate(specs,st==='direct'&&specs.some(s=>!s.ast)?'sop':st);});
document.querySelectorAll('[data-ex]').forEach(b=>b.addEventListener('click',()=>{$('gExpr').value=b.dataset.ex;genPreview();}));
/* truth-table editor */
let te={n:3,m:1,cells:null};
function teInit(){const N=1<<te.n;if(!te.cells||te.cells.length!==te.m||te.cells[0].length!==N)te.cells=Array.from({length:te.m},()=>new Array(N).fill(0));renderTE();}
function renderTE(){const N=1<<te.n,vars='ABCDEF'.slice(0,te.n).split(''),onames='FGH'.slice(0,te.m).split('');
  $('teTab').innerHTML=`<tr><th>#</th>${vars.map(v=>`<th>${v}</th>`).join('')}${onames.map(o=>`<th class="o">${o}</th>`).join('')}</tr>`+[...Array(N).keys()].map(m=>`<tr><td>${m}</td>${vars.map((_,i)=>`<td>${(m>>(te.n-1-i))&1}</td>`).join('')}${onames.map((_,k)=>`<td><button class="cell v${te.cells[k][m]}" data-k="${k}" data-m="${m}" aria-label="${onames[k]} 第 ${m} 行">${te.cells[k][m]}</button></td>`).join('')}</tr>`).join('');}
$('teTab').addEventListener('click',ev=>{const b=ev.target.closest('.cell');if(!b)return;const k=+b.dataset.k,m=+b.dataset.m,v=te.cells[k][m];te.cells[k][m]=v===0?1:v===1?'X':0;renderTE();});
$('teN').addEventListener('change',ev=>{te.n=+ev.target.value;te.cells=null;teInit();});$('teM').addEventListener('change',ev=>{te.m=+ev.target.value;te.cells=null;teInit();});
$('teGo').addEventListener('click',()=>{const vars='ABCDEF'.slice(0,te.n).split(''),onames='FGH'.slice(0,te.m).split('');const specs=onames.map((o,k)=>({name:o,vars,on:te.cells[k].map((v,m)=>v===1?m:-1).filter(m=>m>=0),dc:te.cells[k].map((v,m)=>v==='X'?m:-1).filter(m=>m>=0),ast:null}));
  generate(specs,document.querySelector('input[name=gStyle]:checked').value==='direct'?'sop':document.querySelector('input[name=gStyle]:checked').value);});
teInit();

/* ================= views ================= */
document.querySelectorAll('#lab1 [data-v]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.v;syncView();Lab.draw(1);}));
function syncView(){pressGroup('#lab1 [data-v]',b=>b.dataset.v===view);['la','tt','km','sd','gen'].forEach(v=>$('v_'+v).style.display=view===v?'':'none');if(view==='km')KMapUI.show();}

/* ================= presets ================= */
const PRE={};
function B(){const add=(t,x,y,o={})=>{const c={...mkComp(t,x,y),...o};comps.push(c);return c;};return {add,L:(x,y,name)=>add('LBL',x,y,{name}),W:(...pts)=>{for(let i=0;i+1<pts.length;i++)wires.push({a:pts[i],b:pts[i+1],id:newId()});}};}
PRE.haz={n:'静态冒险 AB + A̅C',g:0,run:66,f({add,L,W}){add('CLK',2,3,{name:'A',half:14});L(3,3,'A');add('IN',2,6,{name:'B',on:1});L(3,6,'B');add('IN',2,9,{name:'C',on:1});L(3,9,'C');add('IN',2,14,{name:'BC项',on:0});L(3,14,'EN');
  add('NOT',8,4,{d:2});L(8,4,'A');L(11,4,'nA');add('AND',14,2);L(14,1,'A');L(14,3,'B');add('AND',14,7);L(14,6,'nA');L(14,8,'C');
  add('AND',8,11);L(8,10,'B');L(8,12,'C');add('AND',14,12);W([12,11],[14,11]);L(14,13,'EN');
  add('OR',21,4);W([18,2],[20,2],[20,3],[21,3]);W([18,7],[20,7],[20,5],[21,5]);add('OR',26,7);W([25,4],[25,6],[26,6]);W([18,12],[25,12],[25,8],[26,8]);add('OUT',31,7,{name:'T'});W([30,7],[30,7]);}};
PRE.alarm={n:'防盗报警 A(B̅+C̅)',g:0,f({add,L,W}){add('IN',2,3,{name:'A',on:1});L(3,3,'A');add('IN',2,7,{name:'B'});L(3,7,'B');add('IN',2,11,{name:'C',on:1});L(3,11,'C');
  add('NOT',8,7);L(8,7,'B');L(11,7,'X');add('NOT',8,11);L(8,11,'C');L(11,11,'Y');add('OR',15,9);L(15,8,'X');L(15,10,'Y');L(19,9,'Z');add('AND',22,4);L(22,3,'A');L(22,5,'Z');add('OUT',29,4,{name:'D'});W([26,4],[28,4]);}};
PRE.simp={n:'化简前后对比',g:0,f({add,L,W}){add('IN',2,3,{name:'A',on:1});L(3,3,'A');add('IN',2,13,{name:'B'});L(3,13,'B');
  add('NOT',7,6);L(7,6,'A');L(10,6,'Z');add('OR',13,5);L(13,4,'A');L(13,6,'Z');L(17,5,'Y');add('AND',20,4);L(20,3,'A');L(20,5,'Y');L(24,4,'X');add('OR',27,6);L(27,5,'X');L(27,7,'B');add('OUT',34,6,{name:'C原'});W([31,6],[33,6]);
  add('OR',27,12);L(27,11,'A');L(27,13,'B');add('OUT',34,12,{name:'C简'});W([31,12],[33,12]);}};
PRE.fa={n:'全加器（门级）',g:0,f({add,L,W}){add('IN',2,3,{name:'A'});L(3,3,'A');add('IN',2,7,{name:'B'});L(3,7,'B');add('IN',2,11,{name:'Cin'});L(3,11,'Cin');
  add('XOR',8,4);L(8,3,'A');L(8,5,'B');L(12,4,'x1');add('XOR',16,5);L(16,4,'x1');L(16,6,'Cin');add('OUT',24,5,{name:'S'});W([20,5],[23,5]);
  add('AND',8,10);L(8,9,'A');L(8,11,'B');add('AND',8,15);L(8,14,'x1');L(8,16,'Cin');add('OR',16,12);W([12,10],[14,10],[14,11],[16,11]);W([12,15],[14,15],[14,13],[16,13]);add('OUT',24,12,{name:'Co'});W([20,12],[23,12]);}};
PRE.add2={n:'2 位加法器 + 数码管',g:0,f({add,L,W}){[['A1',2],['A0',5],['B1',9],['B0',12]].forEach(([n,y])=>{add('IN',2,y,{name:n});L(3,y,n);});add('CONST',2,16,{v:0,name:'0'});L(3,16,'C0');
  add('FA',12,4);L(12,3,'A0');L(12,4,'B0');L(12,5,'C0');L(16,3,'S0');L(16,5,'c1');add('FA',12,11);L(12,10,'A1');L(12,11,'B1');L(12,12,'c1');L(16,10,'S1');L(16,12,'S2');
  add('HEX',24,8,{name:'和'});L(23,6,'0z');L(23,7,'S2');L(23,8,'S1');L(23,9,'S0');add('CONST',19,6,{v:0,name:'0'});W([20,6],[23,6]);
  ['S2','S1','S0'].forEach((s,i)=>{add('OUT',30,4+i*3,{name:s+'灯'});L(29,4+i*3,s);});}};
PRE.mux={n:'4 选 1 MUX 做函数',g:0,f({add,L,W}){add('IN',2,3,{name:'A'});L(3,3,'A');add('IN',2,6,{name:'B'});L(3,6,'B');add('IN',2,9,{name:'C',on:1});L(3,9,'C');
  add('NOT',7,12);L(7,12,'C');L(10,12,'nC');add('CONST',7,15,{v:1,name:'1'});L(8,15,'one');add('CONST',7,18,{v:0,name:'0'});L(8,18,'zero');
  add('MUX4',16,8);L(16,5,'C');L(16,7,'nC');L(16,9,'zero');L(16,11,'one');L(17,13,'A');L(19,13,'B');add('OUT',24,8,{name:'F'});W([20,8],[23,8]);}};
PRE.jk={n:'用 T 触发器做 JK',g:1,run:40,f({add,L,W}){add('IN',2,3,{name:'J',on:1});L(3,3,'J');add('IN',2,7,{name:'K',on:1});L(3,7,'K');add('CLK',2,12,{name:'CLK',half:6});L(3,12,'CLK');
  add('AND',8,4);L(8,3,'J');L(8,5,'nQ');add('AND',8,10);L(8,9,'K');L(8,11,'Q');add('OR',14,7);W([12,4],[13,4],[13,6],[14,6]);W([12,10],[13,10],[13,8],[14,8]);
  add('TFF',18,8);L(18,9,'CLK');W([22,7],[25,7]);L(25,7,'Q');W([22,9],[25,9]);L(25,9,'nQ');add('OUT',28,7,{name:'Q输出'});W([25,7],[27,7]);}};
PRE.cnt={n:'4 位计数器（T）',g:1,run:70,f({add,L,W}){add('CONST',2,3,{v:1,name:'1'});L(3,3,'HI');add('CLK',2,7,{name:'CLK',half:3});L(3,7,'CLK');
  [['Qa','HI',3],['Qb','Qa',7],['Qc','Tc',11],['Qd','Td',15]].forEach(([q,tin,y])=>{add('TFF',20,y);L(20,y-1,tin);L(20,y+1,'CLK');L(24,y-1,q);});
  add('AND',11,9);L(11,8,'Qb');L(11,10,'Qa');L(15,9,'Tc');add('AND',11,14,{n:3});L(11,13,'Qc');L(11,14,'Qb');L(11,15,'Qa');L(15,14,'Td');
  add('HEX',31,9,{name:'计数'});L(30,7,'Qd');L(30,8,'Qc');L(30,9,'Qb');L(30,10,'Qa');}};
PRE.step={n:'步进电机控制器（JK）',g:1,run:40,f({add,L,W}){add('IN',2,4,{name:'DIR',on:1});L(3,4,'DIR');add('CLK',2,9,{name:'CLK',half:5});L(3,9,'CLK');
  add('XNOR',10,2);L(10,1,'Q1');L(10,3,'DIR');L(14,2,'J2');add('XOR',10,6);L(10,5,'Q1');L(10,7,'DIR');L(14,6,'K2');
  add('XOR',10,11);L(10,10,'Q2');L(10,12,'DIR');L(14,11,'J1');add('XNOR',10,15);L(10,14,'Q2');L(10,16,'DIR');L(14,15,'K1');
  add('JKFF',20,4);L(20,3,'J2');L(20,4,'CLK');L(20,5,'K2');L(24,3,'Q2');add('JKFF',20,12);L(20,11,'J1');L(20,12,'CLK');L(20,13,'K1');L(24,11,'Q1');
  add('OUT',30,5,{name:'Q2灯'});L(29,5,'Q2');add('OUT',30,9,{name:'Q1灯'});L(29,9,'Q1');}};
PRE.ring={n:'环形计数器（锁死问题）',g:1,run:40,v:'sd',f({add,L,W}){add('CLK',2,6,{name:'CLK',half:4});L(3,6,'CLK');
  [['Q2','Q0',3,1],['Q1','Q2',8,0],['Q0','Q1',13,0]].forEach(([q,d,y,init])=>{add('DFF',12,y,{init});L(12,y-1,d);L(12,y+1,'CLK');L(16,y-1,q);});
  ['Q2','Q1','Q0'].forEach((q,i)=>{add('OUT',24,3+i*4,{name:q+'灯'});L(23,3+i*4,q);});}};
PRE.sr={n:'NOR 构成的 SR 锁存器',g:1,f({add,L,W}){add('IN',2,4,{name:'R',on:0});L(3,4,'R');add('IN',2,11,{name:'S',on:0});L(3,11,'S');
  add('NOR',12,5,{q0:0});L(12,4,'R');L(12,6,'nQ');L(16,5,'Q');add('NOR',12,11,{q0:1});L(12,10,'Q');L(12,12,'S');L(16,11,'nQ');
  add('OUT',22,5,{name:'Q'});W([16,5],[21,5]);add('OUT',22,11,{name:'Q̅'});W([16,11],[21,11]);}};
PRE.dl={n:'D 锁存器 vs D 触发器',g:1,run:60,f({add,L,W}){add('CLK',2,3,{name:'D',half:7});L(3,3,'D');add('CLK',2,8,{name:'EN',half:10,ph:3});L(3,8,'EN');
  add('DLATCH',12,4);L(12,3,'D');L(12,5,'EN');L(16,3,'Q锁存');add('DFF',12,11);L(12,10,'D');L(12,12,'EN');L(16,10,'Q触发');
  add('OUT',24,4,{name:'锁存'});L(23,4,'Q锁存');add('OUT',24,10,{name:'触发'});L(23,10,'Q触发');}};
function loadPreset(k){const p=PRE[k];if(!p)return;comps=[];wires=[];sel.clear();running=false;curP=k;p.f(B());wires=wires.filter(w=>!eq(w.a,w.b));sim=null;rebuild();for(let i=0;i<(p.run||40);i++)step();
  hist.reset();syncUndo();autoFit=true;fitView();view=p.v||'la';syncView();syncBar();pressPresets();renderProps();Lab.draw(1);}
function pressPresets(){pressGroup('#presets [data-p]',b=>b.dataset.p===curP);const ps=$('pSel');if(ps)ps.value=curP||'';}
$('presets').innerHTML=[['组合逻辑',0],['时序逻辑',1]].map(([t,gi])=>`<div class="btns" role="group" aria-label="${t}"><span class="grp">${t}</span>${Object.entries(PRE).filter(([,p])=>p.g===gi).map(([k,p])=>`<button data-p="${k}">${p.n}</button>`).join('')}</div>`).join('')+
  `<label class="psel">预设 <select id="pSel"><option value="">— 选一个预设电路 —</option>${[['组合逻辑',0],['时序逻辑',1]].map(([t,gi])=>`<optgroup label="${t}">${Object.entries(PRE).filter(([,p])=>p.g===gi).map(([k,p])=>`<option value="${k}">${p.n}</option>`).join('')}</optgroup>`).join('')}</select></label>`;
$('presets').addEventListener('click',ev=>{const b=ev.target.closest('[data-p]');if(b)loadPreset(b.dataset.p);});$('pSel').addEventListener('change',ev=>{if(ev.target.value)loadPreset(ev.target.value);});

/* ================= main loop ================= */
function lab1(){if(!net)return;if(autoFit)fitView();drawSch();if(view==='la')drawLA();else if(view==='tt'&&tt.dirty){tt.dirty=false;drawTT();}else if(view==='sd'&&sd.dirty){sd.dirty=false;drawSD();}}
Lab.add(1,lab1,{sch:300,la:200});
let acc=0;const anim=Lab.anim(1,sch,dt=>{acc+=dt*(+$('spd').value);let n=Math.min(Math.floor(acc),20);acc=Math.min(acc-n,5);if(n){for(let i=0;i<n;i++)step();drawSch();if(view==='la')drawLA();}},()=>running);/* user pressed Run: runs even with reduced motion */
new ResizeObserver(()=>{if(autoFit&&net)fitView();scheduleDraw();}).observe($('schWrap'));
async function boot(){const m=/#c=([\w-]+)/.exec(location.hash),qp=new URLSearchParams(location.search).get('p');
  if(m){try{const s=await K.decode(m[1]);load(s,false);curP='';rebuild();hist.reset();autoFit=true;fitView();syncView();syncBar();renderProps();flashMsg('已载入分享的电路');Lab.draw(1);return;}catch(e){}}
  loadPreset(PRE[qp]?qp:'haz');if(K.store.get(STORE)&&!qp&&!window.EMBED_LAB)$('restore').hidden=false;
  const sp=new URLSearchParams(location.search),vq=sp.get('v'),fq=sp.get('f');if(fq)KMapUI.setText(fq);if(['la','tt','km','sd','gen'].includes(vq)){view=vq;syncView();}}
$('restore').addEventListener('click',()=>{const s=K.store.get(STORE);if(!s)return;try{load(s,false);curP='';rebuild();hist.reset();autoFit=true;fitView();syncBar();pressPresets();renderProps();Lab.draw(1);$('restore').hidden=true;}catch(e){}});
KMapUI.init({generate,flash:flashMsg,getTT:()=>{if(!net)return {err:'还没有电路'};const T=computeTT();if(T.err)return T;
  return {names:T.names,outs:T.outs.map((o,j)=>({name:o.name,on:T.rows.map((r,m)=>r[j]===1?m:-1).filter(m=>m>=0)}))};}});
setTool('s');syncView();boot();Lab.start();
window.__V=V;window.__logic={get comps(){return comps;},get wires(){return wires;},get net(){return net;},get sim(){return sim;},loadPreset,PRE,ser:()=>ser(false),generate};
})();
