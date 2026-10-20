/* Boolean-function toolkit for the logic simulator:
   canonical SOP / POS, complete sum (all prime implicants), every minimal SOP / POS, Quine–McCluskey tabulation,
   prime-implicant chart with Petrick's method, algebraic derivation, answer checking, Reed–Muller (XOR) form, cost table.
   Cubes are {v,m}: m marks eliminated variables, variable i of n sits at bit n-1-i. Needs LE (engine.js). */
const BL=(()=>{
const LX=typeof LE!=='undefined'?LE:require('./engine.js');
const pc=x=>{let c=0;while(x){c+=x&1;x>>>=1;}return c;};
const full=n=>(1<<n)-1;
const cov=(p,x,n)=>((x^p.v)&~p.m&full(n))===0;
const lits=(p,n)=>n-pc(p.m);
const cellsOf=(p,n)=>{const r=[];for(let x=0;x<1<<n;x++)if(cov(p,x,n))r.push(x);return r;};
const kOf=p=>p.v+'/'+p.m;
const bin=(x,n)=>n?x.toString(2).padStart(n,'0'):'';
const cubeStr=(p,n)=>{let s='';for(let b=n-1;b>=0;b--)s+=p.m>>b&1?'-':(p.v>>b&1);return s;};
const uniq=a=>[...new Set(a)].sort((x,y)=>x-y);
const cmpArr=(a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]!==b[i])return a[i]-b[i];return a.length-b.length;};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ---------------- expression trees ----------------
   {t:'v',name,neg} {t:'c',v} {t:'and'|'or'|'xor',a:[..]} {t:'not',a} ; display-only: {t:'grp',a} (parentheses), {t:'fac',c,y} (c·(y'+y)) */
const V=(name,neg)=>({t:'v',name,neg:!!neg});
const OR=a=>!a.length?{t:'c',v:0}:a.length===1?a[0]:{t:'or',a};
const AND=a=>!a.length?{t:'c',v:1}:a.length===1?a[0]:{t:'and',a};
const NOT=e=>e.t==='v'?V(e.name,!e.neg):e.t==='c'?{t:'c',v:1-e.v}:{t:'not',a:e};
/* product that is 1 exactly on cube p; sum (clause) that is 0 exactly on cube p */
function prodNode(p,names){const n=names.length,L=[];for(let i=0;i<n;i++){const b=n-1-i;if(p.m>>b&1)continue;L.push(V(names[i],!(p.v>>b&1)));}return AND(L);}
function sumNode(p,names){const n=names.length,L=[];for(let i=0;i<n;i++){const b=n-1-i;if(p.m>>b&1)continue;L.push(V(names[i],!!(p.v>>b&1)));}return OR(L);}
const wrapIn=(parent,x)=>(parent==='and'&&(x.t==='or'||x.t==='xor'))||(parent==='xor'&&x.t==='or');
function txt(e){switch(e.t){case 'v':return e.name+(e.neg?"'":'');case 'c':return String(e.v);
  case 'not':return e.a.t==='v'?txt(e.a)+"'":'('+txt(e.a)+")'";case 'grp':return '('+txt(e.a)+')';
  case 'fac':return (e.c.t==='c'?'':txt(e.c))+`(${e.y}' + ${e.y})`;
  case 'and':return e.a.map(x=>wrapIn('and',x)?'('+txt(x)+')':txt(x)).join('');
  case 'or':return e.a.map(txt).join(' + ');case 'xor':return e.a.map(x=>wrapIn('xor',x)?'('+txt(x)+')':txt(x)).join(' ⊕ ');}return '';}
/* HTML: a bar over a single variable is an overline; over a group it is a bordered inline block, so nested bars stack */
function htm(e,attr){switch(e.t){case 'v':return e.neg?`<span class="ov">${esc(e.name)}</span>`:esc(e.name);case 'c':return String(e.v);
  case 'not':return `<span class="ovb">${htm(e.a)}</span>`;case 'grp':return '('+htm(e.a)+')';
  case 'fac':return (e.c.t==='c'?'':htm(e.c))+`(<span class="ov">${esc(e.y)}</span> + ${esc(e.y)})`;
  case 'and':return e.a.map(x=>wrapIn('and',x)?'('+htm(x)+')':htm(x)).join('');
  case 'or':return e.a.map(x=>htm(x)).join(' + ');case 'xor':return e.a.map(x=>wrapIn('xor',x)?'('+htm(x)+')':htm(x)).join(' ⊕ ');}return '';}
/* parser AST (engine.js) -> tree */
function fromAst(a){switch(a.op){case 'var':return V(a.name,false);case 'const':return {t:'c',v:a.v};
  case 'not':{const x=fromAst(a.a);return x.t==='v'?V(x.name,!x.neg):{t:'not',a:x};}default:return {t:a.op,a:a.args.map(fromAst)};}}
function varsOfAst(e,s=new Set()){if(e.op==='var')s.add(e.name);else if(e.a)varsOfAst(e.a,s);else if(e.args)e.args.forEach(x=>varsOfAst(x,s));return s;}
/* cost: literals, gates (a bar over a gate output merges into NAND / NOR / XNOR), distinct inverted inputs */
function cost(e,form){let lit=0,gates=0,w=0;const inv=new Set();
  const go=x=>{switch(x.t){case 'v':lit++;if(x.neg)inv.add(x.name);return;case 'c':return;
    case 'not':if(x.a.t==='and'||x.a.t==='or'||x.a.t==='xor')go(x.a);else{gates++;w++;go(x.a);}return;
    case 'grp':go(x.a);return;default:if(x.a.length>1){const g=Math.ceil((x.a.length-1)/3);gates+=g;w+=x.t==='xor'?2*(x.a.length-1):g;}x.a.forEach(go);}};
  go(e);const top=form==='pos'?'and':'or';return {lit,gates,inv:inv.size,terms:e.t===top?e.a.length:e.t==='c'?0:1,w:w+inv.size};}

/* ---------------- one side (cover the 1s, or the 0s) ---------------- */
function side(tgt,dc,n,limit=8){
  if(!tgt.length)return {P:[],ess:[],E:[],sols:[[]],more:false,left:[],cand:[],pet:null,trunc:false};
  const P=LX.primes(tgt,dc,n).filter(p=>tgt.some(x=>cov(p,x,n))).map(p=>({v:p.v,m:p.m,cells:cellsOf(p,n)}));
  P.sort((a,b)=>a.cells[0]-b.cells[0]||pc(b.m)-pc(a.m)||a.v-b.v);
  const T=new Set(tgt);P.forEach((p,i)=>{p.i=i;p.lits=lits(p,n);p.hit=p.cells.filter(x=>T.has(x));});
  const ess=[];P.forEach(p=>{const why=p.hit.filter(x=>P.filter(q=>cov(q,x,n)).length===1);if(why.length)ess.push({p,why});});
  const E=ess.map(e=>e.p),left=tgt.filter(x=>!E.some(p=>cov(p,x,n))),cand=P.filter(p=>!E.includes(p)&&left.some(x=>cov(p,x,n)));
  /* every minimal cover of the remaining 1s: fewest terms, then fewest literals */
  let best=Infinity,found=[],seen=new Set(),nodes=0,trunc=false,more=false;
  const rec=(lf,ch,c)=>{if(++nodes>300000){trunc=true;return;}
    if(!lf.length){if(c<best){best=c;found=[];seen=new Set();more=false;}if(c===best){const k=ch.map(kOf).sort().join();if(!seen.has(k)){seen.add(k);if(found.length<limit)found.push(ch.slice());else more=true;}}return;}
    if(c+100>best)return;
    let opts=null;for(const x of lf){const o=cand.filter(p=>cov(p,x,n));if(!opts||o.length<opts.length)opts=o;}
    opts=opts.slice().sort((a,b)=>a.lits-b.lits||a.i-b.i);
    for(const p of opts){ch.push(p);rec(lf.filter(x=>!cov(p,x,n)),ch,c+100+p.lits);ch.pop();}};
  rec(left,[],0);
  const sols=found.map(s=>E.concat(s).sort((a,b)=>a.i-b.i));
  return {P,ess,E,sols,more,left,cand,pet:left.length?petrick(left,cand,n):null,trunc};}
/* Petrick: product over uncovered minterms of (sum of PIs covering it), expanded with absorption */
function petrick(left,cand,n){const cols=left.map(x=>({x,ps:cand.filter(p=>cov(p,x,n)).map(p=>p.i)}));
  if(cand.length>20||left.length>16)return {cols,big:true};
  const idx=new Map(cand.map((p,k)=>[p.i,k]));let prods=[0];
  for(const c of cols){const nx=new Set();for(const pr of prods)for(const i of c.ps)nx.add(pr|(1<<idx.get(i)));
    const srt=[...nx].sort((a,b)=>pc(a)-pc(b)),keep=[];for(const a of srt)if(!keep.some(b=>(a&b)===b))keep.push(a);prods=keep;if(prods.length>400)return {cols,big:true};}
  const sets=prods.map(b=>cand.filter((p,k)=>b>>k&1));
  const sc=s=>s.length*100+s.reduce((t,p)=>t+p.lits,0);sets.sort((a,b)=>sc(a)-sc(b));
  return {cols,sets,best:sets.length?sc(sets[0]):0};}

/* ---------------- whole analysis ---------------- */
function analyse(spec){const names=spec.vars.slice(),n=names.length,N=1<<n;
  const on=uniq(spec.on.filter(x=>x>=0&&x<N)),dc=uniq((spec.dc||[]).filter(x=>x>=0&&x<N&&!on.includes(x))),dcs=new Set(dc),ons=new Set(on);
  const off=[];for(let x=0;x<N;x++)if(!ons.has(x)&&!dcs.has(x))off.push(x);
  const t=[...Array(N).keys()].map(x=>ons.has(x)?1:dcs.has(x)?'X':0);
  const A={name:spec.name||'F',names,n,N,on,dc,off,t,ast:spec.ast||null};
  A.konst=!on.length?0:!off.length?1:null;
  A.sop=side(on,dc,n);A.pos=side(off,dc,n);
  const K=A.konst!==null?{t:'c',v:A.konst}:null;
  A.sopTrees=K?[K]:A.sop.sols.map(s=>OR(s.map(p=>prodNode(p,names))));
  A.posTrees=K?[K]:A.pos.sols.map(s=>AND(s.map(p=>sumNode(p,names))));
  A.canonSOP=OR(on.map(x=>prodNode({v:x,m:0},names)));
  A.canonPOS=AND(off.map(x=>sumNode({v:x,m:0},names)));
  A.complete=K||OR(A.sop.P.map(p=>prodNode(p,names)));
  A.completeP=K||AND(A.pos.P.map(p=>sumNode(p,names)));
  A.nand=K?null:NOT(AND(A.sop.sols[0].map(p=>NOT(prodNode(p,names)))));
  A.nor=K?null:NOT(OR(A.pos.sols[0].map(p=>NOT(sumNode(p,names)))));
  A.anf=dc.length||K?null:anfOf(t,n,names);
  A.hz=K?[]:LX.hazards(on,dc,n,A.sop.sols[0]);
  /* costs of the different ways of writing it */
  const rows=[];if(A.ast)rows.push({k:'orig',name:'原式',tree:fromAst(A.ast)});
  rows.push({k:'canon',name:'标准与或式',tree:A.canonSOP});rows.push({k:'sop',name:'最简与或式',tree:A.sopTrees[0]});rows.push({k:'pos',name:'最简或与式',tree:A.posTrees[0]});
  rows.forEach(r=>r.c=cost(r.tree,r.k==='pos'?'pos':'sop'));
  /* the XOR form is only worth showing when it is not much longer than the two-level forms */
  if(A.anf&&A.anf.tree.t==='xor'){const c=cost(A.anf.tree),lim=Math.max(rows[rows.length-1].c.lit,rows[rows.length-2].c.lit)+4;if(c.lit<=lim)rows.push({k:'xor',name:'异或形式',tree:A.anf.tree,c});else A.anf.long=true;}A.costs=rows;
  const cand=rows.filter(r=>r.k!=='canon'&&r.k!=='orig'),score=r=>r.c.w*100+r.c.lit;
  A.cheapest=K?null:cand.slice().sort((a,b)=>score(a)-score(b))[0];
  return A;}

/* Reed–Muller (positive-polarity XOR) form; a lone 1 is folded into one literal: 1 ⊕ A = A' */
function anfOf(t,n,names){const a=t.map(v=>v===1?1:0);for(let i=0;i<n;i++){const b=1<<i;for(let x=0;x<1<<n;x++)if(x&b)a[x]^=a[x^b];}
  const mons=[...Array(1<<n).keys()].filter(x=>a[x]).sort((x,y)=>pc(x)-pc(y)||y-x);let one=mons.includes(0);
  const terms=mons.filter(x=>x).map(x=>{const L=[];for(let i=0;i<n;i++)if(x>>(n-1-i)&1)L.push(V(names[i],false));return L;});
  if(one){const k=terms.findIndex(L=>L.length===1);if(k>=0){terms[k]=[V(terms[k][0].name,true)];one=false;}}
  const parts=terms.map(L=>AND(L));if(one)parts.unshift({t:'c',v:1});
  return {tree:!parts.length?{t:'c',v:0}:parts.length===1?parts[0]:{t:'xor',a:parts},mons};}

/* ---------------- Quine–McCluskey tabulation ---------------- */
function qm(tgt,dc,n){const D=new Set(dc);let col=uniq([...tgt,...dc]).map(x=>({v:x,m:0,ms:[x]}));const cols=[];
  while(col.length){const nx=new Map();
    for(let i=0;i<col.length;i++)for(let j=i+1;j<col.length;j++){const a=col[i],b=col[j];if(a.m!==b.m)continue;const d=a.v^b.v;if(!d||(d&(d-1)))continue;
      a.used=b.used=true;const k=(a.v&~d)+'/'+(a.m|d);if(!nx.has(k))nx.set(k,{v:a.v&~d,m:a.m|d,ms:uniq(a.ms.concat(b.ms))});}
    col.forEach(c=>{c.ones=pc(c.v);c.dcOnly=c.ms.every(x=>D.has(x));c.pat=cubeStr(c,n);});
    col.sort((a,b)=>a.ones-b.ones||cmpArr(a.ms,b.ms));cols.push(col);col=[...nx.values()];}
  return cols;}

/* ---------------- algebraic derivation of a minimal SOP from the minterms ---------------- */
function algebra(A,cover){const {n,names,t}=A;if(A.konst!==null)return null;
  const total=cover.reduce((s,p)=>s+p.cells.length,0);if(n>5||A.on.length>16||total>24)return {big:true};
  const steps=[],mt=x=>prodNode({v:x,m:0},names);
  steps.push({e:OR(A.on.map(mt)),why:A.ast?'先展开成最小项之和（真值表里为 1 的行）':'写成最小项之和'});
  const flat=cover.flatMap(p=>p.cells),cnt=new Map();flat.forEach(x=>cnt.set(x,(cnt.get(x)||0)+1));
  const dcU=uniq(flat.filter(x=>t[x]==='X')),dup=uniq(flat.filter(x=>t[x]===1&&cnt.get(x)>1)),notes=[];
  if(dcU.length)notes.push(`无关项 ${dcU.map(x=>'m'+x).join('、')} 当 1 用，加进来`);if(dup.length)notes.push(`${dup.map(x=>'m'+x).join('、')} 要用两次，复制一份（X = X + X）`);
  let groups=cover.map(p=>({cubes:p.cells.map(x=>({v:x,m:0})),bits:[...Array(n).keys()].filter(b=>p.m>>b&1)}));
  const gNode=g=>g.cubes.length===1?prodNode(g.cubes[0],names):{t:'grp',a:OR(g.cubes.map(c=>prodNode(c,names)))};
  steps.push({e:OR(groups.map(gNode)),why:(notes.length?notes.join('；')+'；':'')+'按卡诺图里的圈分组'});
  for(let guard=0;guard<8&&groups.some(g=>g.bits.length);guard++){const elim=new Set();
    const work=groups.map(g=>{if(!g.bits.length)return {g};const b=g.bits[0],used=new Set(),pairs=[];elim.add(names[n-1-b]);
      g.cubes.forEach((c,i)=>{if(used.has(i))return;const j=g.cubes.findIndex((d,k)=>k!==i&&!used.has(k)&&d.m===c.m&&(d.v^c.v)===(1<<b));used.add(i);used.add(j);pairs.push({v:c.v&~(1<<b),m:c.m|(1<<b)});});
      return {g,b,pairs};});
    const fac=(q,b)=>({t:'fac',c:prodNode(q,names),y:names[n-1-b]});
    steps.push({e:OR(work.map(w=>!w.pairs?gNode(w.g):w.pairs.length===1?fac(w.pairs[0],w.b):{t:'grp',a:OR(w.pairs.map(q=>fac(q,w.b)))})),why:'提出公因子（分配律）'});
    groups=work.map(w=>w.pairs?{cubes:w.pairs,bits:w.g.bits.slice(1)}:w.g);
    steps.push({e:OR(groups.map(gNode)),why:`互补律 X' + X = 1，消去 ${[...elim].join('、')}`});}
  return {steps};}

/* ---------------- check a student's answer ---------------- */
function litOf(e){if(e.op==='var')return {name:e.name,neg:false};if(e.op==='not'&&e.a.op==='var')return {name:e.a.name,neg:true};return null;}
/* cube of a product (pol=1) or of the zeros of a clause (pol=0); zero=true when it contains X and X' */
function cubeOfLits(L,A,pol){let v=0,m=full(A.n),zero=false;for(const l of L){const b=A.n-1-A.names.indexOf(l.name),bit=(l.neg?0:1)^(pol?0:1);
    if(!(m>>b&1)){if((v>>b&1)!==bit)zero=true;continue;}m&=~(1<<b);v|=bit<<b;}return {v,m,zero};}
function asForm(ast,A,pol){const outer=pol?'or':'and',inner=pol?'and':'or',items=ast.op===outer?ast.args:[ast],res=[];
  for(const it of items){if(it.op==='const'){res.push(it.v===pol?{v:0,m:full(A.n),zero:false,konst:true}:{v:0,m:0,zero:true});continue;}
    const l=litOf(it);if(l){res.push(cubeOfLits([l],A,pol));continue;}
    if(it.op===inner){const L=it.args.map(litOf);if(L.some(x=>!x))return null;res.push(cubeOfLits(L,A,pol));continue;}return null;}
  return res;}
function check(A,text){let s=String(text||'').trim();if(!s)return null;
  const m=/^\s*[A-Za-z][A-Za-z0-9_]*\s*(?:\([^)]*\))?\s*=\s*(.*)$/.exec(s);if(m)s=m[1];
  let ast;try{ast=LX.parseExpr(s);}catch(e){return {err:e.message};}
  const extra=[...varsOfAst(ast)].filter(v=>!A.names.includes(v));if(extra.length)return {err:`原函数里没有变量 ${extra.join('、')}`};
  const val=[...Array(A.N).keys()].map(x=>{const env={};A.names.forEach((v,i)=>env[v]=(x>>(A.n-1-i))&1);return LX.evalExpr(ast,env);});
  const R={val,miss:A.on.filter(x=>!val[x]),wrong:A.off.filter(x=>val[x]),tree:fromAst(ast)};R.ok=!R.miss.length&&!R.wrong.length;
  const sop=asForm(ast,A,1),pos=sop?null:asForm(ast,A,0);R.form=sop?'sop':pos?'pos':'other';R.c=cost(R.tree,R.form);
  const cubes=sop||pos;
  if(cubes){const pol=sop?1:0,tg=pol?A.on:A.off,bad=pol?A.off:A.on,sd=pol?A.sop:A.pos,Tg=new Set(tg),Bad=new Set(bad),node=pol?prodNode:sumNode;
    R.items=cubes.map((c,k)=>{const it={k,c,node:c.zero?null:node(c,A.names),notes:[]};if(c.zero){it.notes.push({lv:'warn',s:pol?'同时含 X 和 X\'，这一项恒为 0，可以删掉':'同时含 X 和 X\'，这一项恒为 1，可以删掉'});return it;}
      const cells=cellsOf(c,A.n);it.cells=cells;const b=cells.filter(x=>Bad.has(x));
      if(b.length){it.notes.push({lv:'err',s:`盖住了 ${b.map(x=>'m'+x).join('、')}，那里应该是 ${pol?0:1}（圈画大了）`});return it;}
      const big=sd.P.filter(p=>p.m!==c.m&&cov({v:p.v,m:p.m},c.v,A.n)&&(c.m&~p.m)===0).sort((a,b2)=>pc(b2.m)-pc(a.m))[0];
      if(big){const drop=A.names.filter((v,i)=>{const bb=A.n-1-i;return !(c.m>>bb&1)&&(big.m>>bb&1);});it.notes.push({lv:'warn',s:`还能扩大成 ${txt(node(big,A.names))}（去掉 ${drop.join('、')}）`,to:big});}
      return it;});
    /* redundant terms: everything they cover is covered by the other terms */
    R.items.forEach(it=>{if(!it.cells||it.notes.some(n=>n.lv==='err'))return;const own=it.cells.filter(x=>Tg.has(x));
      if(own.length&&own.every(x=>R.items.some(o=>o!==it&&o.cells&&!o.c.zero&&o.cells.includes(x))))it.notes.push({lv:'warn',s:'多余：它盖住的格子别的项都盖住了（除非是为了消除冒险）'});
      if(!own.length)it.notes.push({lv:'warn',s:`只盖住无关项，没有用`});});
    R.uncov=tg.filter(x=>!R.items.some(it=>it.cells&&it.cells.includes(x)));}
  const best=R.form==='pos'?A.posTrees[0]:A.sopTrees[0],bc=cost(best,R.form);R.best=best;R.bc=bc;
  if(R.form==='other'){const b2=[A.sopTrees[0],A.posTrees[0]].map(e=>({e,c:cost(e)})).sort((a,b)=>a.c.lit-b.c.lit)[0];R.best=b2.e;R.bc=b2.c;R.minimal=R.c.lit<=b2.c.lit;}
  else R.minimal=R.c.terms<=bc.terms&&R.c.lit<=bc.lit&&R.items.every(it=>!it.notes.length);
  return R;}

/* ---------------- parse the input line: expression, Σm / ∏M, or a truth-table bit string ---------------- */
function parseFn(text){const line=String(text||'').split(/\n|;/)[0].trim();if(!line)throw new Error('先输入一个函数');
  const m=/^\s*([A-Za-z][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?\s*=\s*(.*)$/.exec(line),rhs=(m?m[3]:line).replace(/\s+/g,'');
  if(/^[01xX\-]+$/.test(rhs)&&rhs.length>=4&&!(rhs.length&(rhs.length-1))){const n=Math.log2(rhs.length);if(n>6)throw new Error('最多 6 个变量（64 位）');
    const vars=m&&m[2]?m[2].split(/[\s,]+/).filter(Boolean):'ABCDEF'.slice(0,n).split('');if(vars.length!==n)throw new Error(`${rhs.length} 位真值表对应 ${n} 个变量`);
    const on=[],dc=[];[...rhs].forEach((c,i)=>{if(c==='1')on.push(i);else if(c!=='0')dc.push(i);});return {name:m?m[1]:'F',vars,on,dc,ast:null};}
  return LX.parseSpec(line,'F');}
function specText(name,vars,on,dc){return `${name}(${vars.join(',')}) = Σm(${on.join(',')})${dc.length?` + d(${dc.join(',')})`:''}`;}

return {analyse,side,qm,algebra,check,parseFn,specText,prodNode,sumNode,txt,htm,cost,cov,cellsOf,cubeStr,bin,pc,fromAst,anfOf};
})();
if(typeof module!=='undefined')module.exports=BL;
