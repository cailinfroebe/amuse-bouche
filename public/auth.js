// Only the public Supabase project URL and publishable/anon key reach the browser.
window.Auth={
 client:null,lastUser:null,
 async session(){await this.ready;const {data,error}=await this.client.auth.getSession();if(error)throw error;return data.session},
 async fetch(url,options={}){
  const session=await this.session();const headers=new Headers(options.headers||{});if(session)headers.set('Authorization','Bearer '+session.access_token);
  return fetch(url,{...options,headers});
 },
 async signOut(){const {error}=await this.client.auth.signOut({scope:'local'});if(error)throw error},
 renderLogin(target){
  coverKitchen(false);document.body.dataset.account='locked';document.body.dataset.page='profile';document.body.dataset.theme='green';
  target.innerHTML=`<section class="account-gate profile-invitation"><div class="profile-checker" aria-hidden="true"></div><div class="profile-welcome"><img class="profile-chef" src="icons/chef-512.png" width="512" height="512" alt="The amuse bouche chef"><p class="eyebrow">Your seat at the table</p><h2>Welcome to<br>amuse bouche!</h2><p class="account-help">Sign in or create your kitchen with your email. No ChatGPT account needed.</p><form id="email-login" class="email-login"><label>Your email<input id="login-email" type="email" autocomplete="email" required placeholder="you@example.com"></label><button class="profile-submit" type="submit">Send my sign-in code</button></form><form id="email-verify" class="email-login" hidden><label>Email code<input id="login-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" required placeholder="Enter the code from your email"></label><button class="profile-submit" type="submit">Open my kitchen</button></form><p id="login-status" role="status" class="account-help"></p></div><div class="profile-checker" aria-hidden="true"></div></section>`;
  let email='';const status=target.querySelector('#login-status');
  target.querySelector('#email-login').onsubmit=async event=>{
   event.preventDefault();email=target.querySelector('#login-email').value.trim();const button=event.submitter;button.disabled=true;
   try{const {error}=await this.client.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:location.origin+'/'}});if(error)throw error;target.querySelector('#email-verify').hidden=false;status.textContent='Check your email for a code or sign-in link. You can enter the code here.'}
   catch(error){status.textContent=error.message}finally{button.disabled=false}
  };
  target.querySelector('#email-verify').onsubmit=async event=>{
   event.preventDefault();const button=event.submitter;button.disabled=true;
   try{const {error}=await this.client.auth.verifyOtp({email,token:target.querySelector('#login-code').value.trim(),type:'email'});if(error)throw error;status.textContent='Verified. Opening your kitchen…'}
   catch(error){status.textContent=error.message}finally{button.disabled=false}
  };
 }
};
Auth.ready=(async()=>{
 const response=await fetch('/api/config',{cache:'no-store'});const config=await response.json();if(!response.ok)throw Error(config.error||'Finish the Supabase setup in README.md.');
 if(!window.supabase)throw Error('The sign-in library could not load. Check your internet connection.');
 Auth.client=supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'amuse-bouche-auth'}});
 const {data}=await Auth.client.auth.getSession();Auth.lastUser=data.session?.user.id??null;
 Auth.client.auth.onAuthStateChange((event,session)=>{
  const next=session?.user.id??null;if(next===Auth.lastUser)return;Auth.lastUser=next;
  setTimeout(()=>{if(typeof initializeKitchen==='function')initializeKitchen()},0);
 });
})();
// The page displays the setup error through initializeKitchen's error boundary.
Auth.ready.catch(()=>{});
