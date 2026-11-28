# Berechnet die Hauptfarben der mitgelieferten Spot-Bilder (gleiche Regeln wie app/src/lib/colors.ts).
# Aufruf: python3 scripts/spot-colors.py /pfad/ausgabe.json
import colorsys,re,json,sys
from PIL import Image
def bucket(r,g,b):
    h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255); h*=360
    if v<0.2: return 'schwarz'
    if s<0.15: return 'weiss' if v>0.85 else 'grau'
    if 20<=h<50 and s<0.35 and v>0.6: return 'beige'
    if 15<=h<45 and v<0.55: return 'braun'
    if h<15 or h>=345: return 'pink' if s<0.55 and v>0.65 else 'rot'
    if h<40: return 'orange'
    if h<65: return 'gelb'
    if h<165: return 'gruen'
    if h<255: return 'blau'
    if h<290: return 'lila'
    return 'pink'
def colors(path):
    im=Image.open(path).convert('RGB').resize((16,16))
    px=[im.getpixel((x,y)) for y in range(3,16) for x in range(16)]
    chrom={};neut={}
    for p in px:
        k=bucket(*p); h,sat,v=colorsys.rgb_to_hsv(*(x/255 for x in p))
        if k in ('schwarz','weiss','grau','beige','braun') or sat<0.3 or v<0.3: neut[k]=neut.get(k,0)+1
        else: chrom[k]=chrom.get(k,0)+1
    top=[k for k,n in sorted(chrom.items(),key=lambda x:-x[1]) if n/len(px)>=0.08][:2]
    if len(top)<2:
        n=sorted(neut.items(),key=lambda x:-x[1])
        if n and n[0][1]/len(px)>=0.25 and n[0][0] not in top: top.append(n[0][0])
    return top[:2]
src=open('/home/user/TestAPP/app/src/data/images.ts').read()
out={}
for m in re.finditer(r"(?:^  (\d+): \[|SPOT_IMAGES\[(\d+)\] = \[)require\('\.\./\.\./assets/spots/([^']+)'\)",src,re.M):
    i=int(m.group(1) or m.group(2))
    if re.search(r'barcelona/90\d\da\.jpg',m.group(3)): continue
    if i in out: continue
    out[i]=colors('/home/user/TestAPP/app/assets/spots/'+m.group(3))
json.dump(out,open(sys.argv[1],'w'))
print(len(out)); print({k:out[k] for k in list(out)[:40]})
