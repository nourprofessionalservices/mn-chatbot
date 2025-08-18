/* MN Chatbot (Carrd/GitHub+jsDelivr friendly) — 3-step capture → intake/WhatsApp prefill */
(function MN_CHATBOT(){
  "use strict";

  const CFG = {
    avatar: "https://cdn.jsdelivr.net/gh/nourprofessionalservices/Chatbot-avatar@main/dfgdfgdfgfdg.png",
    waNumber: "14164748684",
    intake: "https://isntthatmomointakeform.carrd.co/",
    autoBubbleDelayMs: 900,
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
    <div class="mn-msg">Quick 3-step: 1) What are you looking for? 2) What’s your time expectation? 3) Your name & phone. I’ll prefill the intake for you.</div>
    <div class="mn-input-row">
      <input id="mnInput" class="mn-input" type="text" placeholder="Type your answer…" aria-label="Type your answer">
      <button id="mnSend" class="mn-send">Send</button>
    </div>
    <div class="mn-cta" id="mnCTA">
      <a class="mn-btn primary" id="mnWA" href="#" target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
      <a class="mn-btn secondary" id="mnIntake" href="${CFG.intake}" target="_blank" rel="noopener noreferrer">Open Intake Form</a>
    </div>
  </div>
  <button class="mn-btn secondary" id="mnClose" style="margin:12px">Close</button>
</div>`;
    document.body.appendChild(wrap);
  }

  // Conversation capture
  const STATE = { step: 0, lookingFor: "", timeline: "", name: "", phone: "" };
  const encode = s => encodeURIComponent(s || "");
  const waLink = msg => `https://wa.me/${CFG.waNumber}?text=${encode(msg)}`;
  const validPhone = s => /\+?\d[\d\s\-\(\)]{6,}\d/.test((s||"").trim());

  function buildSummary(){
    return [
      `What I'm looking for: ${STATE.lookingFor || "-"}`,
      `Time expectation: ${STATE.timeline || "-"}`,
      `Name: ${STATE.name || "-"}`,
      `Phone: ${STATE.phone || "-"}`
    ].join('\n');
  }

  function updateCTALinks(){
    const wa = document.getElementById('mnWA');
    const intake = document.getElementById('mnIntake');
    const summary = buildSummary();
    const waMsg = `Hi Mo! 👋\n${summary}`;
    if (wa) wa.href = waLink(waMsg);
    if (intake){
      // Pass into intake via query params (description + name + phone)
      const url = `${CFG.intake}?desc=${encode(summary)}&name=${encode(STATE.name)}&phone=${encode(STATE.phone)}`;
      intake.href = url;
    }
  }

  function showCTA(pulse){
    const ctaWrap = document.getElementById('mnCTA');
    if(!ctaWrap) return;
    updateCTALinks();
    ctaWrap.style.display='flex';
    ctaWrap.querySelectorAll('a').forEach(a=>{
      a.classList.remove('mn-pulse');
      if(pulse) a.classList.add('mn-pulse');
    });
  }

  function addMsg(text, who){
    const body = document.getElementById('mnChatBody');
    if(!body) return;
    const d=document.createElement('div'); d.className='mn-msg'+(who==='user'?' user':''); d.textContent=text;
    body.insertBefore(d, body.querySelector('.mn-input-row')); body.scrollTop=body.scrollHeight;
  }

  function askNext(){
    const q = [
      "Great — what are you looking for? (e.g., 1-min promo video, landing page, creator package, real estate media)",
      "Awesome. What’s your time expectation? (date or range)",
      "Got it. What’s your full name?",
      "Thanks! What’s the best phone number to reach you?"
    ];
    if (STATE.step>=1 && STATE.step<=4) addMsg(q[STATE.step-1], 'bot');
  }

  function handleStepInput(input){
    const t = (input||"").trim();
    if (STATE.step===1){ STATE.lookingFor = t; STATE.step=2; askNext(); return; }
    if (STATE.step===2){ STATE.timeline = t; STATE.step=3; askNext(); return; }
    if (STATE.step===3){ STATE.name = t; STATE.step=4; askNext(); return; }
    if (STATE.step===4){
      if (!validPhone(t)){ addMsg("That doesn’t look like a phone number. Try including the area code (e.g., 416-555-1234).", 'bot'); return; }
      STATE.phone = t; STATE.step=5;
      addMsg("Perfect. I’ll prefill the intake form with this info. If I can’t directly answer here, use the buttons below and I’ll follow up shortly.", 'bot');
      showCTA(true);
      return;
    }
    // After capture, nudge to CTA
    addMsg("Use WhatsApp or the Intake Form and I’ll confirm next steps.", 'bot');
    showCTA(false);
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
      if (STATE.step>=1 && STATE.step<=5){ handleStepInput(q); return; }
      if (STATE.step===0){ STATE.step=1; STATE.lookingFor=q; STATE.step=2; askNext(); return; }
    }

    openBtn.addEventListener('click', ()=>{
      const vis = panel.style.display==='flex';
      panel.style.display = vis ? 'none' : 'flex';
      hello.classList.remove('show');
      if(!vis){
        setTimeout(()=> input?.focus(), 150);
        if (STATE.step===0){ STATE.step=1; askNext(); }
      }
    });
    openBtn.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') openBtn.click(); });
    closeBtn.addEventListener('click', ()=> panel.style.display='none');
    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter') handleSend(); });

    // hello bubble
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

  function boot(){ injectCSS(); injectHTML(); hookEvents(); console.log('MN chatbot loaded ✅'); }
  ready(boot);
})();
