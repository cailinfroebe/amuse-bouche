const installDialog = document.querySelector('#install-dialog');
const installOpen = document.querySelector('#install-open');
const nativeInstall = document.querySelector('#install-native');
let installPrompt;
const standalone = ()=>matchMedia('(display-mode: standalone)').matches || navigator.standalone;
function updateInstallButton(){
  installOpen.hidden=standalone();
}
installOpen.addEventListener('click',()=>installDialog.showModal());
document.querySelector('#install-close').addEventListener('click',()=>installDialog.close());
installDialog.addEventListener('click',event=>{
  if(event.target===installDialog){
    const box=installDialog.getBoundingClientRect();
    if(event.clientX<box.left || event.clientX>box.right || event.clientY<box.top || event.clientY>box.bottom)installDialog.close();
  }
});
addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  installPrompt=event;
  nativeInstall.hidden=false;
});
nativeInstall.addEventListener('click',async()=>{
  if(!installPrompt)return;
  nativeInstall.disabled=true;
  try{
    await installPrompt.prompt();
    await installPrompt.userChoice;
  }finally{
    installPrompt=undefined;
    nativeInstall.disabled=false;
    nativeInstall.hidden=true;
  }
});
addEventListener('appinstalled',()=>{installPrompt=undefined;installDialog.close();updateInstallButton()});
matchMedia('(display-mode: standalone)').addEventListener('change',updateInstallButton);
updateInstallButton();
