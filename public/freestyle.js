let freestyleVariation=0;
function freestyleRecipe(){return readJSON('amuse-freestyle-result',null)}
function freestyleResultHTML(recipe){
 if(!recipe)return '';
 return `<article class="card freestyle-result"><div class="recipe-checkerboard" aria-hidden="true"></div><p class="eyebrow">Your fridge, reimagined</p><h3>${escapeHTML(recipe.name)}</h3><p>${escapeHTML(recipe.description)}</p><p class="meta">${recipe.servings} servings · about ${recipe.minutes} minutes</p><h4>Ingredients</h4><ul>${recipe.ingredients.map(i=>`<li>${escapeHTML(i.amount+' '+i.item)} <small class="ingredient-badge">${i.onHand?'You have this':'To pick up'}</small></li>`).join('')}</ul>${recipe.unused?.length?`<p class="field-help">Left out of this recipe: ${escapeHTML(recipe.unused.join(', '))}.</p>`:''}<h4>Simple steps</h4><ol>${recipe.steps.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol>${recipe.steps.length?'<div class="recipe-actions"><button id="freestyle-favorite">Save to favorites</button><button id="freestyle-missing">Add missing ingredients to groceries</button></div><p id="freestyle-save-status" role="status"></p>':''}</article>`;
}
function renderFreestyle(){
 const draft=readJSON('amuse-freestyle-draft',{ingredients:'',flavor:'',servings:planningPeople(),minutes:30,pantryBasics:true});
 content.innerHTML=`<section class="freestyle-page"><p class="eyebrow">A little fridge magic</p><h2>Free style</h2><p class="lede">A little of this, a little of that. Turn what’s left in your fridge into something delicious.</p><form id="freestyle-form" class="panel recipe-form"><label for="fridge-ingredients">What have you got?</label><textarea id="fridge-ingredients" required rows="4" maxlength="2000" placeholder="e.g. 1 cooked chicken breast, ½ cabbage, 2 carrots, Greek yogurt, a lime">${escapeHTML(draft.ingredients)}</textarea><p class="field-help">Include rough amounts and whether meat is raw or cooked. Only use leftovers that are still safe to eat.</p><label for="fridge-flavor">What sounds good? <small>Optional</small></label><input id="fridge-flavor" maxlength="250" placeholder="e.g. spicy Mexican, creamy and cozy, tangy Asian-inspired" value="${escapeHTML(draft.flavor)}"><div class="plan-settings"><label>Servings <input id="fridge-servings" type="number" min="1" max="12" value="${Math.min(12,draft.servings)}" required></label><label>Time <select id="fridge-time">${[15,30,45,60].map(n=>`<option value="${n}" ${draft.minutes===n?'selected':''}>${n} minutes</option>`).join('')}</select></label></div><label class="check-label"><input id="fridge-pantry" type="checkbox" ${draft.pantryBasics?'checked':''}>I have oil, salt and pepper</label><p class="field-help">Uses built-in recipe combinations, filtered by your profile preferences, with any extras clearly marked.</p><button class="primary" id="freestyle-generate" type="submit">Make something delicious</button><p id="freestyle-status" role="status">Ready to cook. No AI connection needed.</p><button type="button" id="fridge-collection">Find ideas in my recipe collection</button><p class="field-help">Collection matches are existing recipes, not AI-generated.</p></form><div id="freestyle-result">${freestyleResultHTML(freestyleRecipe())}</div><div id="fridge-matches"></div></section>`;
 const form=content.querySelector('#freestyle-form');
 const capture=()=>({ingredients:form.querySelector('#fridge-ingredients').value.trim(),flavor:form.querySelector('#fridge-flavor').value.trim(),servings:Number(form.querySelector('#fridge-servings').value),minutes:Number(form.querySelector('#fridge-time').value),pantryBasics:form.querySelector('#fridge-pantry').checked});
 form.oninput=()=>set('amuse-freestyle-draft',JSON.stringify(capture()));
 const status=form.querySelector('#freestyle-status'),button=form.querySelector('#freestyle-generate');
 form.onsubmit=event=>{
  event.preventDefault();
  const input=capture();if(!input.ingredients)return;
  try{
   const recipe=composeFridgeRecipe(input,freestyleVariation++);
   set('amuse-freestyle-result',JSON.stringify(recipe));
   content.querySelector('#freestyle-result').innerHTML=freestyleResultHTML(recipe);bindFreestyleResult();status.textContent='Your recipe is ready. Extras are marked “To pick up.”';
  }catch(error){status.textContent=error.message}
 };
 form.querySelector('#fridge-collection').onclick=()=>{
  const words=capture().ingredients.toLowerCase().match(/[a-z]{3,}/g)??[];const ignored=new Set(['cup','cups','tbsp','tsp','raw','cooked','leftover','leftovers','have','some']);
  const ranked=mealTabs.flatMap(category=>builtInRecipes(category).map(recipe=>({recipe,score:[...new Set(words)].filter(w=>!ignored.has(w)&&(Object.keys(recipe[6]).join(' ').toLowerCase()).includes(w)).length}))).filter(item=>item.score>=2).sort((a,b)=>b.score-a.score).slice(0,4);
  content.querySelector('#fridge-matches').innerHTML=`<h3>From your recipe collection</h3>${ranked.length?'<div class="grid">'+ranked.map(({recipe})=>`<article class="card"><h3>${escapeHTML(recipe[0])}</h3><p>${escapeHTML(recipe[1])}</p><details><summary>Ingredients & steps</summary><ul>${suggestedObject(recipe,'dinner').ingredients.map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul><ol>${instructionLines(recipe[7]).map(s=>`<li>${escapeHTML(s)}</li>`).join('')}</ol></details></article>`).join('')+'</div>':'<p>No close collection matches. Try adding a few more ingredients.</p>'}`;
 };
 bindFreestyleResult();
}
function bindFreestyleResult(){
 const recipe=freestyleRecipe();if(!recipe)return;
 content.querySelector('#freestyle-favorite')?.addEventListener('click',()=>{
  const favorites=readJSON('amuse-favorites',[]);const id='freestyle-'+recipe.name;
  if(!favorites.some(r=>r.id===id))favorites.push({id,name:recipe.name,category:'dinner',yield:recipe.servings,servings:recipe.servings,ingredients:recipe.ingredients.map(i=>i.amount+' '+i.item),steps:recipe.steps,url:''});
  set('amuse-favorites',JSON.stringify(favorites));content.querySelector('#freestyle-save-status').textContent='Saved to favorites.';
 });
 content.querySelector('#freestyle-missing')?.addEventListener('click',event=>{
  const missing=recipe.ingredients.filter(i=>!i.onHand);const extras=manualShoppingItems();
  for(const item of missing){const text=item.amount+' '+item.item;if(!extras.some(i=>i.text.toLowerCase()===text.toLowerCase()))extras.push({id:crypto.randomUUID(),text});
   const product=shoppingProductFor(parseShoppingLine(text).name);const checks=readJSON('amuse-grocery-checks-'+edition,{});delete checks[product.id];set('amuse-grocery-checks-'+edition,JSON.stringify(checks));set('amuse-removed-groceries-'+edition,JSON.stringify(readJSON('amuse-removed-groceries-'+edition,[]).filter(id=>id!==product.id)));
  }
  set('amuse-extra-groceries',JSON.stringify(extras));event.target.disabled=true;content.querySelector('#freestyle-save-status').textContent=missing.length?'Missing ingredients added to groceries.':'You already have everything for this recipe.';
 });
}
