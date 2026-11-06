// Package estimates in USD. Butter is anchored to a listed 16 oz store-brand box.
// Other entries are planning estimates. Store prices and produce weights vary.
const shoppingCatalog=[];
function shoppingProduct(name,pattern,aisle,pack,price,options={}){
 shoppingCatalog.push({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,pattern,aisle,pack,price,base:'g',...options});
}
shoppingProduct('Butter',/\bbutter\b/i,'Dairy & eggs',453.592,2.96,{cup:226.796,each:113.398,stick:113.398,label:'16 oz box · 4 sticks'});
shoppingProduct('Peanut butter',/\bpeanut butter\b/i,'Pantry',454,2.50,{cup:256,label:'16 oz jar'});
shoppingProduct('Greek yogurt',/\b(?:plain |vanilla |greek )*yogurt\b/i,'Dairy & eggs',907,4,{cup:245,label:'32 oz tub'});
shoppingProduct('Cottage cheese',/\bcottage cheese\b/i,'Dairy & eggs',680,3.50,{cup:226,label:'24 oz tub'});
shoppingProduct('Egg whites',/\begg whites?\b/i,'Dairy & eggs',454,4,{cup:243,each:33,label:'16 oz carton'});
shoppingProduct('Eggs',/\beggs?\b/i,'Dairy & eggs',600,3.50,{each:50,cup:243,label:'1 dozen eggs',countLabel:'eggs'});
shoppingProduct('Milk',/\bmilk\b/i,'Dairy & eggs',1893,3.50,{base:'ml',density:1.03,label:'½ gallon'});
shoppingProduct('Coconut milk',/\bcoconut milk\b/i,'Cans & jars',400,2.10,{base:'ml',can:400,label:'13.5 fl oz can'});
shoppingProduct('Cream',/\bcream\b/i,'Dairy & eggs',473,3,{base:'ml',density:1,label:'1 pint'});
shoppingProduct('Cream cheese',/\bcream cheese\b/i,'Dairy & eggs',227,2,{cup:232,label:'8 oz block'});
shoppingProduct('Feta',/\bfeta\b/i,'Dairy & eggs',170,3,{cup:150,label:'6 oz tub'});
shoppingProduct('Parmesan',/\bparmesan\b/i,'Dairy & eggs',170,3.30,{cup:90,label:'6 oz tub'});
shoppingProduct('Cheddar',/\bcheddar\b/i,'Dairy & eggs',227,2.50,{cup:113,label:'8 oz bag'});
shoppingProduct('Mozzarella',/\bmozzarella\b/i,'Dairy & eggs',227,2.50,{cup:112,label:'8 oz bag'});
shoppingProduct('Chicken',/\bchicken\b/i,'Meat & seafood',453.592,3.50,{cup:140,each:170,label:'1 lb'});
shoppingProduct('Ground beef',/\bbeef\b/i,'Meat & seafood',453.592,5.50,{cup:150,label:'1 lb'});
shoppingProduct('Ground turkey',/\bturkey\b/i,'Meat & seafood',453.592,4,{cup:150,label:'1 lb'});
shoppingProduct('Shrimp',/\bshrimp\b|\bprawns?\b/i,'Meat & seafood',453.592,8,{cup:150,each:15,label:'1 lb bag'});
shoppingProduct('Tuna',/\btuna\b/i,'Meat & seafood',113,1.35,{cup:150,can:113,label:'5 oz can · about 4 oz drained'});
shoppingProduct('Salmon',/\bsalmon\b/i,'Meat & seafood',453.592,10,{each:170,label:'1 lb'});
shoppingProduct('Tofu',/\btofu\b/i,'Meat & seafood',397,2.20,{cup:248,label:'14 oz block'});
shoppingProduct('Gluten-free rolled oats',/\b(?:gf |gluten.free )?(?:rolled |old.fashioned )?oats\b/i,'Grains & baking',454,5,{cup:80,label:'16 oz bag'});
shoppingProduct('Brown rice',/\b(?:brown |sushi |white |basmati |jasmine )?rice\b/i,'Grains & baking',907,3,{cup:185,label:'32 oz bag'});
shoppingProduct('Quinoa',/\bquinoa\b/i,'Grains & baking',454,4,{cup:170,label:'16 oz bag'});
shoppingProduct('Lentils',/\blentils?\b/i,'Grains & baking',454,1.80,{cup:192,label:'1 lb bag'});
shoppingProduct('Gluten-free flour',/\b(?:gf|gluten.free)\s+(?:all.purpose\s+|bread\s+)?flour\b/i,'Grains & baking',623,4.50,{cup:120,label:'22 oz bag'});
shoppingProduct('All-purpose flour',/\b(?:all.purpose )?flour\b/i,'Grains & baking',2268,2.50,{cup:120,label:'5 lb bag'});
shoppingProduct('Almond flour',/\balmond flour\b/i,'Grains & baking',454,6,{cup:96,label:'16 oz bag'});
shoppingProduct('Sugar',/\b(?:granulated |brown |powdered )?sugar\b/i,'Grains & baking',1814,3,{cup:200,label:'4 lb bag'});
shoppingProduct('Chocolate chips',/\b(?:gf |gluten.free )?(?:dark |semi.sweet )?chocolate(?: chips)?\b/i,'Grains & baking',283,3,{cup:170,label:'10 oz bag'});
shoppingProduct('Cocoa powder',/\bcocoa(?: powder)?\b/i,'Grains & baking',227,3,{cup:85,label:'8 oz tub'});
shoppingProduct('Baking powder',/\bbaking powder\b/i,'Grains & baking',227,2,{cup:192,label:'8 oz tin'});
shoppingProduct('Baking soda',/\bbaking soda\b/i,'Grains & baking',454,1,{cup:220,label:'16 oz box'});
shoppingProduct('Gluten-free corn tortillas',/\b(?:gf |gluten.free )?(?:corn )?tortillas\b/i,'Bread & wraps',500,2.75,{each:25,label:'20 tortillas',countLabel:'tortillas'});
shoppingProduct('Gluten-free wraps',/\b(?:gf |gluten.free )?(?:burrito.size )?wraps\b/i,'Bread & wraps',360,5.50,{each:60,label:'6 wraps',countLabel:'wraps'});
shoppingProduct('Bread',/\bbread\b/i,'Bread & wraps',454,5,{slice:28,each:454,label:'1 loaf'});
shoppingProduct('Pasta',/\b(?:gf |gluten.free |chickpea )?pasta\b/i,'Grains & baking',227,2.75,{cup:100,label:'8 oz box'});
shoppingProduct('Black beans',/\bblack beans?\b/i,'Cans & jars',258,.95,{cup:172,can:258,label:'15 oz can · about 1½ cups drained'});
shoppingProduct('Kidney beans',/\bkidney beans?\b/i,'Cans & jars',255,.95,{cup:177,can:255,label:'15 oz can · drained'});
shoppingProduct('Chickpeas',/\bchickpeas?\b|\bgarbanzo beans?\b/i,'Cans & jars',255,.95,{cup:164,can:255,label:'15 oz can · about 1½ cups drained'});
shoppingProduct('Crushed tomatoes',/\bcrushed tomatoes\b/i,'Cans & jars',794,2,{cup:242,can:794,label:'28 oz can'});
shoppingProduct('Tomato paste',/\btomato paste\b/i,'Cans & jars',170,.90,{cup:262,can:170,label:'6 oz can'});
shoppingProduct('Canned pumpkin',/\b(?:canned )?pumpkin(?: puree)?\b/i,'Cans & jars',425,1.75,{cup:245,can:425,label:'15 oz can'});
shoppingProduct('Salsa',/\bsalsa\b/i,'Cans & jars',454,2.50,{cup:259,label:'16 oz jar'});
shoppingProduct('Chipotle peppers in adobo',/\bchipotle peppers?(?: in adobo)?\b/i,'Cans & jars',198,2.20,{cup:230,can:198,label:'7 oz can'});
shoppingProduct('Sweet potatoes',/\bsweet potato(?:es)?\b/i,'Produce',200,.85,{each:200,cup:133,label:'1 medium sweet potato',countLabel:'sweet potatoes'});
shoppingProduct('Potatoes',/\b(?:gold |russet |yukon )?potato(?:es)?\b/i,'Produce',200,.55,{each:200,cup:150,label:'1 medium potato',countLabel:'potatoes'});
shoppingProduct('Apples',/\bapples?\b/i,'Produce',182,.75,{each:182,cup:125,label:'1 medium apple',countLabel:'apples'});
shoppingProduct('Bananas',/\bbananas?\b/i,'Produce',118,.25,{each:118,cup:225,label:'1 banana',countLabel:'bananas'});
shoppingProduct('Avocados',/\bavocados?\b/i,'Produce',150,.95,{each:150,cup:150,label:'1 avocado',countLabel:'avocados'});
shoppingProduct('Lemons',/\blemons?\b/i,'Produce',58,.65,{each:58,cup:244,label:'1 lemon',countLabel:'lemons'});
shoppingProduct('Limes',/\blimes?\b/i,'Produce',44,.45,{each:44,cup:244,label:'1 lime',countLabel:'limes'});
shoppingProduct('Lemon juice',/\blemon juice\b/i,'Produce',45,.65,{base:'ml',each:45,label:'1 lemon · about 3 tbsp juice'});
shoppingProduct('Lime juice',/\blime juice\b/i,'Produce',30,.45,{base:'ml',each:30,label:'1 lime · about 2 tbsp juice'});
shoppingProduct('Onions',/\b(?:red |white |yellow )?onions?\b/i,'Produce',150,.85,{each:150,cup:160,label:'1 medium onion',countLabel:'onions'});
shoppingProduct('Scallions',/\bscallions?\b|\bgreen onions?\b/i,'Produce',90,1.15,{each:15,stalk:15,bunch:90,cup:100,label:'1 bunch · about 6 stalks'});
shoppingProduct('Carrots',/\bcarrots?\b/i,'Produce',454,1,{each:61,cup:110,label:'1 lb bag'});
shoppingProduct('Cucumbers',/\bcucumbers?\b/i,'Produce',300,.85,{each:300,cup:104,label:'1 cucumber',countLabel:'cucumbers'});
shoppingProduct('Bell peppers',/\b(?:(?:red|yellow|orange|green|bell|sweet) )+peppers?\b/i,'Produce',150,.85,{each:150,cup:150,label:'1 bell pepper',countLabel:'peppers'});
shoppingProduct('Radishes',/\bradish(?:es)?\b/i,'Produce',150,1.50,{each:5,bunch:150,cup:116,label:'1 bunch'});
shoppingProduct('Cabbage',/\b(?:red |purple |green )?cabbage\b/i,'Produce',908,2.20,{each:908,cup:89,label:'1 small head'});
shoppingProduct('Spinach',/\bspinach\b/i,'Produce',142,2.50,{cup:30,label:'5 oz bag'});
shoppingProduct('Broccoli',/\bbroccoli\b/i,'Frozen',340,2.25,{cup:91,each:300,label:'12 oz bag'});
shoppingProduct('Cauliflower',/\bcauliflower\b/i,'Frozen',454,2.50,{cup:107,each:600,label:'16 oz bag'});
shoppingProduct('Corn',/\b(?:frozen |sweet )?corn\b/i,'Frozen',340,2,{cup:165,can:255,label:'12 oz bag'});
shoppingProduct('Edamame',/\b(?:shelled )?edamame\b/i,'Frozen',340,3,{cup:155,label:'12 oz bag'});
shoppingProduct('Blueberries',/\bblueberr(?:y|ies)\b/i,'Frozen',454,3.50,{cup:148,label:'16 oz bag'});
shoppingProduct('Strawberries',/\bstrawberr(?:y|ies)\b/i,'Produce',454,3.50,{cup:152,each:12,label:'1 lb carton'});
shoppingProduct('Pineapple',/\bpineapple\b/i,'Frozen',454,3.50,{cup:165,each:600,label:'16 oz bag'});
shoppingProduct('Peaches',/\bpeach(?:es)?\b/i,'Frozen',454,3.75,{cup:154,each:150,label:'16 oz bag'});
shoppingProduct('Tomatoes',/\btomato(?:es)?\b/i,'Produce',150,.80,{cup:180,each:150,label:'1 medium tomato'});
shoppingProduct('Garlic',/\bgarlic\b/i,'Produce',30,.55,{each:30,clove:3,cup:136,label:'1 bulb'});
shoppingProduct('Ginger',/\bginger\b/i,'Produce',60,1.10,{each:60,cup:96,label:'1 small piece · about 60 g'});
shoppingProduct('Dill',/\bdill\b/i,'Produce',28,1.65,{bunch:28,cup:9,label:'1 bunch'});
shoppingProduct('Cilantro',/\bcilantro\b|\bcoriander leaves\b/i,'Produce',28,.90,{bunch:28,cup:16,label:'1 bunch'});
shoppingProduct('Parsley',/\bparsley\b/i,'Produce',28,1,{bunch:28,cup:16,label:'1 bunch'});
shoppingProduct('Walnuts',/\bwalnuts?\b/i,'Nuts & seeds',227,4,{cup:117,label:'8 oz bag'});
shoppingProduct('Peanuts',/\b(?:roasted )?peanuts?\b/i,'Nuts & seeds',454,2.25,{cup:146,label:'16 oz jar'});
shoppingProduct('Chia seeds',/\bchia(?: seeds)?\b/i,'Nuts & seeds',170,4,{cup:192,label:'6 oz bag'});
shoppingProduct('Sesame seeds',/\bsesame(?: seeds)?\b/i,'Nuts & seeds',113,2.40,{cup:144,label:'4 oz jar'});
shoppingProduct('Protein powder',/\b(?:gf |gluten.free )?protein powder\b/i,'Pantry',450,19,{scoop:30,cup:120,label:'15 scoops · 450 g'});
shoppingProduct('Tamari',/\btamari\b|\bsoy sauce\b/i,'Sauces & oils',296,4,{base:'ml',density:1.16,label:'10 fl oz bottle'});
shoppingProduct('Dijon mustard',/\b(?:dijon )?mustard\b/i,'Sauces & oils',340,1.85,{cup:249,label:'12 oz jar'});
shoppingProduct('Sriracha',/\bsriracha\b/i,'Sauces & oils',425,3.25,{cup:260,label:'15 oz bottle'});
shoppingProduct('Olive oil',/\b(?:olive |avocado |neutral |vegetable )?oil\b/i,'Sauces & oils',500,6,{base:'ml',density:.91,label:'500 ml bottle'});
shoppingProduct('Honey',/\b(?:hot )?honey\b/i,'Sauces & oils',340,3.50,{cup:339,label:'12 oz bottle'});
shoppingProduct('Vanilla extract',/\bvanilla(?: extract)?\b/i,'Grains & baking',59,3.50,{base:'ml',label:'2 fl oz bottle'});
shoppingProduct('Salt',/\b(?:kosher |sea |table )?salt\b/i,'Spices & seasoning',737,.75,{cup:288,label:'26 oz canister'});
shoppingProduct('Black pepper',/\b(?:ground |black )?pepper\b/i,'Spices & seasoning',85,2.50,{cup:104,label:'3 oz jar'});
shoppingProduct('Garlic powder',/\bgarlic powder\b/i,'Spices & seasoning',85,1.25,{cup:155,label:'3 oz jar'});
shoppingProduct('Cinnamon',/\bcinnamon\b/i,'Spices & seasoning',71,1.25,{cup:125,label:'2.5 oz jar'});
shoppingProduct('Cumin',/\bcumin\b/i,'Spices & seasoning',71,1.25,{cup:96,label:'2.5 oz jar'});
shoppingProduct('Smoked paprika',/\b(?:smoked )?paprika\b/i,'Spices & seasoning',71,1.50,{cup:108,label:'2.5 oz jar'});
shoppingProduct('Curry powder',/\b(?:gf |gluten.free )?curry powder\b/i,'Spices & seasoning',85,2.25,{cup:96,label:'3 oz jar'});
shoppingProduct('Chili flakes',/\bchili flakes\b|\bcrushed red pepper\b/i,'Spices & seasoning',43,1.25,{cup:80,label:'1.5 oz jar'});
shoppingProduct('Oregano',/\boregano\b/i,'Spices & seasoning',21,1.25,{cup:48,label:'0.75 oz jar'});
shoppingProduct('Ground coriander',/\bground coriander\b/i,'Spices & seasoning',57,1.50,{cup:80,label:'2 oz jar'});
shoppingProduct('Turmeric',/\bturmeric\b/i,'Spices & seasoning',57,1.50,{cup:150,label:'2 oz jar'});
shoppingProduct('Cardamom',/\bcardamom\b/i,'Spices & seasoning',43,3,{cup:96,label:'1.5 oz jar'});
shoppingProduct('Water',/\bwater\b/i,'Other',1000,0,{base:'ml',label:'tap water'});
shoppingProduct('Paper towels',/\bpaper towels?\b/i,'Household',2,4,{base:'each',label:'2 rolls'});
shoppingProduct('Toilet paper',/\btoilet paper\b/i,'Household',6,5,{base:'each',label:'6 rolls'});
shoppingProduct('Dish soap',/\bdish soap\b/i,'Household',532,2,{base:'ml',label:'18 fl oz bottle'});

shoppingProduct('Lettuce',/\b(?:butter |romaine |iceberg )?lettuce\b/i,'Produce',300,2,{each:300,cup:36,label:'1 head'});
shoppingProduct('Kale',/\bkale\b/i,'Produce',227,2.50,{cup:67,bunch:227,label:'8 oz bunch'});
shoppingProduct('Basil',/\bbasil\b/i,'Produce',28,1.65,{cup:24,bunch:28,label:'1 bunch'});
shoppingProduct('Mushrooms',/\bmushrooms?\b/i,'Produce',227,2,{cup:70,each:18,label:'8 oz carton'});
shoppingProduct('Almonds',/\balmonds?\b/i,'Nuts & seeds',227,4,{cup:143,label:'8 oz bag'});
shoppingProduct('Cashews',/\bcashews?\b/i,'Nuts & seeds',227,4,{cup:137,label:'8 oz bag'});
shoppingProduct('Vinegar',/\b(?:apple cider |rice |white |red wine |balsamic )?vinegar\b/i,'Sauces & oils',473,2,{base:'ml',density:1,label:'16 fl oz bottle'});
shoppingProduct('Sesame oil',/\bsesame oil\b/i,'Sauces & oils',148,4,{base:'ml',density:.92,label:'5 fl oz bottle'});
shoppingProduct('Avocado oil',/\bavocado oil\b/i,'Sauces & oils',500,7,{base:'ml',density:.91,label:'500 ml bottle'});
shoppingProduct('Vegetable oil',/\bvegetable oil\b/i,'Sauces & oils',946,3,{base:'ml',density:.92,label:'32 fl oz bottle'});
shoppingProduct('Maple syrup',/\b(?:pure )?maple syrup\b/i,'Sauces & oils',355,5,{base:'ml',density:1.33,label:'12 fl oz bottle'});
shoppingProduct('Tahini',/\btahini\b/i,'Sauces & oils',454,5,{cup:240,label:'16 oz jar'});
shoppingProduct('Ketchup',/\bketchup\b/i,'Sauces & oils',567,2,{cup:272,label:'20 oz bottle'});
shoppingProduct('Onion powder',/\bonion powder\b/i,'Spices & seasoning',85,1.25,{cup:128,label:'3 oz jar'});
shoppingProduct('Oregano',/\boregano\b/i,'Spices & seasoning',21,1.25,{cup:48,label:'0.75 oz jar'});
shoppingProduct('Cornstarch',/\bcornstarch\b|\bcorn starch\b/i,'Grains & baking',454,2,{cup:128,label:'16 oz box'});
shoppingProduct('Tapioca flour',/\btapioca (?:flour|starch)\b/i,'Grains & baking',454,3.50,{cup:120,label:'16 oz bag'});
shoppingProduct('Yeast',/\b(?:active dry |instant )?yeast\b/i,'Grains & baking',21,1,{cup:144,label:'3 packets · 7 g each'});

const shoppingUnits={tsp:'tsp',teaspoon:'tsp',teaspoons:'tsp',tbsp:'tbsp',tablespoon:'tbsp',tablespoons:'tbsp',cup:'cup',cups:'cup',g:'g',gram:'g',grams:'g',kg:'kg',kilogram:'kg',kilograms:'kg',oz:'oz',ounce:'oz',ounces:'oz',lb:'lb',lbs:'lb',pound:'lb',pounds:'lb',ml:'ml',milliliter:'ml',milliliters:'ml',l:'l',liter:'l',liters:'l',stick:'stick',sticks:'stick',can:'can',cans:'can',bunch:'bunch',bunches:'bunch',clove:'clove',cloves:'clove',slice:'slice',slices:'slice',scoop:'scoop',scoops:'scoop',stalk:'stalk',stalks:'stalk',package:'package',packages:'package',pack:'package',packs:'package',bag:'package',bags:'package',bottle:'package',bottles:'package',carton:'package',cartons:'package',box:'package',boxes:'package',each:'each',block:'package',blocks:'package',loaf:'package',loaves:'package'};
function parseShoppingLine(input){
 const original=String(input).trim();
 let text=original.replace(/½/g,' 1/2').replace(/¼/g,' 1/4').replace(/¾/g,' 3/4').replace(/⅓/g,' 1/3').replace(/⅔/g,' 2/3').replace(/⅛/g,' 1/8').replace(/⅜/g,' 3/8').replace(/⅝/g,' 5/8').replace(/⅞/g,' 7/8').replace(/^[-•]\s*/,'').trim();
 const parts=[];
 let range=false;
 for(let i=0;i<4;i++){
  const number=text.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/);
  if(!number)break;
  let amount=quantityValue(number[1]);text=text.slice(number[0].length).trim();
  const upper=text.match(/^(?:-|–|to)\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/);
  if(upper){amount=Math.max(amount,quantityValue(upper[1]));text=text.slice(upper[0].length).trim();range=true}
  let declaredSize;
  const packageSize=text.match(/^\((\d+(?:\.\d+)?)\s*[- ]?\s*(oz|ounces?|g|grams?|ml)\)\s*/i)??text.match(/^(\d+(?:\.\d+)?)\s*[- ]\s*(oz|ounces?|g|grams?)\s+/i);
  if(packageSize){
   declaredSize={amount:Number(packageSize[1]),unit:shoppingUnits[packageSize[2].toLowerCase()]};
   text=text.slice(packageSize[0].length);
  }else text=text.replace(/^\([^)]*\)\s*/,'');
  const fluid=text.match(/^(?:fl\.?\s*oz\.?|fluid ounces?)\b\s*/i);
  const unitWord=text.match(/^([a-z]+)\.?\b\s*/i);
  let unit='each';
  if(fluid){unit='fl-oz';text=text.slice(fluid[0].length)}
  else if(unitWord&&shoppingUnits[unitWord[1].toLowerCase()]){unit=shoppingUnits[unitWord[1].toLowerCase()];text=text.slice(unitWord[0].length)}
  parts.push({amount,unit,declaredSize});
  if(!/^(?:\+|plus)\s*/i.test(text))break;
  text=text.replace(/^(?:\+|plus)\s*/i,'');
 }
 text=text.replace(/^of\s+/i,'').replace(/^(raw|dry|drained|crumbled|shredded|chopped|grated|minced)\s+/i,'').trim();
 return {original,name:text||original,parts,range};
}
function shoppingProductFor(name){
 let winner,score=0;
 for(const product of shoppingCatalog){
  const match=name.match(product.pattern);
  if(match&&match[0].length>score){winner=product;score=match[0].length}
 }
 if(winner)return winner;
 const cleaned=name.toLowerCase().split(',')[0].replace(/\b(fresh|chopped|diced|minced|sliced)\b/g,'').replace(/\s+/g,' ').trim();
 return {id:'other-'+cleaned.replace(/[^a-z0-9]+/g,'-'),name:cleaned||'Extra item',aisle:'Other',base:'g',pack:454,price:3,label:'1 standard package · allowance',cup:200,each:454,estimatedSize:true};
}
function convertedShoppingAmount(part,product){
 const {amount,unit}=part;
 if(unit==='can'&&product.can)return amount*product.can;
 if(part.declaredSize&&['package','each','can'].includes(unit)){
  const size=convertedShoppingAmount(part.declaredSize,product);
  return size===null?null:amount*size;
 }
 if(unit==='package')return amount*product.pack;
 if(unit==='bunch'&&product.bunch)return amount*product.bunch;
 if(product[unit]&&unit!=='cup')return amount*product[unit];
 if(product.base==='each')return amount;
 const mass={g:1,kg:1000,oz:28.349523125,lb:453.59237};
 const volume={ml:1,l:1000,'fl-oz':29.5735295625,tsp:4.92892159375,tbsp:14.78676478125,cup:236.5882365};
 if(product.base==='g'){
  if(mass[unit])return amount*mass[unit];
  if(['cup','tbsp','tsp'].includes(unit)&&product.cup)return amount*product.cup/(unit==='cup'?1:unit==='tbsp'?16:48);
  if(volume[unit]&&product.density)return amount*volume[unit]*product.density;
 }else{
  if(volume[unit])return amount*volume[unit];
  if(mass[unit]&&product.density)return amount*mass[unit]/product.density;
 }
 return null;
}
function combineShoppingLines(lines){
 const items=new Map();
 for(const line of lines){
  if(!line.text?.trim()||!isRecipeIngredient(line.text))continue;
  const split=/\bsalt and pepper\b/i.test(line.text)?[line.text.replace(/salt and pepper/i,'salt'),line.text.replace(/salt and pepper/i,'black pepper')]:[line.text];
  for(const text of split){
   const parsed=parseShoppingLine(text);
   const product=shoppingProductFor(parsed.name);
   if(!items.has(product.id))items.set(product.id,{...product,needed:0,unclear:false,sources:[],originals:[]});
   const item=items.get(product.id);
   item.sources=[...new Set([...item.sources,line.source??'My list'])];
   item.originals.push(text);
   if(!parsed.parts.length){item.unclear=true;continue}
   for(const part of parsed.parts){
    const value=convertedShoppingAmount(part,product);
    if(value===null)item.unclear=true;
    else item.needed+=value*(line.multiplier??1);
   }
   if(parsed.range)item.range=true;
  }
 }
 return [...items.values()].map(item=>{
  const count=Math.max(item.unclear||item.needed>0?1:0,Math.ceil(item.needed/item.pack-1e-5));
  return {...item,count,cost:count*item.price};
 }).sort((a,b)=>a.name.localeCompare(b.name));
}
function neededShoppingText(item){
 if(!item.needed)return 'As needed · check recipe amount';
 const amount=item.needed;
 const rounded=n=>Number(n.toFixed(n<10?2:1));
 let text;
 if(item.id==='butter')text=rounded(amount/14.17475)+' tbsp ('+Math.round(amount)+' g)';
 else if(item.countLabel&&item.each)text=rounded(amount/item.each)+' '+item.countLabel;
 else if(item.base==='g')text=amount>=1000?rounded(amount/1000)+' kg':rounded(amount)+' g';
 else if(item.base==='ml')text=amount>=1000?rounded(amount/1000)+' L':rounded(amount)+' ml';
 else text=rounded(amount)+' items';
 return (item.range?'Up to ':'')+text+(item.unclear?' + as needed':'');
}
function suggestedShoppingLines(recipe,servings){
 const lines=Object.entries(recipe[6]).map(([name,n])=>({text:qty(n*servings)+' '+pantry[name][0]+' '+name,source:recipe[0]}));
 const method=recipe[7];
 for(const [pattern,name] of [[/\boil\b/i,'Olive oil'],[/\bhoney\b/i,'Honey'],[/\bvanilla\b/i,'Vanilla extract'],[/\bbaking powder\b/i,'Baking powder'],[/\bcinnamon\b/i,'Cinnamon'],[/\bcumin\b/i,'Cumin'],[/\bgarlic powder\b/i,'Garlic powder'],[/\bpaprika\b/i,'Smoked paprika'],[/\bchili flakes\b/i,'Chili flakes'],[/\bsalt\b/i,'Salt'],[/\bpepper\b/i,'Black pepper']]){
  if(pattern.test(method)&&!Object.keys(recipe[6]).some(key=>shoppingProductFor(key).id===shoppingProductFor(name).id))lines.push({text:name+' (as needed)',source:recipe[0]});
 }
 return lines;
}
const manualShoppingItems=()=>readJSON('amuse-extra-groceries',[]);
function renderAddItems(){
 content.innerHTML=`<section class="add-items-page"><p class="eyebrow">A little something extra</p><h2>ADD ITEMS TO LIST</h2><form id="add-items-form" class="craving-form"><label class="sr-only" for="add-item-input">Item to add</label><input id="add-item-input" required autocomplete="off" placeholder="e.g. 2 apples"><button type="submit" aria-label="Add item">＋</button></form><p id="add-item-status" role="status"></p><a href="#groceries">View grocery list →</a></section>`;
 content.querySelector('#add-items-form').onsubmit=event=>{
  event.preventDefault();
  const input=content.querySelector('#add-item-input');const text=input.value.trim();if(!text)return;
  const list=manualShoppingItems();list.push({id:crypto.randomUUID(),text});set('amuse-extra-groceries',JSON.stringify(list));
  const key='amuse-removed-groceries-'+edition;
  const id=shoppingProductFor(parseShoppingLine(text).name).id;
  set(key,JSON.stringify(readJSON(key,[]).filter(item=>item!==id)));
  const checks=readJSON('amuse-grocery-checks-'+edition,{});delete checks[id];set('amuse-grocery-checks-'+edition,JSON.stringify(checks));
  content.querySelector('#add-item-status').textContent='Added '+text+' to your list.';
  input.value='';input.focus();
 };
}
function renderUnifiedGroceries(lines){
 const rows=combineShoppingLines([...lines,...manualShoppingItems().map(item=>({text:item.text,source:'Added by you'}))]);
 const excluded=new Set(readJSON('amuse-removed-groceries-'+edition,[]));
 const checked=readJSON('amuse-grocery-checks-'+edition,{});
 const active=rows.filter(item=>!excluded.has(item.id)&&!checked[item.id]);
 const removed=rows.filter(item=>excluded.has(item.id));
 const categories=['Produce','Dairy & eggs','Meat & seafood','Frozen','Bread & wraps','Grains & baking','Cans & jars','Nuts & seeds','Sauces & oils','Spices & seasoning','Household','Other'];
 const total=active.reduce((sum,item)=>sum+item.cost,0);
 content.innerHTML=`<div class="meal-heading"><div><p class="eyebrow">Everything in one place</p><h2>Grocery list</h2></div><a class="button-link" href="#add">＋ Add items</a></div><p class="grocery-total"><span class="total">${cash(total)}</span> estimated checkout</p><p class="lede">All active recipes and extra items, combined by ingredient. Quantities include your people count. Check off purchased items to clear them from the list. Use − to remove anything you already have.</p><p class="cost-explanation">Costs cover whole packages, after combining all recipes. For example, a 16 oz box of butter contains 32 tbsp. Prices are store-brand estimates, before tax. Unspecified amounts use a one-package allowance.</p><div class="unified-groceries">${categories.map(category=>{
  const items=active.filter(item=>item.aisle===category);if(!items.length)return '';
  return `<section class="grocery-category"><h3>${category}</h3>${items.map(item=>`<article class="grocery-item"><label><input type="checkbox" data-shopping-check="${escapeHTML(item.id)}" ${checked[item.id]?'checked':''}><span><strong>${escapeHTML(item.name)}</strong><small>Need ${neededShoppingText(item)} · Buy ${item.count} × ${escapeHTML(item.label)}</small><small class="ingredient-sources" title="${escapeHTML(item.sources.join(' · '))}">${item.sources.length>1?item.sources.length+' recipe sources':escapeHTML(item.sources[0])}${item.estimatedSize?' · package-size allowance':''}</small></span></label><span class="ingredient-cost">${cash(item.cost)}</span><button class="remove-ingredient" data-remove-ingredient="${escapeHTML(item.id)}" aria-label="Remove ${escapeHTML(item.name)} from shopping list">−</button></article>`).join('')}</section>`;
 }).join('')}</div>${!active.length?'<p class="empty-menu">Your list is empty. Add an item or restore an ingredient below.</p>':''}${removed.length?`<details class="removed-groceries"><summary>Removed items (${removed.length})</summary>${removed.map(item=>`<div class="removed-row"><span>${escapeHTML(item.name)} · ${cash(item.cost)}</span><button data-restore-ingredient="${escapeHTML(item.id)}" aria-label="Restore ${escapeHTML(item.name)}">＋ Restore</button></div>`).join('')}</details>`:''}<p class="field-help">Cup-to-weight conversions depend on the ingredient. Produce uses typical edible weights. Review recipe quantities when an amount is marked “as needed.” <a href="https://www.walmart.com/c/kp/great-value-butter-price" target="_blank" rel="noopener noreferrer">Butter price reference</a></p>`;
 const updateExcluded=()=>{
  set('amuse-removed-groceries-'+edition,JSON.stringify([...excluded]));render();
 };
 content.querySelectorAll('[data-remove-ingredient]').forEach(button=>button.onclick=()=>{excluded.add(button.dataset.removeIngredient);updateExcluded()});
 content.querySelectorAll('[data-restore-ingredient]').forEach(button=>button.onclick=()=>{excluded.delete(button.dataset.restoreIngredient);updateExcluded()});
 content.querySelectorAll('[data-shopping-check]').forEach(input=>input.onchange=()=>{checked[input.dataset.shoppingCheck]=input.checked;set('amuse-grocery-checks-'+edition,JSON.stringify(checked));
  if(input.checked)set('amuse-extra-groceries',JSON.stringify(manualShoppingItems().filter(item=>shoppingProductFor(parseShoppingLine(item.text).name).id!==input.dataset.shoppingCheck)));
  render()});
}
