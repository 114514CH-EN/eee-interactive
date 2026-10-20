/* Shared editor toolkit for the circuit and logic simulators.
   View (pan / zoom / fit), undo history, share links, autosave, tooltip, pinch gestures,
   SI number parsing / formatting, Manhattan routing helpers. Load after common.js. */
const SimKit=(()=>{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  /* ---------- view: world grid units <-> canvas CSS pixels ---------- */
  class View{
    constructor(o={}){this.gu=o.gu||28;this.ox=0;this.oy=0;this.min=o.min||7;this.max=o.max||64;}
    sx(x){return x*this.gu+this.ox;} sy(y){return y*this.gu+this.oy;}
    wx(px){return (px-this.ox)/this.gu;} wy(py){return (py-this.oy)/this.gu;}
    zoomAt(px,py,f){const wx=this.wx(px),wy=this.wy(py);this.gu=clamp(this.gu*f,this.min,this.max);this.ox=px-wx*this.gu;this.oy=py-wy*this.gu;}
    pan(dx,dy){this.ox+=dx;this.oy+=dy;}
    /* fit world box [x0,y0,x1,y1] into W×H with padding (px); maxGu caps the zoom for tiny circuits */
    fit(b,W,H,pad=24,maxGu=34){const bw=Math.max(b[2]-b[0],4),bh=Math.max(b[3]-b[1],3);
      this.gu=clamp(Math.min((W-2*pad)/bw,(H-2*pad)/bh),this.min,maxGu);
      this.ox=W/2-(b[0]+b[2])/2*this.gu;this.oy=H/2-(b[1]+b[3])/2*this.gu;}
  }

  /* ---------- undo / redo on serialized snapshots ---------- */
  class History{
    constructor(get,set,limit=100){this.get=get;this.set=set;this.limit=limit;this.u=[];this.r=[];}
    reset(){this.u=[this.get()];this.r=[];}
    commit(){const s=this.get();if(this.u.length&&this.u[this.u.length-1]===s)return false;this.u.push(s);if(this.u.length>this.limit)this.u.shift();this.r=[];return true;}
    undo(){if(this.u.length<2)return false;this.r.push(this.u.pop());this.set(this.u[this.u.length-1]);return true;}
    redo(){if(!this.r.length)return false;const s=this.r.pop();this.u.push(s);this.set(s);return true;}
    get canUndo(){return this.u.length>1;} get canRedo(){return this.r.length>0;}
  }

  /* ---------- share links: deflate (when available) + base64url ---------- */
  const b64u=bytes=>{let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
  const unb64u=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;};
  async function encode(str){
    try{if('CompressionStream' in window){const st=new Blob([str]).stream().pipeThrough(new CompressionStream('deflate-raw'));return 'z'+b64u(new Uint8Array(await new Response(st).arrayBuffer()));}}catch(e){}
    return 'j'+b64u(new TextEncoder().encode(str));}
  async function decode(s){const t=s[0],bytes=unb64u(s.slice(1));
    if(t==='z'){const st=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return await new Response(st).text();}
    return new TextDecoder().decode(bytes);}
  async function copyText(s){try{await navigator.clipboard.writeText(s);return true;}catch(e){}
    try{const ta=document.createElement('textarea');ta.value=s;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;}catch(e){return false;}}
  const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};
  function download(canvas,name){try{canvas.toBlob(b=>{if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);});}catch(e){}}

  /* ---------- tooltip that follows the pointer inside a container ---------- */
  function tooltip(host){const d=document.createElement('div');d.className='simtip';d.setAttribute('role','status');host.style.position='relative';host.appendChild(d);let shown=false;
    return {show(html,cx,cy){if(d.innerHTML!==html)d.innerHTML=html;const r=host.getBoundingClientRect();d.style.display='block';shown=true;
        const w=d.offsetWidth,h=d.offsetHeight;let x=cx-r.left+14,y=cy-r.top+16;if(x+w>r.width-4)x=cx-r.left-w-12;if(x<4)x=4;if(y+h>r.height-4)y=cy-r.top-h-12;d.style.left=x+'px';d.style.top=y+'px';},
      hide(){if(shown){d.style.display='none';shown=false;}}};}

  /* ---------- two-finger pinch / pan for touch screens ---------- */
  function gestures(canvas,view,onChange){const pts=new Map();let base=null;
    const pair=()=>{const [a,b]=[...pts.values()];return {cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)||1};};
    const loc=ev=>{const r=canvas.getBoundingClientRect();return {x:ev.clientX-r.left,y:ev.clientY-r.top};};
    return {
      get active(){return pts.size>=2;},
      down(ev){if(ev.pointerType!=='touch')return false;pts.set(ev.pointerId,loc(ev));if(pts.size===2){base=pair();return true;}return false;},
      move(ev){if(!pts.has(ev.pointerId))return false;pts.set(ev.pointerId,loc(ev));if(pts.size<2||!base)return false;const p=pair();
        view.zoomAt(p.cx,p.cy,p.d/base.d);view.pan(p.cx-base.cx,p.cy-base.cy);base=p;onChange();return true;},
      up(ev){pts.delete(ev.pointerId);if(pts.size<2)base=null;}};}

  /* ---------- numbers ---------- */
  const PFX=[[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p']];
  const fmtSI=(v,u='',d=3)=>{if(!isFinite(v))return '—';if(Math.abs(v)<1e-13)return '0 '+u;const a=Math.abs(v);for(const [m,p] of PFX)if(a>=m*0.99995)return (+(v/m).toPrecision(d))+' '+p+u;return v.toExponential(2)+' '+u;};
  const parseSI=s=>{const m=/^\s*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*(meg|[pnuµmkKMG]?)/i.exec(String(s).replace(',','.'));if(!m)return NaN;
    const k={p:1e-12,n:1e-9,u:1e-6,'µ':1e-6,m:1e-3,k:1e3,K:1e3,M:1e6,G:1e9,meg:1e6,MEG:1e6,Meg:1e6}[m[2]]??(m[2]?NaN:1);return parseFloat(m[1])*k;};

  /* ---------- geometry ---------- */
  const key=p=>p[0]+','+p[1],eq=(p,q)=>p[0]===q[0]&&p[1]===q[1];
  function onSeg(p,a,b){if(a[0]===b[0]&&p[0]===a[0])return p[1]>Math.min(a[1],b[1])&&p[1]<Math.max(a[1],b[1]);if(a[1]===b[1]&&p[1]===a[1])return p[0]>Math.min(a[0],b[0])&&p[0]<Math.max(a[0],b[0]);return false;}
  /* Manhattan path from a to b: horizontal first unless vFirst */
  const route=(a,b,vFirst)=>a[0]===b[0]||a[1]===b[1]?[a,b]:vFirst?[a,[a[0],b[1]],b]:[a,[b[0],a[1]],b];
  function segDist(px,py,a,b){const [ax,ay]=a,[bx,by]=b,L2=(bx-ax)**2+(by-ay)**2||1e-9,u=clamp(((px-ax)*(bx-ax)+(py-ay)*(by-ay))/L2,0,1);return Math.hypot(px-ax-u*(bx-ax),py-ay-u*(by-ay));}

  /* inject shared styles once */
  const st=document.createElement('style');st.textContent=`
.simtip{position:absolute;display:none;z-index:5;pointer-events:none;max-width:280px;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:6px 9px;font:12px/1.5 var(--mono);box-shadow:0 4px 16px rgba(0,0,0,.12)}
.simtip b{font-family:var(--body);font-weight:600}
.simtip .m{color:var(--muted);font-family:var(--body)}
.toolgrp{display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding-right:8px;margin-right:2px;border-right:1px solid var(--line)}
.toolgrp:last-child{border-right:0}
.toolgrp>span{font-size:11px;color:var(--muted);margin-right:2px}
.tools{display:flex;flex-wrap:wrap;gap:6px 6px;align-items:center}
.tools button{padding:3px 9px}
.bar{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:13px;color:var(--muted)}
.bar button{padding:4px 10px}
.bar button:disabled{opacity:.4;cursor:default}
.diag{display:flex;flex-direction:column;gap:3px;margin:0;padding:0;list-style:none;font-size:13px}
.diag:empty{display:none}
.diag li{cursor:pointer;border-radius:6px;padding:2px 6px}
.diag li:hover{background:var(--bg)}
.diag .err{color:var(--red)}.diag .warn{color:var(--amp)}.diag .info{color:var(--muted)}
.tabs{display:flex;flex-wrap:wrap;gap:6px}
.kbd{font:11px var(--mono);border:1px solid var(--line);border-bottom-width:2px;border-radius:4px;padding:0 4px;background:var(--bg)}
html.embed .tools button,html.embed .bar button{padding:2px 7px;font-size:11.5px}
html.embed .toolgrp>span{display:none}`;
  document.head.appendChild(st);

  return {View,History,encode,decode,copyText,store,download,tooltip,gestures,fmtSI,parseSI,key,eq,onSeg,route,segDist,clamp};
})();
