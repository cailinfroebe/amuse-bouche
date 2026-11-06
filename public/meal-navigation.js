const mealsToggle=document.querySelector('#meals-toggle');
const mealsSubnav=document.querySelector('#meals-subnav');
function setMealsExpanded(open){
 mealsToggle.setAttribute('aria-expanded',String(open));mealsSubnav.hidden=!open;document.body.dataset.mealsOpen=String(open);
}
function updateMealsCurrent(){
 const route=location.hash||'#home';const active=['#breakfast','#lunch','#dinner','#snacks'].includes(route);
 mealsToggle.dataset.active=String(active);
 mealsSubnav.querySelectorAll('a').forEach(link=>{if(link.hash===route)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
}
mealsToggle.addEventListener('click',()=>setMealsExpanded(mealsToggle.getAttribute('aria-expanded')!=='true'));
mealsSubnav.addEventListener('click',event=>{if(event.target.closest('a'))setMealsExpanded(false)});
document.addEventListener('click',event=>{if(!mealsToggle.contains(event.target)&&!mealsSubnav.contains(event.target))setMealsExpanded(false)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mealsToggle.getAttribute('aria-expanded')==='true'){setMealsExpanded(false);mealsToggle.focus()}});
addEventListener('hashchange',()=>{setMealsExpanded(false);updateMealsCurrent()});
updateMealsCurrent();
