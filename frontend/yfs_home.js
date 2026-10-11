/* YourFavStar real-data dashboard home.
   No demo/fallback people, events, follower counts, or stock images.
   Hero rotates through real approved events first, then real approved creators. */
(function(){
const I={
home:'<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" fill="currentColor"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
fol:'<path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 10c0 6-8 11-8 11z"/>',
msg:'<path d="M4 5h16v11H9l-5 4z"/>',
sv:'<path d="M6 3h12v18l-6-4-6 4z"/>'
};
const ic=k=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;
const safeUrl=(u)=>u&&/^https?:\/\//i.test(u)?u:'';
const img=(u,alt='')=>u?`<img src="${esc(u)}" alt="${esc(alt)}" loading="lazy">`:'';
const initials=(n='?')=>`<span class="yh-av sm"><b>${esc((n.trim()[0]||'?').toUpperCase())}</b></span>`;
const avatar=(name,url,cls='')=>url?`<span class="yh-av ${cls}">${img(url,name)}</span>`:`<span class="yh-av ${cls}"><b>${esc((name||'?').trim()[0].toUpperCase())}</b></span>`;
const emptyRow=(message)=>`<div class="yh-empty">${esc(message)}</div>`;
const dateShort=d=>d?new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}):'';
const dateLong=d=>d?new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'';
const money=p=>Number(p||0)>0?inr(p)+' onwards':'Free';
const fmtFollowers=n=>{
 n=Number(n||0);
 if(n>=1000000)return (n/1000000).toFixed(n>=10000000?0:1)+'M';
 if(n>=1000)return (n/1000).toFixed(n>=10000?0:1)+'K';
 return String(n);
};

function navHome(){
 const n=$('#na');
 if(U){
   n.innerHTML=`<a class="nav-pill" href="#/profile">Profile</a><a class="nav-pill" href="#/following">Following</a><a class="nav-pill premium-mini" href="#/membership">Membership</a><a class="btn ghost sm" href="#/saved">Saved</a><a class="btn sm" href="#/" onclick="logout();return false">Log out</a>`;
 }else{
   n.innerHTML=`<a class="btn ghost sm" href="#/signup">Sign Up</a><a class="btn sm" href="#/login">Log In</a>`;
 }
}

function shell(){
 document.body.classList.add('yfs-mobile-home');
 app(`<div class="yh-mobile-top"><a href="#/" class="yh-mobile-brand"><span class="yh-mobile-logo"></span><b>YourFav<span>Star</span></b></a><div class="yh-mobile-actions"><a href="#/alerts" aria-label="Alerts" class="yh-mobile-alert">${ic('msg')}<i></i></a><a href="#/profile" aria-label="Profile">${avatar(U?.name||'U',U?.avatarUrl,'sm')}</a></div></div><div class="yh">
  <aside class="yh-l">
   <div class="yh-menu">
    ${[['home','Home','#/'],['search','Discover','#/discover'],['cal','Events','#/bookings'],['fol','Following','#/following'],['msg','Alerts','#/alerts'],['sv','Saved','#/saved']].map((x,i)=>`<a class="${i?'':'on'}" href="${x[2]}">${ic(x[0])}<span>${x[1]}</span></a>`).join('')}
   </div>
   <div class="yh-up">
    <div class="yh-up-t"><span class="yh-star">★</span>Unlock Plus / Pro</div>
    <p><i></i>Comment on creator posts</p>
    <p><i></i>Get event discounts</p>
    <p><i></i>Access member features</p>
    <a href="#/membership">View Membership</a>
    <small>Plans from ₹49</small>
   </div>
  </aside>
  <main class="yh-m">
   <section class="yh-hero" id="yhHero"></section>
   <div class="yh-h"><h2>Featured Creators</h2><a href="#/discover">See all</a></div>
   <div class="yh-cr" id="yhCr"></div>
   <div class="yh-posts" id="yhPosts"></div>
  </main>
  <aside class="yh-r">
   <section class="yh-pn"><div class="yh-h"><h3>Upcoming Events</h3><a href="#/discover">See all</a></div><div id="yhEv"></div></section>
   <section class="yh-pn"><div class="yh-h"><h3>Trending Creators</h3><a href="#/discover">See all</a></div><div id="yhTr"></div></section>
  </aside>
 </div><div class="yh-mobile-bottom">${[['home','Home','#/'],['search','Discover','#/discover'],['cal','Events','#/bookings'],['fol','Following','#/following'],['msg','Alerts','#/alerts'],['sv','Saved','#/saved']].map((x,i)=>`<a class="${i?'':'on'}" href="${x[2]}">${ic(x[0])}<span>${x[1]}</span></a>`).join('')}</div>`);
}

function heroSlide(item){
 const isEvent=item.kind==='event';
 const title=isEvent?item.title:`Discover ${item.stageName}`;
 const sub=isEvent
   ? `${item.city||''}${item.startsAt?' · '+dateLong(item.startsAt):''}`
   : `${item.category||'Creator'}${item.city?' · '+item.city:''}`;
 const image=safeUrl(isEvent?(item.coverUrl||item.avatarUrl):(item.coverUrl||item.avatarUrl));
 const cta=isEvent?`#/event/${item.id}`:`#/artist/${item.slug}`;
 return `<div class="yh-hero-bg">${image?img(image,title):''}</div>
  <div class="yh-ho">
   <span class="yh-hero-label">${isEvent?'UPCOMING EVENT':'FEATURED CREATOR'}</span>
   <h1>${esc(title)}</h1>
   <p>${esc(sub)}</p>
   <a class="yh-red" href="${cta}">${isEvent?'Book Now':'View Profile'}</a>
  </div>`;
}

function renderHero(items){
 const box=$('#yhHero');
 if(!items.length){
   box.innerHTML=`<div class="yh-empty-hero"><span>No featured content yet</span><b>Creator events and profiles will appear here.</b><a class="yh-red" href="#/discover">Discover creators</a></div>`;
   return;
 }
 let index=0;
 const paint=()=>{
   box.innerHTML=heroSlide(items[index]);
   const dots=items.map((_,i)=>`<button class="${i===index?'on':''}" aria-label="Banner ${i+1}" onclick="window.__yfsHeroGo(${i})"></button>`).join('');
   box.insertAdjacentHTML('beforeend',`<div class="yh-dots">${dots}</div>`);
 };
 window.__yfsHeroGo=(i)=>{index=(i+items.length)%items.length;paint();};
 paint();
 if(window.__yfsHeroTimer)clearInterval(window.__yfsHeroTimer);
 if(items.length>1)window.__yfsHeroTimer=setInterval(()=>{index=(index+1)%items.length;paint();},4000);
}

function renderCreators(creators){
 const box=$('#yhCr');
 if(!creators.length){box.innerHTML=emptyRow('No approved creators yet.');return;}
 box.innerHTML=creators.slice(0,5).map(a=>`<a class="yh-c" href="#/artist/${esc(a.slug)}">
   ${avatar(a.stageName,a.avatarUrl,'lg')}<b>${esc(a.stageName)}</b><small>${esc(a.category||'Creator')}</small>
 </a>`).join('');
}

function renderEvents(events){
 const box=$('#yhEv');
 if(!events.length){box.innerHTML=emptyRow('No upcoming events yet.');return;}
 box.innerHTML=events.slice(0,3).map(e=>{
   const image=safeUrl(e.coverUrl||e.avatarUrl);
   return `<a class="yh-e" href="#/event/${e.id}">
    ${image?img(image,e.title):`<span class="yh-event-placeholder">★</span>`}
    <div><b>${esc(e.title)}</b><span>By ${esc(e.artistName||'Creator')}</span><span>${esc(e.city||'')}${e.startsAt?' · '+dateShort(e.startsAt):''}</span><span class="pr">${money(e.ticketPrice)}</span></div>
   </a>`;
 }).join('');
}

function renderTrending(creators){
 const box=$('#yhTr');
 if(!creators.length){box.innerHTML=emptyRow('No creators to show yet.');return;}
 box.innerHTML=creators.slice(0,3).map(a=>`<div class="yh-t">
   ${avatar(a.stageName,a.avatarUrl)}
   <div><b>${esc(a.stageName)}</b><span>${esc(a.category||'Creator')}</span><span>${fmtFollowers(a.followers)} followers</span></div>
   <button class="yh-red" onclick="yhFollow(${a.id},this)">${FOL.has(a.id)?'Following ✓':'Follow'}</button>
 </div>`).join('');
}

function renderPosts(posts){
 const box=$('#yhPosts');
 if(!posts.length){box.innerHTML=`<div class="yh-post-empty">No creator posts yet. Creators will appear here as soon as they post.</div>`;return;}
 box.innerHTML=posts.slice(0,20).map((p,i)=>`<article class="yh-p" style="--i:${Math.min(i,8)}">
  <header>${avatar(p.artistName,p.avatarUrl,'sm')}<a href="#/artist/${esc(p.artistSlug)}"><b>${esc(p.artistName||'Creator')}</b></a><small>• ${esc(ago(p.createdAt))} ago</small><button class="yh-fol ${FOL.has(p.artistId)?'on':''}" onclick="yhFollow(${p.artistId},this)">${FOL.has(p.artistId)?'Following ✓':'Follow'}</button></header>
  ${p.text?`<p>${esc(p.text)}</p>`:''}${p.mediaUrl?media(p):''}
  <footer><button class="yh-up-b ${VT.has('POST-'+p.id)?'on':''}" onclick="yhVote(${p.id},this)">▲ <span>${Number(p.votes||0)}</span></button><button onclick="commentToggle(${p.id})">💬 ${Number(p.comments||0)}</button></footer>
  <div id="pc-${p.id}" class="post-comments" style="display:none"></div></article>`).join('');
}
window.yhVote=async(id,b)=>{if(!U){toast('Log in to upvote.');location.hash='#/login';return}
 const k='POST-'+id,on=VT.has(k),s=b.querySelector('span'),n=+s.textContent;b.disabled=true;
 try{await api('/api/me/votes/POST/'+id,{m:on?'DELETE':'PUT'});on?VT.delete(k):VT.add(k);b.classList.toggle('on',!on);s.textContent=n+(on?-1:1)}catch(e){toast(e.message)}b.disabled=false};
window.yhFollow=async(id,b)=>{if(!U){toast('Log in to follow creators.');location.hash='#/login';return}
 const on=FOL.has(id);b.disabled=true;
 try{await api('/api/me/follows/'+id,{m:on?'DELETE':'PUT'});on?FOL.delete(id):FOL.add(id);document.querySelectorAll('.yh-fol').forEach(x=>{if(x.getAttribute('onclick').includes('('+id+',')){x.classList.toggle('on',!on);x.textContent=on?'Follow':'Following ✓'}});
  if(b.classList.contains('yh-red')){b.textContent=on?'Follow':'Following ✓'}}catch(e){toast(e.message)}b.disabled=false};

window.home=async function(){
 if(window.__yfsHeroTimer)clearInterval(window.__yfsHeroTimer);
 shell();
 navHome();

 // No hard-coded people, events, follower counts, stock photos, or demo content.
 try{
   if(U){try{VT=new Set(await api('/api/me/votes'))}catch(_){}try{FOL=new Set(await api('/api/me/follows'))}catch(_){}}
   const [homeData, artistsData, posts] = await Promise.all([
     api('/api/home'),
     api('/api/artists?size=20&sort=rating'),
     api('/api/feed')
   ]);
   const events=Array.isArray(homeData.events)?homeData.events:[];
   const creators=Array.isArray(artistsData.content)?artistsData.content:[];
   const liveCreators=creators.filter(a=>a.verified!==false);
   const livePosts=Array.isArray(posts)?posts:[];

   renderCreators(liveCreators);
   renderEvents(events);
   renderTrending(liveCreators);
   renderPosts(livePosts);

   // Four real banners: upcoming events first, then real approved creators.
   const banners=[
     ...events.slice(0,4).map(e=>({...e,kind:'event'})),
     ...liveCreators.slice(0,4).map(a=>({...a,kind:'creator'}))
   ].slice(0,4);
   renderHero(banners);
 }catch(e){
   console.error(e);
   $('#yhHero').innerHTML=`<div class="yh-empty-hero"><span>Unable to load live content</span><b>Check your connection and try again.</b><a class="yh-red" href="#/" onclick="location.reload();return false">Retry</a></div>`;
   $('#yhCr').innerHTML=emptyRow('Unable to load creators.');
   $('#yhEv').innerHTML=emptyRow('Unable to load events.');
   $('#yhTr').innerHTML=emptyRow('Unable to load creators.');
   $('#yhPosts').innerHTML=`<div class="yh-post-empty">Unable to load creator posts.</div>`;
 }
};

const baseNav=nav;
window.nav=function(){baseNav();};
const S=document.createElement('style');S.textContent=`
body{background:radial-gradient(900px 420px at 8% -6%,#4a0b0e66,transparent 70%),radial-gradient(700px 500px at 100% 100%,#3a080b44,transparent 70%),#060606!important}
nav{height:76px!important;background:transparent!important;border:0!important;backdrop-filter:none!important}
nav .topbar{height:76px!important;width:calc(100% - 40px)!important;max-width:1520px!important;grid-template-columns:230px minmax(0,1fr) 300px!important;gap:22px!important;padding:0!important}
.redditish-logo{font:800 24px var(--d)!important;letter-spacing:-.04em!important;position:relative}.redditish-logo span:last-child{display:block!important;border-bottom:3px solid #ff1a1f;border-radius:0 0 40px 40px;padding-bottom:1px}
.brand-mark{width:44px!important;height:44px!important;border-radius:11px!important;box-shadow:none!important;border:0!important}
.global-search{height:48px!important;border-radius:14px!important;background:#171819!important;border:1px solid #2b2c2e!important;max-width:none!important;padding:0 18px!important}.global-search input{font-size:14px!important}.global-search .search-icon{transform:none!important;font-size:22px!important}
#na{gap:14px!important;justify-content:flex-end!important}
.yh-red{background:#ff0a0a;color:#fff;border:0;cursor:pointer;font-weight:700;transition:.15s}.yh-red:hover{background:#ff3a3a}
.yh{width:calc(100% - 40px);max-width:1520px;margin:0 auto;display:grid;grid-template-columns:230px minmax(0,1fr) 300px;gap:22px;padding:6px 0 60px;align-items:start}.yh-l,.yh-r{position:sticky;top:84px;display:grid;gap:18px}.yh-m{min-width:0}
.yh-menu{display:grid;gap:6px}.yh-menu a{display:flex;align-items:center;gap:16px;height:52px;padding:0 20px;border-radius:12px;color:#e8e8e8;font-size:15px;font-weight:500;position:relative;border:1px solid transparent}.yh-menu a:hover{background:#141415}.yh-menu a.on{background:linear-gradient(90deg,#8e0a0e,#3c0709);border-color:#b3151a;color:#fff;box-shadow:0 0 24px #ff0a0a33}
.yh-up{position:relative;overflow:hidden;padding:20px 18px 18px;border:1px solid #5a1317;border-radius:14px;background:radial-gradient(220px 160px at 40% 100%,#ff0a0a44,transparent 70%),#0c0a0a}.yh-up-t{display:flex;align-items:center;gap:12px;font-weight:800;font-size:16px;line-height:1.25;margin-bottom:16px}.yh-star{display:grid;place-items:center;width:38px;height:38px;border-radius:9px;background:#ff0a0a;font-size:20px}
.yh-up p{display:flex;align-items:center;gap:10px;margin:11px 0;font-size:13px;color:#d6d6d6}.yh-up p i{width:11px;height:11px;border:2px solid #ff2a2f;border-radius:50%;flex:none}.yh-up>a{display:block;margin-top:18px;background:#ff0a0a;border-radius:12px;padding:14px;text-align:center;font-weight:800;font-size:15px}.yh-up small{display:block;text-align:center;margin-top:12px;color:#ff4a4f;font-size:12px}
.yh-hero{position:relative;height:300px;border-radius:16px;overflow:hidden;border:1px solid #2a2a2c;background:linear-gradient(100deg,#4a0a10,#12060a 60%)}.yh-hero-bg,.yh-hero-bg img{position:absolute;inset:0;width:100%;height:100%}.yh-hero-bg img{object-fit:cover;object-position:center;opacity:.72}.yh-hero-bg:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#160507 0%,#160507c9 38%,#16050744 72%,#0000 100%)}
.yh-ho{position:absolute;left:28px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;z-index:2;max-width:68%}.yh-hero-label{font:700 10px var(--mono);letter-spacing:.16em;color:#ff3b40;margin-bottom:10px}.yh-ho h1{font:800 clamp(28px,3.2vw,44px)/1.12 var(--d);letter-spacing:-.03em;margin:0 0 12px;max-width:620px}.yh-ho p{margin:0 0 20px;color:#eee;font-size:15px}.yh-ho .yh-red{padding:13px 28px;border-radius:10px;font-size:15px}
.yh-dots{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:7px;z-index:3}.yh-dots button{width:7px;height:7px;padding:0;border:0;border-radius:50%;background:#ffffff66;cursor:pointer}.yh-dots button.on{background:#fff}
.yh-empty-hero{height:100%;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:30px;color:#fff;gap:10px}.yh-empty-hero span{font:700 10px var(--mono);letter-spacing:.15em;color:#ff4b50;text-transform:uppercase}.yh-empty-hero b{font:800 30px var(--d)}.yh-empty-hero .yh-red{padding:12px 20px;border-radius:10px;margin-top:8px}
.yh-h{display:flex;justify-content:space-between;align-items:center;margin:0 0 14px}.yh-m>.yh-h{margin-top:28px}.yh-h h2,.yh-h h3{font:700 18px var(--d);letter-spacing:-.01em;margin:0}.yh-h a{color:#ff1a1f;font-weight:700;font-size:14px}
.yh-cr{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.yh-c{text-align:center;min-width:0}.yh-c b{display:block;margin-top:10px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.yh-c small{color:#9a9a9c;font-size:12px}.yh-av{position:relative;display:inline-grid;place-items:center;width:48px;height:48px;border-radius:50%;border:2px solid #6a6a6e;flex:none;background:#222;color:#fff}.yh-av.lg{width:78px;height:78px;border-width:3px}.yh-av.sm{width:30px;height:30px;border:0;background:#4a1015;font-size:13px}.yh-av img{width:100%;height:100%;border-radius:50%;object-fit:cover}.yh-av:not(.sm):after{content:"★";position:absolute;right:-3px;bottom:-1px;width:18px;height:18px;border-radius:50%;background:#ff0a0a;border:2px solid #0b0b0b;font-size:9px;display:grid;place-items:center}
.yh-posts{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:26px}.yh-p,.yh-pn{background:#0e0e0f;border:1px solid #262628;border-radius:16px;padding:14px;overflow:hidden}.yh-p header{display:flex;align-items:center;gap:9px}.yh-p header b{font-size:14px}.yh-p header small{color:#8a8a8c;flex:1;font-size:12px}.yh-p header em{color:#999;font-style:normal}.yh-p>p{margin:12px 0;font-size:14px;line-height:1.5;color:#e4e4e4}.yh-pi,.yh-p img{width:100%;max-height:360px;border-radius:12px;object-fit:cover}.yh-p footer{height:auto!important;min-height:0!important;background:none!important;display:flex;gap:12px;margin-top:9px;border-top:1px solid #202226;padding-top:8px}.yh-p footer button,.yh-p footer a{border:0;background:none;color:#888;font-size:11px;padding:4px;cursor:pointer}
.yh-pn{padding:18px 16px}.yh-e,.yh-t{display:flex;gap:14px;align-items:center;padding:10px 0}.yh-e img,.yh-event-placeholder{width:70px;height:70px;border-radius:10px;object-fit:cover;flex:none}.yh-event-placeholder{display:grid;place-items:center;background:#2a0b0e;color:#ff3036;font-size:22px}.yh-e b,.yh-t b{display:block;font-size:15px}.yh-e span,.yh-t span{display:block;font-size:12.5px;color:#9a9a9c;line-height:1.45}.yh-e .pr{color:#e8e8e8}.yh-t>div{flex:1;min-width:0}.yh-t .yh-av{width:50px;height:50px}.yh-t .yh-red{border-radius:12px;padding:11px 0;width:88px;text-align:center;font-size:14px}
.yh-empty{padding:18px 0;color:#777;font-size:13px}.yh-post-empty{grid-column:1/-1;padding:36px 20px;border:1px dashed #303136;border-radius:14px;color:#777;text-align:center;background:#0b0b0c}
@media(max-width:1180px){.yh{grid-template-columns:200px minmax(0,1fr)}.yh-r{display:none}nav .topbar{grid-template-columns:200px minmax(0,1fr) auto!important}}
@media(max-width:820px){.yh{display:block;width:100%;padding:10px}.yh-l{display:none}.yh-hero{height:240px}.yh-posts{grid-template-columns:1fr}.yh-cr{grid-template-columns:repeat(5,100px);overflow-x:auto;padding-bottom:4px}.yh-ho{left:18px;max-width:82%}.yh-ho h1{font-size:25px}.yh-hero-bg img{opacity:.58}nav .topbar{grid-template-columns:auto 1fr auto!important;gap:10px!important}}
@media(max-width:1180px){
  .yh{width:calc(100% - 28px);grid-template-columns:200px minmax(0,1fr);gap:18px}
  .yh-r{position:static;grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
  .yh-pn{min-width:0}
  .yh-hero{height:290px}
}
@media(max-width:820px){
  html,body{overflow-x:hidden}
  nav{height:64px!important}
  nav .topbar{height:64px!important;width:calc(100% - 16px)!important;grid-template-columns:auto minmax(0,1fr) auto!important;gap:8px!important;padding:0!important}
  .redditish-logo{min-width:0!important;gap:7px!important}
  .redditish-logo span:last-child{font-size:18px!important}
  .brand-mark{width:34px!important;height:34px!important;border-radius:9px!important}
  .global-search{height:40px!important;min-width:0!important;padding:0 12px!important}
  .global-search input{font-size:12px!important}
  #na{gap:6px!important;min-width:0}
  #na .btn{min-height:34px!important;padding:7px 10px!important;font-size:11px!important}
  .yh{display:block;width:100%;padding:10px 10px 42px}
  .yh-l{display:none}
  .yh-m{width:100%;min-width:0}
  .yh-r{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}
  .yh-hero{height:250px;border-radius:14px}
  .yh-ho{left:18px;right:18px;max-width:none}
  .yh-ho h1{font-size:clamp(24px,7vw,32px);max-width:80%;line-height:1.08}
  .yh-ho p{font-size:12px;margin-bottom:14px}
  .yh-ho .yh-red{padding:10px 18px;font-size:12px}
  .yh-hero-bg img{opacity:.52}
  .yh-cr{display:flex;overflow-x:auto;gap:16px;padding:2px 2px 8px;scrollbar-width:none;overscroll-behavior-x:contain}
  .yh-cr::-webkit-scrollbar{display:none}
  .yh-c{width:84px;flex:0 0 84px}
  .yh-av.lg{width:68px;height:68px}
  .yh-c b{font-size:12px;margin-top:7px}
  .yh-c small{font-size:10px}
  .yh-posts{grid-template-columns:1fr;gap:12px;margin-top:20px}
  .yh-p{border-radius:13px;padding:12px}
  .yh-p img,.yh-pi{max-height:none;aspect-ratio:16/10}
  .yh-pn{padding:14px;border-radius:13px}
  .yh-e{gap:10px}
  .yh-e img,.yh-event-placeholder{width:58px;height:58px}
  .yh-e b,.yh-t b{font-size:13px}
  .yh-e span,.yh-t span{font-size:11px}
  .yh-t .yh-av{width:42px;height:42px}
  .yh-t .yh-red{width:70px;padding:9px 0;font-size:12px}
}
@media(max-width:600px){
  nav .topbar{grid-template-columns:auto minmax(0,1fr) auto!important}
  .redditish-logo span:last-child{display:none!important}
  .brand-mark{width:36px!important;height:36px!important}
  .global-search{height:38px!important;border-radius:11px!important}
  .global-search .search-icon{font-size:18px!important;margin-right:4px}
  .global-search input{font-size:11px!important}
  #na .btn.ghost{display:none!important}
  #na .btn{padding:8px 10px!important;font-size:10px!important;border-radius:9px!important}
  .yh{padding:8px 8px 36px}
  .yh-hero{height:220px;border-radius:12px}
  .yh-ho{left:16px;right:16px}
  .yh-ho h1{font-size:24px;max-width:88%}
  .yh-ho p{max-width:85%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .yh-ho .yh-red{padding:9px 15px}
  .yh-h{margin-bottom:10px}
  .yh-h h2,.yh-h h3{font-size:16px}
  .yh-h a{font-size:12px}
  .yh-r{grid-template-columns:1fr;gap:10px}
  .yh-pn{padding:13px}
  .yh-p footer{gap:8px}
}

.yh-mobile-top,.yh-mobile-bottom{display:none}
@media(max-width:600px){
  body.yfs-mobile-home{padding-bottom:76px}
  body.yfs-mobile-home>nav{display:none!important}
  .yh-mobile-top{display:flex;position:sticky;top:0;z-index:60;height:58px;align-items:center;justify-content:space-between;padding:0 12px;background:#08090a;border-bottom:1px solid #202124}
  .yh-mobile-brand{display:flex;align-items:center;gap:8px;min-width:0;color:#fff}
  .yh-mobile-brand b{font:800 17px/1 var(--d);letter-spacing:-.045em;white-space:nowrap}
  .yh-mobile-brand b span{color:#ff1820}
  .yh-mobile-logo{width:30px;height:30px;border-radius:8px;background:#000 url('assets/yfstar-logo.png') center/cover no-repeat;box-shadow:0 0 0 1px #ff3540}
  .yh-mobile-actions{display:flex;align-items:center;gap:14px}
  .yh-mobile-actions>a{display:grid;place-items:center;color:#eee}
  .yh-mobile-actions svg{width:20px;height:20px}
  .yh-mobile-alert{position:relative}
  .yh-mobile-alert i{position:absolute;right:-1px;top:-1px;width:6px;height:6px;background:#ff1820;border:1px solid #08090a;border-radius:50%}
  .yh-mobile-actions .yh-av.sm{width:27px;height:27px;background:#2b2d30}
  .yh-mobile-bottom{display:grid;grid-template-columns:repeat(6,1fr);position:fixed;left:0;right:0;bottom:0;z-index:100;height:68px;padding:7px 4px max(7px,env(safe-area-inset-bottom));background:rgba(8,9,10,.97);border-top:1px solid #292a2d;box-shadow:0 -8px 30px #0008;backdrop-filter:blur(16px)}
  .yh-mobile-bottom a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#777;font-size:9px;font-weight:700;min-width:0}
  .yh-mobile-bottom svg{width:19px;height:19px}
  .yh-mobile-bottom a.on,.yh-mobile-bottom a:active{color:#ff1820}
  .yh-mobile-bottom a span{white-space:nowrap}
  .yh{padding-bottom:18px}
}
@media(max-width:380px){
  .global-search input::placeholder{font-size:10px}
  .global-search input{font-size:10px}
  .yh-hero{height:205px}
  .yh-ho h1{font-size:21px}
  .yh-ho p{font-size:11px}
  .yh-cr{gap:12px}
  .yh-c{width:76px;flex-basis:76px}
}
`;
document.head.appendChild(S);
addEventListener('hashchange',()=>{if(location.hash && location.hash!=='#/' && location.hash!=='#') document.body.classList.remove('yfs-mobile-home');});
})();
window.route=function(){const h=location.hash||'#/';scrollTo(0,0);nav();
 if(h.startsWith('#/discover'))discover(h);else if(h.startsWith('#/artist/'))artist(h.split('/')[2]);else if(/^#\/(login|signup)/.test(h))authPage(h);else if(h.startsWith('#/studio'))studio();else if(h.startsWith('#/saved'))saved();else if(h.startsWith('#/enquiries'))enquiries();else if(h.startsWith('#/event/'))evPage(h.split('/')[2]);else if(h.startsWith('#/announce'))announce();else if(h.startsWith('#/alerts'))alerts();else if(h.startsWith('#/profile'))profilePage();else if(h.startsWith('#/membership'))membershipPage();else if(h.startsWith('#/following'))following();else if(h.startsWith('#/bookings'))bookings();else home()};
addEventListener('hashchange',()=>route());
(async()=>{try{await loadMembership();await loadMe();await loadLib()}catch(e){}route()})();
const X=document.createElement('style');X.textContent=`
.yh-p{animation:yhIn .5s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i,0)*60ms)}@keyframes yhIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.yh-p header a{min-width:0}.yh-p header small{flex:1}.yh-fol{border:1.5px solid #ff0a0a;background:transparent;color:#ff4a4f;border-radius:99px;padding:5px 13px;font-size:12px;font-weight:700;cursor:pointer;transition:.18s}.yh-fol:hover{background:#ff0a0a;color:#fff}.yh-fol.on{background:#1b1b1d;border-color:#3a3b3e;color:#ddd}
.yh-p footer{display:flex;gap:8px;margin-top:12px;border-top:1px solid #222;padding-top:10px}.yh-p footer button{border:0;background:#161617;color:#bbb;border-radius:99px;padding:8px 14px;font-weight:700;font-size:13px;cursor:pointer;transition:.18s}.yh-p footer button:hover{background:#222;color:#fff}.yh-up-b.on{background:#ff0a0a!important;color:#fff!important;transform:scale(1.05)}
.btn,.yh-red,.yh-fol,.opt{transition:transform .15s,background .18s}.btn:active,.yh-red:active,.opt:active{transform:scale(.97)}.auth.box{animation:yhIn .5s both}
@media(max-width:820px){.yh-posts{grid-template-columns:1fr}.yh-p header{flex-wrap:wrap}.auth{margin:24px auto}.roles{grid-template-columns:1fr}}`;document.head.appendChild(X);
