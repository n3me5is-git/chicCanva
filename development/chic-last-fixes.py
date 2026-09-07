from pathlib import Path
p=Path(__file__).with_name('chic-ui.js');s=p.read_text(encoding='utf-8')
s=s.replace("else if(e.key==='Escape')hideContext();", "else if(e.key==='Escape'){if(!$('objectMenu').classList.contains('hidden'))hideContext();else handled=false}")
# Load the SDK when the AI section is approached, so a generation click can retain user activation.
s=s.replace("$('fontSearch').placeholder=", "if(location.protocol!=='file:'){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();ensurePuter().catch(e=>{$('aiStatus').textContent=e.message})}},{root:$('sidebar'),rootMargin:'120px'});observer.observe($('aiCard'))}\n $('fontSearch').placeholder=")
p.write_text(s,encoding='utf-8')
css=Path(__file__).with_name('chic-style.css');s=css.read_text(encoding='utf-8');s+='\n.card{scroll-margin-top:60px}@media(max-width:720px){.quick-jump button{min-height:30px;padding:6px 10px}}\n';css.write_text(s,encoding='utf-8')
