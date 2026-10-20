/* Circuit engine: netlist building, diagnostics, transient (MNA + trapezoidal / backward Euler),
   DC operating point, small-signal AC sweep, natural frequencies (poles), Thévenin equivalents.
   No DOM access, so it also runs under Node for testing. */
const CE=(()=>{
const VT=0.025852,GMIN=1e-12,GSW_ON=1e3,GSW_OFF=1e-9,GL_DC=1e6;

/* ---------------- component library (electrical part) ----------------
   two: placed by two end points a→b ; one: a single point ; fp: footprint pins relative to (x,y) */
const LIB={
  w:{n:'导线',two:1},
  R:{n:'电阻',two:1,pre:'R',p:{v:1000},u:'Ω'},
  C:{n:'电容',two:1,pre:'C',p:{v:1e-6},u:'F'},
  L:{n:'电感',two:1,pre:'L',p:{v:1e-3},u:'H'},
  V:{n:'直流电压源',two:1,pre:'V',p:{v:5},u:'V',src:1,vb:1},
  I:{n:'直流电流源',two:1,pre:'I',p:{v:1e-3},u:'A',src:1},
  A:{n:'交流 / 信号源',two:1,pre:'V',p:{v:10,f:50,off:0,ph:0,wave:'sin'},u:'V',src:1,vb:1},
  Q:{n:'方波 / 脉冲源',two:1,pre:'V',p:{v:5,lo:0,f:1,duty:50},u:'V',src:1,vb:1},
  D:{n:'二极管',two:1,pre:'D',p:{}},
  Z:{n:'稳压二极管',two:1,pre:'D',p:{vz:5.1},u:'V'},
  LED:{n:'LED',two:1,pre:'LED',p:{col:'red'}},
  S:{n:'开关',two:1,pre:'S',p:{on:1}},
  LMP:{n:'灯泡',two:1,pre:'X',p:{vr:12,pr:6}},
  VM:{n:'电压表',two:1,pre:'VM',p:{sc:0}},
  AM:{n:'电流表',two:1,pre:'AM',p:{sc:0},vb:1},
  G:{n:'接地',one:1},
  P:{n:'探针',one:1,pre:'P'},
  OA:{n:'运放',pre:'U',p:{vsat:13.5,A:1e5},fp:[[0,-1],[0,1],[4,0]],pins:['−','+','out']},
  NPN:{n:'NPN 三极管',pre:'Q',p:{bf:100},fp:[[0,0],[2,-2],[2,2]],pins:['B','C','E']},
  XF:{n:'理想变压器',pre:'T',p:{n:0.1},fp:[[0,-1],[0,1],[4,-1],[4,1]],pins:['P1','P2','S1','S2']},
  POT:{n:'电位器',pre:'RV',p:{v:10000,pos:0.5},fp:[[0,0],[4,0],[2,-2]],pins:['A','B','W']},
  SW2:{n:'单刀双掷开关',pre:'S',p:{pos:0},fp:[[0,0],[3,-1],[3,1]],pins:['COM','1','2']}};
const LED_COL={red:{vf:2.0,c:'#e3342f',n:'红'},green:{vf:2.2,c:'#2fb34a',n:'绿'},yellow:{vf:2.1,c:'#f0b400',n:'黄'},blue:{vf:3.1,c:'#2f6fe3',n:'蓝'},white:{vf:3.2,c:'#e9e6d8',n:'白'}};
const isVsrc=e=>LIB[e.t].vb===1;           /* elements that own a voltage-defined branch */
const NONLIN=new Set(['D','Z','LED','NPN']);
const key=p=>p[0]+','+p[1];

function rotPt(dx,dy,r,fl){if(fl)dy=-dy;for(let k=0;k<(r||0);k++){const t=dx;dx=-dy;dy=t;}return [dx,dy];}
function terms(e){const L=LIB[e.t];if(L.fp)return L.fp.map(([dx,dy])=>{const [x,y]=rotPt(dx,dy,e.rot,e.flip);return [e.x+x,e.y+y];});if(L.one)return [e.a];return [e.a,e.b];}

/* ---------------- normalisation: split wires at terminals lying inside them ---------------- */
function onSeg(p,a,b){if(a[0]===b[0]&&p[0]===a[0])return p[1]>Math.min(a[1],b[1])&&p[1]<Math.max(a[1],b[1]);if(a[1]===b[1]&&p[1]===a[1])return p[0]>Math.min(a[0],b[0])&&p[0]<Math.max(a[0],b[0]);return false;}
function normalize(els,newId){
  els=els.filter(e=>!(LIB[e.t].two&&e.a[0]===e.b[0]&&e.a[1]===e.b[1]));
  for(let guard=0;guard<500;guard++){const pts=new Map();els.forEach(e=>terms(e).forEach(p=>pts.set(key(p),p)));let hit=false;
    for(const w of els){if(w.t!=='w')continue;for(const p of pts.values()){if(onSeg(p,w.a,w.b)){const b=w.b;w.b=[p[0],p[1]];els.push({t:'w',a:[p[0],p[1]],b,id:newId()});hit=true;break;}}if(hit)break;}
    if(!hit)break;}
  /* drop duplicate wires */
  const seen=new Set();return els.filter(e=>{if(e.t!=='w')return true;const k=[key(e.a),key(e.b)].sort().join('|');if(seen.has(k))return false;seen.add(k);return true;});
}

/* ---------------- netlist ---------------- */
function build(els){
  const par=new Map(),find=k=>{let r=k;while(par.get(r)!==r)r=par.get(r);while(par.get(k)!==r){const n=par.get(k);par.set(k,r);k=n;}return r;},mk=k=>{if(!par.has(k))par.set(k,k);},uni=(a,b)=>{mk(a);mk(b);const ra=find(a),rb=find(b);if(ra!==rb)par.set(ra,rb);};
  els.forEach(e=>terms(e).forEach(p=>mk(key(p))));els.forEach(e=>{if(e.t==='w')uni(key(e.a),key(e.b));});
  const diags=[];const comps=els.filter(e=>e.t!=='w'&&e.t!=='G');
  const gnd=new Set(els.filter(e=>e.t==='G').map(e=>find(key(e.a))));
  if(!gnd.size){const s=comps.find(e=>LIB[e.t].src);const c=s||comps.find(e=>e.t!=='P');
    if(c){gnd.add(find(key(terms(c)[0])));diags.push({lv:'info',msg:`没有接地：已把 ${c.name||LIB[c.t].n} 的${s?'负极':'第一个端子'}当作 0 V 参考点。`,ids:[c.id]});}}
  const idx=new Map();let N=0;const nodeOf=p=>{const k=key(p);if(!par.has(k))return -1;const r=find(k);if(gnd.has(r))return -1;if(!idx.has(r))idx.set(r,N++);return idx.get(r);};
  comps.forEach(e=>{e.nodes=terms(e).map(nodeOf);});
  els.forEach(e=>{if(e.t==='w')e.node=nodeOf(e.a);});
  let M=N;comps.forEach(e=>{if(isVsrc(e)||e.t==='OA'||e.t==='XF')e.br=M++;else e.br=-1;});
  const net={N,M,comps,els,nodeOf,rootOf:p=>{const k=key(p);return par.has(k)?find(k):null;},
    nonlin:comps.some(e=>NONLIN.has(e.t)),hasOA:comps.some(e=>e.t==='OA'),diags};
  diagnose(net);
  return net;
}

/* topology checks that do not need a solution */
function diagnose(net){const {comps,els,diags}=net;const nm=e=>e.name||LIB[e.t].n;
  /* terminal count per node, to find dangling ends */
  const cnt=new Map(),who=new Map();comps.forEach(e=>{if(e.t==='P')return;e.nodes.forEach((n,k)=>{const kk=n<0?'g':n;cnt.set(kk,(cnt.get(kk)||0)+1);if(!who.has(kk))who.set(kk,[]);who.get(kk).push(e);});});
  const dangl=new Set();comps.forEach(e=>{if(e.t==='P')return;e.nodes.forEach(n=>{if(n>=0&&cnt.get(n)===1)dangl.add(e);});});
  dangl.forEach(e=>diags.push({lv:'warn',msg:`${nm(e)} 有一端悬空，没有接到别的元件。`,ids:[e.id]}));
  /* shorted two-terminal parts */
  comps.forEach(e=>{if(!LIB[e.t].two||e.t==='VM')return;if(e.nodes[0]===e.nodes[1]){
    if(isVsrc(e)&&e.t!=='AM')diags.push({lv:'err',msg:`${nm(e)} 的两端被导线直接连在一起（电压源短路），电路无解。`,ids:[e.id]});
    else if(e.t!=='AM'&&e.t!=='S')diags.push({lv:'warn',msg:`${nm(e)} 两端是同一个节点（被导线短路），没有电流流过它。`,ids:[e.id]});}});
  /* loops made only of voltage-defined branches (KVL conflict) */
  const p2=new Map(),f2=k=>{while(p2.has(k)&&p2.get(k)!==k)k=p2.get(k);return k;};
  comps.forEach(e=>{let pairs=[];if(isVsrc(e))pairs=[[e.nodes[0],e.nodes[1]]];else if(e.t==='OA')pairs=[[e.nodes[2],-1]];
    pairs.forEach(([a,b])=>{if(a===b)return;const ra=f2(a<0?'g':a),rb=f2(b<0?'g':b);if(ra===rb)diags.push({lv:'err',msg:`${nm(e)} 和其他电压源 / 电流表构成了只有电压源的回路（KVL 矛盾，或电流表把电源短路了）。`,ids:[e.id]});else p2.set(ra,rb);});});
  /* nodes without a DC path to ground */
  const p3=new Map(),f3=k=>{while(p3.has(k)&&p3.get(k)!==k)k=p3.get(k);return k;},u3=(a,b)=>{a=a<0?'g':a;b=b<0?'g':b;const ra=f3(a),rb=f3(b);if(ra!==rb)p3.set(ra,rb);};
  comps.forEach(e=>{const n=e.nodes;switch(e.t){
    case 'R':case 'L':case 'LMP':case 'D':case 'Z':case 'LED':case 'V':case 'A':case 'Q':case 'AM':u3(n[0],n[1]);break;
    case 'S':if(e.on)u3(n[0],n[1]);break;case 'SW2':u3(n[0],n[e.pos?2:1]);break;case 'POT':u3(n[0],n[2]);u3(n[1],n[2]);break;
    case 'NPN':u3(n[0],n[1]);u3(n[0],n[2]);break;case 'OA':u3(n[2],-1);break;}});
  const floating=new Map();comps.forEach(e=>{if(e.t==='P'||e.t==='VM')return;e.nodes.forEach(n=>{if(n>=0&&f3(n)!==f3('g')&&!dangl.has(e)){if(!floating.has(f3(n)))floating.set(f3(n),new Set());floating.get(f3(n)).add(e);}});});
  floating.forEach(set=>{const list=[...set];const hasI=list.some(e=>e.t==='I'),hasX=list.some(e=>e.t==='XF');
    diags.push({lv:'warn',msg:hasX?'变压器次级（或一部分电路）没有任何直流通路接到地，电压只能相对确定；在次级某处加一个接地即可。':
      hasI?'有节点只经过电流源和电容连到电路其余部分：直流时没有回路，电容电压会一直升高。':'有一部分电路只通过电容连到地（没有直流通路），它的直流电压由初始条件决定。',ids:list.map(e=>e.id)});});
  if(!comps.some(e=>LIB[e.t].src))diags.push({lv:'info',msg:'电路里没有电源：所有电压电流都会是 0（除非电容 / 电感有初始储能）。',ids:[]});
}

/* ---------------- sources ---------------- */
function srcVal(e,t){switch(e.t){
  case 'V':case 'I':return e.v;case 'AM':return 0;
  case 'A':{const u=((e.f*t+(e.ph||0)/360)%1+1)%1;let w;if(e.wave==='tri')w=u<0.25?4*u:u<0.75?2-4*u:4*u-4;else if(e.wave==='saw')w=2*u-1;else w=Math.sin(2*Math.PI*u);return (e.off||0)+e.v*w;}
  case 'Q':{const u=((e.f*t)%1+1)%1;return u<(e.duty??50)/100?e.v:(e.lo||0);}}return 0;}
function srcDC(e){return e.t==='A'?(e.off||0):e.t==='Q'?(e.lo||0):srcVal(e,0);}
function srcJump(e,t0,t1){if(e.t==='Q'){const a=Math.floor(e.f*t0*2+1e-9),b=Math.floor(e.f*t1*2+1e-9);return a!==b||srcVal(e,t0)!==srcVal(e,t1);}if(e.t==='A'&&e.wave==='saw')return Math.floor(e.f*t0+(e.ph||0)/360)!==Math.floor(e.f*t1+(e.ph||0)/360);return false;}

/* ---------------- device models ---------------- */
const lim=x=>x>80?80:x;
function expl(v,nvt){const a=v/nvt;if(a<=40)return [Math.exp(a),Math.exp(a)/nvt];const e=Math.exp(40);return [e*(1+a-40),e/nvt];}  /* exp with linear continuation */
function diodePar(e){if(e.t==='LED'){const c=LED_COL[e.col]||LED_COL.red,n=2;return {Is:0.02/Math.exp(c.vf/(n*VT)),n,bv:5,ibv:1e-6};}
  if(e.t==='Z')return {Is:1e-12,n:1,bv:e.vz,ibv:1e-3};return {Is:1e-12,n:1,bv:100,ibv:1e-9};}
function diodeEval(e,v){const P=diodePar(e),nvt=P.n*VT;let [ex,dex]=expl(v,nvt);let I=P.Is*(ex-1),G=P.Is*dex;
  /* reverse breakdown */
  const vb=-(v+P.bv);if(vb>-40*VT){const [eb,deb]=expl(vb,VT);I-=P.ibv*eb;G+=P.ibv*deb;}
  return [I+GMIN*v,G+GMIN];}
function pnjlim(vn,vo,nvt,vcrit){if(vn>vcrit&&Math.abs(vn-vo)>2*nvt){if(vo>0){const a=1+(vn-vo)/nvt;vn=a>0?vo+nvt*Math.log(a):vcrit;}else vn=nvt*Math.log(vn/nvt);}return vn;}
function limitDiode(e,vn,vo){const P=diodePar(e),nvt=P.n*VT,vc=nvt*Math.log(nvt/(Math.SQRT2*P.Is));vn=pnjlim(vn,vo,nvt,vc);
  /* breakdown side, mirrored */
  const rb=-(vn+P.bv),ro=-(vo+P.bv),vcb=VT*Math.log(VT/(Math.SQRT2*P.ibv));if(rb>vcb){const r=pnjlim(rb,ro,VT,vcb);vn=-(r+P.bv);}return vn;}
const BJT={Is:1e-14,br:1};
function bjtEval(e,vbe,vbc){const bf=e.bf||100,Is=BJT.Is,br=BJT.br;const [xf,dxf]=expl(vbe,VT),[xr,dxr]=expl(vbc,VT);
  const ef=Is*(xf-1),er=Is*(xr-1),gf=Is*dxf,gr=Is*dxr;
  const iC=ef-er*(1+1/br),iB=ef/bf+er/br;
  return {iB,iC,dCbe:gf,dCbc:-gr*(1+1/br),dBbe:gf/bf,dBbc:gr/br};}
const BJT_VC=VT*Math.log(VT/(Math.SQRT2*BJT.Is));

/* ---------------- dense real LU ---------------- */
function luFactor(A,n,piv){for(let c=0;c<n;c++){let p=c,m=Math.abs(A[c*n+c]);for(let r=c+1;r<n;r++){const v=Math.abs(A[r*n+c]);if(v>m){m=v;p=r;}}
    if(m<1e-18){const err=new Error('singular');err.row=c;throw err;}piv[c]=p;if(p!==c)for(let k=0;k<n;k++){const t=A[c*n+k];A[c*n+k]=A[p*n+k];A[p*n+k]=t;}
    const d=A[c*n+c];for(let r=c+1;r<n;r++){const f=A[r*n+c]/d;if(f===0)continue;A[r*n+c]=f;for(let k=c+1;k<n;k++)A[r*n+k]-=f*A[c*n+k];}}}
function luSolve(A,n,piv,b){const x=Float64Array.from(b);for(let c=0;c<n;c++){const p=piv[c];if(p!==c){const t=x[c];x[c]=x[p];x[p]=t;}}
  for(let c=0;c<n;c++){const xc=x[c];if(xc!==0)for(let r=c+1;r<n;r++)x[r]-=A[r*n+c]*xc;}
  for(let r=n-1;r>=0;r--){let v=x[r];for(let k=r+1;k<n;k++)v-=A[r*n+k]*x[k];x[r]=v/A[r*n+r];}return x;}
/* dense complex LU (separate re / im arrays); returns {solve, det} */
function cluFactor(Ar,Ai,n){const piv=new Int32Array(n);let dr=1,di=0,lg=0;
  for(let c=0;c<n;c++){let p=c,m=Math.hypot(Ar[c*n+c],Ai[c*n+c]);for(let r=c+1;r<n;r++){const v=Math.hypot(Ar[r*n+c],Ai[r*n+c]);if(v>m){m=v;p=r;}}
    piv[c]=p;if(m===0){return {piv,sing:true,det:[0,0],lg:-Infinity};}
    if(p!==c){for(let k=0;k<n;k++){let t=Ar[c*n+k];Ar[c*n+k]=Ar[p*n+k];Ar[p*n+k]=t;t=Ai[c*n+k];Ai[c*n+k]=Ai[p*n+k];Ai[p*n+k]=t;}dr=-dr;di=-di;}
    const pr=Ar[c*n+c],pi=Ai[c*n+c],pm=pr*pr+pi*pi;{const t=dr*pr-di*pi;di=dr*pi+di*pr;dr=t;const s=Math.hypot(dr,di);if(s>0){lg+=Math.log(s);dr/=s;di/=s;}}
    for(let r=c+1;r<n;r++){const ar=Ar[r*n+c],ai=Ai[r*n+c];if(ar===0&&ai===0)continue;const fr=(ar*pr+ai*pi)/pm,fi=(ai*pr-ar*pi)/pm;Ar[r*n+c]=fr;Ai[r*n+c]=fi;
      for(let k=c+1;k<n;k++){const br=Ar[c*n+k],bi=Ai[c*n+k];Ar[r*n+k]-=fr*br-fi*bi;Ai[r*n+k]-=fr*bi+fi*br;}}}
  return {piv,sing:false,det:[dr,di],lg};}   /* det = (dr+i·di)·e^lg */
function cluSolve(Ar,Ai,n,piv,br,bi){const xr=Float64Array.from(br),xi=Float64Array.from(bi);
  for(let c=0;c<n;c++){const p=piv[c];if(p!==c){let t=xr[c];xr[c]=xr[p];xr[p]=t;t=xi[c];xi[c]=xi[p];xi[p]=t;}}
  for(let c=0;c<n;c++){for(let r=c+1;r<n;r++){const fr=Ar[r*n+c],fi=Ai[r*n+c];xr[r]-=fr*xr[c]-fi*xi[c];xi[r]-=fr*xi[c]+fi*xr[c];}}
  for(let r=n-1;r>=0;r--){let vr=xr[r],vi=xi[r];for(let k=r+1;k<n;k++){const ar=Ar[r*n+k],ai=Ai[r*n+k];vr-=ar*xr[k]-ai*xi[k];vi-=ar*xi[k]+ai*xr[k];}
    const pr=Ar[r*n+r],pi=Ai[r*n+r],pm=pr*pr+pi*pi;xr[r]=(vr*pr+vi*pi)/pm;xi[r]=(vi*pr-vr*pi)/pm;}
  return [xr,xi];}

/* ================= simulator ================= */
class Sim{
  constructor(net){this.setNet(net);this.t=0;this.beNext=true;}
  setNet(net){const old=this.net;this.net=net;this.n=net.M;this.A=new Float64Array(this.n*this.n);this.z=new Float64Array(this.n);this.piv=new Int32Array(this.n);
    this.x=new Float64Array(this.n);this.lu=null;this.op=null;
    net.comps.forEach(e=>{if(!e.st)e.st={v:0,i:0,vd:0.6,vbe:0.6,vbc:-1,reg:1};});
    /* rebuild solution guess from element states so a running simulation continues smoothly */
    if(old)this.beNext=true;}
  dirty(){this.lu=null;this.op=null;this.beNext=true;}
  resetState(mode){this.t=0;this.beNext=true;this.lu=null;this.x.fill(0);
    this.net.comps.forEach(e=>{e.st={v:0,i:0,vd:0.6,vbe:0.6,vbc:-1,reg:1};e.i=0;e.ti=null;});
    if(mode==='dc'){const r=this.dcop('t0');if(r.ok){this.x=Float64Array.from(r.x);this.net.comps.forEach(e=>{const v=this.vAcross(e,r.x);if(e.t==='C'){e.st.v=v;e.st.i=0;}if(e.t==='L'){e.st.v=0;e.st.i=v*GL_DC;}});this.computeCurrents(this.x,'dc');}}}
  V(x,n){return n<0?0:x[n];}
  vAcross(e,x){return this.V(x,e.nodes[0])-this.V(x,e.nodes[1]);}

  /* assemble real MNA. mode: 'tran' | 'dc' | 'ss0' (small-signal at DC, sources zeroed). */
  assemble(mode,o,wantA){const {comps,N}=this.net,n=this.n,A=this.A,z=this.z;if(wantA)A.fill(0);z.fill(0);
    const a=(i,j,v)=>{if(wantA&&i>=0&&j>=0)A[i*n+j]+=v;},g=(p,q,G)=>{a(p,p,G);a(q,q,G);a(p,q,-G);a(q,p,-G);},
      inj=(p,q,I)=>{if(p>=0)z[p]-=I;if(q>=0)z[q]+=I;};
    if(wantA)for(let i=0;i<N;i++)A[i*n+i]+=GMIN;
    const ss=mode==='ss0',h=o.h,be=o.be;
    for(const e of comps){const nd=e.nodes,p=nd[0],q=nd[1];
      switch(e.t){
        case 'R':g(p,q,1/Math.max(e.v,1e-6));break;
        case 'LMP':g(p,q,e.pr/(e.vr*e.vr));break;
        case 'S':g(p,q,e.on?GSW_ON:GSW_OFF);break;
        case 'SW2':g(nd[0],nd[1],e.pos?GSW_OFF:GSW_ON);g(nd[0],nd[2],e.pos?GSW_ON:GSW_OFF);break;
        case 'POT':{const pos=Math.min(Math.max(e.pos,0),1);g(nd[0],nd[2],1/Math.max(e.v*pos,1e-3));g(nd[2],nd[1],1/Math.max(e.v*(1-pos),1e-3));break;}
        case 'C':if(mode==='tran'){const G=(be?1:2)*e.v/h;e.G=G;e.J0=be?G*e.st.v:G*e.st.v+e.st.i;g(p,q,G);inj(q,p,e.J0);}else g(p,q,GMIN);break;
        case 'L':if(mode==='tran'){const G=(be?1:0.5)*h/e.v;e.G=G;e.Ieq=be?e.st.i:e.st.i+G*e.st.v;g(p,q,G);inj(p,q,e.Ieq);}else g(p,q,GL_DC);break;
        case 'I':if(!ss)inj(p,q,mode==='tran'?srcVal(e,o.t):o.src==='t0'?srcVal(e,0):srcDC(e));break;
        case 'V':case 'A':case 'Q':case 'AM':{const k=e.br;a(q,k,1);a(p,k,-1);a(k,q,1);a(k,p,-1);
          z[k]=ss||e.t==='AM'?0:mode==='tran'?srcVal(e,o.t):o.src==='t0'?srcVal(e,0):srcDC(e);break;}
        case 'XF':{const k=e.br,r=e.n,[P1,P2,S1,S2]=nd;a(S1,k,1);a(S2,k,-1);a(P1,k,-r);a(P2,k,r);a(k,S1,1);a(k,S2,-1);a(k,P1,-r);a(k,P2,r);break;}
        case 'OA':{const k=e.br,[m,pp,out]=nd;a(out,k,1);a(k,out,1);
          if(e.st.reg===0){a(k,pp,-e.A);a(k,m,e.A);}else if(!ss)z[k]=e.st.reg*e.vsat;break;}
        case 'D':case 'Z':case 'LED':{const v=e.st.vd;let [I,G]=diodeEval(e,v);if(ss){g(p,q,G);break;}g(p,q,G);inj(p,q,I-G*v);break;}
        case 'NPN':{const [B,C,E]=nd,r=bjtEval(e,e.st.vbe,e.st.vbc),vbe=e.st.vbe,vbc=e.st.vbc;
          /* d i_k / d V_j for k,j in {B,C,E}; i_k = current into device at terminal k */
          const dC=[r.dCbe+r.dCbc,-r.dCbc,-r.dCbe],dB=[r.dBbe+r.dBbc,-r.dBbc,-r.dBbe],dE=[-(dC[0]+dB[0]),-(dC[1]+dB[1]),-(dC[2]+dB[2])];
          const iC=r.iC,iB=r.iB,iE=-(iC+iB),vB=0,vC=-vbc,vE=-vbe;   /* node voltages relative to B, consistent with vbe/vbc */
          const rows=[[B,dB,iB],[C,dC,iC],[E,dE,iE]],cols=[B,C,E],vv=[vB,vC,vE];
          for(const [k,d,i0] of rows){for(let j=0;j<3;j++)a(k,cols[j],d[j]);if(!ss){const lin=d[0]*vv[0]+d[1]*vv[1]+d[2]*vv[2];if(k>=0)z[k]-=i0-lin;}}break;}
      }}
  }
  /* solve the assembled system (A may be reused when linear) */
  solveLinear(){luFactor(this.A,this.n,this.piv);return luSolve(this.A,this.n,this.piv,this.z);}

  /* Newton loop for nonlinear devices plus the op-amp region logic. Returns solution x. */
  inner(mode,o){const {comps}=this.net,n=this.n;
    for(let it=0;it<120;it++){this.assemble(mode,o,true);luFactor(this.A,n,this.piv);const x=luSolve(this.A,n,this.piv,this.z);
      if(!this.net.nonlin)return x;let ok=true;
      for(const e of comps){
        if(e.t==='D'||e.t==='Z'||e.t==='LED'){const vn=this.V(x,e.nodes[0])-this.V(x,e.nodes[1]),vl=limitDiode(e,vn,e.st.vd);if(Math.abs(vl-e.st.vd)>1e-7+1e-6*Math.abs(vl))ok=false;e.st.vd=vl;}
        else if(e.t==='NPN'){const [B,C,E]=e.nodes,vb=this.V(x,B),vbe=vb-this.V(x,E),vbc=vb-this.V(x,C);
          const lbe=pnjlim(vbe,e.st.vbe,VT,BJT_VC),lbc=pnjlim(vbc,e.st.vbc,VT,BJT_VC);if(Math.abs(lbe-e.st.vbe)>1e-7||Math.abs(lbc-e.st.vbc)>1e-7)ok=false;e.st.vbe=lbe;e.st.vbc=lbc;}}
      if(ok)return x;}
    throw new Error('noconv');}
  newton(mode,o){const oas=this.net.comps.filter(e=>e.t==='OA');let x=this.inner(mode,o);if(!oas.length)return x;
    /* op-amp: linear region Vo = A·(V+ − V−) while |Vo| < Vsat, otherwise pinned at ±Vsat.
       Leaving saturation we try the linear region; if that lands beyond a rail (positive feedback, e.g. a Schmitt
       trigger, or a large input step) the output goes to the opposite rail. */
    for(let outer=0;outer<16;outer++){let changed=false;
      for(const e of oas){const [m,p,out]=e.nodes,vo=this.V(x,out),xin=this.V(x,p)-this.V(x,m),reg=e.st.reg;
        if(reg===0){if(Math.abs(vo)>e.vsat*(1+1e-9)){e.st.reg=e.st._from?-e.st._from:Math.sign(vo);changed=true;}e.st._from=0;}
        else if(reg*e.A*xin<e.vsat){e.st.reg=0;e.st._from=reg;changed=true;}}
      if(!changed)return x;x=this.inner(mode,o);}
    oas.forEach(e=>e.st._from=0);return x;}
  /* consistent solution at the current time without advancing (after edits while paused) */
  refresh(){const n=this.n;if(!n)return null;const o={t:this.t,h:1e-9,be:true};let err=null;try{const x=this.newton('tran',o);if([...x].some(v=>!Number.isFinite(v)))throw new Error('nan');this.x=x;this.computeCurrents(x,'tran');}catch(e){err=e;}this.lu=null;this.beNext=true;return err;}

  step(h){const {comps}=this.net,n=this.n,t1=this.t+h;if(!n){this.t=t1;return;}
    let be=this.beNext;this.beNext=false;if(!be)for(const e of comps)if(LIB[e.t].src&&srcJump(e,this.t,t1)){be=true;break;}
    const o={t:t1,h,be};let x;
    if(!this.net.nonlin&&!this.net.hasOA){
      const sig=h+(be?'b':'t');if(!this.lu||this.luSig!==sig){this.assemble('tran',o,true);luFactor(this.A,n,this.piv);this.lu=true;this.luSig=sig;}
      else this.assemble('tran',o,false);
      x=luSolve(this.A,n,this.piv,this.z);
    }else{x=this.newton('tran',o);this.lu=null;}
    for(let i=0;i<n;i++)if(!Number.isFinite(x[i])){const err=new Error('nan');throw err;}
    /* commit reactive states */
    for(const e of comps){if(e.t==='C'){const v=this.vAcross(e,x);e.st.i=e.G*v-e.J0;e.st.v=v;}else if(e.t==='L'){const v=this.vAcross(e,x);e.st.i=e.G*v+e.Ieq;e.st.v=v;}}
    this.x=x;this.t=t1;this.computeCurrents(x,'tran');}

  /* element currents: e.i (a→b through two-terminal parts), e.ti (into each terminal), e.p (absorbed power) */
  computeCurrents(x,mode){const V=n=>n<0?0:x[n];
    for(const e of this.net.comps){const nd=e.nodes;let ti;
      switch(e.t){
        case 'R':ti=(V(nd[0])-V(nd[1]))/Math.max(e.v,1e-6);break;
        case 'LMP':ti=(V(nd[0])-V(nd[1]))*e.pr/(e.vr*e.vr);break;
        case 'S':ti=(V(nd[0])-V(nd[1]))*(e.on?GSW_ON:GSW_OFF);break;
        case 'C':ti=mode==='tran'?e.st.i:0;break;case 'L':ti=mode==='tran'?e.st.i:(V(nd[0])-V(nd[1]))*GL_DC;break;
        case 'I':ti=mode==='tran'?srcVal(e,this.t):srcDC(e);break;
        case 'V':case 'A':case 'Q':case 'AM':ti=-x[e.br];break;
        case 'D':case 'Z':case 'LED':ti=diodeEval(e,V(nd[0])-V(nd[1]))[0];break;
        case 'VM':ti=0;break;
        case 'SW2':{const c=V(nd[0]),g1=e.pos?GSW_OFF:GSW_ON,g2=e.pos?GSW_ON:GSW_OFF,i1=(c-V(nd[1]))*g1,i2=(c-V(nd[2]))*g2;e.ti=[i1+i2,-i1,-i2];break;}
        case 'POT':{const pos=Math.min(Math.max(e.pos,0),1),i1=(V(nd[0])-V(nd[2]))/Math.max(e.v*pos,1e-3),i2=(V(nd[2])-V(nd[1]))/Math.max(e.v*(1-pos),1e-3);e.ti=[i1,-i2,i2-i1];break;}
        case 'NPN':{const vb=V(nd[0]),r=bjtEval(e,vb-V(nd[2]),vb-V(nd[1]));e.ti=[r.iB,r.iC,-(r.iB+r.iC)];break;}
        case 'OA':e.ti=[0,0,x[e.br]];break;
        case 'XF':{const k=x[e.br];e.ti=[-e.n*k,e.n*k,k,-k];break;}
        default:e.ti=nd.map(()=>0);}
      if(ti!==undefined){e.i=ti;e.ti=[ti,-ti];}
      e.p=e.ti.reduce((s,i,k)=>s+i*V(nd[k]),0);}}

  /* DC operating point; src: 'dc' (AC sources at their offset) or 't0' (values at t = 0) */
  dcop(src='dc'){const save=this.net.comps.map(e=>({...e.st}));const o={src};
    try{const x=this.newton('dc',o);this.computeCurrents(x,'dc');return {ok:true,x};}
    catch(err){/* source stepping */
      try{const xs=[];for(const f of [0.1,0.3,0.6,1]){this.net.comps.forEach(e=>{if(LIB[e.t].src){e._v=e.v;e.v*=f;}});try{xs.push(this.newton('dc',o));}finally{this.net.comps.forEach(e=>{if(e._v!==undefined){e.v=e._v;delete e._v;}});}}
        const x=xs[xs.length-1];this.computeCurrents(x,'dc');return {ok:true,x};}
      catch(e2){this.net.comps.forEach((e,i)=>e.st=save[i]);return {ok:false,err:err.message};}}}

  /* small-signal DC matrix with all independent sources zeroed (for Thévenin resistance) */
  rth(pNode,qNode,skip){const n=this.n;const o={src:'dc',lin:true};const save=skip?skip.map(e=>e.t):null;
    if(skip)skip.forEach(e=>{e._t=e.t;e.t='VM';});
    try{this.assemble('ss0',o,true);for(let i=0;i<n;i++)this.z[i]=0;if(pNode>=0)this.z[pNode]+=1;if(qNode>=0)this.z[qNode]-=1;
      luFactor(this.A,n,this.piv);const x=luSolve(this.A,n,this.piv,this.z);return (pNode<0?0:x[pNode])-(qNode<0?0:x[qNode]);}
    catch(e){return Infinity;}finally{if(skip)skip.forEach(e=>{e.t=e._t;delete e._t;});}}

  /* ---------- complex small-signal assembly at s = sr + j·si (devices linearised at the stored states) ---------- */
  assembleS(sr,si,inp){const {comps,N}=this.net,n=this.n,Ar=new Float64Array(n*n),Ai=new Float64Array(n*n),br=new Float64Array(n),bi=new Float64Array(n);
    const a=(i,j,re,im=0)=>{if(i>=0&&j>=0){Ar[i*n+j]+=re;Ai[i*n+j]+=im;}},y=(p,q,re,im=0)=>{a(p,p,re,im);a(q,q,re,im);a(p,q,-re,-im);a(q,p,-re,-im);};
    for(let i=0;i<N;i++)Ar[i*n+i]+=GMIN;let nL=0;
    for(const e of comps){const nd=e.nodes,p=nd[0],q=nd[1];
      switch(e.t){
        case 'R':y(p,q,1/Math.max(e.v,1e-6));break;case 'LMP':y(p,q,e.pr/(e.vr*e.vr));break;case 'S':y(p,q,e.on?GSW_ON:GSW_OFF);break;
        case 'SW2':y(nd[0],nd[1],e.pos?GSW_OFF:GSW_ON);y(nd[0],nd[2],e.pos?GSW_ON:GSW_OFF);break;
        case 'POT':{const pos=Math.min(Math.max(e.pos,0),1);y(nd[0],nd[2],1/Math.max(e.v*pos,1e-3));y(nd[2],nd[1],1/Math.max(e.v*(1-pos),1e-3));break;}
        case 'C':y(p,q,sr*e.v,si*e.v);break;
        case 'L':{const m=sr*sr+si*si;nL++;if(m===0){y(p,q,GL_DC);break;}const re=sr/(m*e.v),im=-si/(m*e.v);y(p,q,re,im);break;}
        case 'I':if(inp===e){if(p>=0)br[p]-=1;if(q>=0)br[q]+=1;}break;
        case 'V':case 'A':case 'Q':case 'AM':{const k=e.br;a(q,k,1);a(p,k,-1);a(k,q,1);a(k,p,-1);br[k]=inp===e?1:0;break;}
        case 'XF':{const k=e.br,r=e.n,[P1,P2,S1,S2]=nd;a(S1,k,1);a(S2,k,-1);a(P1,k,-r);a(P2,k,r);a(k,S1,1);a(k,S2,-1);a(k,P1,-r);a(k,P2,r);break;}
        case 'OA':{const k=e.br,[m,pp,out]=nd;a(out,k,1);a(k,out,1);if(e.st.reg===0){a(k,pp,-e.A);a(k,m,e.A);}break;}
        case 'D':case 'Z':case 'LED':y(p,q,diodeEval(e,e.st.vd)[1]);break;
        case 'NPN':{const [B,C,E]=nd,r=bjtEval(e,e.st.vbe,e.st.vbc);const dC=[r.dCbe+r.dCbc,-r.dCbc,-r.dCbe],dB=[r.dBbe+r.dBbc,-r.dBbc,-r.dBbe],dE=dC.map((v,j)=>-(v+dB[j]));
          const cols=[B,C,E];[[B,dB],[C,dC],[E,dE]].forEach(([k,d])=>{for(let j=0;j<3;j++)a(k,cols[j],d[j]);});break;}
      }}
    return {Ar,Ai,br,bi,nL};}

  /* frequency response from source `inp` to output spec {kind:'node'|'diff'|'cur', ...} */
  acSweep(inp,out,f0,f1,npts=241){if(!this.op){const r=this.dcop('dc');this.op=r;}
    const n=this.n,res=[];for(let i=0;i<npts;i++){const f=f0*Math.pow(f1/f0,i/(npts-1)),w=2*Math.PI*f;
      const S=this.assembleS(0,w,inp),F=cluFactor(S.Ar,S.Ai,n);if(F.sing){res.push([f,NaN,NaN]);continue;}
      const [xr,xi]=cluSolve(S.Ar,S.Ai,n,F.piv,S.br,S.bi);const pick=k=>k<0?[0,0]:[xr[k],xi[k]];
      let v;if(out.kind==='node')v=pick(out.n);else if(out.kind==='diff'){const A=pick(out.p),B=pick(out.q);v=[A[0]-B[0],A[1]-B[1]];}else v=[-xr[out.br],-xi[out.br]];
      res.push([f,Math.hypot(v[0],v[1]),Math.atan2(v[1],v[0])]);}
    return res;}

  /* natural frequencies: roots of s^nL · det(Y(s)), found by polynomial interpolation on circles of several radii */
  poles(){if(!this.op)this.op=this.dcop('dc');const {comps}=this.net,n=this.n;const nC=comps.filter(e=>e.t==='C').length,nLc=comps.filter(e=>e.t==='L').length,d=nC+nLc;
    if(!d||!n)return {list:[],d:0};if(d>14)return {list:[],d,tooMany:true};
    const pdet=(sr,si)=>{const S=this.assembleS(sr,si,null),F=cluFactor(S.Ar,S.Ai,n);if(F.sing)return [0,0,0];
      /* multiply by s^nL */let [dr,di]=F.det,lg=F.lg;const m=Math.hypot(sr,si),th=Math.atan2(si,sr);if(S.nL){lg+=S.nL*Math.log(m);const a=S.nL*th,c=Math.cos(a),s=Math.sin(a);[dr,di]=[dr*c-di*s,dr*s+di*c];}
      return [dr,di,lg];};
    const found=[];const K=d+1,phi=0.37;
    for(let ex=-2;ex<=10;ex+=0.5){const r=Math.pow(10,ex),vals=[];let lmax=-Infinity;
      for(let j=0;j<K;j++){const th=2*Math.PI*j/K+phi,v=pdet(r*Math.cos(th),r*Math.sin(th));vals.push(v);if(v[2]>lmax&&isFinite(v[2]))lmax=v[2];}
      if(!isFinite(lmax))continue;
      /* coefficients of q(u) = p(r·u)/scale */
      const cr=new Float64Array(K),ci=new Float64Array(K);
      for(let k=0;k<K;k++){let sr=0,si=0;for(let j=0;j<K;j++){const [vr,vi,lg]=vals[j],sc=Math.exp(lg-lmax),a=-(2*Math.PI*j*k/K)-k*phi,c=Math.cos(a),s=Math.sin(a);sr+=sc*(vr*c-vi*s);si+=sc*(vr*s+vi*c);}cr[k]=sr/K;ci[k]=si/K;}
      let deg=K-1;const cm=Math.max(...[...cr].map((v,k)=>Math.hypot(v,ci[k])));while(deg>0&&Math.hypot(cr[deg],ci[deg])<1e-9*cm)deg--;
      let lo=0;while(lo<deg&&Math.hypot(cr[lo],ci[lo])<1e-11*cm)lo++;
      const roots=durandKerner(cr.slice(lo,deg+1),ci.slice(lo,deg+1));
      for(const [ur,ui] of roots){const m=Math.hypot(ur,ui);if(m<0.25||m>4)continue;let s=[ur*r,ui*r];
        /* Newton refinement on log-det with numerical derivative */
        for(let it=0;it<20;it++){const h=1e-5*Math.hypot(s[0],s[1])+1e-12;const f0=pdet(s[0],s[1]),fp=pdet(s[0]+h,s[1]),fm=pdet(s[0]-h,s[1]);
          if(!isFinite(f0[2])||!isFinite(fp[2])||!isFinite(fm[2]))break;
          const D=(A,B)=>{const e=Math.exp(A[2]-f0[2]);return [A[0]*e,A[1]*e];};const P=D(fp),Mm=D(fm),F0=[f0[0],f0[1]],dr=(P[0]-Mm[0])/(2*h),di=(P[1]-Mm[1])/(2*h),dm=dr*dr+di*di;
          if(dm===0)break;const qr=(F0[0]*dr+F0[1]*di)/dm,qi=(F0[1]*dr-F0[0]*di)/dm;s=[s[0]-qr,s[1]-qi];if(Math.hypot(qr,qi)<1e-10*Math.hypot(s[0],s[1]))break;}
        if(!isFinite(s[0])||!isFinite(s[1]))continue;if(Math.abs(s[1])<1e-7*Math.abs(s[0]))s[1]=0;
        if(!found.some(f=>Math.hypot(f[0]-s[0],f[1]-s[1])<1e-4*Math.hypot(s[0],s[1])))found.push(s);}}
    /* fold conjugate pairs into the upper half plane, then de-duplicate */
    const uniq=[];found.map(s=>[s[0],Math.abs(s[1])]).forEach(s=>{if(!uniq.some(u=>Math.hypot(u[0]-s[0],u[1]-s[1])<1e-4*Math.hypot(s[0],s[1])))uniq.push(s);});
    uniq.sort((a,b)=>Math.hypot(a[0],a[1])-Math.hypot(b[0],b[1]));return {list:uniq,d};}
}
function durandKerner(cr,ci){const n=cr.length-1;if(n<1)return [];const ar=cr[n],ai=ci[n],am=ar*ar+ai*ai;
  const pr=[],pi=[];for(let k=0;k<=n;k++){pr[k]=(cr[k]*ar+ci[k]*ai)/am;pi[k]=(ci[k]*ar-cr[k]*ai)/am;}  /* monic */
  const zr=[],zi=[];for(let k=0;k<n;k++){const a=2*Math.PI*k/n+0.4,m=Math.pow(1.1,k%3);zr.push(m*Math.cos(a));zi.push(m*Math.sin(a));}
  for(let it=0;it<800;it++){let mv=0;for(let i=0;i<n;i++){let vr=1,vi=0;for(let k=n-1;k>=0;k--){const t=vr*zr[i]-vi*zi[i];vi=vr*zi[i]+vi*zr[i]+pi[k];vr=t+pr[k];}
      let dr=1,di=0;for(let j=0;j<n;j++){if(j===i)continue;const xr=zr[i]-zr[j],xi=zi[i]-zi[j],t=dr*xr-di*xi;di=dr*xi+di*xr;dr=t;}
      const dm=dr*dr+di*di||1e-300,qr=(vr*dr+vi*di)/dm,qi=(vi*dr-vr*di)/dm;zr[i]-=qr;zi[i]-=qi;mv=Math.max(mv,Math.hypot(qr,qi));}if(mv<1e-13)break;}
  return zr.map((r,i)=>[r,zi[i]]);}

return {LIB,LED_COL,VT,GMIN,terms,normalize,build,Sim,srcVal,srcDC,diodeEval,isVsrc,key,rotPt};
})();
if(typeof module!=='undefined')module.exports=CE;
