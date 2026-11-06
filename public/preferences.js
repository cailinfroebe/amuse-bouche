const dietChoices=[['glutenFree','Gluten free'],['dairyFree','Dairy free'],['vegetarian','Vegetarian'],['sugarFree','Sugar free']];
const allergyChoices=['Milk','Eggs','Peanuts','Tree nuts','Soy','Sesame','Shellfish','Fish','Wheat'];
function kitchenPreferences(){const p=readJSON('amuse-profile',{});return {...p,diets:p.diets??{glutenFree:!!p.name},allergies:Array.isArray(p.allergies)?p.allergies:[],avoid:typeof p.avoid==='string'?p.avoid:'',maxMinutes:Number(p.maxMinutes)||60,budget:Number(p.budget)||0}}
function ingredientConflicts(text,p=kitchenPreferences()){
 const lower=text.toLowerCase();
 const rules={Milk:/\b(?:milk|buttermilk|yogurt|yoghurt|cheese|feta|cheddar|parmesan|butter|cream|whey|casein)\b/,Eggs:/\beggs?\b/,Peanuts:/peanut/, 'Tree nuts':/almond|walnut|cashew|pecan|pistachio|hazelnut|macadamia/,
 Soy:/soy|edamame|tofu|tempeh|tamari/,Sesame:/sesame|tahini/,Shellfish:/shrimp|prawn|crab|lobster|clam|mussel|scallop|oyster/,Fish:/tuna|salmon|cod\b|tilapia|fish|anchov/,Wheat:/wheat|bulgur|couscous|seitan/};
 const hits=[];
 const dairyText=lower.replace(/(?:peanut|almond|cashew|sunflower) butter|coconut milk|(?:almond|oat|soy) milk|coconut cream|(?:dairy.free|coconut|almond|soy) (?:yogurt|cheese|milk)/g,'');
 if(p.diets.dairyFree&&rules.Milk.test(dairyText))hits.push('dairy');
 if(p.diets.vegetarian&&/chicken|beef|tuna|shrimp|prawn|salmon|fish|turkey|pork|bacon|sausage|gelatin|meat broth|bone broth/.test(lower))hits.push('meat or fish');
 if(p.diets.glutenFree&&/whole.?wheat|\bwheat\b|bulgur|couscous|seitan|\bbarley\b|\brye\b/.test(lower))hits.push('gluten');
 if(p.diets.sugarFree&&/\bhoney\b|maple syrup|added sugar|brown sugar|white sugar|chocolate chips|protein powder|sweetened|\bjam\b|icing|frosting|sriracha|chipotle peppers|buffalo sauce|\bsalsa\b/.test(lower.replace(/unsweetened/g,'')))hits.push('added sugar or unverified sweetener');
 for(const allergy of p.allergies)if(rules[allergy]?.test(allergy==='Milk'?dairyText:lower))hits.push(allergy);
 for(const term of p.avoid.split(/[,;\n]+/).map(t=>t.trim().toLowerCase()).filter(Boolean)){if(lower.includes(term))hits.push(term)}
 return [...new Set(hits)];
}
function profileRecipeAllowed(recipe){return !ingredientConflicts(Object.keys(recipe[6]).join(' ')+' '+recipe[7]).length}
function recipePlanningCost(recipe){return Object.entries(recipe[6]).reduce((sum,[name,amount])=>sum+(pantry[name]?amount/pantry[name][1]*pantry[name][2]:0),0)}
function preferenceRecipeScore(recipe){
 const p=kitchenPreferences();let score=0;
 if(recipe[4]<=p.maxMinutes)score+=2;else score-=3;
 const cap=p.budget?p.budget/(planningPeople()*21):0;if(cap)score+=recipePlanningCost(recipe)<=cap?3:-2;
 if(p.skill==='beginner'&&recipe[4]<=30)score+=1;
 return score;
}
