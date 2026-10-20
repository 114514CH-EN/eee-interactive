/* Logic engine: component library, netlist compile, tick-based simulation with gate delays,
   truth tables, Quine–McCluskey minimisation (SOP / POS, don't cares), static-hazard check,
   Boolean expression parser, gate-level synthesis with auto layout, state-diagram extraction,
   critical path. No DOM access (runs under Node for tests). */
const LE=(()=>{
const key=p=>p[0]+','+p[1];
/* ---------------- library ---------------- */
const gateYs=n=>n<=2?[-1,1]:n===3?[-1,0,1]:[-2,-1,1,2];
const AND=v=>v.includes(0)?0:v.every(x=>x===1)?1:'X',OR=v=>v.includes(1)?1:v.every(x=>x===0)?0:'X',NEG=x=>x==='X'?'X':1-x;
const XOR=v=>v.some(x=>x!==0&&x!==1)?'X':v.reduce((a,b)=>a^b,0);
const LIB={
  AND:{n:'与门',gate:1,f:AND},OR:{n:'或门',gate:1,f:OR},NAND:{n:'与非门',gate:1,f:v=>NEG(AND(v))},NOR:{n:'或非门',gate:1,f:v=>NEG(OR(v))},
  XOR:{n:'异或门',gate:1,f:XOR},XNOR:{n:'同或门',gate:1,f:v=>NEG(XOR(v))},
  NOT:{n:'非门',gate:1,one:1,f:v=>NEG(v[0])},BUF:{n:'缓冲器',gate:1,one:1,f:v=>v[0]},
  IN:{n:'开关',src:1,pins:[[1,0,'o']]},BTN:{n:'按钮',src:1,pins:[[1,0,'o']]},CONST:{n:'常量',src:1,pins:[[1,0,'o']]},CLK:{n:'时钟',src:1,pins:[[1,0,'o']]},
  OUT:{n:'LED',pins:[[-1,0,'i']]},LBL:{n:'网络标签',pins:[[0,0,'n']]},
  HEX:{n:'十六进制显示',pins:[[-1,-2,'i','8'],[-1,-1,'i','4'],[-1,0,'i','2'],[-1,1,'i','1']]},
  DFF:{n:'D 触发器',ff:1,pins:[[0,-1,'i','D'],[0,1,'i','>'],[4,-1,'o','Q'],[4,1,'o','Q̅']],clk:1,next:(s,v)=>v[0]},
  TFF:{n:'T 触发器',ff:1,pins:[[0,-1,'i','T'],[0,1,'i','>'],[4,-1,'o','Q'],[4,1,'o','Q̅']],clk:1,next:(s,v)=>v[0]==='X'||s==='X'?'X':s^v[0]},
  JKFF:{n:'JK 触发器',ff:1,pins:[[0,-1,'i','J'],[0,0,'i','>'],[0,1,'i','K'],[4,-1,'o','Q'],[4,1,'o','Q̅']],clk:1,next:(s,v)=>v[0]==='X'||v[2]==='X'||s==='X'?'X':(v[0]&(1-s))|((1-v[2])&s)},
  SRFF:{n:'SR 触发器',ff:1,pins:[[0,-1,'i','S'],[0,0,'i','>'],[0,1,'i','R'],[4,-1,'o','Q'],[4,1,'o','Q̅']],clk:1,next:(s,v)=>v[0]==='X'||v[2]==='X'?'X':v[0]&&v[2]?'X':v[0]?1:v[2]?0:s},
  DLATCH:{n:'D 锁存器',latch:1,pins:[[0,-1,'i','D'],[0,1,'i','EN'],[4,-1,'o','Q'],[4,1,'o','Q̅']]},
  MUX2:{n:'2 选 1 数据选择器',blk:1,pins:[[0,-1,'i','0'],[0,1,'i','1'],[2,3,'i','S'],[4,0,'o','Y']],f:v=>v[2]===0?[v[0]]:v[2]===1?[v[1]]:[v[0]===v[1]?v[0]:'X']},
  MUX4:{n:'4 选 1 数据选择器',blk:1,pins:[[0,-3,'i','0'],[0,-1,'i','1'],[0,1,'i','2'],[0,3,'i','3'],[1,5,'i','S1'],[3,5,'i','S0'],[4,0,'o','Y']],
    f:v=>v[4]==='X'||v[5]==='X'?['X']:[v[v[4]*2+v[5]]]},
  DEC2:{n:'2–4 译码器',blk:1,pins:[[0,-1,'i','A1'],[0,1,'i','A0'],[4,-3,'o','Y0'],[4,-1,'o','Y1'],[4,1,'o','Y2'],[4,3,'o','Y3']],f:v=>v[0]==='X'||v[1]==='X'?['X','X','X','X']:[0,1,2,3].map(k=>k===v[0]*2+v[1]?1:0)},
  FA:{n:'全加器',blk:1,pins:[[0,-1,'i','A'],[0,0,'i','B'],[0,1,'i','Cin'],[4,-1,'o','S'],[4,1,'o','Co']],f:v=>v.some(x=>x!==0&&x!==1)?['X','X']:[v[0]^v[1]^v[2],(v[0]&v[1])|(v[2]&(v[0]^v[1]))]}};
function pins(c){const L=LIB[c.t];let P;if(L.gate)P=L.one?[[0,0,'i'],[3,0,'o']]:gateYs(c.n||2).map(y=>[0,y,'i']).concat([[4,0,'o']]);else P=L.pins;
  return P.map(([dx,dy,io,lab])=>({p:[c.x+dx,c.y+dy],io,lab}));}
/* drawing / hit box in local units */
function box(c){const L=LIB[c.t];if(L.gate){if(L.one)return [0.4,-0.8,2.7,0.8];const h=(c.n||2)>=4?2.5:1.45;return [0.4,-h,3.7,h];}
  switch(c.t){case 'IN':case 'BTN':case 'CONST':case 'CLK':return [-0.85,-0.6,0.5,0.6];case 'OUT':return [-0.5,-0.5,0.5,0.5];case 'LBL':return [-0.1,-0.4,1.8,0.4];
    case 'HEX':return [-0.5,-2.7,2.3,1.6];case 'MUX2':return [0.5,-2,3.5,2.6];case 'MUX4':return [0.5,-4.2,3.5,4.6];case 'DEC2':return [0.5,-4.2,3.5,4.2];case 'FA':return [0.5,-1.8,3.5,1.8];
    default:return [0.5,-1.7,3.5,1.7];}}

/* ---------------- compile ---------------- */
function onSeg(p,a,b){if(a[0]===b[0]&&p[0]===a[0])return p[1]>Math.min(a[1],b[1])&&p[1]<Math.max(a[1],b[1]);if(a[1]===b[1]&&p[1]===a[1])return p[0]>Math.min(a[0],b[0])&&p[0]<Math.max(a[0],b[0]);return false;}
function normalize(comps,wires,newId){wires=wires.filter(w=>!(w.a[0]===w.b[0]&&w.a[1]===w.b[1]));
  for(let g=0;g<600;g++){const pts=new Map();comps.forEach(c=>pins(c).forEach(q=>pts.set(key(q.p),q.p)));wires.forEach(w=>{pts.set(key(w.a),w.a);pts.set(key(w.b),w.b);});let hit=false;
    for(const w of wires){for(const p of pts.values())if(onSeg(p,w.a,w.b)){const b=w.b;w.b=[p[0],p[1]];wires.push({a:[p[0],p[1]],b,id:newId()});hit=true;break;}if(hit)break;}if(!hit)break;}
  const seen=new Set();return wires.filter(w=>{const k=[key(w.a),key(w.b)].sort().join('|');if(seen.has(k))return false;seen.add(k);return true;});}
function build(comps,wires){
  const par=new Map(),find=k=>{let r=k;while(par.get(r)!==r)r=par.get(r);while(par.get(k)!==r){const n=par.get(k);par.set(k,r);k=n;}return r;},mk=k=>{if(!par.has(k))par.set(k,k);},uni=(a,b)=>{mk(a);mk(b);const ra=find(a),rb=find(b);if(ra!==rb)par.set(ra,rb);};
  wires.forEach(w=>uni(key(w.a),key(w.b)));comps.forEach(c=>pins(c).forEach(q=>mk(key(q.p))));
  const lab=new Map();comps.filter(c=>c.t==='LBL'&&c.name).forEach(c=>{const k=key([c.x,c.y]);if(lab.has(c.name))uni(k,lab.get(c.name));else lab.set(c.name,k);});
  const id=new Map();let n=0;const nid=p=>{const r=find(key(p));if(!id.has(r))id.set(r,n++);return id.get(r);};
  comps.forEach(c=>{c.ins=[];c.outs=[];pins(c).forEach(q=>{if(q.io==='i')c.ins.push(nid(q.p));else if(q.io==='o')c.outs.push(nid(q.p));else c.net=nid(q.p);});});
  wires.forEach(w=>w.net=nid(w.a));
  const drivers=Array.from({length:n},()=>[]),readers=Array.from({length:n},()=>[]);comps.forEach(c=>{c.outs.forEach((o,j)=>drivers[o].push([c,j]));c.ins.forEach((i,j)=>readers[i].push([c,j]));});
  const net={n,drivers,readers,comps,wires,diags:[]};diagnose(net);return net;}
function cname(c){return c.name||LIB[c.t].n;}
function diagnose(net){const {comps,drivers,readers,diags}=net;
  comps.forEach(c=>{if(c.t==='LBL'||c.t==='OUT'||c.t==='HEX')return;const pl=pins(c).filter(q=>q.io==='i');c.ins.forEach((nn,j)=>{if(!drivers[nn].length)diags.push({lv:'warn',msg:`${cname(c)} 的输入${pl[j]&&pl[j].lab?' '+pl[j].lab:''} 没有接任何信号（按 0 处理）。`,ids:[c.id]});});});
  comps.filter(c=>c.t==='OUT'||c.t==='HEX').forEach(c=>{if(c.ins.some(nn=>!drivers[nn].length))diags.push({lv:'warn',msg:`${cname(c)} 没有接到任何输出。`,ids:[c.id]});});
  drivers.forEach((d,i)=>{if(d.length>1)diags.push({lv:'err',msg:`${d.map(([c])=>cname(c)).join('、')} 的输出接在了同一根线上（值不同时会显示红色 X）。`,ids:d.map(([c])=>c.id)});});
  const cnt=new Map();comps.filter(c=>c.t==='LBL').forEach(c=>cnt.set(c.name,(cnt.get(c.name)||0)+1));
  comps.filter(c=>c.t==='LBL'&&cnt.get(c.name)===1&&!drivers[c.net].length&&!readers[c.net].length).forEach(c=>diags.push({lv:'warn',msg:`标签「${c.name}」只出现一次，也没接到元件上。`,ids:[c.id]}));
  const names=new Map();comps.filter(c=>c.t==='IN'||c.t==='OUT').forEach(c=>{if(names.has(c.name))diags.push({lv:'warn',msg:`有两个元件都叫「${c.name}」，真值表里会分不清。`,ids:[c.id,names.get(c.name)]});else names.set(c.name,c.id);});
  const loop=combLoop(net);if(loop)diags.push({lv:'info',msg:`有不经过触发器的反馈环路（${loop.map(cname).slice(0,4).join(' → ')}），它会像锁存器一样记忆，或者振荡。`,ids:loop.map(c=>c.id)});}
/* combinational cycle detection (gates / blocks only) */
function combLoop(net){const comb=net.comps.filter(c=>LIB[c.t].gate||LIB[c.t].blk);const st=new Map();let found=null;
  const succ=c=>{const r=[];c.outs.forEach(o=>net.readers[o].forEach(([d])=>{if(LIB[d.t].gate||LIB[d.t].blk)r.push(d);}));return r;};
  const dfs=(c,path)=>{if(found)return;st.set(c,1);path.push(c);for(const d of succ(c)){if(st.get(d)===1){found=path.slice(path.indexOf(d));return;}if(!st.has(d))dfs(d,path);if(found)return;}path.pop();st.set(c,2);};
  for(const c of comb)if(!st.has(c))dfs(c,[]);return found;}

/* ---------------- simulation ---------------- */
class Sim{
  constructor(net){this.net=net;this.reset();}
  reset(){this.tick=0;for(const c of this.net.comps){const L=LIB[c.t];
      if(L.gate){const o=c.q0!=null?c.q0:0;c.q=new Array(Math.max(1,c.d||1)).fill(o);c.out=[o];}
      else if(L.ff||L.latch){c.s=c.init||0;c.prev=null;c.q=[c.s];c.out=[c.s,NEG(c.s)];}
      else if(L.blk){const k=c.outs.length;c.q=[new Array(k).fill(0)];c.out=new Array(k).fill(0);}
      else if(c.t==='IN')c.out=[c.on?1:0];else if(c.t==='BTN')c.out=[c.down?1:0];else if(c.t==='CONST')c.out=[c.v?1:0];else if(c.t==='CLK')c.out=[0];else c.out=[];}
    this.val=this.resolve();}
  resolve(){const {n,drivers}=this.net,v=new Array(n);for(let i=0;i<n;i++){const d=drivers[i];if(!d.length){v[i]='Z';continue;}let x=d[0][0].out[d[0][1]];for(const [c,j] of d)if(c.out[j]!==x){x='X';break;}v[i]=x===undefined?'Z':x;}return v;}
  rd(nn){const x=this.val[nn];return x==='Z'?0:x;}
  step(opt={}){const tk=this.tick;for(const c of this.net.comps){const L=LIB[c.t];
      if(c.t==='IN')c.out=[c.on?1:0];else if(c.t==='BTN')c.out=[c.down?1:0];else if(c.t==='CONST')c.out=[c.v?1:0];
      else if(c.t==='CLK')c.out=[opt.holdClk?(c.force||0):Math.floor((tk+1+(c.ph||0))/(c.half||8))%2];
      else if(L.gate){c.q.push(L.f(c.ins.map(i=>this.rd(i))));c.out=[c.q.shift()];}
      else if(L.blk){c.q.push(L.f(c.ins.map(i=>this.rd(i))));c.out=c.q.shift();}
      else if(L.latch){const d=this.rd(c.ins[0]),en=this.rd(c.ins[1]);if(en===1)c.s=d;else if(en==='X'&&d!==c.s)c.s='X';c.q.push(c.s);const o=c.q.shift();c.out=[o,NEG(o)];}
      else if(L.ff){const v=c.ins.map(i=>this.rd(i)),ck=v[L.pins.findIndex(p=>p[3]==='>')],fall=c.edge==='f';
        if(!opt.freeze&&c.prev!==null&&(fall?c.prev===1&&ck===0:c.prev===0&&ck===1))c.s=L.next(c.s,v);c.prev=ck;
        c.q.push(c.s);const o=c.q.shift();c.out=[o,NEG(o)];}}
    this.tick++;this.val=this.resolve();}
  settle(maxT=300){let stable=0,last=this.val.join();for(let i=0;i<maxT;i++){this.step({holdClk:true});const s=this.val.join();if(s===last){if(++stable>12)return true;}else{stable=0;last=s;}}return false;}
}

/* ---------------- truth tables & minimisation ---------------- */
function primes(on,dc,n){const M=(1<<n)-1;let cur=new Map();[...on,...dc].forEach(x=>cur.set(x+'/0',{v:x,m:0}));const P=[];
  while(cur.size){const nx=new Map(),used=new Set(),arr=[...cur.values()];
    for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){const a=arr[i],b=arr[j];if(a.m!==b.m)continue;const d=a.v^b.v;if(d&&!(d&(d-1))){nx.set((a.v&~d)+'/'+(a.m|d),{v:a.v&~d,m:a.m|d});used.add(i);used.add(j);}}
    arr.forEach((a,i)=>{if(!used.has(i))P.push(a);});cur=nx;}
  const uniq=new Map();P.forEach(p=>uniq.set(p.v+'/'+p.m,p));return [...uniq.values()];}
const cov=(p,x,n)=>((x^p.v)&~p.m&((1<<n)-1))===0;
const lits=(p,n)=>n-popcnt(p.m);function popcnt(x){let c=0;while(x){c+=x&1;x>>=1;}return c;}
function minCover(on,dc,n){if(!on.length)return [];const P=primes(on,dc,n).filter(p=>on.some(x=>cov(p,x,n)));let best=null;
  const cost=s=>s.length*100+s.reduce((a,p)=>a+lits(p,n),0);
  const rec=(left,ch)=>{if(best&&cost(ch)>=cost(best))return;if(!left.length){best=ch.slice();return;}
    let opts=null;for(const x of left){const o=P.filter(p=>cov(p,x,n));if(!opts||o.length<opts.length)opts=o;}
    opts.sort((a,b)=>lits(a,n)-lits(b,n));for(const p of opts){ch.push(p);rec(left.filter(x=>!cov(p,x,n)),ch);ch.pop();}};
  rec(on,[]);return best;}
function essential(on,dc,n){const P=primes(on,dc,n).filter(p=>on.some(x=>cov(p,x,n)));return P.filter(p=>on.some(x=>cov(p,x,n)&&P.filter(q=>cov(q,x,n)).length===1));}
/* static-1 hazards: adjacent 1-cells not covered by one implicant of the cover */
function hazards(on,dc,n,cover){const S=new Set(on),res=[];const P=primes(on,dc,n);
  for(const x of on)for(let b=0;b<n;b++){const y=x^(1<<b);if(y<x||!S.has(y))continue;if(cover.some(p=>cov(p,x,n)&&cov(p,y,n)))continue;
    const fix=P.filter(p=>cov(p,x,n)&&cov(p,y,n)).sort((a,b)=>lits(a,n)-lits(b,n))[0];res.push({a:x,b:y,fix});}
  return res;}
function hazardFree(on,dc,n){const c=minCover(on,dc,n).slice();for(let k=0;k<20;k++){const h=hazards(on,dc,n,c);if(!h.length)break;if(!c.includes(h[0].fix))c.push(h[0].fix);else break;}return c;}
/* term as text; mode 'sop' gives products of literals, 'pos' gives sums (for a cover of F̅) */
function termText(p,names,pos){const n=names.length,L=[];for(let i=0;i<n;i++){const b=n-1-i;if(p.m>>b&1)continue;const one=(p.v>>b&1)===1;L.push(pos?(one?names[i]+"'":names[i]):(one?names[i]:names[i]+"'"));}
  if(!L.length)return pos?'0':'1';return pos?'('+L.join(' + ')+')':L.join('');}
function sopText(cover,names,on,n){if(!on.length)return '0';if(on.length===1<<n)return '1';return cover.map(p=>termText(p,names,false)).join(' + ');}
function posText(coverOff,names,off,n){if(!off.length)return '1';if(off.length===1<<n)return '0';return coverOff.map(p=>termText(p,names,true)).join('');}

/* ---------------- Boolean expressions ---------------- */
function lex(s){const T=[];let i=0;s=s.replace(/\bAND\b/gi,'·').replace(/\bOR\b/gi,'+').replace(/\bXOR\b/gi,'⊕').replace(/\bNOT\b/gi,'~');
  while(i<s.length){const c=s[i];if(/\s/.test(c)){i++;continue;}
    if('+|∨'.includes(c)){T.push({t:'or'});i++;continue;}if('·*&∧.'.includes(c)){T.push({t:'and'});i++;continue;}if('⊕^'.includes(c)){T.push({t:'xor'});i++;continue;}
    if('~!¬'.includes(c)){T.push({t:'not'});i++;continue;}if("'’′".includes(c)){T.push({t:'post'});i++;continue;}if(c==='̅'){T.push({t:'post'});i++;continue;}
    if(c==='('||c===')'){T.push({t:c});i++;continue;}if(c==='0'||c==='1'){T.push({t:'const',v:+c});i++;continue;}
    const m=/^([A-Z][a-z0-9_]*|[a-z][0-9_]*)/.exec(s.slice(i));if(m){T.push({t:'var',name:m[1]});i+=m[1].length;continue;}
    throw new Error(`不认识的字符「${c}」`);}return T;}
function parseExpr(s){const T=lex(s);let p=0;const peek=()=>T[p],eat=t=>{if(T[p]&&T[p].t===t){p++;return true;}return false;};
  const atom=()=>{const t=T[p];if(!t)throw new Error('表达式不完整');let a;
    if(t.t==='not'){p++;a={op:'not',a:atom()};}else if(t.t==='('){p++;a=or();if(!eat(')'))throw new Error('缺右括号');}
    else if(t.t==='var'){p++;a={op:'var',name:t.name};}else if(t.t==='const'){p++;a={op:'const',v:t.v};}else throw new Error('这里不该出现运算符');
    while(eat('post'))a={op:'not',a};return a;};
  const startsAtom=t=>t&&(t.t==='var'||t.t==='const'||t.t==='('||t.t==='not');
  const and=()=>{const args=[atom()];for(;;){if(eat('and')){args.push(atom());continue;}if(startsAtom(peek())){args.push(atom());continue;}break;}return args.length===1?args[0]:{op:'and',args};};
  const xor=()=>{const args=[and()];while(eat('xor'))args.push(and());return args.length===1?args[0]:{op:'xor',args};};
  const or=()=>{const args=[xor()];while(eat('or'))args.push(xor());return args.length===1?args[0]:{op:'or',args};};
  const e=or();if(p<T.length)throw new Error('表达式后面有多余内容');return e;}
function varsOf(e,set=new Set()){if(e.op==='var')set.add(e.name);else if(e.a)varsOf(e.a,set);else if(e.args)e.args.forEach(a=>varsOf(a,set));return set;}
function evalExpr(e,env){switch(e.op){case 'var':return env[e.name]?1:0;case 'const':return e.v;case 'not':return 1-evalExpr(e.a,env);
  case 'and':return e.args.every(a=>evalExpr(a,env))?1:0;case 'or':return e.args.some(a=>evalExpr(a,env))?1:0;case 'xor':return e.args.reduce((s,a)=>s^evalExpr(a,env),0);}return 0;}
/* parse "F = ...", "F(A,B,C) = Σm(1,3) + d(2)", "∏M(...)" — returns {name, vars, on, dc, ast} */
function parseSpec(line,defName){let name=defName,rhs=line,vars=null;
  const m=/^\s*([A-Za-z][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?\s*=\s*(.*)$/.exec(line);if(m){name=m[1];if(m[2])vars=m[2].split(/[\s,]+/).filter(Boolean);rhs=m[3];}
  const list=t=>t.split(/[\s,]+/).filter(Boolean).map(v=>{const k=parseInt(v,10);if(!(k>=0))throw new Error(`「${v}」不是编号`);return k;});
  const mm=/^\s*(Σ\s*m?|∑\s*m?|sum\s*m?|m|∏\s*M?|Π\s*M?|prod\s*M?|M)\s*\(([^)]*)\)\s*(?:\+?\s*(?:d|dc|x)\s*\(([^)]*)\))?\s*$/i.exec(rhs);
  if(mm){const isMax=/^(∏|Π|prod|M)/.test(mm[1].trim())&&!/^m$/.test(mm[1].trim());const nums=list(mm[2]),dc=mm[3]?list(mm[3]):[];
    const mx=Math.max(0,...nums,...dc);let n=vars?vars.length:Math.max(2,Math.ceil(Math.log2(mx+1)));if(n>6)throw new Error('最多 6 个变量');
    if(!vars)vars='ABCDEF'.slice(0,n).split('');if(mx>=1<<n)throw new Error(`编号 ${mx} 超出了 ${n} 个变量的范围`);
    const all=[...Array(1<<n).keys()],on=isMax?all.filter(k=>!nums.includes(k)&&!dc.includes(k)):nums.filter(k=>!dc.includes(k));return {name,vars,on,dc,ast:null};}
  const ast=parseExpr(rhs);const vs=vars||[...varsOf(ast)].sort();if(vs.length>6)throw new Error('最多 6 个变量');
  const n=vs.length,on=[];for(let k=0;k<1<<n;k++){const env={};vs.forEach((v,i)=>env[v]=(k>>(n-1-i))&1);if(evalExpr(ast,env))on.push(k);}
  return {name,vars:vs,on,dc:[],ast};}

/* ---------------- synthesis with automatic layout (connections through net labels) ---------------- */
function synth(specs,style,newId){
  const comps=[],wires=[],add=(t,x,y,o={})=>{const c={t,x,y,id:newId(),d:1,...o};comps.push(c);return c;},lbl=(x,y,name)=>add('LBL',x,y,{name});
  const vars=[];specs.forEach(s=>s.vars.forEach(v=>{if(!vars.includes(v))vars.push(v);}));
  const NAND=style==='nand',NOR=style==='nor';let gid=0;const fresh=p=>p+(++gid);
  vars.forEach((v,i)=>{add('IN',2,2+i*3,{name:v,on:0});lbl(3,2+i*3,v);});
  const XG=16,XS=25;let rowG=2;           /* next free row in the gate columns */
  /* inverters in their own column, created on demand */
  const inv=new Map();let invY=2;
  const neg=v=>{if(inv.has(v))return inv.get(v);const nm='n'+v,y=invY;invY+=3;
    if(NAND||NOR){add(NAND?'NAND':'NOR',7,y,{n:2});lbl(7,y-1,v);lbl(7,y+1,v);lbl(11,y,nm);}else{add('NOT',7,y);lbl(7,y,v);lbl(10,y,nm);}inv.set(v,nm);return nm;};
  const comp=v=>v.startsWith('n')&&inv.get(v.slice(1))===v?v.slice(1):neg(v);   /* complement of a literal */
  /* one gate (≤ 4 inputs) at column x, next free row; returns output net name */
  const one=(t,ins,x)=>{if(t==='NOT'||t==='BUF'){const y=rowG+1;add(t,x,y);lbl(x,y,ins[0]);const out=fresh('g');lbl(x+3,y,out);rowG=y+2;return out;}
    const n=Math.max(2,ins.length),ys=n<=2?[-1,1]:n===3?[-1,0,1]:[-2,-1,1,2],y=rowG+(n>=4?2:1);
    add(t,x,y,{n});ins.forEach((s,k)=>lbl(x,y+ys[k],s));if(ins.length===1)lbl(x,y+ys[1],ins[0]);const out=fresh('g');lbl(x+4,y,out);rowG=y+ys[ys.length-1]+2;return out;};
  /* gate with any number of inputs: associative split; NAND / NOR split through AND / OR built from themselves */
  const gate=(t,ins,x)=>{if(ins.length<=4)return one(t,ins,x);const chunks=[];for(let i=0;i<ins.length;i+=4)chunks.push(ins.slice(i,i+4));
    if(t==='AND'||t==='OR'||t==='XOR')return one(t,chunks.map(c=>c.length===1?c[0]:gate(t,c,x-7)),x);
    const inner=t==='NAND'?'NAND':'NOR';return one(t,chunks.map(c=>{const g=gate(inner,c,x-14);return one(inner,[g],x-7);}),x);};
  const finish=(name,net)=>{const y=rowG+1;add('OUT',XS+8,y,{name});lbl(XS+7,y,net);rowG=y+3;};
  for(const s of specs){const n=s.vars.length,all=1<<n;rowG=Math.max(rowG,2);
    const off=[...Array(all).keys()].filter(k=>!s.on.includes(k)&&!s.dc.includes(k));
    if(!s.on.length||!off.length){const v=s.on.length?1:0,nm=fresh('k');add('CONST',XG,rowG+1,{v,name:String(v)});lbl(XG+1,rowG+1,nm);rowG+=3;finish(s.name,nm);continue;}
    if(style==='direct'&&s.ast){
      const build=e=>{switch(e.op){case 'var':return e.name;case 'const':{const nm=fresh('k');add('CONST',XG,rowG+1,{v:e.v,name:String(e.v)});lbl(XG+1,rowG+1,nm);rowG+=3;return nm;}
        case 'not':return e.a.op==='var'?neg(e.a.name):one('NOT',[build(e.a)],XG);
        default:{const kids=e.args.map(build);return gate({and:'AND',or:'OR',xor:'XOR'}[e.op],kids,XG+7*depth(e));}}};
      const depth=e=>0;finish(s.name,build(s.ast));continue;}
    if(NOR){/* product of sums, NOR–NOR: F = NOR( NOR(sum literals) ... ) */
      const cover=minCover(off,s.dc,n),bars=cover.map(p=>{const L=[];s.vars.forEach((v,i)=>{const b=n-1-i;if(p.m>>b&1)return;L.push((p.v>>b&1)?neg(v):v);});
        return L.length===1?comp(L[0]):gate('NOR',L,XG);});
      finish(s.name,bars.length===1?one('NOR',[bars[0]],XS):gate('NOR',bars,XS));continue;}
    const cover=style==='hazard'?hazardFree(s.on,s.dc,n):minCover(s.on,s.dc,n);
    const terms=cover.map(p=>{const L=[];s.vars.forEach((v,i)=>{const b=n-1-i;if(p.m>>b&1)return;L.push((p.v>>b&1)?v:neg(v));});return L;});
    if(NAND){/* F = NAND( NAND(product literals) ... ); a one-literal product enters inverted */
      const bars=terms.map(L=>L.length===1?comp(L[0]):gate('NAND',L,XG));finish(s.name,bars.length===1?one('NAND',[bars[0]],XS):gate('NAND',bars,XS));continue;}
    const prods=terms.map(L=>L.length===1?L[0]:gate('AND',L,XG));finish(s.name,prods.length===1?prods[0]:gate('OR',prods,XS));}
  return {comps,wires};}

/* ---------------- sequential: state table / diagram ---------------- */
function stateAnalysis(net){const ffs=net.comps.filter(c=>LIB[c.t].ff);if(!ffs.length)return {err:'电路里没有触发器，是组合电路。'};
  if(ffs.length>6)return {err:'触发器超过 6 个，状态太多不画了。'};
  const clks=new Set(ffs.map(c=>{const ci=c.ins[LIB[c.t].pins.findIndex(p=>p[3]==='>')];return ci;}));
  const clkSrc=[...clks].map(nn=>net.drivers[nn].map(([c])=>c.t));const sync=clks.size===1&&clkSrc[0].length===1&&clkSrc[0][0]==='CLK';
  const ins=net.comps.filter(c=>c.t==='IN'&&!clks.has(c.outs[0]));if(ins.length>4)return {err:'外部输入超过 4 个，表太大了。'};
  const outs=net.comps.filter(c=>c.t==='OUT');
  /* name and order flip-flops: label on Q, else LED, else position */
  const qName=c=>{const q=c.outs[0];const l=net.comps.find(d=>d.t==='LBL'&&d.net===q);if(l)return l.name;const o=net.comps.find(d=>d.t==='OUT'&&d.ins[0]===q);return o?o.name:null;};
  ffs.forEach((c,i)=>c._nm=qName(c)||('FF'+(i+1)));const order=ffs.slice().sort((a,b)=>a._nm<b._nm?1:a._nm>b._nm?-1:a.y-b.y);
  const nF=order.length,nI=ins.length,sim=new Sim(net);const rows=[];
  const save=ins.map(c=>c.on);
  for(let s=0;s<1<<nF;s++)for(let u=0;u<1<<nI;u++){sim.reset();ins.forEach((c,i)=>c.on=(u>>(nI-1-i))&1);
    order.forEach((c,i)=>{const b=(s>>(nF-1-i))&1;c.s=b;c.q=c.q.map(()=>b);c.out=[b,1-b];});
    for(let k=0;k<60;k++)sim.step({holdClk:true,freeze:true});
    const nx=order.map(c=>{const L=LIB[c.t],v=c.ins.map(i=>sim.rd(i));return L.next(c.s,v);});
    const ns=nx.some(b=>b==='X')?null:nx.reduce((a,b)=>a*2+b,0);rows.push({s,u,ns,out:outs.map(o=>sim.rd(o.ins[0]))});}
  ins.forEach((c,i)=>c.on=save[i]);
  /* Moore or Mealy? */
  const mealy=outs.some((o,k)=>{for(let s=0;s<1<<nF;s++){const vs=rows.filter(r=>r.s===s).map(r=>r.out[k]);if(new Set(vs).size>1)return true;}return false;});
  /* reachability from 0 and lock-out */
  const init=order.reduce((a,c)=>a*2+(c.init?1:0),0);
  const nxt=s=>rows.filter(r=>r.s===s&&r.ns!==null).map(r=>r.ns);const reach=new Set([init]),q=[init];while(q.length){const s=q.shift();for(const t of nxt(s))if(!reach.has(t)){reach.add(t);q.push(t);}}
  const canReach=s=>{const seen=new Set([s]),qq=[s];while(qq.length){const a=qq.shift();if(reach.has(a))return true;for(const b of nxt(a))if(!seen.has(b)){seen.add(b);qq.push(b);}}return false;};
  const states=[...Array(1<<nF).keys()].map(s=>({s,used:reach.has(s),lock:!reach.has(s)&&!canReach(s)}));
  return {ffs:order,ins,outs,rows,states,nF,nI,mealy,sync,init};}

/* ---------------- measured glitches: flip one input at a time and watch every output tick by tick ---------------- */
function glitchScan(net,ins,outs,maxT=60){const sim=new Sim(net),n=ins.length,res=[],set=(c,v)=>{if(c.t==='CLK')c.force=v;else c.on=v;};
  const save=ins.map(c=>c.t==='CLK'?c.force:c.on);
  for(let m=0;m<1<<n;m++)for(let b=0;b<n;b++){const m2=m^(1<<(n-1-b));ins.forEach((c,i)=>set(c,(m>>(n-1-i))&1));sim.reset();sim.settle(200);
    const before=outs.map(o=>sim.rd(o.ins[0]));set(ins[b],(m2>>(n-1-b))&1);const tr=outs.map(()=>[]);
    for(let k=0;k<maxT;k++){sim.step({holdClk:true});outs.forEach((o,j)=>tr[j].push(sim.rd(o.ins[0])));}
    outs.forEach((o,j)=>{const t=tr[j],after=t[t.length-1];let ch=t[0]!==before[j]?1:0;for(let k=1;k<t.length;k++)if(t[k]!==t[k-1])ch++;
      const width=t.filter(v=>v!==before[j]&&v!==after).length+(before[j]===after?0:0);
      if(before[j]===after&&ch>0)res.push({out:j,from:m,to:m2,bit:b,kind:'static',level:before[j],width:t.filter(v=>v!==after).length});
      else if(before[j]!==after&&ch>1)res.push({out:j,from:m,to:m2,bit:b,kind:'dynamic',level:after,width:ch});});}
  ins.forEach((c,i)=>{if(c.t==='CLK'){if(save[i]===undefined)delete c.force;else c.force=save[i];}else c.on=save[i];});
  return res;}

/* ---------------- critical path (longest gate-delay path) ---------------- */
function criticalPath(net){if(combLoop(net))return null;const comb=net.comps.filter(c=>LIB[c.t].gate||LIB[c.t].blk);const memo=new Map();
  const arrive=c=>{if(memo.has(c))return memo.get(c);let best={t:0,path:[]};c.ins.forEach(i=>net.drivers[i].forEach(([d])=>{if(LIB[d.t].gate||LIB[d.t].blk){const r=arrive(d);if(r.t>best.t)best=r;}}));
    const r={t:best.t+(LIB[c.t].gate?(c.d||1):1),path:best.path.concat([c])};memo.set(c,r);return r;};
  let best={t:0,path:[]};comb.forEach(c=>{const r=arrive(c);if(r.t>best.t)best=r;});return best;}

return {LIB,pins,box,normalize,build,Sim,glitchScan,primes,minCover,essential,hazards,hazardFree,termText,sopText,posText,parseExpr,parseSpec,evalExpr,synth,stateAnalysis,criticalPath,combLoop,key,NEG};
})();
if(typeof module!=='undefined')module.exports=LE;
