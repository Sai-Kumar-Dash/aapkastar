/* YourFavStar Creator Network feature layer */
let MEM={plan:'FREE',active:false,discountPercent:0};
async function loadMembership(){if(!U){MEM={plan:'FREE',active:false,discountPercent:0};return MEM}try{MEM=await api('/api/me/membership');return MEM}catch(e){return MEM}}
async function loadMe(){if(!U)return;try{const me=await api('/api/me/profile');U=me;localStorage.setItem('u',JSON.stringify(me))}catch(e){}}

function nav(){
 const n=$('#na');
 if(U){
   n.innerHTML=`<a class="nav-pill" href="#/profile">Profile</a><a class="nav-pill" href="#/following">Following</a><a class="nav-pill premium-mini" href="#/membership">${MEM.active?MEM.plan:'Join Plus'}</a><a class="btn ghost sm" href="#/saved">Saved</a><a class="btn sm" href="#/" onclick="logout();return false">Log out</a><span class="nav-more">•••</span>`;
 } else n.innerHTML=`<a class="btn ghost sm" href="#/signup">Sign Up</a><a class="btn sm" href="#/login">Log In</a><span class="nav-more">•••</span>`;
}
async function done(j){setU(j.user,j.token);await loadMe();await loadMembership();nav();await loadLib();toast('Welcome, '+j.user.name.split(' ')[0]+'!');location.hash=j.user.role==='ARTIST'?'#/studio':'#/';}

function authPage(h){
 const su=h.startsWith('#/signup');
 AU={su,role:q(h).role==='ARTIST'?'ARTIST':'CUSTOMER'};
 app(`<div class="wrap"><div class="auth box pop auth-modern">
 <div class="auth-kicker">YOURFAVSTAR ACCOUNT</div>
 <h2>${su?'Join YourFavStar':'Welcome back'}</h2>
 <p class="mu">Continue with Google. You can add a mobile number and password later from your profile.</p>
 <div class="google-step-title">I want to join as</div>
 <div class="roles">${[['CUSTOMER','A fan','Follow creators · Upvote · Book'],['ARTIST','A creator','Post · List events · Get booked']].map(r=>`<button type="button" class="opt ${AU.role==r[0]?'on':''}" data-r="${r[0]}" onclick="AU.role='${r[0]}';document.querySelectorAll('.opt').forEach(b=>b.classList.toggle('on',b.dataset.r==AU.role))"><b>${r[1]}</b><span>${r[2]}</span></button>`).join('')}</div>
 <div id="gb" class="google-button-wrap"></div>
 <div class="or">or log in with mobile</div>
 <form class="f" id="phoneForm"><label>Mobile number<input name="phone" inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10-digit mobile number" required></label><label>Password<input name="password" type="password" required autocomplete="current-password"></label><button class="btn" id="phoneBtn">Log in</button></form>
 <p class="mu auth-switch">${su?'Already a member? <a href="#/login">Log in</a>':'New here? <a href="#/signup">Create an account</a>'}</p>
 </div></div>`);
 $('#phoneForm').onsubmit=async e=>{e.preventDefault();const f=e.target,b=$('#phoneBtn');b.disabled=true;try{await done(await api('/api/auth/phone/login',{m:'POST',b:{phone:f.phone.value,password:f.password.value}}))}catch(x){toast(x.message);b.disabled=false}};
 const g=()=>{
   if(!CFG.GOOGLE_CLIENT_ID){$('#gb').innerHTML='<span class="mu" style="font-size:11px">Google sign-in will appear after Google OAuth is configured.</span>';return}
   if(!(window.google&&google.accounts))return setTimeout(g,300);
   google.accounts.id.initialize({
     client_id:CFG.GOOGLE_CLIENT_ID,
     callback:async r=>{
       try{
         // First let Google identify the account. Existing users are logged in immediately;
         // new users are asked only for phone + password after the Google account is selected.
         const j=await api('/api/auth/google',{m:'POST',b:{idToken:r.credential,role:AU.role}});await done(j);
       }catch(x){toast(x.message)}
     }
   });
   google.accounts.id.renderButton($('#gb'),{theme:'outline',size:'large',text:su?'signup_with':'signin_with',shape:'rectangular',width:320});
 };
 g();
}
function profilePage(){
 if(!U){location.hash='#/login';return}
 app(`<div class="wrap profile-page"><div class="profile-shell"><div class="profile-head"><div class="profile-avatar-wrap">${av(U.avatarUrl,U.name,U.id,'profile-avatar')}</div><div><div class="eyebrow">ACCOUNT</div><h1>${esc(U.name)}</h1><p class="mu">${U.role==='ARTIST'?'Creator account':'Fan / booker account'} · ${MEM.active?MEM.plan:'Free member'}</p></div></div><form class="box f" id="profileForm"><h2>Profile settings</h2><label>Display name<input name="name" required maxlength="120" value="${esc(U.name)}"></label><label>Profile photo<input name="photo" type="file" accept="image/*"></label><input type="hidden" name="avatarUrl" value="${esc(U.avatarUrl||'')}"><div class="profile-preview">${U.avatarUrl?`<img src="${esc(U.avatarUrl)}" alt="Profile photo">`:'<span>No profile photo yet</span>'}</div><button class="btn" id="profileSave">Save profile</button></form>${U.hasLogin?`<div class="box"><b>Mobile login active</b><p class="mu">You can log in with ${esc(U.phone)} and your password.</p></div>`:`<form class="box f" id="credsForm"><h2>Add mobile &amp; password</h2><p class="mu">Optional: lets you log in without Google.</p><label>Mobile number<input name="phone" inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" required></label><label>Password<input name="password" type="password" minlength="8" required autocomplete="new-password"></label><button class="btn">Save login</button></form>`}<div class="profile-actions"><a class="box action-box" href="#/membership"><b>Membership</b><span>${MEM.active?MEM.plan+' active':'Join Plus or Pro'}</span></a>${U.role==='ARTIST'?'<a class="box action-box" href="#/studio"><b>Creator Studio</b><span>Manage your public profile and posts</span></a>':''}<a class="box action-box" href="#/enquiries"><b>Bookings</b><span>Requests and event reservations</span></a></div></div></div>`);
 $('#profileForm').photo.onchange=async e=>{if(!e.target.files[0])return;try{toast('Uploading profile photo…');$('#profileForm').avatarUrl.value=await up(e.target.files[0]);$('.profile-preview').innerHTML=`<img src="${esc($('#profileForm').avatarUrl.value)}" alt="Profile photo">`;toast('Photo uploaded. Save profile.')}catch(x){toast(x.message)}};
 $('#profileForm').onsubmit=async e=>{e.preventDefault();const f=e.target;$('#profileSave').disabled=true;try{const me=await api('/api/me/profile',{m:'PUT',b:{name:f.name.value,avatarUrl:f.avatarUrl.value||null}});setU(me,T);await loadMembership();nav();toast('Profile updated.')}catch(x){toast(x.message)}finally{$('#profileSave').disabled=false}}
 const cf=$('#credsForm');if(cf)cf.onsubmit=async e=>{e.preventDefault();try{const me=await api('/api/me/credentials',{m:'PUT',b:{phone:cf.phone.value,password:cf.password.value}});setU(me,T);toast('Mobile login added.');profilePage()}catch(x){toast(x.message)}};
}

async function membershipPage(){
 if(!U){location.hash='#/login';return}await loadMembership();
 app(`<div class="wrap membership-page"><div class="membership-hero"><div><span class="premium-badge">YOURFAVSTAR MEMBERSHIP</span><h1>Support the creators you follow.</h1><p class="mu">Plus and Pro unlock creator comments and member booking discounts.</p></div><div class="membership-current"><span>Current plan</span><b>${MEM.plan}</b>${MEM.active?`<small>Active until ${new Date(MEM.expiresAt).toLocaleDateString('en-IN')}</small>`:'<small>Free member</small>'}</div></div><div class="plan-grid" id="plans">Loading plans…</div><div class="box membership-note"><b>Payments</b><p class="mu">The checkout layer is prepared for card / UPI / QR integration. Add your Razorpay keys before taking real payments.</p></div></div>`);
 try{const plans=await api('/api/membership/plans');$('#plans').innerHTML=plans.map(p=>`<div class="plan-card ${p.id==='PRO'?'featured':''}"><span class="premium-badge">${p.id}</span><h2>₹${p.price}<small>/ plan</small></h2><p class="mu">${p.discount}% booking discount · comments enabled</p><ul><li>Comment on creator posts</li><li>${p.discount}% booking discount</li><li>Creator-first feed access</li></ul><button class="btn" onclick="startMembership('${p.id}',${p.price})">Choose ${p.name}</button></div>`).join('')}catch(e){$('#plans').innerHTML=empty(e.message)}
}
function startMembership(plan,price){toast(`${plan} checkout is ready for Razorpay integration. No payment has been charged.`);}

async function postComments(id){
 const el=$('#pc-'+id);if(!el)return;el.innerHTML='<div class="mu">Loading comments…</div>';
 try{const cs=await api('/api/posts/'+id+'/comments');el.innerHTML=(cs.length?cs.map(c=>`<div class="comment-row">${av(c.avatarUrl,c.name,c.id)}<div><b>${esc(c.name)}</b>${c.membershipPlan&&c.membershipPlan!=='FREE'?`<span class="member-tag">${esc(c.membershipPlan)}</span>`:''}<p>${esc(c.body)}</p><small>${ago(c.createdAt)}</small></div></div>`).join(''):'<div class="mu">No comments yet.</div>')+`<form class="comment-form" onsubmit="addPostComment(event,${id})"><input name="body" maxlength="1000" placeholder="Write a comment…"><button class="btn sm">Post</button></form>`}catch(e){el.innerHTML=`<div class="mu">${esc(e.message)}</div>`}
}
async function addPostComment(e,id){e.preventDefault();if(!U){location.hash='#/login';return}if(!MEM.active){toast('Plus or Pro is required to comment.');location.hash='#/membership';return}const f=e.target;try{await api('/api/posts/'+id+'/comments',{m:'POST',b:{body:f.body.value}});postComments(id)}catch(x){toast(x.message)}}
function commentToggle(id){if(!U){toast('Log in to comment.');location.hash='#/login';return}if(!MEM.active){toast('Plus or Pro members can comment.');location.hash='#/membership';return}const el=$('#pc-'+id);el.style.display=el.style.display==='none'?'block':'none';if(el.style.display==='block')postComments(id)}

function rcard(x,i){const d=`class="rp pop" style="--i:${Math.min(i,6)}"`;
 if(x.k==='NEWS')return `<article ${d}><div class="vt"><span style="font-size:22px;padding-top:4px">✦</span></div><div class="rb"><div class="rm"><span class="flair bot">BOT</span><b>YourFavStar</b><span class="mu">· ${ago(x.createdAt)}</span></div><h3><a href="${x.eventId?'#/event/'+x.eventId:'#/discover'}">${esc(x.headline)}</a></h3><p class="mu">${esc(x.body||'')}</p></div></article>`;
 const vt=`<div class="vt"><button class="${VT.has(x.k+'-'+x.id)?'on':''}" onclick="vote('${x.k}',${x.id})">▲</button><b>${x.votes}</b></div>`;
 const hd=`<div class="rm">${av(x.avatarUrl,x.artistName,x.artistId)}<a href="#/artist/${esc(x.artistSlug)}">${esc(x.artistName)}</a><span class="flair">${x.k==='EVENT'?'EVENT':'CREATOR'}</span><span class="mu">· ${ago(x.createdAt)}</span></div>`;
 if(x.k==='EVENT')return `<article ${d}>${vt}<div class="rb">${hd}<h3><a href="#/event/${x.id}">${esc(x.title)}</a></h3><div class="rchips"><span>📍 ${esc(x.city)}</span><span>🗓️ ${fdt(x.startsAt)}</span><span>🎟️ ${x.ticketPrice?inr(x.ticketPrice):'Free'}</span></div>${x.description?`<p>${esc(x.description.slice(0,260))}</p>`:''}<div class="ra"><a href="#/event/${x.id}">💬 ${x.comments||0} comments</a><a href="#/event/${x.id}">Book event</a><button onclick="follow(${x.artistId},this)">${FOL.has(x.artistId)?'Following ✓':'Follow'}</button></div></div></article>`;
 return `<article ${d}>${vt}<div class="rb">${hd}${x.text?`<p>${esc(x.text)}</p>`:''}${media(x)}<div class="ra"><button onclick="commentToggle(${x.id})">💬 ${x.comments||0} Comments</button><a href="#/artist/${esc(x.artistSlug)}">View creator</a><button class="bm ${LIB.p.has(x.id)?'on':''}" style="width:auto;height:auto;border:0" onclick="tog('p',${x.id},this)">🔖 Save</button></div><div id="pc-${x.id}" class="post-comments" style="display:none"></div></div></article>`;
}

post=function(p,i=0,own){return `<article class="post pop" style="--i:${i}"><header><a href="#/artist/${esc(p.artistSlug)}">${av(p.avatarUrl,p.artistName,p.artistId)}${esc(p.artistName)}</a><time>${ago(p.createdAt)}</time>${own?`<button class="btn ghost sm" onclick="delPost(${p.id})">Delete</button>`:`<button class="bm ${LIB.p.has(p.id)?'on':''}" onclick="tog('p',${p.id},this)">🔖</button>`}</header>${p.text?`<p>${esc(p.text)}</p>`:''}${media(p)}<div class="post-actions"><button onclick="commentToggle(${p.id})">💬 ${p.comments||0}</button><a href="#/artist/${esc(p.artistSlug)}">Creator</a></div><div id="pc-${p.id}" class="post-comments" style="display:none"></div></article>`};

async function following(){
 if(!U){location.hash='#/login';return}
 app(`<div class="wrap"><div class="following-head"><div><span class="eyebrow">YOUR FEED</span><h1>Stars you follow.</h1><p class="mu">New posts and events from creators you chose.</p></div></div><div class="rfeed" id="followingFeed">Loading…</div></div>`);
 try{const r=await api('/api/me/following-feed');const list=[...(r.events||[]).map(x=>({...x,k:'EVENT'})),...(r.posts||[]).map(x=>({...x,k:'POST'}))].map(x=>({...x,t:new Date(x.createdAt).getTime(),votes:+x.votes||0}));$('#followingFeed').innerHTML=list.length?list.sort((a,b)=>b.t-a.t).map(rcard).join(''):empty('Follow a creator to build your feed.')}catch(e){$('#followingFeed').innerHTML=empty(e.message)}
}

async function evPage(id){app(`<div class="wrap">${empty('Loading…')}</div>`);try{const r=await api('/api/events/'+id);const e=r.event;app(`<div class="wrap" style="padding:28px 0"><a class="mu" href="#/artist/${esc(e.artistSlug)}">← ${esc(e.artistName)}</a><div class="two" style="margin-top:14px"><div class="box"><span class="eyebrow">CREATOR EVENT</span><h1 style="font-size:clamp(30px,5vw,52px);margin:12px 0">${esc(e.title)}</h1><p class="mu">📍 ${esc(e.venue?e.venue+', ':'')}${esc(e.city)}<br>🗓️ ${fdt(e.startsAt)}<br>🎟️ ${e.ticketPrice?inr(e.ticketPrice):'Free entry'}</p><p style="white-space:pre-wrap">${esc(e.description||'')}</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" onclick="bookEvent(${e.id},${e.ticketPrice||0})">${e.ticketPrice?'Book tickets':'Reserve spot'}</button><a class="btn ghost" href="#/artist/${esc(e.artistSlug)}">Book ${esc(e.artistName)}</a><button class="btn ghost" onclick="follow(${e.artistId},this)">${FOL.has(e.artistId)?'Following ✓':'Follow for updates'}</button></div><p class="mu" style="font-size:12px;margin-top:12px">Plus: 10% booking discount · Pro: 20% booking discount</p></div><div class="box"><h3>Event discussion</h3><p class="mu">${MEM.active?'You can comment as a '+MEM.plan+' member.':'Join Plus or Pro to comment.'}</p><form class="f" onsubmit="cmt(event,${e.id})"><textarea name="body" rows="2" maxlength="500" required placeholder="Say something about this event…"></textarea><button class="btn sm">Comment</button></form>${r.comments.map(c=>`<div class="nw"><b>${esc(c.name)}</b><span>${esc(c.body)}</span><span class="mu">${ago(c.createdAt)}</span></div>`).join('')}</div></div></div>`)}catch(x){app(`<div class="wrap" style="padding:40px 0">${empty(esc(x.message))}</div>`)}}
async function bookEvent(id,price){if(!U){toast('Log in to book this event.');location.hash='#/login';return}if(!price){toast('This event is free — your reservation is being recorded.')}try{const r=await api('/api/events/'+id+'/book',{m:'POST',b:{quantity:1}});toast(`Booking reserved. ${r.discountPercent}% member discount applied.`);location.hash='#/enquiries'}catch(e){toast(e.message)}}

async function bookings(){if(!U){location.hash='#/login';return}app(`<div class="wrap"><h2 class="t" style="margin-top:28px">My event bookings</h2><div class="feed" id="bookingsList">Loading…</div></div>`);try{const r=await api('/api/me/bookings');$('#bookingsList').innerHTML=r.length?r.map(b=>`<div class="box"><b>${esc(b.title)}</b><p class="mu">${esc(b.artistName)} · ${esc(b.city)} · ${fdt(b.startsAt)}</p><p>₹${b.totalAmount.toLocaleString('en-IN')} ${b.discountPercent?`<span class="member-tag">${b.discountPercent}% member discount</span>`:''}</p><span class="st ${b.status}">${b.status}</span></div>`).join(''):empty('No event bookings yet.')}catch(e){$('#bookingsList').innerHTML=empty(e.message)}}

function route2(){const h=location.hash||'#/';if(h.startsWith('#/profile'))profilePage();else if(h.startsWith('#/membership'))membershipPage();else if(h.startsWith('#/following'))following();else if(h.startsWith('#/bookings'))bookings();}

async function startMembership(plan,price){
 if(!U){location.hash='#/login';return}
 try{
   const o=await api('/api/membership/order',{m:'POST',b:{plan}});
   const opts={key:o.keyId,amount:o.amount,currency:o.currency,name:'YourFavStar',description:plan+' Membership',order_id:o.orderId,theme:{color:'#e10600'},prefill:{name:U.name},handler:async function(resp){try{await api('/api/membership/verify',{m:'POST',b:{plan,orderId:resp.razorpay_order_id,paymentId:resp.razorpay_payment_id,signature:resp.razorpay_signature}});await loadMe();await loadMembership();nav();toast(plan+' membership activated for 30 days.');membershipPage()}catch(e){toast(e.message)}}};
   if(!window.Razorpay){throw new Error('Payment checkout could not load. Disable blockers and try again.')}
   new Razorpay(opts).open();
 }catch(e){toast(e.message)}
}

const yfsAuthStyle=document.createElement('style');yfsAuthStyle.textContent=`
.google-button-wrap{display:flex;justify-content:center;min-height:44px;margin:18px 0 10px}
.google-step-title{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:18px 0 8px}
.auth-note{text-align:center;font-size:12px}
.google-selected{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--line,#ddd);border-radius:14px;margin:12px 0 18px;background:rgba(0,0,0,.025)}
.google-selected>div{display:flex;flex-direction:column;gap:2px}.google-check{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#111;color:#fff;font-weight:800}
`;document.head.appendChild(yfsAuthStyle);

// Re-render the auth route after this feature layer replaces the original auth screen,
// including when the site is opened directly at /#/login or /#/signup.

