"""UI audit: logs in, visits pages, screenshots them, reports controls whose shape or
spacing falls outside the design tokens and console errors."""
import asyncio, json, sys
from playwright.async_api import async_playwright
BASE='http://localhost:3000'
PAGES=sys.argv[1].split(',') if len(sys.argv)>1 else ['/','/roadmap','/changelog','/hc','/hc/en/articles/33-component-showcase','/settings/profile','/settings/preferences','/about','/design-system','/admin','/admin/feedback','/admin/settings','/admin/settings/developers','/admin/analytics','/admin/changelog','/admin/inbox','/admin/help-center','/admin/users']
AUDIT="""() => {
 const ok=new Set(['0px','4px','6px','8px','12px','16px','9999px','50%']);
 const bad={};
 for (const el of document.querySelectorAll('button, a, input, label, [role=tab], [data-slot=card], select, textarea')) { if (el.matches('[role=switch], [data-slot=switch]')) continue;
   const r=el.getBoundingClientRect(); if(!r.width||!r.height) continue;
   const cs=getComputedStyle(el); const br=cs.borderTopLeftRadius;
   if(br==='0px') continue;
   const px=parseFloat(br);
   const round = px >= r.height/2 - 0.5;
   let key=null;
   if(round && r.width > r.height*1.6 && !el.querySelector('img,[data-slot=avatar]')) key='pill '+el.tagName;
   else if(!round && !ok.has(br)) key='radius '+br;
   if(key){ bad[key]=bad[key]||[]; if(bad[key].length<3) bad[key].push((el.innerText||el.getAttribute('aria-label')||el.className.toString()).trim().slice(0,40)); }
 }
 return bad;
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 1600, 'height': 950}, color_scheme='dark')
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.goto(BASE+'/?auth=signin&callbackUrl=%2F', wait_until='networkidle'); await pg.wait_for_timeout(600)
        await pg.fill('input[type=email]', 'demo@example.com')
        if await pg.locator('input[type=password]').count()==0:
            await pg.keyboard.press('Enter'); await pg.wait_for_timeout(800)
        await pg.fill('input[type=password]', 'password'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(2500)
        for u in PAGES:
            errs.clear()
            try:
                await pg.goto(BASE+u, wait_until='networkidle', timeout=30000); await pg.wait_for_timeout(1200)
            except Exception as e: print(u,'LOAD FAIL',e); continue
            name=u.strip('/').replace('/','_') or 'home'
            await pg.screenshot(path=f'/tmp/audit/{name}.png')
            bad=await pg.evaluate(AUDIT)
            print(u, json.dumps(bad)[:600], ('ERR '+' | '.join(errs[:2])) if errs else '')
        await b.close()
asyncio.run(main())
