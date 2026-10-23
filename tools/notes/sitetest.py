"""Automated checks for the eee-interactive site.
usage: python3 sitetest.py [page ...]   (default: all pages)
Serves nothing itself: expects http://localhost:8765 to serve the repo root.
Checks per page: console errors / swallowed draw errors, horizontal overflow (desktop 1280, phone 390),
elements sticking out of their panel, NaN/undefined in readouts after fuzzing every control,
embed mode (?lab=N inside an iframe at 700 px and 360 px): only one lab visible, no overflow, height.
"""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright

BASE = 'http://localhost:8765'
HERE = os.path.dirname(os.path.abspath(__file__))
KATEX = os.environ.get('KATEX_DIR', os.path.join(HERE, '.cache', 'node_modules', 'katex', 'dist'))  # npm i --prefix tools/notes/.cache katex@0.16.9
REPO = os.path.dirname(os.path.dirname(HERE))
OUT = os.environ.get('SITETEST_OUT', os.path.join(HERE, '.out')); os.makedirs(OUT, exist_ok=True)
ALL = sorted(d for d in os.listdir(REPO) if os.path.isfile(os.path.join(REPO, d, 'index.html')))

PYO = os.environ.get('PYODIDE_DIR', os.path.join(HERE, '.cache', 'node_modules', 'pyodide'))  # only needed for pages that run Python
async def route(r):
    u = r.request.url
    if '/npm/pyodide@0.29.4/' in u:
        p = os.path.join(PYO, u.split('/npm/pyodide@0.29.4/')[1].split('?')[0])
        if os.path.exists(p):
            ct = {'js':'application/javascript','wasm':'application/wasm','json':'application/json','zip':'application/zip','mjs':'application/javascript'}.get(p.rsplit('.',1)[-1],'application/octet-stream')
            return await r.fulfill(path=p, content_type=ct)
        return await r.fulfill(status=404, body='')
    if 'fonts.googleapis.com' in u or 'fonts.gstatic.com' in u:
        return await r.fulfill(status=200, content_type='text/css', body='')
    if '/KaTeX/0.16.9/' in u:
        p = os.path.join(KATEX, u.split('/KaTeX/0.16.9/')[1].split('?')[0])
        if os.path.exists(p):
            ct = 'text/css' if p.endswith('.css') else 'application/javascript' if p.endswith('.js') else 'font/woff2'
            return await r.fulfill(path=p, content_type=ct)
        return await r.fulfill(status=404, body='')
    if u.startswith(BASE) or u.startswith('data:') or u.startswith('about:') or u.startswith('blob:'):
        return await r.continue_()
    return await r.abort()

HOOK = """(()=>{window.__errs=[];const ow=console.warn,oe=console.error;
console.warn=(...a)=>{window.__errs.push('warn: '+a.map(x=>x&&x.stack?x.stack.split('\\n').slice(0,2).join(' | '):String(x)).join(' '));ow.apply(console,a)};
console.error=(...a)=>{window.__errs.push('error: '+a.map(x=>x&&x.stack?x.stack.split('\\n').slice(0,2).join(' | '):String(x)).join(' '));oe.apply(console,a)};
addEventListener('error',e=>window.__errs.push('onerror: '+e.message+' @'+(e.filename||'').split('/').slice(-2).join('/')+':'+e.lineno));
addEventListener('unhandledrejection',e=>window.__errs.push('rejection: '+e.reason));})();"""

FUZZ = r"""async (sel) => {
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const fire=(el,t)=>el.dispatchEvent(new Event(t,{bubbles:true}));
  const enter=el=>el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  const skip=/导出|导入|清空|下载|删除|重置进度|Export|Import/;
  const out=[];
  for(const p of document.querySelectorAll(sel)){
    if(getComputedStyle(p).display==='none') continue;
    const before=window.__errs.length;
    for(const r of p.querySelectorAll('input[type=range]')){const v0=r.value,mn=+(r.min||0),mx=+(r.max||100);
      for(const v of [mn,mx,(mn+mx)/2,v0]){r.value=v;fire(r,'input');fire(r,'change');await sleep(12);}}
    for(const s of p.querySelectorAll('select')){const v0=s.value;
      for(const o of s.options){s.value=o.value;fire(s,'input');fire(s,'change');await sleep(12);}
      s.value=v0;fire(s,'input');fire(s,'change');}
    for(const c of p.querySelectorAll('input[type=checkbox],input[type=radio]')){c.click();await sleep(12);if(c.type==='checkbox'){c.click();await sleep(12);}}
    for(const n of p.querySelectorAll('input[type=number]')){const v0=n.value;
      for(const v of [n.min,n.max,'','-1','1e9',v0]){if(v===undefined||v===null)continue;n.value=v;fire(n,'input');fire(n,'change');await sleep(12);}}
    for(const t of p.querySelectorAll('input[type=text],input:not([type]),textarea')){const v0=t.value;
      for(const v of ['','abc','((','1+',v0]){t.value=v;fire(t,'input');fire(t,'change');enter(t);await sleep(12);}}
    for(const b of p.querySelectorAll('button')){if(skip.test(b.textContent))continue;if(b.offsetParent===null)continue;b.click();await sleep(20);}
    await sleep(250);
    const vals=[...p.querySelectorAll('output,.read b,.verdict,td,b,span,div')].filter(e=>e.children.length===0).map(e=>e.textContent);
    const bad=[...new Set(vals.filter(t=>/\bNaN\b|\bundefined\b|\[object|Infinity/.test(t)).map(t=>t.trim().slice(0,60)))];
    const cv=[...p.querySelectorAll('canvas')].filter(c=>c.offsetParent!==null&&(c.width<10||c.height<10)).map(c=>c.id||'?');
    out.push({id:p.id||p.className,errs:window.__errs.slice(before),bad,emptyCanvas:cv});
  }
  return out;
}"""

LAYOUT = r"""() => {
  const W=document.documentElement.clientWidth, sw=document.documentElement.scrollWidth;
  const res={overflow:sw-W, sticking:[]};
  for(const p of document.querySelectorAll('section.panel, main, .wrap > *')){
    const pr=p.getBoundingClientRect(); if(!pr.width) continue;
    for(const e of p.querySelectorAll('*')){
      if(e.closest('.scroll')) continue;
      const r=e.getBoundingClientRect(); if(!r.width||!r.height) continue;
      if(r.right>pr.right+2||r.left<pr.left-2){res.sticking.push((p.id||p.tagName)+' > '+e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')+' +'+Math.round(Math.max(r.right-pr.right,pr.left-r.left)));}
    }
  }
  res.sticking=[...new Set(res.sticking)].slice(0,12);
  return res;
}"""

async def check_page(br, page_name, report):
    rep = report.setdefault(page_name, {})
    url = f'{BASE}/{page_name}/'
    for label, vw, vh, scheme in (('desktop', 1280, 900, 'light'), ('phone', 390, 844, 'light'), ('dark', 1280, 900, 'dark')):
        ctx = await br.new_context(viewport={'width': vw, 'height': vh}, color_scheme=scheme, device_scale_factor=1)
        await ctx.route('**/*', route)
        await ctx.add_init_script(HOOK)
        pg = await ctx.new_page()
        perr = []
        pg.on('pageerror', lambda e: perr.append(str(e)))
        t0 = time.time()
        await pg.goto(url, wait_until='load')
        await pg.wait_for_timeout(700)
        load_ms = int((time.time() - t0) * 1000)
        errs = await pg.evaluate('window.__errs')
        lay = await pg.evaluate(LAYOUT)
        await pg.screenshot(path=f'{OUT}/{page_name}_{label}.png', full_page=True)
        entry = {'load_ms': load_ms, 'errs': errs + perr, 'overflow': lay['overflow'], 'sticking': lay['sticking']}
        if label == 'desktop':
            entry['fuzz'] = [f for f in await pg.evaluate(FUZZ, 'section.panel, section') if f['errs'] or f['bad'] or f['emptyCanvas']]
            entry['errs_after_fuzz'] = (await pg.evaluate('window.__errs'))[len(errs):] + perr
            entry['labs'] = await pg.evaluate("[...document.querySelectorAll('section[id^=lab]')].map(s=>s.id)")
        if label == 'phone':
            entry['fuzz'] = [f for f in await pg.evaluate(FUZZ, 'section.panel, section') if f['errs'] or f['bad'] or f['emptyCanvas']]
            lay2 = await pg.evaluate(LAYOUT)
            entry['overflow_after_fuzz'] = lay2['overflow']
        rep[label] = entry
        await ctx.close()
    # embed mode
    labs = rep['desktop'].get('labs', [])
    rep['embed'] = {}
    for lid in labs:
        n = lid[3:]
        for w in (700, 360):
            ctx = await br.new_context(viewport={'width': w + 40, 'height': 1000}, device_scale_factor=1)
            await ctx.route('**/*', route)
            await ctx.add_init_script(HOOK)
            pg = await ctx.new_page()
            perr = []
            pg.on('pageerror', lambda e: perr.append(str(e)))
            await pg.goto(f'{BASE}/index.html')  # same-origin parent is fine: framed check uses self!==top
            await pg.set_content(f'<body style="margin:0"><iframe id="f" src="{url}?lab={n}" style="width:{w}px;height:900px;border:0"></iframe></body>')
            await pg.wait_for_timeout(900)
            fr = pg.frames[1] if len(pg.frames) > 1 else None
            if fr is None:
                rep['embed'][f'{n}@{w}'] = {'error': 'no frame'}; await ctx.close(); continue
            info = await fr.evaluate("""()=>({embed:document.documentElement.classList.contains('embed'),
                shown:[...document.querySelectorAll('section')].filter(s=>getComputedStyle(s).display!=='none').map(s=>s.id),
                h:Math.ceil(document.body.getBoundingClientRect().height+parseFloat(getComputedStyle(document.body).marginTop)+parseFloat(getComputedStyle(document.body).marginBottom)), overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
                errs:window.__errs})""")
            lay = await fr.evaluate(LAYOUT)
            info['sticking'] = lay['sticking']
            info['perr'] = perr
            if w == 700:
                await pg.screenshot(path=f'{OUT}/{page_name}_embed{n}.png', full_page=False, clip={'x': 0, 'y': 0, 'width': w, 'height': min(900, info['h'])})
            rep['embed'][f'{n}@{w}'] = info
            await ctx.close()

async def main(pages):
    report = {}
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for name in pages:
            try:
                await check_page(br, name, report)
            except Exception as e:
                report.setdefault(name, {})['crash'] = repr(e)
            print('done', name, flush=True)
        await br.close()
    with open(os.path.join(OUT, 'report.json'), 'w') as f:
        json.dump(report, f, ensure_ascii=False, indent=1)

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1:] or ALL))
