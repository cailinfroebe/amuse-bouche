// Local recipe composer: explicit ingredient groups and tested cooking methods, no AI calls.
function fridgeItems(text){
 const rules=[['chicken',/chicken/],['beef',/beef|steak/],['shrimp',/shrimp|prawn/],['tuna',/tuna/],['fish',/salmon|tilapia|cod\b|white fish/],['eggs',/\beggs?\b/],['beans',/beans?|chickpeas?|lentils?|edamame/],['rice',/\brice\b(?!.*(?:vinegar|paper))/],['quinoa',/quinoa/],['potato',/potato/],['wrap',/tortilla|wrap/],['oats',/\boats?\b/],['yogurt',/yogurt|yoghurt|cottage cheese/],['cheese',/cheese|feta|cheddar|parmesan/],['vegetable',/cabbage|carrot|broccoli|cauliflower|spinach|kale|lettuce|arugula|cucumber|pepper|zucchini|courgette|mushroom|tomato|onion|corn|peas|radish|celery|asparagus|green bean/],['fruit',/banana|apple|berr|peach|mango|pineapple|pear|plum|orange|grape|kiwi/],['avocado',/avocado/],['citrus',/lemon|lime/],['garlic',/garlic/],['ginger',/ginger/],['peanut',/peanut butter/],['tamari',/tamari|soy sauce/],['salsa',/salsa|chipotle/],['coconut',/coconut milk/],['curry',/curry powder|garam masala/],['mustard',/mustard|dijon/],['vinegar',/vinegar/],['cinnamon',/cinnamon/],['nuts',/walnut|peanut|almond|cashew|pecan/],['chocolate',/chocolate|cocoa/],['chia',/chia/],['honey',/honey|maple syrup/],['cumin',/cumin/],['paprika',/paprika/],['coriander',/ground coriander/],['turmeric',/turmeric/],['vanilla',/vanilla/],['herb',/cilantro|parsley|dill|scallion/]];
 return text.split(/[,;\n]+|\s+and\s+/i).map(raw=>{
  const leftover=/leftover/i.test(raw);
  raw=raw.trim().replace(/^(?:i have|some|a little|leftover)\s+/i,'');
  const amount=raw.match(/^(?:(?:\d+(?:[./]\d+)?(?:\s+\d\/\d)?|[½¼¾⅓⅔]|half|a|an)\s*(?:(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|g|cans?|handfuls?|bunch(?:es)?|cloves?)\b)?\s*)/i)?.[0].trim()??'';
  const item=raw.slice(amount.length).trim()||raw;
  const kind=rules.find(([,rule])=>rule.test(item.toLowerCase()))?.[0]??'unknown';
  return {amount:amount||'Available portion of',item,kind,onHand:true,cooked:leftover||/cooked|roasted|grilled|rotisserie|canned|tinned/.test(item.toLowerCase())};
 }).filter(i=>i.item);
}
function composeFridgeRecipe(input,variation=0){
 const servings=Math.min(12,Math.max(1,Number(input.servings)||1));
 if(!input.ingredients?.trim())throw Error('Tell me at least two ingredients you have.');
 if(/mould|moldy|spoiled|rotten|smells? bad|left (?:out )?(?:overnight|all night)/i.test(input.ingredients))throw Error('Please use fresh ingredients or safely stored leftovers. I can’t build a recipe around food described as spoiled or left out overnight.');
 const all=fridgeItems(input.ingredients);
 const preferences=typeof kitchenPreferences==='function'?kitchenPreferences():{diets:{glutenFree:true},allergies:[]};
 const known=all.filter(i=>i.kind!=='unknown'&&(typeof ingredientConflicts!=='function'||!ingredientConflicts(i.item,preferences).length));
 const flavor=(input.flavor??'').toLowerCase();
 const gluten=all.filter(i=>/\b(?:wheat|barley|rye|bulgur|couscous|seitan)\b/.test(i.item.toLowerCase())||(/flour|bread|pasta|soy sauce|tortilla|wrap|oats/.test(i.item.toLowerCase())&&!/gluten.free|\bgf\b|corn tortilla|tamari/.test(i.item.toLowerCase())));
 if(preferences.diets.glutenFree&&gluten.length)throw Error('Please confirm gluten-free versions of: '+gluten.map(i=>i.item).join(', ')+'. For regular soy sauce, use gluten-free tamari.');
 if(known.length<2)throw Error('I need at least two ingredients I recognize. Try chicken, beef, tuna, shrimp, eggs, rice, potatoes, beans, vegetables, fruit, oats or yogurt. Separate ingredients with commas.');
 const sweet=/sweet|dessert|treat|breakfast|cookie|pancake/.test(flavor)&&!/savory|savoury/.test(flavor)||(!known.some(i=>['chicken','beef','shrimp','tuna','fish','beans','vegetable','rice','potato'].includes(i.kind))&&known.some(i=>['fruit','oats','yogurt'].includes(i.kind)));
 let used=[],steps=[],name='',minutes=15;
 const use=item=>{if(item&&!used.includes(item))used.push(item);return item};
 const take=kind=>use(known.find(i=>i.kind===kind));
 const add=(kind,item,amount)=>take(kind)||use({kind,item,amount,onHand:false});
 const list=items=>items.map(i=>i.item).join(', ');
 const has=kind=>known.some(i=>i.kind===kind);
 const water='Add water a spoonful at a time as needed.';
 if(sweet){
  const fruit=known.filter(i=>i.kind==='fruit');fruit.forEach(use);
  const oats=take('oats'),egg=take('eggs');
  const nuts=known.filter(i=>['nuts','peanut','chocolate','chia','cinnamon','honey'].includes(i.kind));nuts.forEach(use);
  if(oats&&egg&&(variation%2===0||!has('yogurt'))){
   const yogurt=take('yogurt');name='Golden '+(fruit[0]?.item.replace(/(?:ripe|frozen|chopped)\s*/g,'')??'oat')+' oat pancakes';minutes=25;
   const oil=use({kind:'oil',item:'oil for the skillet',amount:servings+' tsp',onHand:!!input.pantryBasics});
   steps.push('Blend or finely grind the oats. Beat the egg and mix with the oats. '+water+' The batter should be thick but spoonable.');
   if(fruit.length)steps.push('Mash or finely dice '+list(fruit)+'; fold into the batter. Cook frozen berries according to their package first.');
   if(nuts.length)steps.push('Stir '+list(nuts)+' into the batter; chop whole nuts and chocolate first.');
   steps.push('Heat a lightly oiled skillet over medium-low heat. Make small pancakes and cook 3–4 minutes per side, adjusting heat so they cook through. Egg-containing centers should reach 160°F.');
   if(yogurt)steps.push('Serve with '+yogurt.item+' spooned over the pancakes.');
  }else{
   // Eggs are deliberately left out of uncooked yogurt recipes.
   if(egg)used=used.filter(i=>i!==egg);
   const yogurt=add('yogurt',preferences.diets.dairyFree||preferences.allergies.includes('Milk')?'plain unsweetened coconut yogurt':'Greek yogurt',servings*0.75+' cup');
   name=(fruit.length?'Fruit & crunch':oats?'Toasted oat crunch':'Creamy crunch')+' cheesecake-style pots';
   if(oats)steps.push('Toast the gluten-free oats in a dry skillet over medium heat for 3–5 minutes, stirring often. Cool completely.');
   if(fruit.length)steps.push('Wash and chop '+list(fruit)+'. If using frozen berries, cook as directed on the package and cool.');
   steps.push('Stir the '+yogurt.item+' until creamy. If it is cottage cheese, blend it smooth if you prefer.');
   if(nuts.length)steps.push('Chop or stir in '+list(nuts)+' for richness and crunch.');
   steps.push('Layer the creamy filling, '+(fruit.length?'fruit':'crunchy ingredients')+(oats?' and toasted oats':'')+' in glasses or bowls. Serve right away, or refrigerate and eat within 3–4 days.');
  }
 }else{
  const protein=known.filter(i=>['chicken','beef','shrimp','tuna','fish','beans','eggs'].includes(i.kind));protein.forEach(use);
  const vegetables=known.filter(i=>['vegetable','avocado'].includes(i.kind));vegetables.forEach(use);
  const grain=['rice','quinoa','potato','wrap'].map(kind=>known.find(i=>i.kind===kind)).find(Boolean);use(grain);
  if(!protein.length&&!vegetables.length)throw Error('Add a protein or vegetable so I can build a savory meal.');
  const crunchy=vegetables.filter(i=>/cucumber|cabbage|lettuce|arugula|radish|avocado/.test(i.item.toLowerCase()));
  const hot=vegetables.filter(i=>!crunchy.includes(i));
  const oil=use({kind:'oil',item:'oil for cooking',amount:servings+' tsp',onHand:!!input.pantryBasics});
  let finish='',flavorName='';
  if(/mexican|tex.?mex|chipotle|taco|spicy/.test(flavor)){
   const salsa=add('salsa','gluten-free chipotle salsa',servings*2+' tbsp'),lime=add('citrus','lime',Math.ceil(servings/2)+'');
   const cumin=add('cumin','ground cumin',servings*0.375+' tsp'),paprika=add('paprika','smoked paprika',servings*0.25+' tsp');
   flavorName='Chipotle-lime';finish='Bloom '+cumin.item+' and '+paprika.item+' in a little cooking oil for 30 seconds. '+'Stir '+salsa.item+' into the hot filling, then finish with the juice of '+lime.item+'.';
   const fruit=known.filter(i=>i.kind==='fruit'&&/pineapple|mango/.test(i.item));fruit.forEach(use);if(fruit.length)finish+=' Dice '+list(fruit)+' and spoon over the top.';
  }else if(/thai|curry|indian|coconut/.test(flavor)){
   const curry=add('curry','gluten-free curry powder',servings*0.5+' tsp'),coconut=add('coconut','coconut milk',servings*0.25+' cup');
   const garlic=add('garlic','garlic',servings+' clove'),ginger=add('ginger','fresh ginger',servings*0.5+' tbsp');
   flavorName='Coconut curry';finish='Finely grate '+garlic.item+' and '+ginger.item+' and cook in a little oil for 30–60 seconds. '+'Stir '+curry.item+' and '+coconut.item+' into the cooked filling. Simmer gently for 3–5 minutes; loosen with water if needed.';
  }else if(/asian|korean|chinese|peanut|ginger|sesame|teriyaki/.test(flavor)){
   const peanut=add('peanut','peanut butter',servings+' tbsp'),tamari=add('tamari','gluten-free tamari',servings*0.5+' tbsp');const ginger=add('ginger','fresh ginger',servings*0.5+' tbsp');
   flavorName='Peanut'+(ginger?'-ginger':' crunch');finish='Whisk '+peanut.item+' with '+tamari.item+' and warm water until pourable.'+(ginger?' Stir in finely grated '+ginger.item+'.':'')+' Toss the hot filling with this sauce off the heat.';
  }else if(/german|mustard|tangy|sour/.test(flavor)){
   const mustard=add('mustard','gluten-free Dijon mustard',servings*0.5+' tbsp'),vinegar=add('vinegar','apple cider vinegar',servings*0.5+' tbsp');
   flavorName='Tangy mustard';finish='Whisk '+mustard.item+' with '+vinegar.item+' and a splash of water. Spoon over the cooked filling.';
  }else{
   const lemon=add('citrus','lemon',Math.ceil(servings/2)+''),garlic=add('garlic','garlic',servings+' clove');
   flavorName='Lemon-garlic';finish='Finely grate '+garlic.item+' and cook it in the filling for 1 minute. Finish with the juice of '+lemon.item+'.';
  }
  const dairy=take('yogurt')||take('cheese');
  name=flavorName+' '+(protein[0]?.kind??'vegetable')+' '+(grain?.kind==='wrap'?'wraps':grain?'bowls':variation%2?'warm crunch plates':'skillet & crunch');
  if(grain){
   if(grain.kind==='rice'||grain.kind==='quinoa'){
    const cooked=grain.cooked;minutes=Math.max(minutes,cooked?20:grain.kind==='rice'?45:30);
    steps.push(cooked?'Reheat '+grain.item+' until steaming hot, reaching 165°F. Use only rice or grains that were cooled promptly and refrigerated.':'Cook '+grain.item+' according to its package directions. Use only the amount you listed.');
   }else if(grain.kind==='potato'){minutes=35;steps.push('Dice '+grain.item+' into small cubes, toss with half the cooking oil, and roast at 425°F for 25–30 minutes until golden and tender.');}
   else steps.push('Warm the gluten-free '+grain.item+' in a dry skillet until pliable.');
  }
  if(hot.length)steps.push('Chop '+list(hot)+' into bite-size pieces. Heat a little cooking oil in a skillet and sauté until tender, about 5–10 minutes; follow package directions for frozen vegetables. Transfer to a plate.');
  for(const p of protein){
   if(p.cooked&&p.kind!=='beans')steps.push('Reheat '+p.item+' in the skillet until 165°F.');
   else if(p.kind==='chicken'){minutes=Math.max(minutes,25);steps.push('Cut '+p.item+' into small even pieces. Cook in a lightly oiled skillet over medium heat, turning often, until every piece reaches 165°F, about 8–12 minutes.');}
   else if(p.kind==='beef'){minutes=Math.max(minutes,25);steps.push('Cook '+p.item+' in the skillet, breaking ground beef apart or cutting steak into thin strips. Cook ground beef to 160°F; for whole-cut steak, reach at least 145°F and rest 3 minutes.');}
   else if(p.kind==='shrimp'){minutes=Math.max(minutes,20);steps.push('Thaw and peel '+p.item+' if needed, then sauté until the flesh is pearly and opaque, about 3–5 minutes.');}
   else if(p.kind==='tuna')steps.push(/raw|fresh/.test(p.item)?'Cook the fresh tuna to 145°F, then flake it.':'Drain canned tuna and flake it into the filling. If your tuna is fresh rather than canned, cook it to 145°F first.');
   else if(p.kind==='fish'){minutes=Math.max(minutes,25);steps.push('Cook '+p.item+' in the skillet until it reaches 145°F and flakes easily.');}
   else if(p.kind==='eggs')steps.push('Beat '+p.item+' and scramble in the skillet until fully set and 160°F.');
   else if(p.kind==='beans'){minutes=Math.max(minutes,/dry|dried/.test(p.item)?60:20);steps.push(/dry|dried/.test(p.item)?'Fully cook the dried beans or lentils according to their package before continuing. Bean varieties may require soaking and more than an hour, so use cooked beans for a quick meal.':'Drain and rinse canned beans or chickpeas, or use fully cooked beans. Warm them through; cook frozen edamame according to its package.');}
  }
  if(hot.length)steps.push('Return the cooked vegetables to the skillet.');
  const herbs=known.filter(i=>i.kind==='herb');herbs.forEach(use);if(herbs.length)finish+=' Chop '+list(herbs)+' and scatter over the finished dish.';
  steps.push(finish);
  if(crunchy.length)steps.push('Wash and thinly slice '+list(crunchy)+'. Keep these fresh for a crunchy contrast.');
  if(dairy)steps.push('Keep '+dairy.item+' cool and add a spoonful or sprinkle at the table, rather than boiling it into the sauce.');
  steps.push('Serve '+(grain?.kind==='wrap'?'the filling in the warm wraps':grain?'the hot filling over the cooked base':'the hot filling on plates')+(crunchy.length?' with the fresh crunchy vegetables':'')+'. Divide the available ingredients between '+servings+' '+(servings===1?'portion':'portions')+'.');
 }
 if(sweet){const vanilla=add('vanilla','vanilla extract',servings*0.25+' tsp');steps.unshift('Stir '+vanilla.item+' into the wet mixture or creamy filling before shaping, cooking or layering.')}
 const unused=all.filter(i=>!used.includes(i));
 if(!steps.length)throw Error('Try a few more ingredients so I can build a complete recipe.');
 const conflicts=typeof ingredientConflicts==='function'?ingredientConflicts(used.map(i=>i.item).join(' '),preferences):[];
 if(conflicts.length)throw Error('This flavor combination needs '+conflicts.join(', ')+', which conflicts with your profile. Try a different flavor or change your ingredients.');
 return {name,description:'Built from your ingredients using amuse bouche’s cooking rules. '+(minutes>input.minutes?'Allow about '+minutes+' minutes for safe cooking. ':'')+'Portion sizes depend on the amounts you have; quantities are not automatically increased.',servings,minutes,ingredients:used.map(({amount,item,onHand})=>({amount,item,onHand})),steps,unused:unused.map(i=>i.item),source:'local'};
}
