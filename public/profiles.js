let kitchenReady=false,kitchenState={},kitchenRevision=0,kitchenUser='',kitchenEmail='',kitchenDirty=false,kitchenSaving=false,kitchenConflict=false,kitchenTimer;
let kitchenGeneration=0,kitchenAbort=null,kitchenIdentityCheck=null;
function kitchenGet(key){return kitchenReady?kitchenState[key]??null:null}
function kitchenMessage(message){const el=document.querySelector('#kitchen-sync');if(el)el.textContent=message}
function kitchenCache(){
 if(!kitchenUser)return;
 try{localStorage.setItem('amuse-account-cache-'+kitchenUser,JSON.stringify({userId:kitchenUser,state:kitchenState,revision:kitchenRevision,dirty:kitchenDirty}))}catch{}
}
function coverKitchen(locked){
 document.body.dataset.sessionLocked=String(locked);
 let cover=document.querySelector('#session-cover');
 if(!cover){cover=document.createElement('div');cover.id='session-cover';cover.setAttribute('role','status');cover.textContent='Checking your account…';document.body.append(cover)}
 cover.hidden=!locked;
}
function resetKitchenMemory(){
 kitchenGeneration++;clearTimeout(kitchenTimer);kitchenAbort?.abort();kitchenAbort=null;
 if(typeof stopHomePrompt==='function')stopHomePrompt();
 kitchenReady=false;kitchenState={};kitchenRevision=0;kitchenUser='';kitchenEmail='';kitchenDirty=false;kitchenSaving=false;kitchenConflict=false;
 if(typeof visibleCravings!=='undefined')visibleCravings=[];
 if(typeof mealView!=='undefined')mealView=null;
 if(typeof editingRecipe!=='undefined')editingRecipe=null;
 if(typeof addingToMeal!=='undefined')addingToMeal=null;
 document.body.dataset.account='locked';content.innerHTML='';kitchenMessage('');
}
function kitchenSet(key,value){
 if(!kitchenReady||kitchenConflict||document.body.dataset.sessionLocked==='true')return false;
 kitchenState[key]=String(value);kitchenDirty=true;kitchenCache();
 clearTimeout(kitchenTimer);kitchenTimer=setTimeout(saveKitchen,650);kitchenMessage('Saving your kitchen…');return true;
}
function kitchenBoundHeaders(user=kitchenUser){return {'Content-Type':'application/json','X-Kitchen-Account':user}}
async function saveKitchen(){
 if(kitchenSaving||kitchenConflict||!kitchenReady)return false;
 if(!kitchenDirty)return true;
 if(!kitchenState['amuse-profile'])return false;
 const generation=kitchenGeneration,user=kitchenUser,revision=kitchenRevision,state={...kitchenState};
 kitchenSaving=true;kitchenDirty=false;
 try{
  const response=await Auth.fetch('/api/kitchen',{method:'PUT',headers:kitchenBoundHeaders(user),body:JSON.stringify({ownerId:user,state,revision})});const result=await response.json();
  if(generation!==kitchenGeneration||user!==kitchenUser)return false;
  if(!response.ok){
   if(response.status===401||result.code==='account_changed'){await initializeKitchen('Your sign-in changed. Choose the right account before continuing.');return false}
   if(response.status===409)kitchenConflict=true;
   throw Error(result.error||'Could not save your kitchen.');
  }
  if(result.userId!==user)throw Error('Account verification failed. Please reload.');
  kitchenRevision=result.revision;kitchenCache();kitchenMessage(kitchenDirty?'Saving your kitchen…':'Saved to your profile');return true;
 }catch(error){
  if(generation!==kitchenGeneration)return false;
  kitchenDirty=true;kitchenCache();kitchenMessage(error.message+' Your changes remain in this account’s device cache.');return false;
 }finally{
  if(generation===kitchenGeneration){kitchenSaving=false;if(kitchenDirty&&!kitchenConflict&&JSON.stringify(state)!==JSON.stringify(kitchenState))setTimeout(saveKitchen,650)}
 }
}
function renderAccountGate(identity,message=''){
 coverKitchen(false);
 content.innerHTML=`<section class="account-gate profile-invitation"><div class="profile-checker" aria-hidden="true"></div><div class="profile-welcome"><img class="profile-chef" src="icons/chef-512.png" alt="The amuse bouche chef" width="512" height="512"><p class="eyebrow">Your kitchen, your account</p><h2>Who’s cooking?</h2><p class="account-identity">Signed in as<br><strong>${escapeHTML(identity.email||'email account '+identity.userId.slice(-6))}</strong></p>${message?`<p class="account-help">${escapeHTML(message)}</p>`:''}<p class="account-help">The same email account opens the same kitchen on every device. For a separate profile, use a different email account.</p><div class="account-gate-actions"><button id="open-my-kitchen" class="primary">Open my kitchen</button><button id="switch-kitchen-account">Use another account</button></div><p class="account-help">If your phone keeps signing in automatically, switch email accounts first, then return here.</p></div><div class="profile-checker" aria-hidden="true"></div></section>`;
 content.querySelector('#open-my-kitchen').onclick=()=>openVerifiedKitchen(identity);
 content.querySelector('#switch-kitchen-account').onclick=switchKitchenAccount;
}
async function initializeKitchen(message=''){
 resetKitchenMemory();coverKitchen(true);document.body.dataset.page='profile';document.body.dataset.theme='green';
 const generation=kitchenGeneration;kitchenAbort=new AbortController();
 try{
  await Auth.ready;
  if(!await Auth.session()){coverKitchen(false);Auth.renderLogin(content);return}
  const response=await Auth.fetch('/api/kitchen?identity=1',{cache:'no-store',signal:kitchenAbort.signal});const result=await response.json();
  if(generation!==kitchenGeneration)return;
  if(response.status===401){coverKitchen(false);Auth.renderLogin(content);return}
  if(!response.ok||!result.userId)throw Error(result.error||'Your account could not be verified.');
  renderAccountGate(result,message);
 }catch(error){if(generation!==kitchenGeneration||error.name==='AbortError')return;coverKitchen(false);content.innerHTML=`<section class="profile-page"><h2>Let’s check your account</h2><p>${escapeHTML(error.message)}</p><button id="retry-profile">Try again</button></section>`;content.querySelector('#retry-profile').onclick=()=>initializeKitchen()}
}
async function openVerifiedKitchen(identity){
 const generation=kitchenGeneration;coverKitchen(true);
 try{
  const response=await Auth.fetch('/api/kitchen',{cache:'no-store',headers:kitchenBoundHeaders(identity.userId),signal:kitchenAbort?.signal});const result=await response.json();
  if(generation!==kitchenGeneration)return;
  if(response.status===401||result.code==='account_changed'){await initializeKitchen('Your sign-in changed. Please check the account below.');return}
  if(!response.ok||result.userId!==identity.userId)throw Error(result.error||'Your kitchen could not be verified.');
  kitchenUser=result.userId;kitchenEmail=result.email||identity.email||'';kitchenState=result.state;kitchenRevision=result.revision;
  let cache;try{cache=JSON.parse(localStorage.getItem('amuse-account-cache-'+kitchenUser))}catch{}
  if(cache?.userId===kitchenUser&&cache.dirty&&cache.revision===kitchenRevision){kitchenState=cache.state;kitchenDirty=true}
  kitchenReady=true;document.body.dataset.account='ready';coverKitchen(false);
  try{localStorage.setItem('amuse-session-account',JSON.stringify({userId:kitchenUser,at:Date.now()}))}catch{}
  edition=restoreMenuEdition();
  if(!kitchenGet('amuse-profile')){renderProfile(true);return}
  render();if(kitchenDirty)saveKitchen();else kitchenMessage('Saved to your profile');
 }catch(error){if(generation!==kitchenGeneration||error.name==='AbortError')return;renderAccountGate(identity,error.message)}
}
async function switchKitchenAccount(){
 kitchenCache();resetKitchenMemory();coverKitchen(true);
 try{localStorage.setItem('amuse-session-account',JSON.stringify({userId:null,at:Date.now()}))}catch{}
 await Auth.signOut();coverKitchen(false);Auth.renderLogin(content);
}
async function verifyKitchenIdentity(){
 if(!kitchenReady||kitchenIdentityCheck)return;
 const user=kitchenUser,generation=kitchenGeneration;coverKitchen(true);
 kitchenIdentityCheck=(async()=>{
  try{
   const response=await Auth.fetch('/api/kitchen?identity=1',{cache:'no-store'});const result=await response.json();
   if(generation!==kitchenGeneration)return;
   if(!response.ok||result.userId!==user){await initializeKitchen('Your sign-in changed. Choose the correct account.');return}
   coverKitchen(false);if(kitchenDirty)saveKitchen();
  }catch{if(generation===kitchenGeneration){resetKitchenMemory();coverKitchen(false);content.innerHTML='<section class="profile-page"><h2>Your kitchen is locked</h2><p>We couldn’t verify your sign-in. Reload when you’re connected.</p><button id="retry-profile">Check my account</button></section>';content.querySelector('#retry-profile').onclick=()=>initializeKitchen()}}
 })();
 try{await kitchenIdentityCheck}finally{kitchenIdentityCheck=null}
}
function renderProfile(first=false){
 document.body.dataset.page='profile';document.body.dataset.theme='green';
 const profile=kitchenPreferences();const diets=first?{}:{...profile.diets};const allergies=new Set(profile.allergies);
 content.innerHTML=`<section class="profile-page profile-maker"><div class="profile-invitation"><div class="profile-checker" aria-hidden="true"></div><div class="profile-welcome"><span class="profile-side-note">your seat at the table</span><img class="profile-chef" src="icons/chef-512.png" alt="The amuse bouche chef" width="512" height="512"><p class="eyebrow">Good food. Your way.</p><h2>${first?'Welcome to<br>amuse bouche!':`Hello, ${escapeHTML(profile.name||'chef')}!`}</h2><p>Let’s make a little room<br>for the way you like to eat.</p></div><form id="profile-form" class="profile-preferences"><div class="profile-step"><span>01</span><h3>A little about your kitchen</h3></div><label>Your name<input id="profile-name" required maxlength="60" autocomplete="given-name" value="${escapeHTML(profile.name??'')}" placeholder="What should we call you?"></label><div class="profile-fields"><label>People at your table<input id="profile-people" required type="number" min="1" max="50" value="${planningPeople()}"></label><label>Weeks to plan<input id="profile-weeks" required type="number" min="1" max="52" value="${planningWeeks()}"></label></div><div class="profile-step"><span>02</span><h3>Made to suit you</h3></div><p class="profile-field-note">Pick any that fit. Leave them off for the full recipe collection.</p><div class="preference-pills" aria-label="Dietary preferences">${dietChoices.map(([key,label])=>`<button type="button" data-diet="${key}" aria-pressed="${!!diets[key]}">${label}</button>`).join('')}</div><p class="profile-field-note">Sugar free means no added sugar here. Fruit and plain dairy can still contain natural sugar.</p><fieldset class="allergy-fieldset"><legend>Any allergies?</legend><div class="preference-pills">${allergyChoices.map(name=>`<button type="button" data-allergy="${name}" aria-pressed="${allergies.has(name)}">${name}</button>`).join('')}</div></fieldset><label>Other ingredients to avoid<input id="profile-avoid" maxlength="250" value="${escapeHTML(profile.avoid)}" placeholder="e.g. celery, coconut, mushrooms"></label><p class="profile-field-note">We filter ingredient mentions. Check product labels and cross-contact information for your allergies, including imported recipes.</p><div class="profile-step"><span>03</span><h3>Easy on your time & wallet</h3></div><div class="profile-fields"><label>Weekly grocery budget ($)<input id="profile-budget" type="number" min="0" max="10000" step="1" value="${profile.budget||''}" placeholder="Optional"></label><label>Preferred cooking time<select id="profile-time">${[15,30,45,60].map(n=>`<option value="${n}" ${profile.maxMinutes===n?'selected':''}>Up to ${n} minutes</option>`).join('')}</select></label></div><p class="profile-field-note">Budget is for your whole household, per week. Prices are estimates; we prioritize recipes that fit.</p><label>How do you like to cook?<select id="profile-skill">${[['beginner','Keep it very easy'],['comfortable','A little cooking is lovely'],['adventurous','I’m up for an adventure']].map(([key,label])=>`<option value="${key}" ${(profile.skill||'beginner')===key?'selected':''}>${label}</option>`).join('')}</select></label><button class="profile-submit" type="submit">${first?'Let’s get cooking!':'Save my kitchen'}</button><p id="profile-status" role="status"></p></form><div class="profile-checker" aria-hidden="true"></div></div>${!first?'<div class="profile-extras"><a class="button-link" href="#inspiration">My recipe inspiration</a><details><summary>Account & saving</summary><p id="profile-sync-copy">Your kitchen saves to your signed-in profile.</p><button id="retry-kitchen-save">Retry save</button><button id="reload-kitchen">Reload saved kitchen</button><p><a href="#profile" data-switch-account target="_top">Sign out / use another account</a></p></details></div>':''}</section>`;
 content.querySelectorAll('[data-diet]').forEach(button=>button.onclick=()=>{const key=button.dataset.diet;diets[key]=!diets[key];button.setAttribute('aria-pressed',String(diets[key]))});
 content.querySelectorAll('[data-allergy]').forEach(button=>button.onclick=()=>{const name=button.dataset.allergy;allergies.has(name)?allergies.delete(name):allergies.add(name);button.setAttribute('aria-pressed',String(allergies.has(name)))});
 content.querySelector('#profile-form').insertAdjacentHTML('afterbegin',`<p class="profile-field-note">Signed in as ${escapeHTML(kitchenEmail||'your verified email account')}. <a href="#profile" data-switch-account>Use another account</a></p>`);
 content.querySelector('#profile-form').onsubmit=async event=>{
  event.preventDefault();const name=content.querySelector('#profile-name').value.trim();if(!name)return;
  const people=Number(content.querySelector('#profile-people').value),weeks=Number(content.querySelector('#profile-weeks').value),budget=Number(content.querySelector('#profile-budget').value)||0;
  if(!Number.isInteger(people)||people<1||people>50||!Number.isInteger(weeks)||weeks<1||weeks>52||budget<0||budget>10000)return;
  const next={name,diets,allergies:[...allergies],avoid:content.querySelector('#profile-avoid').value.trim(),budget,maxMinutes:Number(content.querySelector('#profile-time').value),skill:content.querySelector('#profile-skill').value};
  kitchenSet('amuse-profile',JSON.stringify(next));kitchenSet('amuse-plan-people',people);kitchenSet('amuse-plan-weeks',weeks);edition=restoreMenuEdition();
  const button=event.submitter;button.disabled=true;content.querySelector('#profile-status').textContent='Setting your place at the table…';const saved=await saveKitchen();button.disabled=false;
  if(!saved||kitchenDirty){const status=content.querySelector('#profile-status');if(status)status.textContent='Your profile could not be saved yet. Please check your sign-in and try again.';return}
  location.hash='#home';render();
 };
 content.querySelector('#retry-kitchen-save')?.addEventListener('click',()=>saveKitchen());
 content.querySelector('#reload-kitchen')?.addEventListener('click',()=>location.reload());
}
function inspirationURL(raw){try{const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password)return '';return url.href}catch{return ''}}
function renderInspiration(){
 const saved=readJSON('amuse-inspiration',[]),links=readJSON('amuse-inspiration-collections',{});
 content.innerHTML=`<section class="profile-page"><p class="eyebrow">Ideas worth keeping</p><h2>amuse bouche inspiration</h2><p class="lede">Keep your favorite recipe links together. You can name your social collections <strong>amuse bouche</strong> too.</p><section class="panel"><h3>Your collection links</h3><p class="field-help">These are bookmarks, not connected accounts or automatic imports. A collection name alone doesn’t grant account access.</p><form id="collection-links">${['Pinterest','Instagram','Facebook'].map(name=>`<label>${name} collection link <input type="url" id="link-${name.toLowerCase()}" value="${escapeHTML(links[name]??'')}" placeholder="https://…"></label>`).join('')}<button>Save collection links</button><p id="collection-status" role="status"></p></form><div class="recipe-actions">${Object.entries(links).filter(([,url])=>inspirationURL(url)).map(([name,url])=>`<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Open ${escapeHTML(name)} collection</a>`).join('')}</div></section><section class="panel"><h3>Save a recipe idea</h3><form id="inspo-form"><label>Recipe or post link<input type="url" id="inspo-url" required placeholder="https://…"></label><label>A little reminder<input id="inspo-title" maxlength="150" placeholder="e.g. Mom’s crispy chicken bowls"></label><button>Save to my inspiration</button></form></section><div class="grid">${saved.map(item=>`<article class="card"><h3>${escapeHTML(item.title)}</h3><a href="${escapeHTML(inspirationURL(item.url))}" target="_blank" rel="noopener noreferrer">Open original</a><button data-remove-inspo="${escapeHTML(item.id)}">Remove</button></article>`).join('')}</div><p class="field-help">For a complete recipe import, use its original recipe website in Build your own menu. A saved social link may not contain accessible ingredients or steps.</p></section>`;
 content.querySelector('#collection-links').onsubmit=event=>{event.preventDefault();const next={};for(const name of ['Pinterest','Instagram','Facebook']){const raw=content.querySelector('#link-'+name.toLowerCase()).value.trim();if(raw&&!inspirationURL(raw)){content.querySelector('#collection-status').textContent='Use complete https:// links.';return}if(raw)next[name]=raw}set('amuse-inspiration-collections',JSON.stringify(next));render()};
 content.querySelector('#inspo-form').onsubmit=event=>{event.preventDefault();const url=inspirationURL(content.querySelector('#inspo-url').value);if(!url)return;saved.unshift({id:crypto.randomUUID(),url,title:content.querySelector('#inspo-title').value.trim()||new URL(url).hostname});set('amuse-inspiration',JSON.stringify(saved));render()};
 content.querySelectorAll('[data-remove-inspo]').forEach(button=>button.onclick=()=>{set('amuse-inspiration',JSON.stringify(saved.filter(item=>item.id!==button.dataset.removeInspo)));render()});
}

document.addEventListener('click',event=>{if(event.target.closest('[data-switch-account]')){event.preventDefault();switchKitchenAccount()}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){if(kitchenReady){kitchenCache();coverKitchen(true);clearTimeout(kitchenTimer)}}else verifyKitchenIdentity()});
addEventListener('focus',()=>verifyKitchenIdentity());
addEventListener('pagehide',()=>{kitchenCache();clearTimeout(kitchenTimer);coverKitchen(true)});
addEventListener('pageshow',event=>{if(event.persisted)initializeKitchen()});
addEventListener('storage',event=>{if(event.key==='amuse-session-account'&&kitchenReady){let session;try{session=JSON.parse(event.newValue)}catch{}if(session?.userId!==kitchenUser)initializeKitchen('The account changed in another tab.')}});
