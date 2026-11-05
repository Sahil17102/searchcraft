const qs=(s,c=document)=>c.querySelector(s),qsa=(s,c=document)=>[...c.querySelectorAll(s)];
// Content published from the admin landing-page editor.
try{
  const managed=JSON.parse(localStorage.getItem('sc_site_content')||'null');
  if(managed){
    const hero=qs('.hero-copy'),cta=qs('.final-cta'),footer=qs('.footer-brand');
    if(hero){
      if(managed.heroEyebrow)hero.querySelector('.eyebrow').lastChild.textContent=` ${managed.heroEyebrow}`;
      if(managed.heroTitle||managed.heroAccent)hero.querySelector('h1').innerHTML=`${managed.heroTitle||'Every shipment.'}<br><span class="gradient-text">${managed.heroAccent||'One smart route.'}</span>`;
      if(managed.heroLead)hero.querySelector('.hero-lead').textContent=managed.heroLead;
      const actions=hero.querySelectorAll('.hero-actions a');
      if(managed.heroPrimary&&actions[0])actions[0].childNodes[0].textContent=`${managed.heroPrimary} `;
      if(managed.heroSecondary&&actions[1])actions[1].lastChild.textContent=` ${managed.heroSecondary}`;
    }
    if(cta){
      if(managed.ctaEyebrow)cta.querySelector('.eyebrow').lastChild.textContent=` ${managed.ctaEyebrow}`;
      if(managed.ctaTitle)cta.querySelector('h2').textContent=managed.ctaTitle;
      if(managed.ctaText)cta.querySelector('p').textContent=managed.ctaText;
      if(managed.ctaButton)cta.querySelector('.btn').childNodes[0].textContent=`${managed.ctaButton} `;
    }
    if(footer&&managed.footerText)footer.querySelector('p').textContent=managed.footerText;
  }
}catch(error){console.warn('Admin-managed landing content could not be loaded.',error)}
try{
  const extras=JSON.parse(localStorage.getItem('sc_site_extras')||'null');
  if(extras){
    if(extras.seoTitle)document.title=extras.seoTitle;
    if(extras.seoDescription)qs('meta[name="description"]')?.setAttribute('content',extras.seoDescription);
    if(extras.announcement){const bar=document.createElement('div');bar.className='admin-announcement';bar.innerHTML=`<span>${extras.announcement}</span><button aria-label="Close announcement">×</button>`;document.body.prepend(bar);bar.querySelector('button').onclick=()=>bar.remove()}
    if(extras.navCta){const navCta=qs('.nav-signup');if(navCta)navCta.lastChild.textContent=` ${extras.navCta}`}
    if(extras.featureTitle){const heading=qs('.feature-showcase .section-head h2');if(heading)heading.textContent=extras.featureTitle}
    const visibility={showCarriers:'.carrier-ecosystem',showFeatures:'.feature-showcase',showReviews:'.reviews-section',showFaq:'.faq'};
    Object.entries(visibility).forEach(([key,selector])=>{if(extras[key]===false){const section=qs(selector);if(section)section.hidden=true}});
    if(extras.supportEmail||extras.supportPhone){const footer=qs('.footer-main');if(footer){const contact=document.createElement('p');contact.className='admin-contact-line';contact.textContent=[extras.supportEmail,extras.supportPhone].filter(Boolean).join(' · ');footer.appendChild(contact)}}
  }
}catch(error){console.warn('Extended landing settings could not be loaded.',error)}
qsa('main>section').forEach((section,index)=>{const pattern=document.createElement('span');pattern.className=`section-pattern pattern-${index%3+1}`;pattern.setAttribute('aria-hidden','true');section.appendChild(pattern)});
const header=qs('.site-header'),toggle=qs('.nav-toggle'),nav=qs('.main-nav');
toggle?.addEventListener('click',()=>{const open=toggle.classList.toggle('open');nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',open)});
qsa('.nav-drop>button').forEach(b=>b.addEventListener('click',()=>b.parentElement.classList.toggle('open')));
addEventListener('scroll',()=>header?.classList.toggle('scrolled',scrollY>30),{passive:true});
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.style.transitionDelay=`${e.target.dataset.delay||0}ms`;e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});qsa('.reveal').forEach(el=>io.observe(el));
qsa('.feature-tabs button').forEach(btn=>btn.addEventListener('click',()=>{qsa('.feature-tabs button').forEach(x=>x.classList.remove('active'));qsa('.feature-panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');qs('#'+btn.dataset.tab)?.classList.add('active')}));
const countIO=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const n=e.target,goal=+n.dataset.count,start=performance.now();function tick(now){const p=Math.min((now-start)/1300,1);n.textContent=(goal%1?(goal*p).toFixed(1):Math.round(goal*p));if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick);countIO.unobserve(n)}),{threshold:.5});qsa('[data-count]').forEach(n=>countIO.observe(n));
qs('.to-top')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
qs('.subscribe-form')?.addEventListener('submit',e=>{e.preventDefault();const input=qs('input',e.currentTarget);if(input.value){e.currentTarget.innerHTML='<span style="color:#6ee0d8;padding:12px 0">You’re on the list — thank you.</span>'}});
qs('.contact-form')?.addEventListener('submit',e=>{e.preventDefault();qs('.form-status',e.currentTarget).textContent='Thanks! Your request is ready for the SearchCraft team.';e.currentTarget.reset()});
addEventListener('mousemove',e=>{const g=qs('.cursor-glow');if(g){g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'}},{passive:true});
const stackCards=qsa('.stack-card');if(stackCards.length){let stackTick=false;const paintStack=()=>{stackCards.forEach((card,i)=>{const next=stackCards[i+1];card.classList.toggle('is-behind',!!next&&next.getBoundingClientRect().top<165)});stackTick=false};addEventListener('scroll',()=>{if(!stackTick){requestAnimationFrame(paintStack);stackTick=true}},{passive:true});paintStack()}
const helpForm=qs('.help-search');const filterHelp=query=>{const term=query.trim().toLowerCase();let found=0;qsa('.support-topic').forEach(card=>{const match=!term||(card.dataset.keywords+' '+card.textContent).toLowerCase().includes(term);card.hidden=!match;if(match)found++});const empty=qs('.support-no-results');if(empty)empty.hidden=found>0;qs('#guided-help')?.scrollIntoView({behavior:'smooth',block:'start'})};helpForm?.addEventListener('submit',e=>{e.preventDefault();filterHelp(qs('input',helpForm).value)});qsa('.popular-searches button').forEach(btn=>btn.addEventListener('click',()=>{const input=qs('input',helpForm);input.value=btn.dataset.query;filterHelp(btn.dataset.query)}));addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&helpForm){e.preventDefault();qs('input',helpForm).focus()}});
