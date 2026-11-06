const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const c=vm.createContext({get:()=>null,qty:n=>Number(n.toFixed(2)),edition:0,document:{addEventListener(){}}});vm.runInContext(['menu.js','recipe-collection.js','family-recipes.js','flavor-recipes.js','custom-menu.js','ingredient-costs.js','preferences.js','experience.js','fridge-cook.js'].map(f=>fs.readFileSync('public/'+f,'utf8')).join('\n'),c);
for(const category of ['breakfast','lunch','dinner','snacks']){
 c.category=category;assert(vm.runInContext('builtInRecipes(category).every(r=>r[8].flavor&&Object.entries(r[6]).every(([name,n])=>pantry[name]&&n>0))',c));
}
const lines=vm.runInContext("suggestedShoppingLines(builtInRecipes('dinner').find(r=>r[0].includes('Mexican smoky')),4)",c);assert(lines.some(i=>i.text.includes('Ground cumin')));assert(lines.some(i=>i.text.includes('Fresh cilantro')));assert(!lines.some(i=>/^Cumin \(as needed/.test(i.text)));
assert(vm.runInContext("['Ground coriander','Ground turmeric','Dried oregano','Ground cardamom'].every(name=>shoppingProductFor(name).aisle==='Spices & seasoning')",c));
const r=vm.runInContext("composeFridgeRecipe({ingredients:'cooked chicken, cabbage, carrots',flavor:'Mexican',servings:2,minutes:30,pantryBasics:true})",c);assert(r.ingredients.some(i=>i.item==='ground cumin'));assert(r.ingredients.some(i=>i.item==='smoked paprika'));assert(r.steps.some(s=>s.includes('Bloom')));
console.log('All library recipes have measured flavor layers; spices reach groceries without duplicate allowances; Free style uses cumin and paprika.');
