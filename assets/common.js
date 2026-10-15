/* Shared helpers for EEE interactive pages.
   Load in <head> (not deferred): sets the embed classes before first paint.
   ?lab=N inside an iframe -> compact mode showing only section#labN.
   ?lab=N opened directly  -> full page scrolled to that lab. */
(function(){
  var m=/[?&]lab=(\d+)/.exec(location.search), framed=false;
  try{framed=window.self!==window.top;}catch(e){framed=true;}
  window.EMBED_LAB = (m&&framed) ? +m[1] : 0;
  if(window.EMBED_LAB) document.documentElement.classList.add('embed','lab-'+m[1]);
  else if(m) addEventListener('load',function(){var el=document.getElementById('lab'+m[1]);if(el)el.scrollIntoView();});
})();

const $=id=>document.getElementById(id);
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const D2R=Math.PI/180;
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Canvas sizing: base CSS height read once from the height attribute; backing store = CSS px * dpr.
   Never re-reads the scaled attribute (that was the runaway-height bug). */
function fit(c){
  if(!c.dataset.h)c.dataset.h=c.getAttribute('height');
  const h=+c.dataset.h,d=window.devicePixelRatio||1,
    W=Math.max(Math.round(c.getBoundingClientRect().width||c.parentElement.clientWidth||300),120),
    pw=Math.round(W*d),ph=Math.round(h*d);
  if(c.style.height!==h+'px')c.style.height=h+'px';
  if(c.width!==pw)c.width=pw; if(c.height!==ph)c.height=ph;
  const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,h);return [x,W,h];
}
CanvasRenderingContext2D.prototype.arcS=function(x,y,r,a,b,cc){this.arc(x,y,Math.max(r,0.5),a,b,cc);};
function arrow(x,x0,y0,x1,y1,col,w=2.6,head=10){const a=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0);if(L<1)return;
  x.strokeStyle=col;x.fillStyle=col;x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(x0,y0);x.lineTo(x1-Math.cos(a)*head*.6,y1-Math.sin(a)*head*.6);x.stroke();
  x.beginPath();x.moveTo(x1,y1);x.lineTo(x1-head*Math.cos(a-.42),y1-head*Math.sin(a-.42));x.lineTo(x1-head*Math.cos(a+.42),y1-head*Math.sin(a+.42));x.closePath();x.fill();}
function label(x,s,px,py,col,size=13,weight='600',font){x.fillStyle=col;x.font=`${weight} ${size}px ${font||css('--mono')}`;x.fillText(s,px,py);}
function text(x,s,px,py,col,size=12,align='left'){x.fillStyle=col;x.font=`${size}px ${css('--body')}`;x.textAlign=align;x.fillText(s,px,py);x.textAlign='left';}
/* label beside a segment, pushed off it along the normal (side=+1/-1) */
function tag(x,s,x0,y0,x1,y1,side,col,d=14,size=12){const L=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/L*side,ny=(x1-x0)/L*side;
  x.font=`600 ${size}px ${css('--mono')}`;const w=x.measureText(s).width;
  let px=(x0+x1)/2+nx*d-w/2+nx*w/2,py=(y0+y1)/2+ny*d+size*0.35+ny*size*0.4;
  px=Math.max(2,Math.min(px,x.canvas.width/(window.devicePixelRatio||1)-w-2));x.fillStyle=col;x.fillText(s,px,py);}
/* simple x-y plot frame; returns mapping functions */
function axes(x,W,H,o){const pl=o.pl??46,pr=o.pr??12,pt=o.pt??22,pb=o.pb??30;
  const X=v=>pl+(W-pl-pr)*(v-o.x0)/(o.x1-o.x0), Y=v=>pt+(H-pt-pb)*(o.y1-v)/(o.y1-o.y0);
  x.strokeStyle=css('--grid');x.lineWidth=1;x.fillStyle=css('--muted');x.font=`11px ${css('--mono')}`;
  (o.xt||[]).forEach(v=>{x.beginPath();x.moveTo(X(v),pt);x.lineTo(X(v),H-pb);x.stroke();const s=o.xf?o.xf(v):String(v);x.fillText(s,X(v)-x.measureText(s).width/2,H-pb+14);});
  (o.yt||[]).forEach(v=>{x.beginPath();x.moveTo(pl,Y(v));x.lineTo(W-pr,Y(v));x.stroke();const s=o.yf?o.yf(v):String(v);x.fillText(s,pl-6-x.measureText(s).width,Y(v)+4);});
  if(o.zero!==false&&o.y0<0&&o.y1>0){x.strokeStyle=css('--muted');x.beginPath();x.moveTo(pl,Y(0));x.lineTo(W-pr,Y(0));x.stroke();}
  if(o.title)text(x,o.title,pl,14,css('--muted'),12);
  if(o.xl)text(x,o.xl,W-pr,H-2,css('--muted'),11,'right');
  return {X,Y,pl,pr,pt,pb};}
function plot(x,X,Y,f,a,b,col,lw=2.4,n=400){x.strokeStyle=col;x.lineWidth=lw;x.beginPath();let first=true;
  for(let i=0;i<=n;i++){const t=a+(b-a)*i/n,v=f(t);if(!isFinite(v)){first=true;continue;}first?x.moveTo(X(t),Y(v)):x.lineTo(X(t),Y(v));first=false;}x.stroke();}
const fmt=(v,d=3)=>{if(!isFinite(v))return '—';const a=Math.abs(v);return a!==0&&(a<1e-3||a>=1e5)?v.toExponential(2):(+v.toFixed(d)).toString();};
function pressGroup(sel,pred){document.querySelectorAll(sel).forEach(b=>b.setAttribute('aria-pressed',!!pred(b)));}

/* Lab registry: Lab.add(n, draw, embedHeights) then Lab.start().
   Only the shown lab draws in embed mode; animations run only while on screen + tab visible. */
const Lab={labs:{},anims:[],
  add(n,draw,eh){this.labs[n]={draw,eh};},
  shown(n){return !window.EMBED_LAB||window.EMBED_LAB===n;},
  draw(n){const l=this.labs[n];if(l&&this.shown(n)){try{l.draw();}catch(e){console.warn('lab'+n,e);}}},
  all(){Object.keys(this.labs).forEach(n=>this.draw(+n));},
  /* step(dt) returns nothing; canvasEl used for visibility */
  anim(n,canvasEl,step,isOn){const a={n,step,isOn,on:true,last:0,raf:0};this.anims.push(a);
    if('IntersectionObserver' in window)new IntersectionObserver(es=>{a.on=es[0].isIntersecting;Lab.kick(a);}).observe(canvasEl);return a;},
  kick(a){if(a.raf)return;const loop=ts=>{a.raf=0;if(!(this.shown(a.n)&&a.on&&!document.hidden&&a.isOn())){a.last=0;return;}
      if(a.last&&ts-a.last<33){a.raf=requestAnimationFrame(loop);return;}
      if(a.last){try{a.step((ts-a.last)/1000);}catch(e){console.warn(e);}}a.last=ts;a.raf=requestAnimationFrame(loop);};
    a.raf=requestAnimationFrame(loop);},
  start(){
    if(window.EMBED_LAB){const s=$('lab'+window.EMBED_LAB);if(s)s.classList.add('on');
      const l=this.labs[window.EMBED_LAB];if(l&&l.eh)Object.entries(l.eh).forEach(([id,h])=>{const c=$(id);if(c){c.setAttribute('height',h);c.removeAttribute('data-h');}});}
    let rt=0;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>this.all(),120);});
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>this.all());
    new MutationObserver(()=>this.all()).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    document.addEventListener('visibilitychange',()=>this.anims.forEach(a=>this.kick(a)));
    if(document.fonts)document.fonts.ready.then(()=>this.all());
    this.all();setTimeout(()=>this.all(),300);this.anims.forEach(a=>this.kick(a));}
};
