"""dist-single -> one self-contained HTML that works in phone app previews.
- one classic <script> (no modules), CSS/fonts/images inlined
- a pre-rendered still of the page, shown until the live site has mounted (or if it never does)
- if a script error stops the site, the error is printed on screen"""
import sys, os, re, base64
dist, out = sys.argv[1], sys.argv[2]
mime={'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.svg':'image/svg+xml'}
def uri(path):
    p=os.path.join(dist,path)
    return f"data:{mime[os.path.splitext(p)[1]]};base64,"+base64.b64encode(open(p,'rb').read()).decode() if os.path.isfile(p) else None
html=open(os.path.join(dist,'index.html')).read()
css_tag=re.search(r'<link rel="stylesheet"[^>]*href="\./([^"]+)"[^>]*>',html)
css=open(os.path.join(dist,css_tag.group(1))).read()
css=re.sub(r'@font-face\{[^}]*?(?:cyrillic|greek|vietnamese|latin-ext)[^}]*\}','',css)
css=re.sub(r'url\(([^)]+)\)', lambda m: 'url('+(uri(os.path.normpath(os.path.join('static',m.group(1).strip('"\'')))) or m.group(1))+')', css)
js_tag=re.search(r'<script[^>]*src="\./([^"]+)"[^>]*></script>',html)
js=open(os.path.join(dist,js_tag.group(1))).read()
js=re.sub(r'(?<![\w/])((?:\./)?assets/[A-Za-z0-9_\-./]+\.(?:webp|png|jpe?g|svg))', lambda m: uri(m.group(1)) or m.group(0), js)
js=js.replace('</script','<\\/script')
diag='''<script>
(function(){
  function show(msg){
    try{var b=document.getElementById('sb-error');if(!b){b=document.createElement('div');b.id='sb-error';
    b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#8f2d20;color:#fff;font:13px/1.4 -apple-system,system-ui,sans-serif;padding:10px 12px;border-radius:6px;white-space:pre-wrap;word-break:break-word';
    (document.body||document.documentElement).appendChild(b)}b.textContent+= (b.textContent?'\\n':'')+'Preview error: '+msg}catch(e){}
  }
  window.addEventListener('error',function(e){show((e.message||'unknown')+(e.lineno?' (line '+e.lineno+':'+e.colno+')':''))});
  window.addEventListener('unhandledrejection',function(e){show('promise: '+((e.reason&&(e.reason.message||e.reason))||'unknown'))});
  // drop the still once the live site is on screen
  function swap(){var r=document.querySelector('#root [data-journey]'),p=document.getElementById('prerender');if(r&&p){p.remove();return true}return false}
  document.addEventListener('DOMContentLoaded',function(){if(swap())return;var mo=new MutationObserver(function(){if(swap())mo.disconnect()});mo.observe(document.getElementById('root'),{childList:true,subtree:true})});
})();
</script>'''
html=html.replace(css_tag.group(0),'<style>'+css+'</style>').replace(js_tag.group(0),'')
html=re.sub(r'<link rel="preload"[^>]*>','',html)
html=html.replace('<head>','<head>\n'+diag,1)
html=html.replace('</body>','<script>'+js+'</script>\n</body>')
open(out,'w').write(html)

# a plain note shown until the live site mounts: if scripts never run, this stays and says so
note='<div id="prerender" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#26221f;color:#f8f2e9;font:600 15px/1.4 -apple-system,system-ui,sans-serif;text-align:center;padding:24px">Loading the Sindibad preview…</div>'
html=html.replace('<div id="root"></div>',note+'<div id="root"></div>',1)
open(out,'w').write(html)
left=re.findall(r'["\'(]((?:\./)?(?:assets|static)/[^"\')]+)',html)
print('wrote',out,os.path.getsize(out)//1024,'KB','unresolved',left[:3])
