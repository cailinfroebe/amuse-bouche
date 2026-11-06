const start = Date.UTC(2026,10,4);
const fortnight = 14*86400000;
const now = () => {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',year:'numeric',month:'numeric',day:'numeric'}).formatToParts();
  const part = name => Number(parts.find(item=>item.type===name).value);
  return Math.max(0,Math.floor((Date.UTC(part('year'),part('month')-1,part('day'))-start)/fortnight));
};
const groups = ['home','breakfast','lunch','dinner','snacks','groceries','collaborate','favorites','add','freestyle','profile','inspiration'];

const cash = n=>'$'+n.toFixed(2);
const qty = n=>Number(n.toFixed(2));
const content = document.querySelector('#content');
const get = key=>kitchenGet(key);
const set = (key,value)=>kitchenSet(key,value);
function restoreMenuEdition(){
 const saved=get('amuse-menu-edition');
 if(saved!==null&&/^\d+$/.test(saved))return Number(saved);
 let selected=now();
 try{
  const existing=[];
  const keys=Object.keys(kitchenState);
  for(let i=0;i<keys.length;i++){
   const match=keys[i].match(/^amuse-custom-(\d+)-(breakfast|lunch|dinner|snacks)$/);
   if(match&&Number(match[1])<=now()){
    const menu=readJSON(keys[i],null);
    if(menu?.active&&menu.recipes?.length)existing.push(Number(match[1]));
   }
  }
  if(existing.length)selected=Math.max(...existing);
 }catch{}
 set('amuse-menu-edition',String(selected));
 return selected;
}
let edition = restoreMenuEdition();
const prep = '<strong>Cold storage.</strong> Chill cooked components promptly in shallow containers. Refrigerate jars at 40°F or below and eat within 3–4 days. Freeze extra cooked breakfasts and dinner portions promptly, thaw overnight in the fridge, and reheat leftovers to 165°F. Keep yogurt toppings in the fridge and add after reheating.';
const celiac = '<strong>Check your kitchen preferences.</strong> Use oats labeled gluten-free, check seasonings, protein powder, chocolate, sauces and packaged ingredients for gluten, and use clean utensils and prep surfaces to avoid cross-contact.';
function card(recipe, portions, hint='',category=null){
 const [name,desc,protein,fiber,time,icon,ingredients,method] = recipe;
 return `<article class="card suggested-recipe-card"><div class="recipe-checkerboard" aria-hidden="true"></div><h3>${name}</h3>${recipeSocialActions('suggested-'+encodeURIComponent(name))}<p>${desc}</p>${recipe[8]?.flavor?`<p class="flavor-note">${escapeHTML(recipe[8].flavor.label)}</p>`:''}<p class="meta">~${protein}g protein · ~${fiber}g fiber · ${time} min</p><details><summary>Recipe & ingredients</summary><p>${portions} ${portions===1?'serving':'servings'} · quantities below</p><ul>${Object.entries(ingredients).map(([item,n])=>`<li>${qty(n*portions)} ${pantry[item][0]} ${item}</li>`).join('')}</ul><p>${method}</p><p>${hint}</p></details>${category==='snacks'?treatToggle(name):''}</article>`;
}
function render(){
 if(!kitchenReady)return;
 if(!get('amuse-profile')){renderProfile(true);return}
 stopHomePrompt();
 const base=menus[edition % menus.length];
 const days=planningDays();
 const people=planningPeople();
 
 const active=base;
 const breakfasts=suggestedMenuRecipes('breakfast',cravingSuggestions('breakfast',base.recipes.slice(0,3),3));
 const lunches=suggestedMenuRecipes('lunch',cravingSuggestions('lunch',base.recipes.slice(3,6),3));
 const breakfastSizes=portionSplit(days,breakfasts.length);
 const lunchSizes=portionSplit(days,lunches.length);
 const page = groups.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
 document.body.dataset.page = page;
 if(page!=='home')visibleCravings=[];
 document.querySelectorAll('.logo-crop img').forEach(img=>{img.src=img.closest('footer')||!mealTabs.includes(page)?'branding/wordmark-cream.svg':'branding/wordmark-red.svg'});
 document.body.dataset.theme = mealTabs.includes(page)?'meal':'green';
 const key = 'lunch-club-'+edition;
 const dinners = suggestedMenuRecipes('dinner',cravingSuggestions('dinner',[...extraDinners,...active.recipes.slice(6).filter(Boolean)],Math.min(7,days)).slice(0,days));
 const dinnerServings = dinners.map((_,i)=>(Math.floor(days/dinners.length)+(i<days%dinners.length?1:0))*people);
 const snackOptions=suggestedMenuRecipes('snacks',cravingSuggestions('snacks',snacks,snacks.length));
 document.querySelector('#edition').textContent = `Saved menu · ${planningWeeks()} ${planningWeeks()===1?'week':'weeks'} · ${people} ${people===1?'person':'people'}`;
 document.querySelector('#intro').textContent = active.name+' · '+active.note;
 document.querySelector('#new-menu').hidden=!mealTabs.includes(page);
 document.querySelectorAll('nav a').forEach(a=>{
   if(a.hash==='#'+page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 const lunchBatches=()=>{
  const cards=[];
  for(let first=0;first<days;first+=4){
   const counts=lunches.map(()=>0);
   for(let d=first;d<Math.min(first+4,days);d++)if(lunches.length)counts[d%lunches.length]+=people;
   cards.push(`<div class="panel"><div class="eyebrow">Days ${first+1}–${Math.min(first+4,days)}</div><ul>${counts.map((n,i)=>n?`<li>${n} × ${lunches[i][0]}</li>`:'').join('')}</ul></div>`);
  }
  return `<div class="batches">${cards.join('')}</div>`;
 };
 const schedule = '<p class="notice">'+prep+'</p>';
 const pagePlan=()=>page==='breakfast'?breakfasts.map((recipe,i)=>({recipe,servings:breakfastSizes[i]*people})):page==='lunch'?lunches.map((recipe,i)=>({recipe,servings:lunchSizes[i]*people})):page==='dinner'?dinners.map((recipe,i)=>({recipe,servings:dinnerServings[i]})):snackOptions.map(recipe=>({recipe,servings:6*people}));
 if(mealTabs.includes(page)){
  mealView??=savedMealView(page);
  if(mealView==='choose'){mealChoice(page);renderCravingIdeas(page,pagePlan());return}
  if(mealView==='custom'){customCards(page);renderCravingIdeas(page,pagePlan());return}
  if(mealView==='edit'){customEditor(page);return}
 }

 if(page==='profile'){
   renderProfile();
 }else if(page==='inspiration'){
   renderInspiration();
 }else if(page==='home'){
   renderHome();
 }else if(page==='favorites'){
   renderFavorites();
 }else if(page==='collaborate'){
   renderCollaborate();
 }else if(page==='freestyle'){
   renderFreestyle();
 }else if(page==='add'){
   renderAddItems();
 }else if(page==='groceries'){
   const lines=[];
   const add=(recipe,servings)=>lines.push(...suggestedShoppingLines(recipe,servings));
   if(!customMenu('breakfast').active)breakfasts.forEach((recipe,i)=>add(recipe,breakfastSizes[i]*people));
   if(!customMenu('lunch').active)lunches.forEach((recipe,i)=>add(recipe,lunchSizes[i]*people));
   if(!customMenu('dinner').active)dinners.forEach((recipe,i)=>add(recipe,dinnerServings[i]));
   if(!customMenu('snacks').active)snackOptions.filter(recipe=>selectedTreatNames().includes(recipe[0])).forEach(recipe=>add(recipe,6*people));
   renderUnifiedGroceries([...lines,...customGroceries()]);

 }else{
   const data={
    breakfast:['Breakfast','Fridge- and freezer-friendly breakfasts. Add or remove meals to make this menu yours. Freeze the baked portions individually and buy fresh yogurt for week two if needed.',breakfasts],
    lunch:['Mason jar lunches','Complete, ready-to-eat lunches. Add or remove recipes below. Use wide-mouth quart jars, pack dressing first and shake or tip into a bowl at lunchtime.',lunches],
    dinner:['Easy dinners',`Every recipe below is included in your grocery list. The listed portions add up to ${days*people} servings for ${days} dinners. Freeze extra portions before adding fresh toppings.`,dinners],
    snacks:['Treats','Cookies, muffins and freezer bites. Choose the recipes you want in your plan; their ingredients go straight into your grocery list.',snackOptions]
   }[page];
   content.innerHTML=`<p class="eyebrow">The recipe box</p><h2>${data[0]}</h2><p class="lede">${data[1]}</p><div class="grid">${data[2].map((r,i)=>card(r,page==='snacks'?6*people:page==='lunch'?1:page==='dinner'?dinnerServings[i]:breakfastSizes[i]*people,page==='lunch'?'Multiply ingredients by the number of jars for this batch. Keep cold until lunch.':page==='snacks'?'Refrigerate for 3–4 days or freeze individual portions.':'',page)).join('')}</div>${!data[2].length?'<p class="empty-menu">Your menu is empty. Add a recipe from the options below.</p>':''}${page==='lunch'&&lunches.length?lunchBatches():''}${schedule}<p class="meta">Protein and fiber are rough estimates per serving and vary by ingredients.</p>`;
 }
 if(mealTabs.includes(page)&&mealView==='suggested'){
   const menu=customMenu(page);
   content.querySelectorAll('.grid > .card').forEach((node,index)=>{
    const recipe=pagePlan()[index]?.recipe;if(!recipe)return;
    const button=document.createElement('button');button.className='remove-menu-meal';button.textContent='− Remove from menu';
    button.onclick=()=>{saveSuggestedRecipes(page,pagePlan().map(item=>item.recipe).filter(item=>item[0]!==recipe[0]));if(page==='snacks')set('amuse-treat-selection',JSON.stringify(selectedTreatNames().filter(name=>name!==recipe[0])));render()};
    node.append(button);
   });
   const toolbar=document.createElement('div');
   toolbar.className='menu-toolbar';
   toolbar.innerHTML='<button id="use-suggested">'+(menu.active?'Use suggested menu for groceries':'✓︎ Using suggested menu')+'</button>';
   content.prepend(toolbar);
   content.querySelector('#use-suggested').onclick=()=>{menu.active=false;if(saveCustom(page,menu)){selectMealView(page,'suggested');render()}};
 }
 if(mealTabs.includes(page)&&mealView==='suggested')renderCravingIdeas(page,pagePlan());
}
document.querySelector('#new-menu').onclick=()=>{
 const category=location.hash.slice(1);
 if(!mealTabs.includes(category))return;
 startNewPlan(false);
};
addEventListener('hashchange',()=>{mealView=null;editingRecipe=null;addingToMeal=null;render();window.scrollTo({top:0,behavior:'instant'})});
initializeKitchen();
