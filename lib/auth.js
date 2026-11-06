import {createClient} from '@supabase/supabase-js';
export function publicConfig(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
 if(!url||!key)throw Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Vercel, then redeploy.');
 if(key.startsWith('sb_secret_'))throw Error('Use a publishable key, never a secret key.');
 if(key.split('.').length===3){try{const body=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());if(body.role==='service_role')throw Error('service role')}catch(error){if(error.message==='service role')throw Error('Use the anon key, never the service-role key.')}}
 return {url,key};
}
export function noStore(res){res.setHeader('Cache-Control','private, no-store');res.setHeader('Vary','Authorization, X-Kitchen-Account')}
export async function authenticate(req,res){
 noStore(res);const token=req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];if(!token){res.status(401).json({error:'Please sign in with your email.'});return null}
 const {url,key}=publicConfig();const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:'Bearer '+token}}});
 const {data,error}=await db.auth.getUser(token);if(error||!data.user){res.status(401).json({error:'Your sign-in expired. Please sign in again.'});return null}
 return {user:data.user,db};
}
export function sameOrigin(req){const host=req.headers.host;try{return new URL(req.headers.origin||'').host===host}catch{return false}}
