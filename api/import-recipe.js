import {authenticate,sameOrigin,noStore} from '../lib/auth.js';
import {safeHTML} from '../lib/safe-fetch.js';
import {extractRecipe} from '../lib/recipe-parser.js';
export default async function handler(req,res){
 noStore(res);if(req.method!=='POST')return res.status(405).json({error:'Use the import form.'});if(!sameOrigin(req))return res.status(403).json({error:'Use this app’s import form.'});
 try{
  const auth=await authenticate(req,res);if(!auth)return;
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;if(JSON.stringify(body||{}).length>5000)throw Error('That link is too long.');
  const page=await safeHTML(body.url);let result=extractRecipe(page);
  if(!result.recipe&&/(^|\.)(pinterest\.[a-z.]+|pin\.it)$/.test(new URL(page.url).hostname)){
   for(const link of result.links.slice(0,3)){
    try{const original=new URL(link,page.url);if(!/(^|\.)(pinterest\.[a-z.]+|pin\.it|pinimg\.com)$/.test(original.hostname)){result=extractRecipe(await safeHTML(original.href));if(result.recipe)break}}catch{}
   }
  }
  if(!result.recipe)throw Error('This page did not expose ingredients and steps. Paste the original recipe website or use the recipe-text option.');
  return res.status(200).json({recipe:result.recipe});
 }catch(error){return res.status(422).json({error:error.message||'Could not import this recipe.'})}
}
