import {lookup} from 'node:dns/promises';
import {request} from 'node:https';
import {request as httpRequest} from 'node:http';
import ipaddr from 'ipaddr.js';
export function isPublicIP(address){try{let ip=ipaddr.parse(address);if(ip.kind()==='ipv6'&&ip.isIPv4MappedAddress())ip=ip.toIPv4Address();return ip.range()==='unicast'}catch{return false}}
export async function safeHTML(input){
 let url=new URL(input);const deadline=Date.now()+22000;
 for(let i=0;i<6;i++){
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port||!url.hostname.includes('.')||/localhost|\.local$|\.internal$|\.test$|\.invalid$/i.test(url.hostname))throw Error('Use a public recipe website link.');
  const records=await lookup(url.hostname,{all:true});if(!records.length||records.some(record=>!isPublicIP(record.address)))throw Error('Only public recipe websites can be imported.');
  const pinned=records[0];const remaining=deadline-Date.now();if(remaining<=0)throw Error('This website took too long to respond.');
  const page=await new Promise((resolve,reject)=>{
   const send=url.protocol==='https:'?request:httpRequest;
   const req=send(url,{method:'GET',headers:{Accept:'text/html,application/xhtml+xml','User-Agent':'amuse-bouche recipe importer'},lookup:(_host,options,done)=>options?.all?done(null,[pinned]):done(null,pinned.address,pinned.family)},res=>{
    if(res.statusCode>=300&&res.statusCode<400){const location=res.headers.location;res.resume();resolve({redirect:location});return}
    if(res.statusCode<200||res.statusCode>=300){res.resume();reject(Error('This website is limiting automated access. Try its original recipe link.'));return}
    if(!/text\/html|application\/xhtml/i.test(res.headers['content-type']||'')){res.resume();reject(Error('Please use a recipe web page.'));return}
    const chunks=[];let size=0;res.on('data',chunk=>{size+=chunk.length;if(size>4*1024*1024){res.destroy();reject(Error('This recipe page is too large.'))}else chunks.push(chunk)});res.on('end',()=>resolve({html:Buffer.concat(chunks).toString('utf8'),url:url.href}));res.on('error',reject);
   });
   req.setTimeout(remaining,()=>req.destroy(Error('This website took too long to respond.')));req.on('error',reject);req.end();
  });
  if(page.redirect){url=new URL(page.redirect,url);continue}if(page.html)return page;
  throw Error('The recipe website returned an incomplete redirect.');
 }
 throw Error('This link redirects too many times.');
}
