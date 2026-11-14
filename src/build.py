s=open('shell.html').read()
for k,f in [('/*ASTRO*/','astro.js'),('/*INTERP*/','interp.js'),('/*EXTRAS*/','extras.js'),('/*APP*/','app.js'),('/*PERSONAL*/','personal.js'),('/*DIARY*/','diary.js'),('/*INTERESTS*/','interests.js'),('/*SHELF*/','shelf.js'),('/*MORE*/','more.js'),('/*FAMILY*/','family.js'),('/*CYCLE*/','cycle.js'),('/*INSIGHTS*/','insights.js'),('/*DISCOVER*/','discover.js'),('/*TAROT*/','tarot.js'),('/*STUDIO*/','studio.js'),('/*RITUAL*/','ritual.js'),('/*WEEK*/','week.js'),('/*SOUL*/','soul.js'),('/*UI*/','ui.js')]: s=s.replace(k,(open('qrcode.min.js').read()+'\n' if f=='soul.js' else '')+open(f).read())
open('index.html','w').write(s)

import subprocess, sys
r = subprocess.run(['node', '-e', "const s=require('fs').readFileSync('index.html','utf8');const m=[...s.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)];new Function(m[0][1]);console.log('syntax ok')"], capture_output=True, text=True)
if r.returncode != 0: print('ERRO DE SINTAXE:', r.stderr[-500:]); sys.exit(1)
print(r.stdout.strip())
