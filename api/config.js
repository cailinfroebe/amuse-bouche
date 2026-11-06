import {publicConfig,noStore} from '../lib/auth.js';
export default function handler(req,res){noStore(res);if(req.method!=='GET')return res.status(405).json({error:'Method not allowed.'});try{return res.status(200).json(publicConfig())}catch(error){return res.status(503).json({error:error.message})}}
