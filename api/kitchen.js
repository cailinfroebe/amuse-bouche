import {authenticate,noStore,sameOrigin} from '../lib/auth.js';
import {validateState} from '../lib/state-validation.js';
export default async function handler(req,res){
 noStore(res);
 try{
  const auth=await authenticate(req,res);if(!auth)return;const {user,db}=auth;
  const identity={userId:user.id,email:user.email||null};
  if(req.method==='GET'){
   if(req.query.identity==='1')return res.status(200).json(identity);
   if(req.headers['x-kitchen-account']!==user.id)return res.status(409).json({code:'account_changed',error:'Your sign-in changed. Please open the right account.'});
   const {data,error}=await db.from('kitchens').select('state,revision').eq('user_id',user.id).maybeSingle();if(error)throw error;
   return res.status(200).json({...identity,state:data?.state||{},revision:data?.revision||0});
  }
  if(req.method!=='PUT')return res.status(405).json({error:'Method not allowed.'});
  if(!sameOrigin(req))return res.status(403).json({error:'Please save from this app.'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(JSON.stringify(body||{}).length>1500000)return res.status(413).json({error:'Your kitchen is too large to save.'});
  if(body?.ownerId!==user.id||req.headers['x-kitchen-account']!==user.id)return res.status(409).json({code:'account_changed',error:'Your account changed. Nothing was saved to the other account.'});
  const invalid=validateState(body);if(invalid)return res.status(400).json({error:invalid});
  const row={user_id:user.id,state:body.state,revision:body.revision+1,updated_at:new Date().toISOString()};
  const operation=body.revision===0?db.from('kitchens').insert(row):db.from('kitchens').update(row).eq('user_id',user.id).eq('revision',body.revision);
  const {data,error}=await operation.select('revision').maybeSingle();
  if(error?.code==='23505'||!error&&!data)return res.status(409).json({conflict:true,error:'This kitchen changed on another device. Reload the latest saved plan.'});
  if(error)throw error;
  return res.status(200).json({userId:user.id,revision:data.revision});
 }catch{return res.status(503).json({error:'Your kitchen could not be saved or loaded. Check setup and try again.'})}
}
