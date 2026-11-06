import {load} from 'cheerio';
function isRecipeIngredient(value){return !/^(?:shop (?:this )?recipe|shop ingredients|print recipe|jump to recipe|save recipe|ingredients|instructions|equipment)[.!:]?$/i.test(String(value).trim())}
function clean(input){
 return String(input??'').replace(/<[^>]*>/g,' ').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{
  const code=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);
  return code>0&&code<=0x10ffff?String.fromCodePoint(code):'';
 }).replace(/&(amp|quot|apos|lt|gt|nbsp|frac12|frac14|frac34|deg|rsquo|lsquo|rdquo|ldquo|ndash|mdash);/g,(_,n)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' ',frac12:'½',frac14:'¼',frac34:'¾',deg:'°',rsquo:"'",lsquo:"'",rdquo:'"',ldquo:'"',ndash:'–',mdash:'—'}[n])).replace(/\s+/g,' ').trim();
}
function findRecipe(data,depth=0){
 if(!data||typeof data!=='object'||depth>15)return null;
 if([].concat(data['@type']??[]).some(type=>/(^|\/)recipe$/i.test(String(type))))return data;
 for(const value of Object.values(data)){
  if(typeof value==='object'){const found=findRecipe(value,depth+1);if(found)return found}
 }
 return null;
}
function steps(value){
 if(Array.isArray(value))return value.flatMap(steps);
 if(value&&typeof value==='object')return steps(value.itemListElement??value.text??value.description??'');
 return String(value??'').split(/\n+|<\/(?:p|li)>|<br\s*\/?>/i).map(clean).filter(Boolean).filter(isRecipeIngredient).flatMap(line=>line.split(/(?<=[.!?])\s+(?=[A-Z])/)).map(line=>line.replace(/^\d+[.)]\s*/, '').trim()).filter(Boolean);
}
function normalized(data,url){
 const rawYield=[].concat(data.recipeYield??[]).map(String).join(' ');
 const yieldMatch=rawYield.match(/\d+(?:\.\d+)?/);
 const ingredients=[].concat(data.recipeIngredient??[]).map(clean).filter(Boolean).filter(isRecipeIngredient);
 const method=steps(data.recipeInstructions);
 return {name:clean(data.name),ingredients,steps:method,yield:yieldMatch?Number(yieldMatch[0]):1,yieldKnown:!!yieldMatch,url};
}

export function extractRecipe(page){
 const $=load(page.html);const links=[];
 for(const element of $('script[type="application/ld+json"]').toArray()){
  try{const r=findRecipe(JSON.parse($(element).text()));if(r){const result=normalized(r,page.url);if(result.name&&result.ingredients.length&&result.steps.length)return {recipe:result,links}}}catch{}
 }
 const text=selector=>$(selector).toArray().map(el=>$(el).text().trim()).filter(Boolean);
 const ingredients=text('[itemprop="recipeIngredient"],.wprm-recipe-ingredient,.tasty-recipes-ingredients li,.mv-create-ingredients li').filter(isRecipeIngredient);
 const instructions=text('[itemprop="recipeInstructions"] li,.wprm-recipe-instruction-text,.tasty-recipes-instructions li,.mv-create-instructions li');
 $('meta[property="og:see_also"],meta[property="pin:source"],meta[name="pinterest:source"]').each((_i,el)=>links.push($(el).attr('content')));
 $('a[data-pin-url],a[data-test-id="source-link"],a[data-test-id="visit-site-button"]').each((_i,el)=>links.push($(el).attr('data-pin-url')||$(el).attr('href')));
 for(const match of page.html.matchAll(/"link"\s*:\s*"((?:\\.|[^"\\])+)"/g)){try{links.push(JSON.parse('"'+match[1]+'"'))}catch{}}
 if(ingredients.length&&instructions.length)return {recipe:normalized({name:$('h1').first().text(),recipeIngredient:ingredients,recipeInstructions:instructions,recipeYield:text('[itemprop="recipeYield"],.wprm-recipe-servings')[0]},page.url),links};
 return {recipe:null,links};
}
