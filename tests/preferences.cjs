const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');let profile={name:'Family',diets:{},allergies:[],maxMinutes:60};
const c=vm.createContext({get:key=>key==='amuse-profile'?JSON.stringify(profile):null,edition:0,document:{addEventListener(){}},console});
vm.runInContext(['menu.js','recipe-collection.js','family-recipes.js','flavor-recipes.js','custom-menu.js','preferences.js','experience.js','fridge-cook.js'].map(file=>fs.readFileSync('public/'+file,'utf8')).join('\n'),c);
const evaluate=s=>vm.runInContext(s,c);
const total=evaluate("['breakfast','lunch','dinner','snacks'].reduce((n,k)=>n+builtInRecipes(k).length,0)");assert(total>=90);console.log(total+' shared recipes');
assert(evaluate("builtInRecipes('dinner').some(r=>JSON.stringify(r[6]).includes('Whole wheat'))"));
profile.diets={glutenFree:true};assert(evaluate("builtInRecipes('dinner').every(r=>!JSON.stringify(r[6]).includes('Whole wheat'))"));
profile.diets={glutenFree:true,dairyFree:true,vegetarian:true,sugarFree:true};
for(const category of ['breakfast','lunch','dinner','snacks']){const count=evaluate(`builtInRecipes('${category}').length`);assert(count>0,category+' has no compatible recipes');assert(evaluate(`builtInRecipes('${category}').every(r=>ingredientConflicts(Object.keys(r[6]).join(' ')).length===0)`));console.log(category+': '+count+' compatible choices for all four preferences');}
profile.allergies=['Peanuts','Tree nuts','Soy','Sesame'];assert(evaluate("builtInRecipes('dinner').every(r=>!ingredientConflicts(Object.keys(r[6]).join(' ')).length)"));
profile={name:'Family',diets:{dairyFree:true},allergies:['Milk'],maxMinutes:30};
assert(evaluate("ingredientConflicts('peanut butter coconut milk').length===0"));assert(evaluate("ingredientConflicts('Greek yogurt').includes('Milk')"));
const recipe=evaluate("composeFridgeRecipe({ingredients:'banana, strawberries, GF oats',flavor:'sweet',servings:2,minutes:15,pantryBasics:true})");assert(recipe.ingredients.some(i=>i.item==='plain unsweetened coconut yogurt'));assert(!recipe.ingredients.some(i=>i.item==='Greek yogurt'));
profile={name:'Family',diets:{vegetarian:true,dairyFree:true,glutenFree:true},allergies:[],maxMinutes:30};
assert(evaluate("cravingSuggestions('lunch',menus[0].recipes.slice(3,6),3).length===3"));
assert(evaluate("Object.values(familyRecipes).flat().every(r=>Object.entries(r[6]).every(([name,n])=>pantry[name]&&n>0)&&r[7].length>100)"));
const src=fs.readFileSync('public/profiles.js','utf8');assert(!src.includes('profile-import'));assert(!src.includes('legacyKitchen'));assert(src.includes('amuse bouche!'));
console.log('Diet, allergy, fallback menu, dairy-free Free style, recipe integrity and onboarding checks passed.');
