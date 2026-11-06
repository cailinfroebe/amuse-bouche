import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
for(const directory of ['public','api','lib']){
 for(const name of await readdir(directory))if(name.endsWith('.js')){
  const check=spawnSync(process.execPath,['--check',`${directory}/${name}`],{stdio:'inherit'});if(check.status)process.exit(check.status);
 }
}
const html=await readFile('public/index.html','utf8');
if(/signin-with-chatgpt|signout-with-chatgpt|oai-authenticated/.test(await readFile('public/profiles.js','utf8')))throw Error('Hosted-platform authentication remains in standalone code.');
for(const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){
 if(/^https?:/.test(match[1]))continue;
 if(!/\.(?:js|css|svg|png|jpg|webmanifest)$/.test(match[1]))continue;
 await readFile('public/'+match[1]);
}
console.log('Standalone source syntax and local asset references passed.');
