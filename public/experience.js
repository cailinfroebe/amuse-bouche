let visibleCravings=[];
let homePromptTimer;
const cravingExamples=["I'm feeling like Asian-inspired meals","Give me sweet treat recipe ideas","Healthy fall treats and fresh lunches","Quick dinners with chicken and shrimp"];
const mealLabel=category=>({breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snacks:'Treats'}[category]??category);
const planningWeeks=()=>Math.min(52,Math.max(1,Math.round(Number(get('amuse-plan-weeks'))||2)));
const planningDays=()=>planningWeeks()*7;
const planningPeople=()=>Math.min(50,Math.max(1,Math.round(Number(get('amuse-plan-people'))||1)));
const recipeServings=recipe=>recipe.servings*planningPeople();
const portionSplit=(total,count)=>Array.from({length:count},(_,i)=>Math.floor(total/count)+(i<total%count?1:0));
const cravingHistory=()=>readJSON('amuse-cravings',[]);
const cravingThemes={
 asian:{input:/asian|ginger|teriyaki|sesame|sushi|thai|japanese|chinese|korean|peanut/i,recipe:/ginger|tamari|sesame|teriyaki|sushi|edamame|curry|peanut/ig},
 fall:{input:/fall|autumn|pumpkin|cozy|cinnamon|apple/i,recipe:/pumpkin|apple|cinnamon|sweet potato|chili|bake|walnut/ig},
 fresh:{input:/fresh|salad|crunch|light|lemon|healthy/i,recipe:/salad|jar|crunch|cucumber|lemon|lime|quinoa|broccoli/ig},
 sweet:{input:/sweet|treat|dessert|cookie|chocolate|muffin/i,recipe:/chocolate|cookie|muffin|banana|oat|pumpkin|peach|apple|blueberry/ig},
 spicy:{input:/spicy|heat|chili|chilli|hot/i,recipe:/chipotle|chili|chilli|spicy|hot honey|curry/ig},
 tangy:{input:/sour|tangy|pickle|vinegar/i,recipe:/lime|lemon|pickle|yogurt|dill|feta/ig},
 german:{input:/german|germany/i,recipe:/potato|cabbage|dill|beef|apple/ig},
 mexican:{input:/mexican|taco|salsa|chipotle|tex.mex/i,recipe:/taco|salsa|chipotle|black bean|street corn/ig},
 easy:{input:/easy|quick|simple|busy|cheap|budget/i,recipe:/sheet.pan|tray|skillet|jar|one.pan/ig}
};
function activeCravings(){
 const themes=new Set();
 for(const entry of cravingHistory()){
  for(const [name,rule] of Object.entries(cravingThemes)){
   if(rule.input.test(entry.text)){
    const avoided=new RegExp('(?:no|avoid|without|not|skip)\\s+(?:more\\s+)?'+name,'i').test(entry.text);
    if(avoided)themes.delete(name);else themes.add(name);
   }
  }
 }
 return [...themes];
}
function selectedTreatNames(){
 const saved=readJSON('amuse-treat-selection',null);
 if(Array.isArray(saved))return saved;
 const key='lunch-club-'+edition;
 const legacy=get(key+'-snack-name');
 if(legacy!==null)return legacy?[legacy]:[];
 const index=get(key+'-snack');
 if(index!==null)return snacks[Number(index)]?[snacks[Number(index)][0]]:[];
 return snacks.map(recipe=>recipe[0]);
}
function treatToggle(name){
 const included=selectedTreatNames().includes(name);
 return `<button class="treat-toggle" data-treat-toggle="${escapeHTML(name)}" aria-pressed="${included}">${included?uiIcon('check')+' In my plan':uiIcon('plus')+' Add to my plan'}</button>`;
}
function builtInRecipes(category){
 const recipes=category==='snacks'?snacks:category==='dinner'?[...extraDinners,...menus.flatMap(menu=>menu.recipes.slice(6)).filter(Boolean)]:menus.flatMap(menu=>menu.recipes.slice(category==='breakfast'?0:3,category==='breakfast'?3:6));
 return [...new Map([...recipes,...expandedRecipes[category],...familyRecipes[category]].map(recipe=>[recipe[0],recipe])).values()].filter(profileRecipeAllowed);
}
const cravingCuisines={
 mexican:/\b(?:mexican|tex[ -]?mex)\b/i,
 greek:/\bgreek\b/i,
 mediterranean:/\bmediterranean\b/i,
 korean:/\bkorean\b/i,
 thai:/\bthai\b/i,
 indian:/\bindian\b/i,
 german:/\b(?:german|germany)\b/i,
 italian:/\bitalian\b/i,
 moroccan:/\b(?:moroccan|north african)\b/i,
 cuban:/\b(?:cuban|caribbean)\b/i,
 asian:/\b(?:asian|japanese|chinese)\b/i
};
function cravingScope(text){return [['breakfast',/breakfast/],['lunch',/lunch/],['dinner',/dinner/],['snacks',/dessert|sweet treat|cookie|brownie|snack/]].filter(([,rule])=>rule.test(text)).map(([name])=>name)}
function requestedCuisines(category){
 let wanted=[];
 for(const entry of cravingHistory()){
  const query=entry.text.toLowerCase();const scope=cravingScope(query);
  if(scope.length&&!scope.includes(category))continue;
  const positive=query.replace(/(?:no|without|avoid|skip|not)\s+(?:any\s+)?[a-z]+/g,'');
  const next=Object.entries(cravingCuisines).filter(([,rule])=>rule.test(positive)).map(([name])=>name);
  if(next.length)wanted=next;
 }
 return wanted;
}
function matchesCuisine(recipe,wanted){
 if(!wanted.length)return true;
 const tags=(recipe[8]?.tags??[]).join(' ');const text=recipe[0]+' '+tags;
 const inferred={mexican:/taco|chipotle|street corn|enchilada|fajita|salsa|tex.mex/i,greek:/greek|tzatziki/i,mediterranean:/greek|mediterranean|antipasto/i,korean:/korean|kimchi/i,thai:/thai/i,indian:/indian|tikka|garam masala|chai/i,german:/german|sauerkraut/i,italian:/italian|antipasto/i,moroccan:/moroccan/i,cuban:/cuban|caribbean/i,asian:/asian|korean|thai|japanese|chinese|sesame|teriyaki|sushi|tamari|peanut.ginger/i};
 return wanted.some(name=>cravingCuisines[name].test(text)||inferred[name].test(text));
}
function cravingRanked(category){
 const stop=new Set('want wants wanting like love craving cravings recipe recipes ideas meal meals give really this week inspired please some with that lunch lunches dinner dinners breakfast breakfasts treat treats healthy health fresh food foods something make more would could feel feeling looking prep'.split(' '));
 const normalize=text=>text.toLowerCase().replace(/bbq/g,'barbecue').replace(/germany/g,'german').replace(/asian-inspired/g,'asian').replace(/[-–]/g,' ');
 const entries=cravingHistory().slice(-20);
 const cuisines=requestedCuisines(category);
 return builtInRecipes(category).map((recipe,index)=>{
  const tags=recipe[8]?.tags??[];
  const title=normalize(recipe[0]);
  const tagText=normalize(tags.join(' '));
  const ingredients=normalize(Object.keys(recipe[6]).join(' '));
  let score=0,reason='',best=0;
  entries.forEach((entry,entryIndex)=>{
   const query=normalize(entry.text);
   const scopes=cravingScope(query);
   if(scopes.length&&!scopes.includes(category))return;
   const negatives=[...query.matchAll(/(?:no|without|avoid|skip|not)\s+(?:any\s+)?([a-z]+)/g)].map(match=>match[1]);
   if(negatives.some(word=>(title+' '+ingredients+' '+tagText).includes(word))) {score=-Infinity;return}
   const positive=query.replace(/(?:no|without|avoid|skip|not)\s+(?:any\s+)?[a-z]+/g,'');
   const words=[...new Set((positive.match(/[a-z]{3,}/g)??[]).filter(word=>!stop.has(word)))];
   const has=(text,word)=>text.split(/[^a-z]+/).some(token=>token===word||token===word+'s'||token+'s'===word);
   let match=words.reduce((sum,word)=>sum+(has(title,word)?6:has(tagText,word)?5:has(ingredients,word)?3:0),0);
   for(const [name,rule] of Object.entries(cravingThemes)){
    if(rule.input.test(positive)&&new RegExp(rule.recipe.source,'i').test(title+' '+tagText))match+=1;
   }
   if(/vegetarian|meatless/.test(positive)&&/chicken|beef|tuna|shrimp/.test(ingredients))match=0;
   if(/vegan/.test(positive)&&/chicken|beef|tuna|shrimp|egg|yogurt|cheese|feta|honey/.test(ingredients))match=0;
   const weighted=match*Math.pow(.75,entries.length-1-entryIndex);
   score+=weighted;
   if(weighted>best){best=weighted;reason=entry.text}
  });
  if(!matchesCuisine(recipe,cuisines))return {recipe,score:-Infinity,index,reason:''};
  if(cuisines.length&&score>0){score+=20;reason=[...entries].reverse().find(entry=>cuisines.some(name=>cravingCuisines[name].test(entry.text)))?.text??reason}
  return {recipe,score:score+(score>0?preferenceRecipeScore(recipe):0),index,reason};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
}
function cravingSuggestions(category,fallback,count){
 const ranked=cravingRanked(category);
 const matches=ranked.filter(item=>item.score>0);
 if(matches.length)return matches.slice(0,count).map(item=>item.recipe);
 if(requestedCuisines(category).length)return [];
 const pool=[...new Map([...fallback.filter(profileRecipeAllowed),...builtInRecipes(category)].map(recipe=>[recipe[0],recipe])).values()];
 return pool.sort((a,b)=>preferenceRecipeScore(b)-preferenceRecipeScore(a)).slice(0,count);
}
const moreRecipeCounts={};
function suggestedMenuRecipes(category,defaults){
 const names=readJSON('amuse-suggested-'+edition+'-'+category,null);
 if(!Array.isArray(names))return defaults.filter(profileRecipeAllowed);
 const library=builtInRecipes(category);
 return names.map(name=>library.find(recipe=>recipe[0]===name)).filter(Boolean);
}
function saveSuggestedRecipes(category,recipes){
 set('amuse-suggested-'+edition+'-'+category,JSON.stringify(recipes.map(recipe=>recipe[0])));
}
function startNewPlan(clearCravings=false){
 edition+=1;set('amuse-menu-edition',String(edition));
 for(const tab of mealTabs){saveCustom(tab,{active:true,recipes:[]});set('amuse-meal-view-'+edition+'-'+tab,JSON.stringify('choose'));delete moreRecipeCounts[tab]}
 set('amuse-treat-selection',JSON.stringify([]));
 if(clearCravings){set('amuse-cravings','[]');visibleCravings=[]}
 editingRecipe=null;addingToMeal=null;mealView=null;
 render();window.scrollTo({top:0,behavior:'instant'});
}
function renderCravingIdeas(category,plan){
 const menu=customMenu(category);
 const inMenu=new Set(menu.active?menu.recipes.map(recipe=>recipe.name):plan.map(item=>item.recipe[0]));
 const available=cravingRanked(category).filter(item=>!inMenu.has(item.recipe[0])&&item.score!==-Infinity);
 const matches=cravingHistory().length?available.filter(item=>item.score>0).slice(0,6):[];
 const matched=new Set(matches.map(item=>item.recipe[0]));
 const others=available.filter(item=>!matched.has(item.recipe[0]));
 const limit=moreRecipeCounts[category]??6;
 const choices=[...matches,...others.slice(0,limit)];
 const section=document.createElement('section');section.className='craving-ideas';
 const recipeCard=({recipe,reason},matched)=>`<article class="card suggested-recipe-card"><div class="recipe-checkerboard" aria-hidden="true"></div><h3>${escapeHTML(recipe[0])}</h3>${matched?`<p class="craving-match">Inspired by: “${escapeHTML(reason)}”</p>`:''}<p>${escapeHTML(recipe[1])}</p><details><summary>Ingredients & simple steps</summary><ul>${suggestedObject(recipe,category).ingredients.map(line=>`<li>${escapeHTML(line)}</li>`).join('')}</ul><ol>${suggestedObject(recipe,category).steps.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol></details><button data-craving-add="${escapeHTML(recipe[0])}">＋ Add to my menu</button></article>`;
 section.innerHTML=`${matches.length?`<p class="eyebrow">Inspired by your cravings</p><h3>Picked for what you’re craving</h3><div class="grid">${matches.map(item=>recipeCard(item,true)).join('')}</div>`:''}<h3>Explore more ${mealLabel(category).toLowerCase()}</h3><p>More recipes to mix into your menu. These are different from your current meals and the craving picks above.</p><div class="grid">${others.slice(0,limit).map(item=>recipeCard(item,false)).join('')}</div>${others.length>limit?'<button data-more-recipes>Show more recipes</button>':''}${!available.length?'<p>No more recipes match these cravings in this collection. Try another cuisine or flavor to explore more.</p>':''}`;
 content.append(section);
 section.querySelector('[data-more-recipes]')?.addEventListener('click',()=>{moreRecipeCounts[category]=limit+6;render()});
 section.querySelectorAll('[data-craving-add]').forEach(button=>button.onclick=()=>{
  const recipe=choices.find(item=>item.recipe[0]===button.dataset.cravingAdd)?.recipe;if(!recipe)return;
  if(mealView==='suggested'){
   saveSuggestedRecipes(category,[...plan.map(item=>item.recipe),recipe]);
   menu.active=false;saveCustom(category,menu);
   if(category==='snacks')set('amuse-treat-selection',JSON.stringify([...new Set([...selectedTreatNames(),recipe[0]])]));
  }else{
   if(!menu.recipes.some(item=>item.name===recipe[0]))menu.recipes.push({...suggestedObject(recipe,category),id:crypto.randomUUID()});
   menu.active=true;if(!saveCustom(category,menu))return;selectMealView(category,'custom');
  }
  render();
 });
}
function suggestedObject(recipe,category){
 return {id:'suggested-'+encodeURIComponent(recipe[0]),name:recipe[0],category,yield:1,servings:category==='snacks'?6:4,ingredients:Object.entries(recipe[6]).map(([name,n])=>qty(n)+' '+pantry[name][0]+' '+name),steps:instructionLines(recipe[7]),description:recipe[1],url:''};
}
function recipeLibrary(){
 const all=mealTabs.flatMap(category=>[
  ...builtInRecipes(category).map(recipe=>suggestedObject(recipe,category)),
  ...customMenu(category).recipes.map(recipe=>({...recipe,id:'custom-'+recipe.id,category}))
 ]);
 return [...new Map([...all,...readJSON('amuse-favorites',[]),...readJSON('amuse-from-friends',[])].map(recipe=>[recipe.id,recipe])).values()];
}
function recipeSocialActions(id){
 const saved=readJSON('amuse-favorites',[]).some(recipe=>recipe.id===id);
 return `<div class="social-actions"><button data-favorite="${escapeHTML(id)}" aria-pressed="${saved}">${uiIcon('heart',saved)} ${saved?'Saved':'Favorite'}</button><button data-share="${escapeHTML(id)}">Share ↗︎</button></div>`;
}
function stopHomePrompt(){if(homePromptTimer){clearInterval(homePromptTimer);homePromptTimer=undefined}}
function renderHome(){
 const history=visibleCravings;
 content.innerHTML=`<section class="home-intro"><div><p class="eyebrow">amuse bouche · a little prep, a lot of good</p><h1>meal prep and grocery shopping just got easier</h1></div><div class="home-art"><img src="table.svg" alt="A sketched dinner table set for a good meal"></div></section><section class="craving-section"><h2>what are you craving this week?</h2><div class="craving-conversation" role="log" aria-live="polite" aria-label="Your craving messages" ${history.length?'':'hidden'}>${history.map(entry=>`<div class="craving-entry"><p class="craving-message">${escapeHTML(entry.text)}</p><small class="craving-message-state">Sent <span aria-hidden="true">${uiIcon('check')}</span></small></div>`).join('')}</div><form id="craving-form" class="craving-form"><label class="sr-only" for="craving-input">Tell us what you’re craving</label><input id="craving-input" autocomplete="off" required placeholder="${escapeHTML(cravingExamples[0])}"><button type="submit" aria-label="Update my suggested recipes">↗︎</button></form><p class="craving-help">Keep sending ideas to shape your menu.</p><div class="fresh-start"><button id="start-fresh">Refresh / start fresh</button><p>Clears menus and cravings. Keeps favorites, added grocery items and kitchen settings.</p></div></section><section class="kitchen-plan"><div class="kitchen-heading"><div><p class="eyebrow">Make room for a good week</p><h2>your kitchen plan</h2></div><div class="plan-settings"><label>Weeks <input id="plan-weeks" required type="number" min="1" max="52" step="1" value="${planningWeeks()}"></label><label>People <input id="plan-people" required type="number" min="1" max="50" step="1" value="${planningPeople()}"></label></div></div><p>${planningDays()} days · ${planningPeople()} ${planningPeople()===1?'person':'people'} · servings and groceries scale to your kitchen plan.</p><div class="kitchen-links">${mealTabs.map(category=>`<a href="#${category}"><span>${mealLabel(category).toLowerCase()}</span><small>${customMenu(category).active?'Your custom menu':'Suggested menu'}</small><span aria-hidden="true">↗︎</span></a>`).join('')}</div><a class="home-grocery-link" href="#groceries">Open your grocery list →</a><p class="craving-help">Custom recipe quantities are set per person and scaled by the people count. Prep refrigerated lunches in batches of 3–4 days.</p></section>`;
 content.querySelector('#start-fresh').onclick=()=>startNewPlan(true);
 const thread=content.querySelector('.craving-conversation');
 thread.scrollTop=thread.scrollHeight;
 const field=content.querySelector('#craving-input');
 let index=0;
 homePromptTimer=setInterval(()=>{
  if(document.body.dataset.page!=='home'||field.value||document.activeElement===field)return;
  field.placeholder=cravingExamples[++index%cravingExamples.length];
 },3200);
 content.querySelector('#craving-form').onsubmit=event=>{
  event.preventDefault();
  const text=field.value.trim();if(!text)return;
  const history=cravingHistory();history.push({text,at:Date.now()});
  visibleCravings.push(history[history.length-1]);
  set('amuse-cravings',JSON.stringify(history));
  render();content.querySelector('.craving-entry:last-child')?.classList.add('just-sent');content.querySelector('#craving-input').focus();
 };
 for(const [id,key,max] of [['plan-weeks','amuse-plan-weeks',52],['plan-people','amuse-plan-people',50]]){
  content.querySelector('#'+id).onchange=event=>{
   const value=Number(event.target.value);
   if(!Number.isInteger(value)||value<1||value>max){event.target.reportValidity();return}
   set(key,String(value));render();content.querySelector('#'+id).focus();
  };
 }

}
function collectionCard(recipe){
 return `<article class="card"><p class="eyebrow">${escapeHTML(mealLabel(recipe.category??'Recipe'))}</p><h3>${escapeHTML(recipe.name)}</h3><p class="meta">Recipe makes ${recipe.yield} servings</p>${recipeSocialActions(recipe.id)}<details><summary>Ingredients & simple steps</summary><ul>${recipe.ingredients.map(line=>`<li>${escapeHTML(line)}</li>`).join('')}</ul><ol>${recipe.steps.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol></details><div class="recipe-actions"><label>Add to <select data-add-category="${escapeHTML(recipe.id)}">${mealTabs.map(category=>`<option value="${category}" ${recipe.category===category?'selected':''}>${mealLabel(category)}</option>`).join('')}</select></label><button data-add-saved="${escapeHTML(recipe.id)}">Add to my menu</button></div></article>`;
}
function renderFavorites(){
 const recipes=readJSON('amuse-favorites',[]);
 content.innerHTML=`<p class="eyebrow">The keepers</p><h2>Favorites</h2><p class="lede">All the recipes you want to come back to. Favorite a suggestion, your own recipe, or something shared by a friend.</p><p id="social-status" role="status"></p>${recipes.length?`<div class="grid">${recipes.map(collectionCard).join('')}</div>`:'<div class="empty-menu"><h3>A little collection of good things.</h3><p>Tap Favorite on a recipe to keep it here.</p><a href="#lunch">Find a lunch recipe →</a></div>'}`;
}
function shareText(recipe){
 return recipe.name+'\nServes '+recipe.yield+(recipe.url?'\nOriginal recipe '+recipe.url:'')+'\n\nIngredients\n'+recipe.ingredients.join('\n')+'\n\nInstructions\n'+recipe.steps.map((step,i)=>(i+1)+'. '+step).join('\n');
}
async function shareRecipe(recipe){
 const text=shareText(recipe);
 try{
  if(navigator.share){await navigator.share({title:recipe.name,text});return}
  await navigator.clipboard.writeText(text);
  showSocialStatus('Recipe copied. Paste it in a message to your friend.');
 }catch(error){if(error.name!=='AbortError')showSocialStatus('Sharing is unavailable in this browser. Open Collaborate to download a recipe card.')}
}
function showSocialStatus(message){
 let status=document.querySelector('#social-status');
 if(!status){status=document.createElement('p');status.id='social-status';status.setAttribute('role','status');content.prepend(status)}
 status.textContent=message;
}
function renderCollaborate(){
 content.innerHTML=`<section class="construction-page"><p class="eyebrow">Coming soon</p><h2>Collaborate</h2><p>Recipe sharing with friends is under construction.</p></section>`;
}
document.addEventListener('click',event=>{
 const treat=event.target.closest('[data-treat-toggle]');
 if(treat){
  const selected=selectedTreatNames();
  const name=treat.dataset.treatToggle;
  set('amuse-treat-selection',JSON.stringify(selected.includes(name)?selected.filter(item=>item!==name):[...selected,name]));
  render();return;
 }
 const favorite=event.target.closest('[data-favorite]');
 const share=event.target.closest('[data-share]');
 const add=event.target.closest('[data-add-saved]');
 const id=favorite?.dataset.favorite??share?.dataset.share??add?.dataset.addSaved;
 if(!id)return;
 const recipe=recipeLibrary().find(recipe=>recipe.id===id);if(!recipe)return;
 if(favorite){
  const list=readJSON('amuse-favorites',[]);
  const exists=list.some(item=>item.id===id);
  set('amuse-favorites',JSON.stringify(exists?list.filter(item=>item.id!==id):[...list,recipe]));
  render();
 }else if(share)shareRecipe(recipe);
 else{
  const category=[...content.querySelectorAll('[data-add-category]')].find(select=>select.dataset.addCategory===id).value;
  const menu=customMenu(category);
  if(menu.recipes.some(item=>item.originKey===id)){showSocialStatus('This recipe is already in your '+category+' menu.');return}
  menu.recipes.push({...recipe,id:crypto.randomUUID(),originKey:id,mealId:undefined,servings:4});
  menu.active=true;
  if(saveCustom(category,menu)){selectMealView(category,'custom');showSocialStatus('Added to your '+category+' menu.')}
 }
});
