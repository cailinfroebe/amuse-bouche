function isRecipeIngredient(value){
 return !/^(?:shop (?:this )?recipe|shop (?:the )?ingredients|print recipe|jump to recipe|save recipe|add (?:all )?ingredients to (?:cart|list)|ingredients|instructions|equipment)[.!:]?$/i.test(String(value).trim().replace(/\s+/g,' '));
}
const mealTabs = ['breakfast','lunch','dinner','snacks'];
let mealView = null;
let editingRecipe = null;
let addingToMeal = null;
const escapeHTML = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readJSON = (key,fallback)=>{try{return JSON.parse(get(key))??fallback}catch{return fallback}};
const menuKey = (category)=>'amuse-custom-'+edition+'-'+category;
const customMenu = category=>readJSON(menuKey(category),{active:false,recipes:[]});
function savedMealView(category){
 const stored=readJSON('amuse-meal-view-'+edition+'-'+category,null);
 if(['choose','custom','suggested'].includes(stored))return stored;
 return customMenu(category).active?'custom':'choose';
}
function selectMealView(category,view){
 set('amuse-meal-view-'+edition+'-'+category,JSON.stringify(view));
 mealView=view;
}
function saveCustom(category,data){
 try{if(!set(menuKey(category),JSON.stringify(data)))throw Error('save');return true}
 catch{alert('Your menu could not be saved. Open your profile to check the save status.');return false}
}
function safeRecipeURL(value){
 try{const u=new URL(value);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}
}
function quantityValue(value){
 const text=String(value).trim().replace(/½/g,' 1/2').replace(/¼/g,' 1/4').replace(/¾/g,' 3/4').replace(/⅓/g,' 1/3').replace(/⅔/g,' 2/3').trim();
 if(!text)return null;
 const parts=text.split(/\s+/);
 if(!parts.every(p=>/^\d+(?:\.\d+)?(?:\/\d+)?$/.test(p)))return null;
 const total=parts.reduce((sum,p)=>{const [a,b]=p.split('/').map(Number);return sum+a/(b??1)},0);
 return Number.isFinite(total)&&total>0?total:null;
}
function parseIngredient(line){
 const match=line.trim().match(/^([\d¼½¾⅓⅔][\d\s./¼½¾⅓⅔]*)(.*)$/);
 const amount=match?quantityValue(match[1]):null;
 if(match&&/^[-–]/.test(match[2].trim()))return {amount:null,text:line.trim()};
 const rest=match?match[2].trim():line.trim();
 return {amount,text:rest||line.trim()};
}
function scaledIngredient(line,multiplier){
 const ingredient=parseIngredient(line);
 return ingredient.amount===null ? line+(multiplier!==1?' (check quantity for '+qty(multiplier)+'× batch)':'') : qty(ingredient.amount*multiplier)+' '+ingredient.text;
}
function customGroceries(){
 return mealTabs.flatMap(category=>{
  const menu=customMenu(category);
  return menu.active?menu.recipes.flatMap(recipe=>recipe.ingredients.map(text=>({
   text,multiplier:recipeServings(recipe)/recipe.yield,source:recipe.name
  }))):[];
 });
}
function recipeSchema(value){
 if(!value||typeof value!=='object')return null;
 if(Array.isArray(value)){for(const item of value){const found=recipeSchema(item);if(found)return found}return null}
 if([].concat(value['@type']??[]).some(type=>String(type).toLowerCase()==='recipe'))return value;
 if(value['@graph'])return recipeSchema(value['@graph']);
 return null;
}
const plainText = value=>{
 const doc=new DOMParser().parseFromString(String(value??''),'text/html');
 return doc.body.textContent.trim();
};
function instructionLines(value){
 if(Array.isArray(value))return value.flatMap(instructionLines);
 if(typeof value==='object'&&value)return value.itemListElement?instructionLines(value.itemListElement):instructionLines(value.text??'');
 return plainText(value).split(/\n+|(?<=[.!?])\s+(?=[A-Z])/).map(s=>s.replace(/^\s*\d+[.)]\s*/,'').trim()).filter(Boolean);
}
function normalizeRecipe(value){
 return {
  name:plainText(value.name),
  ingredients:[].concat(value.recipeIngredient??[]).map(plainText).filter(Boolean).filter(isRecipeIngredient),
  steps:instructionLines(value.recipeInstructions),
  yield:Math.max(1,Number(String([].concat(value.recipeYield??'1')[0]).match(/\d+(?:\.\d+)?/)?.[0]??1))
 };
}
function parseRecipeText(text){
 try{const recipe=recipeSchema(JSON.parse(text));if(recipe)return normalizeRecipe(recipe)}catch{}
 const lines=text.split(/\n/).map(line=>line.trim()).filter(Boolean);
 let section='', ingredients=[], steps=[];
 let name=lines[0]??'';
 for(const line of lines){
  if(/^ingredients\s*:?$/i.test(line)){section='ingredients';continue}
  if(/^(instructions|directions|method|steps|preparation)\s*:?$/i.test(line)){section='steps';continue}
  if(/^(notes|nutrition|tips|storage)\s*:?$/i.test(line)){section='';continue}
  if(section==='ingredients')ingredients.push(line.replace(/^[-•*]\s*/,''));
  if(section==='steps')steps.push(...instructionLines(line));
 }
 return {name,ingredients:ingredients.filter(isRecipeIngredient),steps,yield:Number(text.match(/(?:serves|servings|yield)\s*:?\s*(\d+)/i)?.[1]??1)};
}
function mealChoice(category){
 const menu=customMenu(category);
 content.innerHTML=`<p class="eyebrow">Make it yours</p><h2>Your ${mealLabel(category).toLowerCase()} menu</h2><p class="lede">How would you like to plan this part of your week?</p><div class="menu-choice"><button class="choice-card" data-meal-view="custom"><span class="choice-mark">${uiIcon('plus')}</span><h3>Build your own menu</h3><p>Bring a recipe from a website or Pinterest. Review its ingredients and steps, set your servings, and send it to your grocery list.</p><span>${menu.recipes.length?'Open my '+menu.recipes.length+' saved recipes':'Start building'} →</span></button><button class="choice-card" data-meal-view="suggested"><span class="choice-mark">${uiIcon('star')}</span><h3>Suggested menu</h3><p>Ready-to-prep recipes picked for your ${planningWeeks()}-week plan.</p><span>Explore suggestions →</span></button></div><p class="notice">${menu.active&&!menu.recipes.length?'Your new menu is empty. Choose recipes to add their ingredients to groceries.':'Your grocery list currently uses the <strong>'+(menu.active?'custom':'suggested')+' '+category+' menu</strong>.'} Your menu and selected view stay saved on this device. Make new menu starts a fresh plan for every meal tab and keeps your extra grocery items.</p>`;
 content.querySelectorAll('[data-meal-view]').forEach(button=>button.onclick=()=>{const view=button.dataset.mealView;if(view==='suggested'){menu.active=false;if(!saveCustom(category,menu))return}selectMealView(category,view);render()});
}
function mealGroups(menu){
 const groups=new Map();
 for(const recipe of menu.recipes){
  const id=recipe.mealId??recipe.id;
  if(!groups.has(id))groups.set(id,{id,recipes:[]});
  groups.get(id).recipes.push(recipe);
 }
 for(const group of groups.values()){
  const primary=group.recipes.findIndex(recipe=>recipe.id===group.id);
  if(primary>0)group.recipes.unshift(...group.recipes.splice(primary,1));
 }
 return [...groups.values()];
}
function stackedRecipeCard(recipe,{groupId=null,mealNumber=null}={}){
 return `<article class="card ${groupId?'main-recipe-card':'stacked-side-card'}">${ingredientConflicts(recipe.ingredients.join(' ')).length?`<p class="notice">Check your profile preferences: ${escapeHTML(ingredientConflicts(recipe.ingredients.join(' ')).join(', '))} found in this saved recipe.</p>`:''}<p class="eyebrow">${groupId?'Meal '+mealNumber:'Stacked recipe'}</p><h3>${escapeHTML(recipe.name)}</h3><p class="meta">${recipeServings(recipe)} planned servings · original recipe makes ${recipe.yield}</p>${recipe.url?`<a href="${escapeHTML(recipe.url)}" target="_blank" rel="noopener noreferrer">Original recipe ↗︎</a>`:''}<details><summary>Ingredients & simple steps</summary><ul>${recipe.ingredients.map(line=>`<li>${escapeHTML(scaledIngredient(line,recipeServings(recipe)/recipe.yield))}</li>`).join('')}</ul><ol>${recipe.steps.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol></details>${recipeSocialActions('custom-'+recipe.id)}<div class="recipe-actions">${groupId?`<button class="stack-recipe-button" data-stack="${groupId}">＋ Stack recipe</button>`:''}<button data-edit="${recipe.id}">Edit</button><button data-remove="${recipe.id}">Remove recipe</button></div></article>`;
}
function customCards(category){
 const menu=customMenu(category);
 const groups=mealGroups(menu);
 const servings=groups.reduce((sum,group)=>sum+group.recipes[0].servings,0);
 content.innerHTML=`<div class="meal-heading"><div><p class="eyebrow">Your recipe box</p><h2>My ${mealLabel(category).toLowerCase()} menu</h2></div></div><p class="lede">Start with a main recipe, then use Stack recipe to give each bread, side, or sauce recipe its own folder below. Every recipe goes into your grocery list.</p><div class="menu-toolbar"><button class="primary" id="add-recipe">＋ Add a new meal</button><button id="use-custom" ${!menu.recipes.length?'disabled':''}>${menu.active?'✓︎ Using this menu':'Use this menu for groceries'}</button><span>${servings} planned meals per person${category==='snacks'?'':' / '+planningDays()}</span></div>${menu.recipes.length?'':'<div class="empty-menu"><h3>Your next favorite goes here.</h3><p>Add your first meal, then stack more recipes inside it.</p></div>'}<div class="meal-folder-grid">${groups.map((group,index)=>`<section class="meal-stack">${stackedRecipeCard(group.recipes[0],{groupId:group.id,mealNumber:index+1})}${group.recipes.slice(1).map((recipe,folderIndex)=>`<details class="recipe-folder" style="--folder-index:${Math.min(folderIndex,5)}"><summary><span class="folder-symbol" aria-hidden="true">▱</span><span>${escapeHTML(recipe.name)}<small>${recipeServings(recipe)} servings · stacked recipe</small></span><span class="folder-chevron" aria-hidden="true">⌄</span></summary><div class="folder-recipes">${stackedRecipeCard(recipe)}</div></details>`).join('')}</section>`).join('')}</div><p class="field-help">Recipe portions scale to the people count in your kitchen plan. The first recipe determines the planned meals per person.</p><p class="notice">${kitchenPreferences().diets.glutenFree?celiac:'Check saved recipes against your selected dietary preferences and allergies. Product labels and ingredient lists can change.'}</p>`;
 content.querySelector('#add-recipe').onclick=()=>{editingRecipe=null;addingToMeal=null;mealView='edit';render()};
 content.querySelectorAll('[data-stack]').forEach(button=>button.onclick=()=>{
  editingRecipe=null;addingToMeal=button.dataset.stack;mealView='edit';render();
 });
 content.querySelector('#use-custom').onclick=()=>{menu.active=true;if(saveCustom(category,menu)){selectMealView(category,'custom');render()}};
 content.querySelectorAll('[data-edit]').forEach(button=>button.onclick=()=>{addingToMeal=null;editingRecipe=menu.recipes.find(r=>r.id===button.dataset.edit);mealView='edit';render()});
 content.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{
  const previousRecipes=menu.recipes.slice();
  const previousActive=menu.active;
  menu.recipes=menu.recipes.filter(r=>r.id!==button.dataset.remove);
  if(!menu.recipes.length)menu.active=false;
  if(saveCustom(category,menu)){render();const undo=document.createElement('button');undo.textContent='Undo removal';undo.onclick=()=>{menu.recipes=previousRecipes;menu.active=previousActive;saveCustom(category,menu);render()};content.querySelector('.menu-toolbar').append(undo)}
 });
}
function customEditor(category){
 const menu=customMenu(category);
 const groups=mealGroups(menu);
 const target=groups.find(group=>group.id===addingToMeal);
 const recipe=editingRecipe??{name:'',url:'',yield:1,servings:target?.recipes[0].servings??(category==='snacks'?6:4),ingredients:[],steps:[]};
 const selectedMeal=editingRecipe?(editingRecipe.mealId??editingRecipe.id):(addingToMeal??'');
 const groupPicker=`<label>Include this recipe in<select id="recipe-meal"><option value="">A new separate meal</option>${groups.map((group,index)=>`<option value="${group.id}" ${selectedMeal===group.id?'selected':''}>Meal ${index+1} · ${escapeHTML(group.recipes[0].name)}</option>`).join('')}</select></label>`;

 content.innerHTML=`<p class="eyebrow">Bring something delicious</p><h2>${editingRecipe?'Edit':'Add'} a recipe</h2><p class="lede">Paste a recipe link and we’ll fill in the ingredients, simple steps, and original servings for you.</p><div class="import-panel panel"><label>Website or Pinterest link<input id="recipe-url" type="url" placeholder="https://…" value="${escapeHTML(recipe.url)}"></label><button id="fetch-recipe">Import recipe link</button><p class="field-help">Pinterest links are followed to the original recipe website when it is publicly accessible.</p><details class="alternative-import"><summary>Other ways to add a recipe</summary><label>Paste recipe text<textarea id="recipe-paste" rows="5" placeholder="Recipe name\nIngredients\n1 cup rice\nInstructions\nCook rice according to the package."></textarea></label><div class="recipe-actions"><button id="parse-recipe">Break down pasted recipe</button><label class="file-button">Upload recipe file<input id="recipe-file" type="file" accept=".txt,.json,text/plain,application/json"></label></div></details><p id="import-status" role="status"></p></div><form id="recipe-form" class="recipe-form" ${editingRecipe?'':'hidden'}>${groupPicker}<label>Recipe name<input id="recipe-name" required maxlength="150" value="${escapeHTML(recipe.name)}"></label><div class="serving-fields"><label>Original recipe servings<input id="recipe-yield" required type="number" min="1" max="100" step="1" value="${recipe.yield}"></label><label>Planned servings per person<input id="recipe-servings" required type="number" min="1" max="100" step="1" value="${recipe.servings}"></label></div><label>Ingredients · one per line<textarea id="recipe-ingredients" required rows="7" placeholder="1 cup brown rice\n2 tbsp gluten-free tamari\n1 lb chicken">${escapeHTML(recipe.ingredients.join('\n'))}</textarea></label><p class="field-help">Start each ingredient with a quantity when possible, such as ½ cup or 2 tbsp. Quantities scale to your planned servings.</p><label>Simple steps · one per line<textarea id="recipe-steps" required rows="6" placeholder="Cook the rice.\nPrepare the sauce.\nCombine and serve.">${escapeHTML(recipe.steps.join('\n'))}</textarea></label><label class="check-label"><input id="recipe-gf" type="checkbox" required ${editingRecipe?'checked':''}>I’ve reviewed the ingredients against my dietary preferences and allergies.</label><div class="recipe-actions"><button class="primary" type="submit">Save recipe & update groceries</button><button id="edit-cancel" type="button">Cancel</button></div><p class="field-help">Recognized pantry ingredients merge into your grocery list. Other ingredient costs are estimated automatically.</p></form>`;
 const status=content.querySelector('#import-status');
 const populate=data=>{
  content.querySelector('#recipe-form').hidden=false;
  content.querySelector('#recipe-name').value=data.name??'';
  content.querySelector('#recipe-ingredients').value=(data.ingredients??[]).join('\n');
  content.querySelector('#recipe-steps').value=(data.steps??[]).join('\n');
  content.querySelector('#recipe-yield').value=data.yield??1;
  status.textContent=data.ingredients?.length?'Recipe broken into ingredients and steps. Check the original serving count and edit before saving.':'Could not identify ingredient and instruction sections. Paste text with Ingredients and Instructions headings, or fill in the fields below.';
 };
 content.querySelector('#parse-recipe').onclick=()=>populate(parseRecipeText(content.querySelector('#recipe-paste').value));
 content.querySelector('#recipe-file').onchange=async event=>{
  const file=event.target.files[0];if(!file)return;
  if(file.size>500000){status.textContent='Please use a recipe file under 500 KB.';return}
  populate(parseRecipeText(await file.text()));
 };
 content.querySelector('#fetch-recipe').onclick=async event=>{
  const url=safeRecipeURL(content.querySelector('#recipe-url').value);
  if(!url){status.textContent='Enter a complete http or https recipe link.';return}
  const button=event.target;button.disabled=true;status.textContent='Looking for the recipe…';
  try{
   const response=await Auth.fetch('/api/import-recipe',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({url}),signal:AbortSignal.timeout(28000)
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.error??'Could not import this recipe.');
   if(!content.contains(button))return;
   populate(data.recipe);
   content.querySelector('#recipe-url').value=data.recipe.url;
   if(data.recipe.yieldKnown){
    status.textContent='Imported! Ingredients, steps, and original servings are ready. Choose how many portions to make, then save to update your grocery list.';
   }else{
    content.querySelector('#recipe-yield').value='';
    status.textContent='Ingredients and steps imported. This website did not include a serving count. Enter its original servings before saving so grocery quantities scale correctly.';
   }
   content.querySelector('#recipe-form').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(error){if(content.contains(button))status.textContent=error.name==='TimeoutError'?'The recipe website took too long to respond. Try again.':error.message}

  finally{button.disabled=false}
 };
 content.querySelector('#recipe-url').addEventListener('paste',()=>{
  setTimeout(()=>{if(content.contains(buttonForImport)&&safeRecipeURL(content.querySelector('#recipe-url').value)&&!buttonForImport.disabled)buttonForImport.click()},0);
 });
 const buttonForImport=content.querySelector('#fetch-recipe');
 content.querySelector('#edit-cancel').onclick=()=>{addingToMeal=null;mealView='custom';render()};
 content.querySelector('#recipe-form').onsubmit=event=>{
  event.preventDefault();
  const urlInput=content.querySelector('#recipe-url').value.trim();
  if(urlInput&&!safeRecipeURL(urlInput)){status.textContent='Please fix the recipe link or clear it before saving.';return}
  const value=id=>content.querySelector(id).value.trim();
  const saved={id:editingRecipe?.id??crypto.randomUUID(),name:value('#recipe-name'),url:safeRecipeURL(urlInput),yield:Number(value('#recipe-yield')),servings:Number(value('#recipe-servings')),ingredients:value('#recipe-ingredients').split('\n').filter(Boolean),steps:instructionLines(value('#recipe-steps'))};
  if(!saved.name||!saved.ingredients.length||!saved.steps.length)return;
  const selectedGroup=value('#recipe-meal');
  saved.mealId=mealGroups(customMenu(category)).some(group=>group.id===selectedGroup)?selectedGroup:(editingRecipe?crypto.randomUUID():saved.id);
  const menu=customMenu(category);
  const index=menu.recipes.findIndex(r=>r.id===saved.id);
  if(index>=0)menu.recipes[index]=saved;else menu.recipes.push(saved);
  menu.active=true;
  if(saveCustom(category,menu)){selectMealView(category,'custom');editingRecipe=null;addingToMeal=null;render();window.scrollTo({top:0})}
 };
}
