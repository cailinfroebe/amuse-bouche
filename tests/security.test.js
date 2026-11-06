import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateState} from '../lib/state-validation.js';
import {isPublicIP} from '../lib/safe-fetch.js';
import {extractRecipe} from '../lib/recipe-parser.js';
import {readFile} from 'node:fs/promises';
test('saved state accepts profile data and rejects unrelated keys',()=>{
 const state={'amuse-profile':'{"name":"Example"}','amuse-extra-groceries':'[]'};
 assert.equal(validateState({state,revision:0}),null);
 assert(validateState({state:{...state,password:'not allowed'},revision:0}));
 assert(validateState({state:{'amuse-profile':'{"name":""}'},revision:0}));
});
test('importer excludes private, local and mapped private addresses',()=>{
 for(const ip of ['127.0.0.1','10.0.0.1','192.168.1.1','169.254.169.254','::1','fc00::1','::ffff:127.0.0.1'])assert.equal(isPublicIP(ip),false,ip);
 assert.equal(isPublicIP('8.8.8.8'),true);
});
test('recipe JSON-LD and web ingredient fallback are supported',()=>{
 const data={'@type':'Recipe',name:'Example lunch',recipeIngredient:['1 cup rice','shop recipe'],recipeInstructions:['Cook the rice. Serve with vegetables.'],recipeYield:'2 servings'};
 const result=extractRecipe({url:'https://example.com/recipe',html:`<script type="application/ld+json">${JSON.stringify(data)}</script>`});
 assert.equal(result.recipe.name,'Example lunch');assert.equal(result.recipe.yield,2);assert.equal(result.recipe.ingredients.length,1);
 const fallback=extractRecipe({url:'https://example.com/recipe',html:'<h1>Lunch</h1><li class="wprm-recipe-ingredient">1 cup <span>rice</span></li><div class="wprm-recipe-instruction-text">Cook rice.</div>'});assert.equal(fallback.recipe.ingredients[0],'1 cup rice');
});
test('database policies scope all access to the authenticated user',async()=>{
 const sql=await readFile('supabase/schema.sql','utf8');assert(sql.includes('enable row level security'));assert.equal((sql.match(/auth\.uid\(\)/g)||[]).length,4);assert(sql.includes('revoke all on public.kitchens from anon'));
});
