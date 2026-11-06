export function validateState(body){
 if(!body.state||typeof body.state!=='object'||Array.isArray(body.state)||!Number.isInteger(body.revision)||body.revision<0)return 'Invalid saved kitchen.';
 const entries=Object.entries(body.state);if(entries.length>1500||!entries.every(([key,value])=>/^(amuse-|lunch-club-)[a-zA-Z0-9_-]+$/.test(key)&&key.length<150&&typeof value==='string'&&value.length<1000000))return 'Invalid saved items.';
 let p;try{p=JSON.parse(body.state['amuse-profile']??'null')}catch{}
 if(!p||typeof p.name!=='string'||!p.name.trim()||p.name.length>60)return 'Please enter a profile name.';
 if(p.diets!==undefined&&(!p.diets||typeof p.diets!=='object'||Array.isArray(p.diets)||!Object.entries(p.diets).every(([key,value])=>['glutenFree','dairyFree','vegetarian','sugarFree'].includes(key)&&typeof value==='boolean')))return 'Invalid dietary preferences.';
 if(p.allergies!==undefined&&(!Array.isArray(p.allergies)||p.allergies.length>20||!p.allergies.every(v=>typeof v==='string'&&v.length<60)))return 'Invalid allergy preferences.';
 if(p.avoid!==undefined&&(typeof p.avoid!=='string'||p.avoid.length>250))return 'Please shorten the ingredients to avoid.';
 if(p.budget!==undefined&&(!Number.isFinite(p.budget)||p.budget<0||p.budget>10000))return 'Invalid household budget.';
 return null;
}
