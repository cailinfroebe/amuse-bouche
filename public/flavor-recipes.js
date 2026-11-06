// Flavor layers for the shared recipe library. Original names/IDs remain stable.
Object.assign(pantry,{
 'Dried oregano':['tsp',24,1.25,'Spices & seasoning'],
 'Ground coriander':['tsp',24,1.50,'Spices & seasoning'],
 'Ground turmeric':['tsp',24,1.50,'Spices & seasoning'],
 'Ground cardamom':['tsp',20,3,'Spices & seasoning'],
 'Garlic powder':['tsp',32,1.25,'Spices & seasoning'],
 'Chili flakes':['tsp',24,1.25,'Spices & seasoning'],
 'Fresh cilantro':['tbsp chopped',16,.90,'Produce'],
 'Fresh parsley':['tbsp chopped',16,1,'Produce'],
 'Salt':['tsp',120,.75,'Spices & seasoning'],
 'Black pepper':['tsp',48,2.50,'Spices & seasoning']
});
const libraryFlavorProfiles={
 mexican:{label:'Smoky cumin, oregano & lime',ingredients:{'Ground cumin':.375,'Smoked paprika':.375,'Dried oregano':.125,'Garlic':1,'Limes':.25,'Fresh cilantro':1},description:'Smoky cumin, garlic, lime and a fresh cilantro finish.'},
 asian:{label:'Ginger, garlic & sharp citrus',ingredients:{'Fresh ginger':.5,'Garlic':1,'Limes':.25,'Scallions':1,'Chili flakes':.0625},description:'Fresh ginger, garlic, a little chili heat and bright lime.'},
 curry:{label:'Warm curry spices & fresh aromatics',ingredients:{'Ground cumin':.25,'Ground coriander':.25,'Ground turmeric':.125,'Garlic':1,'Fresh ginger':.5,'Limes':.25},description:'Bloomed cumin, coriander and turmeric with garlic, ginger and lime.'},
 mediterranean:{label:'Lemon, garlic & garden herbs',ingredients:{'Dried oregano':.25,'Garlic':1,'Lemons':.25,'Fresh parsley':1},description:'Lemon zest, garlic, oregano and fresh parsley.'},
 moroccan:{label:'Toasty cumin, coriander & lemon',ingredients:{'Ground cumin':.375,'Ground coriander':.25,'Smoked paprika':.25,'Ground cinnamon':.0625,'Garlic':1,'Lemons':.25,'Fresh parsley':1},description:'Toasty cumin, coriander, a touch of cinnamon and lemon.'},
 german:{label:'Garlic, pepper & fresh dill',ingredients:{'Garlic':.5,'Black pepper':.125,'Fresh dill':1,'Lemons':.125},description:'Fresh dill, sharp lemon and plenty of black pepper.'},
 savory:{label:'Garlic, smoky spice & citrus',ingredients:{'Smoked paprika':.25,'Garlic':1,'Lemons':.25,'Fresh parsley':1},description:'Savory garlic, smoky paprika and a bright citrus finish.'},
 berry:{label:'Vanilla, citrus zest & a pinch of salt',ingredients:{'Vanilla extract':.25,'Lemons':.125,'Salt':.03125},description:'Vanilla and citrus zest make the fruit shine.'},
 cozy:{label:'Cinnamon, ginger & vanilla',ingredients:{'Ground cinnamon':.375,'Fresh ginger':.125,'Vanilla extract':.25,'Salt':.03125},description:'Warm cinnamon, a little ginger and vanilla.'},
 chai:{label:'Cinnamon, cardamom & ginger',ingredients:{'Ground cinnamon':.375,'Ground cardamom':.0625,'Fresh ginger':.125,'Vanilla extract':.25,'Salt':.03125},description:'Chai-style cinnamon, cardamom, ginger and vanilla.'},
 nutty:{label:'Vanilla, cinnamon & a salted nut-butter finish',ingredients:{'Vanilla extract':.25,'Ground cinnamon':.25,'Salt':.03125},description:'Vanilla, cinnamon and a pinch of salt bring out the nut-butter richness.'},
 chocolate:{label:'Vanilla & a salted chocolate finish',ingredients:{'Vanilla extract':.25,'Ground cinnamon':.0625,'Salt':.03125},description:'Vanilla, a whisper of cinnamon and a pinch of salt deepen the chocolate.'},
 tropical:{label:'Lime zest & vanilla',ingredients:{'Limes':.25,'Vanilla extract':.25,'Salt':.03125},description:'Fragrant lime zest and vanilla balance the tropical fruit.'}
};
function libraryFlavorType(recipe,category){
 const text=(recipe[0]+' '+(recipe[8]?.tags??[]).join(' ')).toLowerCase();
 const sweet=category==='snacks'||category==='breakfast'&&!/egg|burrito|frittata|enchilada|savory|savoury|kimchi/.test(text);
 if(sweet){
  if(/chai/.test(text))return 'chai';
  if(/chocolate|brownie/.test(text))return 'chocolate';
  if(/peanut|pb\b/.test(text))return 'nutty';
  if(/mango|coconut|pineapple/.test(text))return 'tropical';
  if(/apple|pumpkin|carrot|walnut/.test(text))return 'cozy';
  return 'berry';
 }
 if(/moroccan/.test(text))return 'moroccan';
 if(/german|mustard/.test(text))return 'german';
 if(/curry|indian|tikka|thai.*coconut/.test(text))return 'curry';
 if(/mexican|taco|chipotle|street corn|enchilada|fajita|tex.mex|cuban|caribbean/.test(text))return 'mexican';
 if(/korean|thai|asian|sesame|teriyaki|sushi|peanut.ginger/.test(text))return 'asian';
 if(/greek|mediterranean|italian|lemon|dill|feta|antipasto/.test(text))return 'mediterranean';
 return 'savory';
}
function enrichLibraryFlavor(recipe,category){
 if(!recipe||recipe[8]?.flavor)return;
 const type=libraryFlavorType(recipe,category),flavor=libraryFlavorProfiles[type];
 const additions=[];
 for(const [name,amount] of Object.entries(flavor.ingredients)){
  if(recipe[6][name]===undefined){recipe[6][name]=amount;additions.push(name)}
  else recipe[6][name]=Math.max(recipe[6][name],amount);
 }
 const sweet=['berry','cozy','chai','chocolate','nutty','tropical'].includes(type);
 if(!sweet){
  if(!recipe[6]['Olive oil']){recipe[6]['Olive oil']=.25;additions.push('Olive oil')}
  if(!Object.keys(recipe[6]).some(name=>/tamari|salsa|feta|cheddar|sauerkraut|salt/i.test(name))){recipe[6]['Salt']=.125;additions.push('Salt')}
  if(!recipe[6]['Black pepper']){recipe[6]['Black pepper']=.0625;additions.push('Black pepper')}
 }
 const citrus=additions.filter(name=>/Lemons|Limes/.test(name));
 const herbs=additions.filter(name=>/Fresh (?:cilantro|parsley|dill)|Scallions/.test(name));
 const spices=additions.filter(name=>/Ground |Smoked paprika|Dried oregano|Chili flakes|Garlic$|Fresh ginger/.test(name));
 const salt=additions.filter(name=>/Salt|Black pepper/.test(name));
 let note='';
 if(sweet){
  const mix=additions.filter(name=>!citrus.includes(name));
  if(mix.length)note+='Mix in '+mix.join(', ').toLowerCase()+' when combining the wet ingredients or creamy filling. Finely grate any fresh ginger first. ';
  if(citrus.length)note+='Zest the '+citrus.join(' and ').toLowerCase()+' before cutting; fold the zest into the batter or creamy filling and add the juice a little at a time to taste. ';
  note='Flavor prep: '+note+'Use the ingredient-list totals across the recipe, rather than adding the same seasoning twice. ';
  recipe[7]=note+recipe[7];
 }else{
  if(spices.length)note+='Gently warm '+spices.join(', ').toLowerCase()+' in a little of the listed olive oil for 30–60 seconds, stirring; do not let the garlic burn. Stir into the cooked filling. For cold jars, cool this mixture first and stir it into the dressing. ';
  if(citrus.length)note+='Zest the '+citrus.join(' and ').toLowerCase()+' before juicing. Add the juice gradually and finish with the zest for freshness. ';
  if(herbs.length)note+='Finely chop '+herbs.join(', ').toLowerCase()+' and fold in just before serving, or place at the top of cold jars. ';
  if(salt.length)note+='Use the listed '+salt.join(' and ').toLowerCase()+' to season the vegetables or filling. ';
  recipe[7]+=' Flavor finish: '+note+'Use the ingredient-list totals across the main steps and flavor finish; do not double the seasonings.';
 }
 recipe[1]+=' '+flavor.description;
 recipe[8]={...recipe[8],flavor:{type,label:flavor.label}};
}
for(const category of ['breakfast','lunch','dinner','snacks']){
 const base=category==='snacks'?snacks:category==='dinner'?[...extraDinners,...menus.flatMap(menu=>menu.recipes.slice(6))]:menus.flatMap(menu=>menu.recipes.slice(category==='breakfast'?0:3,category==='breakfast'?3:6));
 const seen=new Set();
 for(const recipe of [...base,...expandedRecipes[category],...familyRecipes[category]]){if(recipe&&!seen.has(recipe)){enrichLibraryFlavor(recipe,category);seen.add(recipe)}}
}
