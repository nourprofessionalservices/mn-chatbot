/* MN Chatbot: self-installing widget (Carrd/GitHub+jsDelivr friendly) */
(function MN_CHATBOT(){
  const CFG = {
    avatar: "https://cdn.jsdelivr.net/gh/nourprofessionalservices/Chatbot-avatar@main/dfgdfgdfgfdg.png",
    wa: "https://wa.me/14164748684?text=Hey%20Mo%2C%20I%27d%20like%20to%20chat%20about%20your%20creative%20services.",
    intake: "https://isntthatmomointakeform.carrd.co/",
    autoBubbleDelayMs: 1000,
    autoBubbleEveryLoad: true
  };

  function ready(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn, {once:true}); }

  function injectCSS(){
    if (document.getElementById('mnChatCSS')) return;
    const css = `
.mn-launch-wrap{position:fixed;right:18px;bottom:calc(env(safe-area-inset-bottom,0px)+36px);z-index:99999}
.mn-chat-launcher{width:58px;height:58px;border-radius:50%;background:#d4843b;display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.25);overflow:hidden}
.mn-avatar{width:100%;height:100%;object-fit:cover;display:block}
.mn-hello{position:absolute;right:66px;bottom:8px;background:#fff;color:#111;border:1px solid #ececec;border-radius:14px;padding:8px 12px;font:13px/1.35 'Poppins',system-ui,-apple-system,Segoe UI,Roboto,Arial;box-shadow:0 8px 20px rgba(0,0,0,.15);display:none;max-width:240px;white-space:normal}
.mn-hello:after{content:"";position:absolute;right:-6px;bottom:12px;width:0;height:0;border-left:6px solid #fff;border-top:6px solid transparent;border-bottom:6px solid transparent}
.mn-hello.show{display:block}
.mn-chat-panel{position:fixed;right:18px;bottom:86px;width:360px;max-width:92vw;background:#fff;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;z-index:99999;font-family:'Poppins',system-ui,-apple-system,Segoe UI,Roboto,Arial}
.mn-chat-header{padding:14px;background:#d4843b;color:#fff;font:600 15px/1.2 'Poppins',sans-serif;letter-spacing:.5px;text-transform:uppercase}
.mn-chat-body{padding:16px;background:#f9f9f9;color:#111;max-height:60vh;overflow:auto}
.mn-msg{background:#fff;border:1px solid #eee;border-radius:12px;padding:12px 14px;font:15px/1.5 'Poppins',sans-serif;margin:6px 0;box-shadow:0 2px 4px rgba(0,0,0,.05)}
.mn-msg.user{background:#e9f5ff;border-color:#cfe9ff;align-self:flex-end}
.mn-input-row{display:flex;gap:8px;margin-top:10px}
.mn-input{flex:1;border:1px solid #ddd;border-radius:10px;padding:10px 12px;font:14px 'Poppins',sans-serif}
.mn-send{border:0;border-radius:10px;padding:10px 14px;background:#d4843b;color:#fff;font-weight:600;cursor:pointer}
.mn-send:hover{filter:brightness(.95)}
.mn-cta{display:none;gap:10px;margin-top:10px}
.mn-btn{flex:1;text-align:center;text-decoration:none;border:0;border-radius:10px;padding:12px 14px;font:14px 'Poppins',sans-serif;cursor:pointer;font-weight:600;transition:all .2s ease}
.mn-btn.primary{background:#25D366;color:#fff}.mn-btn.primary:hover{background:#1ebe5b}
.mn-btn.secondary{background:#fff;border:1px solid #ddd;color:#111}.mn-btn.secondary:hover{background:#f0f0f0}
.mn-card{background:#fff;border:1px solid #eee;border-radius:12px;margin:8px 0;padding:10px 12px}
.mn-card h4{margin:0 0 6px;font-size:14px;letter-spacing:.2px}
.mn-price{font-weight:700}
.mn-feat{display:flex;gap:8px;align-items:center;font-size:14px;margin:6px 0}
.mn-feat .ico{width:18px;text-align:center}
.mn-feat.off{color:#9a9a9a}
.mn-note{font-size:12px;color:#666;margin-top:6px}
@keyframes mnPulse{0%{transform:scale(1)}50%{transform:scale(1.03)}100%{transform:scale(1)}}
.mn-pulse{animation:mnPulse 700ms ease-in-out 2}
`;
    const el = document.createElement('style');
    el.id = 'mnChatCSS';
    el.textContent = css;
    document.head.appendChild(el);
  }

  function injectHTML(){
    if (document.getElementById('mnLaunchWrap')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
<div class="mn-launch-wrap" id="mnLaunchWrap" aria-live="polite">
  <div class="mn-chat-launcher" id="mnChatOpen" aria-label="Open chat" role="button" tabindex="0">
    <img class="mn-avatar" alt="Chat with Mo" src="${CFG.avatar}" />
  </div>
  <div class="mn-hello" id="mnHello" role="status">Questions?</div>
</div>
<div class="mn-chat-panel" id="mnChatPanel" role="dialog" aria-label="Contact chat" aria-modal="true">
  <div class="mn-chat-header">Let’s Connect</div>
  <div class="mn-chat-body" id="mnChatBody">
    <div class="mn-msg">Hey! Ask me anything about videography, webpages, or marketing.</div>
    <div class="mn-input-row">
      <input id="mnInput" class="mn-input" type="text" placeholder="Type your question…" aria-label="Type your question">
      <button id="mnSend" class="mn-send">Send</button>
    </div>
    <div class="mn-cta" id="mnCTA">
      <a class="mn-btn primary" id="mnWA" href="${CFG.wa}" target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
      <a class="mn-btn secondary" id="mnIntake" href="${CFG.intake}" target="_blank" rel="noopener noreferrer">Intake Form</a>
    </div>
  </div>
  <button class="mn-btn secondary" id="mnClose" style="margin:12px">Close</button>
</div>`;
    document.body.appendChild(wrap);
  }

  /* ====== Knowledge Base + Utterances ====== */
  const KB = {
    web:{label:"Web Design + Ads Setup",tiers:{
      basic:{price:"$450",includes:{landing:true,intake:true,links:true,menu:false,widgets:false,reviews:false,metaAds:false,googleAds:false}},
      premium:{price:"$600",includes:{landing:true,intake:true,links:true,menu:true,widgets:true,reviews:true,metaAds:true,googleAds:false}},
      ultimate:{price:"$850",includes:{landing:true,intake:true,links:true,menu:true,widgets:true,reviews:true,metaAds:true,googleAds:true}}
    },features:[["landing","Landing page setup"],["intake","Intake/contact form"],["links","Links to existing content"],["menu","Menu / multi-page navigation"],["widgets","Advanced/complicated widgets"],["reviews","Google Reviews display (embed/view)"],["metaAds","Meta Ads setup (Facebook/Instagram)"],["googleAds","Google Ads setup (Search/Display)"]]},
    promo:{label:"Promo Video (1 video, ~45–60s)",tiers:{
      basic:{price:"$250",includes:{duration:"45–60s",revision:"1",captions:true,grading:true,vfx:false,sfx:false}},
      premium:{price:"$350",includes:{duration:"45–60s",revision:"1",captions:true,grading:true,vfx:true,sfx:false}},
      ultimate:{price:"$450",includes:{duration:"45–60s",revision:"1",captions:true,grading:true,vfx:true,sfx:true}}
    },features:[["duration","Length"],["revision","Revisions"],["captions","Captions"],["grading","Color grading"],["vfx","VFX"],["sfx","Sound effects"]]},
    creator:{label:"Creator Package (4 videos, ~45–60s each)",tiers:{
      basic:{price:"$600",includes:{duration:"45–60s each",revision:"1/video",captions:true,grading:true,vfx:false,sfx:false}},
      premium:{price:"$800",includes:{duration:"45–60s each",revision:"1/video",captions:true,grading:true,vfx:true,sfx:false}},
      ultimate:{price:"$1,000",includes:{duration:"45–60s each",revision:"1/video",captions:true,grading:true,vfx:true,sfx:true}}
    },features:[["duration","Length"],["revision","Revisions"],["captions","Captions"],["grading","Color grading"],["vfx","VFX"],["sfx","Sound effects"]]},
    realestate:{label:"Real Estate Agent Media",tiers:{
      basic:{price:"$600",includes:{vertVid:"1 Vertical Video",horizVid:true,photos:"Photos (20)",grading:true,revision:"1",drone:false,captions:true,vfx:false,sfx:false}},
      premium:{price:"$800",includes:{vertVid:"1 Vertical Video",horizVid:true,photos:"Photos (30)",grading:true,revision:"1",drone:true,captions:true,vfx:false,sfx:false}},
      ultimate:{price:"$1,000",includes:{vertVid:"2 Vertical Videos",horizVid:true,photos:"Photos (40)",grading:true,revision:"1",drone:true,captions:true,vfx:true,sfx:true}}
    },features:[["vertVid","Vertical videos"],["horizVid","Horizontal videos"],["photos","Photos"],["grading","Color grading"],["revision","Revisions"],["drone","Drone footage"],["captions","Captions"],["vfx","VFX"],["sfx","Sound effects"]]}
  };

  const UTTERANCES = {
    services_overview:["what services do you offer","what do you offer","what do you provide","what are your services","how can you help","how can you help me","do you do end to end","can you manage everything","do you have packages","do you work with small businesses","do you work with startups"],
    web:["do you do web development","can you build a landing page","can you redesign my website","do you set up contact forms","can you add a menu","multi page navigation","can you embed google reviews","can you connect whatsapp","can you integrate my crm","email list integration"],
    video:["do you film and edit","do you do videography","can you make a promo video","do you add captions","do you do color grading","can you do vfx","sound design","do you shoot vertical videos","can you produce monthly content","do you write scripts","do you provide voiceover"],
    combined_web_video:["if you build my site can you create the video","can you produce a promo and place it on the landing page","can you shoot product clips and integrate them","can you make banner videos for the homepage","deliver vertical and horizontal for site and social","build the page and run ads with the video","optimize the video for page load","create thumbnails and hero images from video"],
    marketing_ads:["do you set up meta ads","can you run google ads","do you create ad creatives","do you write ad copy","install tracking pixels","conversions setup","do you help with targeting","optimize campaign","manage ad budgets","share performance reports"],
    pricing:["how much do you charge","what's the price","pricing","cost","rate","rates","how much is a promo video","package prices","custom quote","what's included in basic","difference between premium and ultimate","discount if i bundle","cad or usd","monthly content rate","$"],
    turnaround:["how long does a project take","what's the turnaround","turn around time","delivery time","lead time","by next week","deadline","when will it be ready","how fast","rush","expedite","turn-around"],
    availability:["are you available","when can we start","can we start","start date","availability this week","are you free","book a shoot","booking","schedule","scheduling","earliest opening","weekend or evening"],
    location:["where are you based","location","are you in gta","in toronto","do you travel","travel fees","can you shoot at our office","do you work remotely","mississauga","brampton","scarborough"],
    realestate:["do you do real estate","realtor media","listing video","mls video","property video","how many photos","horizontal video for mls","drone footage","captions for listings","light music","twilight photos","floor plans","3d tours","turnaround for listings"],
    creator:["creator package","four videos","4 videos","monthly content bundle","swap a video for photos","do you include scripts","retainer","how many revisions per video","one location for all four","hooks and on screen text"],
    promo:["1 minute promo","60 second video","short video","single video","reel","45-60 seconds","vertical and horizontal version","animated text and captions","include logo and brand colors","stock footage if needed","record a voiceover","export 1080p","export 4k"],
    web_features:["add a multi page menu","advanced widgets","sliders","faq","integrate google reviews","setup intake form","booking form","connect mailchimp","connect hubspot","add meta pixel","add google tag","basic seo","hosting domain help"],
    process:["what's your process","from brief to delivery","creative brief template","how many review rounds","share drafts before final","how do we share assets","scripts and shot lists","on camera coaching","how do we communicate"],
    deliverables:["what file formats do you deliver","vertical and horizontal","captions and subtitle files","project files","optimized web video","export for instagram","export for tiktok","export for youtube","thumbnails and cover images","pngs or jpegs sized for site"],
    policies:["how many revisions","reshoot policy","do i own the final content","licensing for music","licensing limits","sign nda","cancellation policy","refund policy","keep footage","request raw footage"],
    payment:["do you require a deposit","payment methods","payment plan","do you charge hst","can you work within my budget","travel fee","rush fees","nonprofit discount","startup discount"],
    contact:["can we chat on whatsapp","where is the intake form","how do i get a quote","schedule an intro call","what info do you need","can i send examples","availability next week if i submit the form","what happens after i submit"]
  };

  /* ====== Render helpers ====== */
  function row(label,value){
    const on=value!==false && value!==0 && value!==null;
    const text=(typeof value==='string'||typeof value==='number')? value: label;
    return `<div class="mn-feat ${on?'':'off'}"><span class="ico">${on?'✔︎':'–'}</span><span>${text}</span></div>`;
  }
  function renderTier(catName,tierKey,tier,defs){
    const title=`${catName} — ${tierKey[0].toUpperCase()+tierKey.slice(1)} (<span class="mn-price">${tier.price}</span>)`;
    const feats=defs.map(([k,l])=>row(l, tier.includes[k] ?? false)).join('');
    return `<div class="mn-card"><h4>${title}</h4>${feats}</div>`;
  }
  function renderCategory(key){
    const c=KB[key]; if(!c) return '';
    let html=`<div><strong>${c.label}</strong></div>`;
    html+=renderTier(c.label,'basic',c.tiers.basic,c.features);
    html+=renderTier(c.label,'premium',c.tiers.premium,c.features);
    html+=renderTier(c.label,'ultimate',c.tiers.ultimate,c.features);
    html+=`<div class="mn-note">For booking, availability, add-ons, or custom scope, please reach out on WhatsApp or fill the intake form for a tailored quote.</div>`;
    return html;
  }

  function norm(s){ return (s||'').toLowerCase().trim(); }
  function hasAny(text, list){ const t=norm(text); return (list||[]).some(p=>t.includes(p)); }
  function intentIs(text, key){ return hasAny(text, UTTERANCES[key]||[]); }

  function addMsg(text, who){
    const body = document.getElementById('mnChatBody');
    if(!body) return;
    const d=document.createElement('div'); d.className='mn-msg'+(who==='user'?' user':''); d.textContent=text;
    body.insertBefore(d, body.querySelector('.mn-input-row')); body.scrollTop=body.scrollHeight;
  }
  function addHtml(html){
    const body = document.getElementById('mnChatBody');
    if(!body) return;
    const d=document.createElement('div'); d.className='mn-msg'; d.innerHTML=html;
    body.insertBefore(d, body.querySelector('.mn-input-row')); body.scrollTop=body.scrollHeight;
  }
  function showCTA(pulse){
    const ctaWrap = document.getElementById('mnCTA');
    if(!ctaWrap) return;
    ctaWrap.style.display='flex';
    ctaWrap.querySelectorAll('a').forEach(a=>{ a.classList.remove('mn-pulse'); if(pulse) a.classList.add('mn-pulse'); });
  }

  function answer(q){
    if (intentIs(q,'turnaround')) return { text:"It depends on the package and scope. It’s best we chat about your project so I can give you a clear estimate.", cta:true, pulse:true };
    if (intentIs(q,'availability')) return { text:"I’d love to check availability and get you started. Please reach out on WhatsApp or share your details in the intake form, and I’ll confirm next steps.", cta:true, pulse:true };

    if (intentIs(q,'combined_web_video')){
      return { html:`<div class="mn-card"><h4>Site + Video? Absolutely.</h4>
            <div class="mn-feat"><span class="ico">✔︎</span><span>Build landing page + on-brand promo video</span></div>
            <div class="mn-feat"><span class="ico">✔︎</span><span>Above-the-fold placement, optimized for fast load</span></div>
            <div class="mn-feat"><span class="ico">✔︎</span><span>Vertical & horizontal cuts + thumbnails/hero images</span></div>
            <div class="mn-feat"><span class="ico">✔︎</span><span>Optional: Launch Meta/Google Ads</span></div></div>
            ${renderCategory('web')}${renderCategory('promo')}`, cta:true, pulse:true };
    }

    if (intentIs(q,'web'))        return { html:renderCategory('web'), cta:true };
    if (intentIs(q,'promo'))      return { html:renderCategory('promo'), cta:true, pulse:true };
    if (intentIs(q,'creator'))    return { html:renderCategory('creator'), cta:true };
    if (intentIs(q,'realestate')) return { html:renderCategory('realestate'), cta:true };

    if (intentIs(q,'video'))         return { text:"Yes — I handle videography: shooting, editing, captions, color grading, VFX/SFX, and both vertical & horizontal formats.", cta:true };
    if (intentIs(q,'marketing_ads')) return { text:"Yes — Meta & Google Ads setup, pixels/GTAG, targeting, creatives, and optimization.", cta:true };
    if (intentIs(q,'web_features'))  return { text:"Yes — menus, advanced widgets, Google Reviews, intake/booking forms, pixels/tags, and basic SEO. I’ll guide hosting & domain setup too.", cta:true };
    if (intentIs(q,'process'))       return { text:"Flow: brief → script/shot list → production → first cut → revisions → final. Drafts shared and comms tight.", cta:true };
    if (intentIs(q,'deliverables'))  return { text:"Deliverables: 9:16 & 16:9 videos, caption files, optimized web video, platform-ready exports, thumbnails, and site-sized PNG/JPEGs.", cta:true };
    if (intentIs(q,'policies'))      return { text:"Standard: defined revisions per package, ownership of final exports, licensed music/footage, NDA on request. Raw/reshoot by arrangement.", cta:true };
    if (intentIs(q,'payment'))       return { text:"Deposit required, common payment methods, HST applies. Travel/rush fees as needed; nonprofit/startup discounts can be discussed.", cta:true };
    if (intentIs(q,'location'))      return { text:"I’m based in the GTA and travel across the region. Remote web/ads work available.", cta:true };
    if (intentIs(q,'services_overview')) return { text:"I offer scriptwriting, video shooting, video editing, webpage setup, and Meta/Google Ads. GTA-based, bundle-friendly packages.", cta:true };
    if (intentIs(q,'pricing'))       return { text:"Tell me which package (Web, Promo, Creator, or Real Estate) — or tap WhatsApp / Intake and I’ll tailor a quote.", cta:true, pulse:true };
    if (intentIs(q,'contact'))       return { text:"Tap WhatsApp for a quick chat or use the intake form to share details—I'll follow up with next steps.", cta:true, pulse:true };

    return { text:"Ask about Web design, Promo video (incl. 1-minute videos), the Creator 4-video bundle, or Real Estate media — I’ll share details and next steps.", cta:true };
  }

  function hookEvents(){
    const launchWrap = document.getElementById('mnLaunchWrap');
    const openBtn = document.getElementById('mnChatOpen');
    const panel = document.getElementById('mnChatPanel');
    const closeBtn = document.getElementById('mnClose');
    const input = document.getElementById('mnInput');
    const send = document.getElementById('mnSend');
    const hello = document.getElementById('mnHello');

    if(!launchWrap || !openBtn || !panel || !closeBtn || !input || !send || !hello){
      console.warn('MN chatbot: nodes missing; will retry.');
      let tries=0; const t=setInterval(()=>{
        tries++; if(tries>20){ clearInterval(t); return; }
        if (['mnLaunchWrap','mnChatOpen','mnChatPanel','mnClose','mnInput','mnSend','mnHello'].every(id=>document.getElementById(id))){
          clearInterval(t); hookEvents();
        }
      },100);
      return;
    }

    function handleSend(){
      const q=input.value; if(!q) return;
      addMsg(q,'user'); input.value='';
      const res=answer(q);
      if(res?.html) addHtml(res.html); else addMsg(res.text||'','bot');
      if(res?.cta) showCTA(!!res?.pulse);
    }

    openBtn.addEventListener('click', ()=>{
      const vis = panel.style.display==='flex';
      panel.style.display = vis ? 'none' : 'flex';
      hello.classList.remove('show');
      if(!vis){ setTimeout(()=> input?.focus(), 150); }
    });
    openBtn.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') openBtn.click(); });
    closeBtn.addEventListener('click', ()=> panel.style.display='none');
    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter') handleSend(); });

    // bubble behavior
    function showHelloAuto(){
      if (!CFG.autoBubbleEveryLoad && sessionStorage.getItem('mnHelloShown')) return;
      setTimeout(()=>{
        hello.classList.add('show');
        setTimeout(()=>hello.classList.remove('show'), 3200);
        if (!CFG.autoBubbleEveryLoad) sessionStorage.setItem('mnHelloShown','1');
      }, CFG.autoBubbleDelayMs);
    }
    launchWrap.addEventListener('mouseenter', ()=> hello.classList.add('show'));
    launchWrap.addEventListener('mouseleave', ()=> hello.classList.remove('show'));
    showHelloAuto();
  }

  function boot(){
    injectCSS();
    injectHTML();
    hookEvents();
    console.log('MN chatbot loaded via external script ✅');
  }

  // If a builder shoved us into <head>, wait for DOM.
  ready(boot);
})();
