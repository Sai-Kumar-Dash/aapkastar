/* YourFavStar — global shell: header, mobile bottom bar, auth flows, discover, uploads, banners */
(function(){
const P={home:'<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',disc:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',plus:'<path d="M12 5v14M5 12h14"/>',heart:'<path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 10c0 6-8 11-8 11z"/>',save:'<path d="M6 3h12v18l-6-4-6 4z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',bell:'<path d="M6 17V11a6 6 0 0112 0v6l2 2H4z"/><path d="M10 21h4"/>'};
const ic=(k,s=22)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${P[k]}</svg>`;
const on=(h,p)=>p==='#/'?(h===''||h==='#'||h==='#/'):h.startsWith(p);

/* ---------- header + bottom bar (rendered on every page) ---------- */
window.nav=function(){
 let hd=document.getElementById('yn');
 if(!hd){hd=document.createElement('header');hd.id='yn';const o=document.querySelector('nav');o?o.replaceWith(hd):document.body.prepend(hd)}
 const h=location.hash||'#/',A=U&&U.role==='ARTIST',sv=h.startsWith('#/discover')?(q(h).q||''):'';
 const links=[['Home','#/'],['Discover','#/discover'],['Following','#/following'],['Saved','#/saved']].map(l=>`<a class="${on(h,l[1])?'on':''}" href="${l[1]}">${l[0]}</a>`).join('');
 const me=U?`${A?'<button class="yn-btn red yn-post" onclick="openComposer()">+ Post</button>':''}<button class="yn-me" onclick="ynMenu(event)" aria-label="Account">${U.avatarUrl?`<img src="${esc(U.avatarUrl)}" alt="">`:`<b>${esc((U.name||'U')[0].toUpperCase())}</b>`}</button><div class="yn-dd" id="ynDd"><div class="yn-who"><b>${esc(U.name)}</b><small>${A?'Creator':'Follower'}</small></div><a href="#/profile">Profile</a>${A?'<a href="#/studio">Creator Studio</a>':''}<a href="#/following">Following</a><a href="#/saved">Saved</a><a href="#/membership">Membership</a><button onclick="logout()">Log out</button></div>`
  :`<a class="yn-btn" href="#/signup">Sign Up</a><a class="yn-btn red" href="#/login">Log In</a>`;
 hd.innerHTML=`<div class="yn-in"><a class="yn-logo" href="#/"><img src="assets/yfstar-logo.png" alt=""><b>YourFav<i>Star</i></b></a><form class="yn-search" onsubmit="return ySearch(event)">${ic('disc',18)}<input id="ysq" type="search" autocomplete="off" placeholder="Search creators…" aria-label="Search" value="${esc(sv)}"></form><div class="yn-links">${links}</div><div class="yn-right">${me}</div></div>`;
 let mb=document.getElementById('mb');if(!mb){mb=document.createElement('div');mb.id='mb';document.body.appendChild(mb)}
 const it=!U?[['home','Home','#/'],['disc','Discover','#/discover'],['user','Log in','#/login']]
  :A?[['home','Home','#/'],['disc','Discover','#/discover'],['plus','','+'],['bell','Alerts','#/alerts'],['user','Profile','#/profile']]
  :[['home','Home','#/'],['disc','Discover','#/discover'],['heart','Following','#/following'],['save','Saved','#/saved'],['user','Profile','#/profile']];
 mb.innerHTML=it.map(x=>x[2]==='+'?`<button class="mb-plus" onclick="openComposer()" aria-label="New post">${ic('plus',28)}</button>`:`<a class="${on(h,x[2])?'on':''}" href="${x[2]}">${ic(x[0])}<span>${x[1]}</span></a>`).join('');
};
window.ySearch=e=>{e.preventDefault();const v=document.getElementById('ysq').value.trim();location.hash='#/discover'+(v?'?q='+encodeURIComponent(v):'');return false};
window.ynMenu=e=>{e.stopPropagation();document.getElementById('ynDd').classList.toggle('open')};
document.addEventListener('click',()=>{const d=document.getElementById('ynDd');if(d)d.classList.remove('open')});

/* ---------- photo upload (stored by our own backend, no Cloudinary) ---------- */
async function shrink(f){try{const b=await createImageBitmap(f),s=Math.min(1,1400/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);c.getContext('2d').drawImage(b,0,0,c.width,c.height);return await new Promise(r=>c.toBlob(r,'image/jpeg',.85))}catch(e){return f}}
window.up=async function(file){
 if(!file.type.startsWith('image/'))throw new Error('Please choose a photo (JPG, PNG or WebP).');
 const f=new FormData();f.append('file',await shrink(file),'photo.jpg');let r;
 try{r=await fetch(CFG.API+'/api/me/upload',{method:'POST',headers:{Authorization:'Bearer '+T},body:f})}catch(e){throw new Error('Cannot reach the server. Try again in a moment.')}
 const j=await r.json().catch(()=>null);if(!r.ok)throw new Error((j&&j.message)||'Upload failed. Try a smaller photo.');
 return /^https?:/.test(j.url)?j.url:CFG.API+j.url};

/* ---------- quick composer (the + button) ---------- */
window.openComposer=function(){
 if(!U||U.role!=='ARTIST'){toast('Only creator accounts can post.');return}
 const m=document.createElement('div');m.className='cm';let file=null;
 m.innerHTML=`<div class="cm-box"><div class="cm-h"><b>New post</b><button type="button" class="cm-x" aria-label="Close">✕</button></div><textarea id="cmT" maxlength="2000" placeholder="Share an update with your followers…"></textarea><div class="cm-pv" id="cmP"></div><div class="cm-a"><label class="cm-file">📷 Add photo<input type="file" id="cmF" accept="image/*" hidden></label><button type="button" class="yh-red cm-go" id="cmGo">Post</button></div></div>`;
 document.body.appendChild(m);
 m.onclick=e=>{if(e.target===m||e.target.classList.contains('cm-x'))m.remove()};
 m.querySelector('#cmF').onchange=e=>{file=e.target.files[0]||null;m.querySelector('#cmP').innerHTML=file?`<img src="${URL.createObjectURL(file)}" alt="">`:''};
 m.querySelector('#cmGo').onclick=async()=>{const t=m.querySelector('#cmT').value.trim(),b=m.querySelector('#cmGo');
  if(!t&&!file){toast('Write something or add a photo.');return}
  b.disabled=true;b.textContent='Posting…';
  try{let url=null;if(file)url=await up(file);
   await api('/api/me/posts',{m:'POST',b:{type:url?'PHOTO':'TEXT',text:t,mediaUrl:url}});
   m.remove();toast('Posted! Your followers can see it now.');route()}
  catch(e){toast(e.message);b.disabled=false;b.textContent='Post'}};
 setTimeout(()=>m.querySelector('#cmT').focus(),50)};

/* ---------- auth: login = Google or mobile → next → password; signup = role → next → Google → number + password ×2 ---------- */
function gbtn(el,cb,text){
 if(!CFG.GOOGLE_CLIENT_ID){el.innerHTML='<p class="mu" style="font-size:12px;text-align:center">Google sign-in isn\'t configured yet. Add GOOGLE_CLIENT_ID in config.js.</p>';return}
 if(!(window.google&&google.accounts))return setTimeout(()=>gbtn(el,cb,text),300);
 google.accounts.id.initialize({client_id:CFG.GOOGLE_CLIENT_ID,callback:r=>cb(r.credential)});
 google.accounts.id.renderButton(el,{theme:'outline',size:'large',text,shape:'pill',width:Math.min(320,el.clientWidth||320)})}
const card=(k,t,body)=>`<div class="wrap"><div class="auth box pop au"><div class="auth-kicker">${k}</div><h2>${t}</h2>${body}</div></div>`;
const PH='inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10-digit mobile number" required';
window.authPage=function(h){h.startsWith('#/signup')?signup(h):login()};
function login(){
 app(card('WELCOME BACK','Log in',`<div id="gb" class="google-button-wrap"></div><div class="or"><span>or</span></div><div id="mob"></div><p class="mu auth-switch">New here? <a href="#/signup">Create an account</a></p>`));
 gbtn($('#gb'),async tok=>{try{await done(await api('/api/auth/google',{m:'POST',b:{idToken:tok}}))}catch(x){toast(x.message);if(/sign up/i.test(x.message))setTimeout(()=>location.hash='#/signup',1400)}},'signin_with');
 const s1=()=>{$('#mob').innerHTML=`<form class="f" id="f1"><label>Mobile number<input name="phone" ${PH}></label><button class="btn">Next</button></form>`;
  $('#f1').onsubmit=e=>{e.preventDefault();s2(e.target.phone.value)}};
 const s2=ph=>{$('#mob').innerHTML=`<form class="f" id="f2"><p class="mu">Logging in as <b>+91 ${esc(ph)}</b> · <a href="#" id="bk">change</a></p><label>Password<input name="password" type="password" required autocomplete="current-password" autofocus></label><button class="btn" id="lb">Log in</button></form>`;
  $('#bk').onclick=e=>{e.preventDefault();s1()};
  $('#f2').onsubmit=async e=>{e.preventDefault();const b=$('#lb');b.disabled=true;try{await done(await api('/api/auth/phone/login',{m:'POST',b:{phone:ph,password:e.target.password.value}}))}catch(x){toast(x.message);b.disabled=false}}};
 s1()}
function signup(h){
 AU={role:q(h).role==='ARTIST'?'ARTIST':'CUSTOMER'};
 const s1=()=>{app(card('STEP 1 OF 3','How will you use YourFavStar?',`<div class="roles">${[['ARTIST','Creator','Post updates, list events, get booked'],['CUSTOMER','Follower','Follow creators, upvote posts, book events']].map(r=>`<button type="button" class="opt ${AU.role==r[0]?'on':''}" data-r="${r[0]}"><b>${r[1]}</b><span>${r[2]}</span></button>`).join('')}</div><button class="btn" id="nx" style="width:100%;margin-top:16px">Next</button><p class="mu auth-switch">Already a member? <a href="#/login">Log in</a></p>`));
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{AU.role=b.dataset.r;document.querySelectorAll('.opt').forEach(x=>x.classList.toggle('on',x===b))});$('#nx').onclick=s2};
 const s2=()=>{app(card('STEP 2 OF 3','Verify your Google account',`<p class="mu">Joining as a <b>${AU.role==='ARTIST'?'Creator':'Follower'}</b>. Pick the Google account you want to use.</p><div id="gb" class="google-button-wrap"></div><p class="mu auth-switch"><a href="#" id="bk">← Back</a></p>`));
  $('#bk').onclick=e=>{e.preventDefault();s1()};gbtn($('#gb'),s3,'signup_with')};
 const s3=tok=>{let em='';try{em=JSON.parse(atob(tok.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).email||''}catch(e){}
  app(card('STEP 3 OF 3','Almost done',`<div class="google-selected"><span class="google-check">✓</span><div><b>Google account verified</b><span class="mu">${esc(em)}</span></div></div><form class="f" id="f3"><label>Mobile number<input name="phone" ${PH}></label><label>New password<input name="p1" type="password" minlength="8" required autocomplete="new-password" placeholder="At least 8 characters"></label><label>Confirm password<input name="p2" type="password" minlength="8" required autocomplete="new-password"></label><button class="btn" id="cb">Create account</button></form>`));
  $('#f3').onsubmit=async e=>{e.preventDefault();const f=e.target;if(f.p1.value!==f.p2.value){toast('Passwords do not match.');return}
   const b=$('#cb');b.disabled=true;try{await done(await api('/api/auth/google/complete',{m:'POST',b:{idToken:tok,phone:f.phone.value,password:f.p1.value,role:AU.role}}))}catch(x){toast(x.message);b.disabled=false}}};
 s1()}
window.done=async function(j){setU(j.user,j.token);try{await loadMe();await loadMembership();await loadLib()}catch(e){}toast('Welcome, '+j.user.name.split(' ')[0]+'!');if((location.hash||'#/')==='#/')route();else location.hash='#/'};

/* ---------- discover: round profile photos with the name underneath ---------- */
window.discover=async function(h){
 const Q=q(h);let cats=[];try{cats=await api('/api/categories')}catch(e){}
 app(`<div class="wrap"><h1 class="yd-t">Discover creators</h1><div class="yd-bar"><input id="fq" type="search" placeholder="Search creators…" value="${esc(Q.q||'')}"><select id="fc"><option value="">All types</option>${cats.map(c=>`<option value="${esc(c.slug)}" ${Q.cat==c.slug?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="yd-grid" id="g"></div></div>`);
 const go=async()=>{const p=new URLSearchParams({q:$('#fq').value,category:$('#fc').value,sort:'rating',size:60});
  try{const r=await api('/api/artists?'+p);$('#g').innerHTML=r.content.length?r.content.map((a,i)=>`<a class="yd-c" style="--i:${Math.min(i,14)}" href="#/artist/${esc(a.slug)}"><span class="yd-av"><em>${esc((a.stageName||'?')[0].toUpperCase())}</em>${a.avatarUrl?`<img src="${esc(a.avatarUrl)}" alt="" loading="lazy" onerror="this.remove()">`:''}</span><b>${esc(a.stageName)}</b></a>`).join(''):empty('No creators found. Try a different search.')}catch(e){$('#g').innerHTML=empty(esc(e.message))}};
 ['fq','fc'].forEach(i=>$('#'+i).addEventListener('input',()=>{clearTimeout(go.t);go.t=setTimeout(go,250)}));go()};

/* ---------- home: rotating banners (edit banners.js) + live refresh ---------- */
function banners(){
 const el=document.getElementById('yhHero'),B=(window.BANNERS||[]).slice(0,6);if(!el||!B.length)return;
 clearInterval(window.__yfsHeroTimer);clearInterval(window.__ybT);el.className='yh-hero yb';
 el.innerHTML=B.map((b,i)=>`<a class="yb-s ${i?'':'on'}" href="${esc(b.link||'#/discover')}" style="background-image:url('${esc(b.img)}')"><div class="yb-t"><small>${esc(b.tag||'')}</small><h2>${esc(b.title||'')}</h2><p>${esc(b.sub||'')}</p><span class="yh-red">${esc(b.cta||'Explore')}</span></div></a>`).join('')+`<div class="yb-d">${B.map((_,i)=>`<i class="${i?'':'on'}" data-i="${i}"></i>`).join('')}</div>`;
 const S=[...el.querySelectorAll('.yb-s')],D=[...el.querySelectorAll('.yb-d i')];let i=0,x0=null;
 const go=n=>{i=(n+S.length)%S.length;S.forEach((s,k)=>s.classList.toggle('on',k===i));D.forEach((d,k)=>d.classList.toggle('on',k===i))};
 D.forEach(d=>d.onclick=e=>{e.preventDefault();e.stopPropagation();go(+d.dataset.i)});
 el.ontouchstart=e=>{x0=e.touches[0].clientX};el.ontouchend=e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));x0=null};
 window.__ybT=setInterval(()=>{if(document.getElementById('yhHero')!==el)clearInterval(window.__ybT);else go(i+1)},4500)}
let sig='';async function refresh(force){if(!document.getElementById('yhPosts')||document.hidden)return;
 try{const ps=await api('/api/feed'),s=JSON.stringify(ps.map(p=>[p.id,p.votes,p.comments]));if(force||s!==sig){sig=s;window.__yhRenderPosts&&window.__yhRenderPosts(ps)}}catch(e){}}
const H=window.home;window.home=async function(){const p=H();setTimeout(banners,0);await p;clearInterval(window.__yfsHeroTimer);banners();sig='';clearInterval(window.__yhR);window.__yhR=setInterval(()=>refresh(),20000)};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});

const S=document.createElement('style');S.textContent=`
nav,.yh-mobile-top,.yh-mobile-bottom{display:none!important}
#yn{position:sticky;top:0;z-index:80;background:rgba(8,8,9,.88);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid #1d1d1f}
.yn-in{max-width:1520px;margin:0 auto;height:66px;padding:0 20px;display:flex;align-items:center;gap:18px}
.yn-logo{display:flex;align-items:center;gap:10px;font:800 21px var(--d,inherit);letter-spacing:-.03em;flex:none;color:#fff}.yn-logo img{width:38px;height:38px;border-radius:10px;object-fit:cover}.yn-logo i{font-style:normal;color:#ff1a1f}
.yn-search{position:relative;flex:1;max-width:520px}.yn-search svg{position:absolute;left:15px;top:12px;color:#888;pointer-events:none}.yn-search input{width:100%;height:42px;border-radius:999px;background:#151517;border:1px solid #2a2a2d;padding:0 16px 0 42px;color:#fff;font-size:14px;outline:0;transition:border-color .2s,box-shadow .2s}.yn-search input:focus{border-color:#ff1a1f;box-shadow:0 0 0 3px #ff1a1f22}
.yn-links{display:flex;gap:2px;margin-left:auto}.yn-links a{padding:9px 14px;border-radius:99px;color:#b5b5ba;font-weight:600;font-size:14px;transition:.18s}.yn-links a:hover{color:#fff;background:#151517}.yn-links a.on{color:#fff;background:#2a0b0d}
.yn-right{display:flex;align-items:center;gap:10px;position:relative;flex:none}
.yn-btn{height:40px;padding:0 20px;border-radius:99px;display:inline-flex;align-items:center;font-weight:700;font-size:14px;border:1.5px solid #3a3b3e;color:#fff;background:transparent;cursor:pointer;transition:.18s}.yn-btn:hover{border-color:#888}.yn-btn.red{background:#ff0a0a;border-color:#ff0a0a}.yn-btn.red:hover{background:#ff3a3a}
.yn-me{width:42px;height:42px;border-radius:50%;border:2px solid #3a3b3e;overflow:hidden;background:#2a0b0d;color:#fff;font-weight:800;padding:0;cursor:pointer;transition:.18s}.yn-me:hover{border-color:#ff1a1f}.yn-me img{width:100%;height:100%;object-fit:cover}
.yn-dd{display:none;position:absolute;right:0;top:52px;min-width:210px;background:#101012;border:1px solid #2a2a2d;border-radius:14px;padding:8px;box-shadow:0 24px 60px #000b;animation:yhIn .2s both}.yn-dd.open{display:block}
.yn-who{padding:8px 12px 10px;border-bottom:1px solid #222;margin-bottom:6px}.yn-who b,.yn-who small{display:block}.yn-who small{color:#888;font-size:12px}
.yn-dd a,.yn-dd button{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:9px;color:#eee;background:none;border:0;font:600 14px inherit;cursor:pointer}.yn-dd a:hover,.yn-dd button:hover{background:#1b1b1d}
.yh-l,.yh-r{top:84px!important}
#mb{display:none}
@media(max-width:820px){
 .yn-in{height:auto;padding:9px 12px;gap:10px}.yn-links,.yn-logo b,.yn-post,.yn-btn:not(.red):not(.yn-post){display:none}.yn-logo img{width:36px;height:36px}.yn-search{max-width:none}.yn-btn{height:38px;padding:0 16px}
 #mb{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:90;padding-bottom:env(safe-area-inset-bottom,0px);height:calc(62px + env(safe-area-inset-bottom,0px));background:rgba(10,10,11,.97);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-top:1px solid #222;align-items:center}
 #mb a{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;color:#85858a;font-size:10.5px;font-weight:600;padding-top:4px;transition:color .15s}#mb a.on{color:#ff2a2f}#mb a.on svg{transform:translateY(-2px);transition:.2s}
 .mb-plus{flex:none;width:56px;height:56px;border-radius:50%;margin:-28px 8px 0;background:linear-gradient(135deg,#ff2a2f,#c40608);color:#fff;border:0;display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 24px #ff0a0a66,0 0 0 6px #0a0a0b;transition:transform .15s}.mb-plus:active{transform:scale(.92)}
 body{padding-bottom:calc(78px + env(safe-area-inset-bottom,0px))!important}footer{padding-bottom:24px}
 .yh-l{display:none}}
.cm{position:fixed;inset:0;z-index:200;background:#000b;display:flex;align-items:flex-end;justify-content:center;animation:cmF .2s both}@keyframes cmF{from{opacity:0}}
.cm-box{width:min(560px,100%);background:#101012;border:1px solid #2a2a2d;border-radius:20px 20px 0 0;padding:16px;animation:cmU .3s cubic-bezier(.22,1,.36,1) both}@keyframes cmU{from{transform:translateY(40px);opacity:0}}
@media(min-width:821px){.cm{align-items:center}.cm-box{border-radius:20px}}
.cm-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:17px}.cm-x{background:#1b1b1d;border:0;color:#fff;width:34px;height:34px;border-radius:50%;cursor:pointer}
.cm-box textarea{width:100%;min-height:120px;background:#151517;border:1px solid #2a2a2d;border-radius:14px;color:#fff;padding:14px;font-size:15px;resize:vertical;outline:0}.cm-box textarea:focus{border-color:#ff1a1f}
.cm-pv img{width:100%;max-height:260px;object-fit:cover;border-radius:14px;margin-top:10px}.cm-a{display:flex;justify-content:space-between;align-items:center;margin-top:12px}.cm-file{padding:10px 16px;border-radius:99px;background:#1b1b1d;font-weight:700;font-size:14px;cursor:pointer}.cm-go{padding:11px 28px;border-radius:99px;font-size:15px}.cm-go:disabled{opacity:.6}
.yb{position:relative;overflow:hidden;background:#0a0a0b}.yb-s{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transform:scale(1.04);transition:opacity .8s ease,transform 5s ease;display:flex;align-items:center;pointer-events:none}.yb-s.on{opacity:1;transform:none;pointer-events:auto;z-index:1}
.yb-t{padding:0 32px;max-width:640px;position:relative}.yb-t small{color:#ff4a4f;font-weight:800;letter-spacing:.14em;font-size:12px}.yb-t h2{font:800 clamp(26px,4vw,46px)/1.08 var(--d,inherit);letter-spacing:-.03em;margin:8px 0 10px;color:#fff}.yb-t p{color:#e5e5e8;margin:0 0 18px;font-size:15px}.yb-t .yh-red{display:inline-block;padding:12px 26px;border-radius:10px}
.yb-s.on .yb-t{animation:yhIn .7s .15s cubic-bezier(.22,1,.36,1) both}.yb-d{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:7px;z-index:3}.yb-d i{width:8px;height:8px;border-radius:99px;background:#fff6;cursor:pointer;transition:.3s}.yb-d i.on{width:24px;background:#fff}
@media(max-width:820px){.yb-t{padding:0 20px}.yb-t p{font-size:13px;margin-bottom:12px}}
.yd-t{font:800 clamp(26px,4vw,40px) var(--d,inherit);letter-spacing:-.03em;margin:28px 0 16px;text-transform:none}
.yd-bar{display:flex;gap:10px;margin-bottom:28px}.yd-bar input,.yd-bar select{height:46px;border-radius:999px;background:#151517;border:1px solid #2a2a2d;color:#fff;padding:0 18px;outline:0;font-size:14px}.yd-bar input{flex:1;min-width:0}.yd-bar input:focus{border-color:#ff1a1f}
.yd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:30px 12px;padding-bottom:30px}
.yd-c{display:flex;flex-direction:column;align-items:center;gap:11px;text-align:center;animation:yhIn .45s both;animation-delay:calc(var(--i)*35ms);min-width:0}
.yd-av{position:relative;width:116px;height:116px;border-radius:50%;overflow:hidden;border:3px solid #2e2e32;background:linear-gradient(135deg,#6a0c12,#1a0507);display:grid;place-items:center;transition:.22s}.yd-av em{font:800 42px var(--d,inherit);font-style:normal;color:#fff8}.yd-av img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.yd-c:hover .yd-av{border-color:#ff1a1f;transform:translateY(-4px) scale(1.04);box-shadow:0 12px 30px #ff0a0a33}.yd-c b{font-size:14.5px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:820px){.yd-grid{grid-template-columns:repeat(3,1fr);gap:24px 8px}.yd-av{width:88px;height:88px}.yd-av em{font-size:32px}.yd-c b{font-size:13px}.yd-bar select{max-width:120px}}
.au{max-width:440px;margin:36px auto}.or{display:flex;align-items:center;gap:12px;color:#777;font-size:12px;margin:18px 0;text-transform:uppercase;letter-spacing:.1em}.or:before,.or:after{content:"";flex:1;height:1px;background:#2a2a2d}
.au .roles{display:grid;grid-template-columns:1fr 1fr;gap:10px}.au .opt{text-align:left;padding:16px;border-radius:14px;background:#151517;border:1.5px solid #2a2a2d;color:#fff;cursor:pointer;transition:.18s}.au .opt b{display:block;font-size:16px;margin-bottom:4px}.au .opt span{color:#999;font-size:12px}.au .opt.on{border-color:#ff1a1f;background:#2a0b0d;box-shadow:0 0 0 3px #ff1a1f22}
@media(max-width:520px){.au .roles{grid-template-columns:1fr}.au{margin:20px auto}}
`;document.head.appendChild(S);
document.addEventListener('DOMContentLoaded',()=>{});nav();
})();
