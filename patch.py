from pathlib import Path
import re
p=Path('/mnt/data/yfs_own/frontend/index.html')
s=p.read_text()
# top nav brand/search
s=s.replace('<span class="brand-mark">★</span><span>yourfavstar</span>','<span class="brand-mark">Y</span><span>YourFavStar</span>')
s=s.replace('placeholder="Search YourFavStar"','placeholder="Find creators, events, stories…"')
# append own style before style close
own_css=r'''
/* YOURFAVSTAR — ORIGINAL COMMUNITY UI LAYER
   Inspired by the useful idea of a 3-column discovery feed, but with a distinct
   creator-first visual language: editorial red rail, soft-black surfaces,
   creator badges and booking CTAs. */
:root{--yf-red:#ff3040;--yf-red2:#c91428;--yf-bg:#070708;--yf-surface:#101012;--yf-surface2:#151518;--yf-line:#29292e;--yf-text:#f5f5f7;--yf-muted:#8f9098;--yf-hot:#ff4d5d}
body{background:var(--yf-bg)!important;color:var(--yf-text)!important}
nav{height:64px!important;background:#09090b!important;border-bottom:1px solid #25252a!important}
nav .topbar{height:64px!important;max-width:1480px!important;grid-template-columns:260px minmax(340px,650px) 260px!important;padding:0 24px!important;gap:26px!important}
.redditish-logo{font:800 22px/1 var(--d)!important;letter-spacing:-.065em!important;gap:10px!important}
.brand-mark{width:34px!important;height:34px!important;border-radius:10px!important;background:var(--yf-red)!important;color:#fff!important;border:0!important;box-shadow:inset 0 -4px 0 #a30e20,0 0 0 1px #ff5b68!important;font-size:17px!important;transform:rotate(-4deg)}
.global-search{height:42px!important;border-radius:13px!important;background:#141418!important;border:1px solid #303038!important;box-shadow:inset 0 1px 0 #222!important}
.global-search:focus-within{border-color:#55555e!important;box-shadow:0 0 0 3px #ff30401c!important}
.global-search .search-icon{font-size:22px!important;color:#a8a8b0!important}
#na .btn{border-radius:10px!important;min-height:38px!important;padding:9px 17px!important}
#na .btn:not(.ghost){background:var(--yf-red)!important;color:#fff!important}
#na .btn:not(.ghost):hover{background:#ff4453!important}
#na .btn.ghost:hover{background:#18181c!important}
.rd{max-width:1480px!important;grid-template-columns:260px minmax(0,720px) 300px!important;gap:24px!important;padding:22px 24px 70px!important}
.rl{top:84px!important}
.login-card{background:linear-gradient(160deg,#121216 0%,#0d0d10 70%);border:1px solid #2d2d33;border-radius:18px!important;padding:22px 18px 18px!important;min-height:0!important;box-shadow:0 18px 60px #0006!important}
.login-card:before{content:'CREATOR NETWORK';position:absolute;top:13px;right:14px;color:#777;font:600 8px var(--mono);letter-spacing:.12em}
.login-card:after{background:radial-gradient(circle at 18% 86%,#ff304044,transparent 52%),radial-gradient(circle at 85% 20%,#ff304018,transparent 45%)!important;filter:blur(12px)!important}
.login-card h2{font-size:25px!important;text-align:left!important;margin:24px 4px 20px!important;max-width:210px}
.login-card h2:after{content:'Join the people shaping the next big moment.';display:block;font:500 12px/1.5 'DM Sans';letter-spacing:0;color:#85858e;margin-top:10px}
.auth-choice{height:44px!important;border-radius:11px!important;background:#f3f3f4!important;border-color:#ddd!important;font-size:12px!important;margin:9px 0!important}
.auth-choice:hover{background:#fff!important;box-shadow:0 6px 18px #0005!important}
.login-legal{font-size:9px!important;color:#666!important}
.left-nav{border-top:1px solid #29292e!important;padding-top:13px!important;margin-top:14px}
.left-nav a{padding:11px 13px!important;border-radius:10px!important;color:#aaa!important}
.left-nav a:first-child{background:#1b1214!important;color:#fff!important;box-shadow:inset 3px 0 var(--yf-red)}
.left-nav a:hover{background:#141418!important;color:#fff!important}
.left-nav h4{color:#5f6068!important;margin:23px 12px 8px!important}
.feed-title{border:0!important;padding:3px 0 16px!important;margin:0!important;font-size:22px!important;display:flex;align-items:end;justify-content:space-between}
.feed-title:after{content:'LIVE';font:700 8px var(--mono);letter-spacing:.12em;color:#ff6773;border:1px solid #63232a;border-radius:999px;padding:5px 8px;background:#1a0e10}
.feed-sub{font-size:11px!important;color:#6f7079!important;margin-left:10px}
.rfeed{gap:14px!important}
.rp{grid-template-columns:56px 1fr!important;background:var(--yf-surface)!important;border:1px solid #29292f!important;border-radius:15px!important;box-shadow:0 10px 30px #0003!important;min-height:0!important;transition:transform .18s,border-color .18s,box-shadow .18s!important}
.rp:hover{border-color:#3c3c45!important;transform:translateY(-2px)!important;box-shadow:0 15px 35px #0005!important}
.vt{background:#0c0c0f!important;width:56px!important;border-right:1px solid #25252b!important;padding:13px 0!important}
.vt button{font-size:17px!important;color:#72737c!important}
.vt button:hover,.vt button.on{color:var(--yf-red)!important}
.vt b{color:#c6c6cc!important}
.rb{padding:14px 16px 12px!important}
.rm{color:#8c8d95!important;font-size:10px!important;gap:7px!important}
.rm .av{width:28px!important;height:28px!important;border:1px solid #3a3a41!important}
.rp h3{font-size:20px!important;line-height:1.16!important;letter-spacing:-.035em!important;margin:10px 0 7px!important}
.rp h3 a:hover,.rp h3:hover{color:#ff5b68!important}
.rp p{font-size:13px!important;color:#b6b6bf!important;line-height:1.55!important}
.flair{background:#1b1113!important;color:#ff6974!important;border:1px solid #4d2026!important;border-radius:999px!important;padding:3px 7px!important;font-size:8px!important;text-transform:uppercase!important;letter-spacing:.08em!important}
.rchips{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.rchips span{background:#17171b;border:1px solid #2c2c32;border-radius:8px;padding:6px 8px;color:#aaa;font-size:10px}
.ra{border-top:1px solid #24242a!important;padding-top:8px!important;margin-top:11px!important}
.ra a,.ra button{color:#777984!important;border-radius:7px!important}.ra a:hover,.ra button:hover{background:#1b1b20!important;color:#fff!important}
.rmedia-fake{height:360px!important;border-radius:12px!important;margin:12px 0 2px!important;border:1px solid #34343b!important;background:#12090b!important;box-shadow:inset 0 0 80px #0006!important}
.rmedia-fake:before{background:radial-gradient(circle at 70% 25%,#ff3040 0,#8d1724 22%,transparent 48%),linear-gradient(135deg,#15151a,#070708 70%)!important}
.rmedia-fake:after{content:'YOURFAVSTAR / CREATOR DROP'!important;color:#ffb0b7!important}
.rmedia-fake span{font-size:42px!important}
.fake-tag{background:#1c1012!important;border-color:#54252b!important;color:#ff737d!important}
.rr{top:84px!important}
.rr .box{background:var(--yf-surface)!important;border:1px solid #29292f!important;border-radius:16px!important;padding:17px!important;box-shadow:0 10px 28px #0003!important}
.popular-title{color:#777982!important;font-size:9px!important;letter-spacing:.13em!important}
.community-row{border-top:1px solid #222229!important;padding:11px 0!important}
.community-avatar{width:36px!important;height:36px!important;border-radius:11px!important;background:#1a1a1f!important;border-color:#33333a!important}
.community-row b{font-size:12px!important}.community-row small{font-size:10px!important;color:#6e6f77!important}
.rr .box h3{font-size:18px!important;text-transform:none!important;letter-spacing:-.03em!important}
.rr .btn{width:100%;border-radius:10px!important;background:var(--yf-red)!important;box-shadow:none!important}
.see-more{color:#ff5f6c!important}
/* Distinct creator-brand details */
.rfeed:before{content:'THE CREATOR PULSE';display:block;font:700 9px var(--mono);letter-spacing:.16em;color:#5f6068;padding:2px 3px 0}
.fake-post:nth-of-type(2n){border-radius:15px 15px 15px 6px}
.fake-post:nth-of-type(3n){border-radius:15px 6px 15px 15px}
@media(max-width:1050px){.rd{grid-template-columns:220px minmax(0,1fr)!important}.rr{display:none!important}.rp h3{font-size:18px!important}}
@media(max-width:760px){nav .topbar{height:58px!important}.rd{padding:12px 9px 40px!important}.login-card{display:none!important}.rd{grid-template-columns:1fr!important}.rl{display:none!important}.feed-title{font-size:20px}.rp{grid-template-columns:44px 1fr!important}.vt{width:44px!important}.rb{padding:12px!important}.rmedia-fake{height:260px!important}.global-search{height:38px!important}.redditish-logo span:last-child{display:block!important;font-size:17px!important}.brand-mark{width:30px!important;height:30px!important}}
'''
s=s.replace('</style>','\n'+own_css+'\n</style>',1)
# replace home function
start=s.index('async function home(){')
end=s.index('\nfunction openPro(){', start)
new_home=r'''async function home(){
 app(`<div class="rd">
   <aside class="rl" id="rl"></aside>
   <main>
     <div class="feed-title">Creator Pulse <span class="feed-sub">What creators are making, booking & talking about</span></div>
     <div class="rfeed" id="fakeFeed"></div>
     <div class="rfeed" id="rf" style="margin-top:10px"></div>
   </main>
   <aside class="rr" id="rr"></aside>
 </div>`);
 drawFakeFeed();
 $('#rl').innerHTML=`
   <div class="login-card">
     <h2>Your people are here.</h2>
     <button class="auth-choice" onclick="location.hash='#/login'"><span class="ico">G</span> Continue with Google</button>
     <button class="auth-choice" onclick="toast('Apple sign in will be connected in the next auth update.')"><span class="ico">●</span> Continue with Apple</button>
     <button class="auth-choice" onclick="location.hash='#/login'"><span class="ico">▣</span> Continue with Phone Number</button>
     <button class="auth-choice" onclick="location.hash='#/login'"><span class="ico">✉</span> Continue with Email</button>
     <p class="login-legal">By continuing, you agree to the YourFavStar terms and privacy policy.</p>
   </div>
   <div class="left-nav">
     <a href="#/">◈ <span>Creator Pulse</span></a>
     <a href="#/discover">⌕ <span>Find creators</span></a>
     ${U?'<a href="#/saved">▱ <span>Your saves</span></a><a href="#/alerts">♧ <span>Updates</span></a>':''}
     <h4>Discover</h4>
     <a href="#/discover?cat=singer">● <span>Music & singers</span></a>
     <a href="#/discover?cat=dj">◉ <span>DJs & live acts</span></a>
     <a href="#/discover?cat=dancer">✦ <span>Dance & performance</span></a>
     <a href="#/discover?cat=comedian">◇ <span>Comedy & hosts</span></a>
   </div>`;
 $('#rr').innerHTML=`
   <div class="box">
     <div class="popular-title">RIGHT NOW</div>
     ${[
       ['Live Creator Talk','12.4K watching','LT'],['Bengaluru Creator Meet','4.8K following','BM'],['Reel Makers India','9.2K following','RM'],['Indie Music Circle','3.7K following','IM'],['Event Creators','2.9K following','EC']
     ].map((x,i)=>`<div class="community-row"><div class="community-avatar" style="background:linear-gradient(145deg,#${['5a1820','20202a','35131a','20242a','30151a'][i]},#101014)">${x[2]}</div><div class="cr-copy"><b>${x[0]}</b><small>${x[1]}</small></div></div>`).join('')}
     <a class="see-more" href="#/discover">Explore all →</a>
   </div>
   <div class="box">
     <div class="popular-title">BOOKING INSIDER</div>
     <h3>Follow first. Book smarter.</h3>
     <p class="mu" style="font-size:12px">See creator updates, discover events and get closer to the people you want to book.</p>
     <a class="btn" href="#/discover">Find a creator</a>
   </div>
   <div class="box" style="border-color:#4b2026;background:linear-gradient(145deg,#120b0d,#0f0f12)">
     <div class="popular-title" style="color:#ff6873">YOURFAVSTAR PRO</div>
     <h3>More access. Less friction.</h3>
     <p class="mu" style="font-size:12px">GIF comments, creator messaging and member booking discounts from ₹49.</p>
     <button class="btn" onclick="openPro()">See Pro</button>
   </div>`;
 try{
   const [f,H]=await Promise.all([api('/api/feed'),api('/api/home')]);
   FD.items=[...H.events.map(e=>({...e,k:'EVENT'})),...H.news.map(n=>({...n,k:'NEWS'})),...f.map(p=>({...p,k:'POST'}))].map(x=>({...x,t:new Date(x.createdAt).getTime(),votes:+x.votes||0}));
   $('#rf').innerHTML=FD.items.length?FD.items.map(rcard).join(''):'';
 }catch(e){$('#rf').innerHTML='';}
}
'''
s=s[:start]+new_home+s[end:]
p.write_text(s)
