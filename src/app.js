import {DEFAULT_OWNER,validOwner,compactCount,filterRepos,languageChoices,mergeRepos,readState,stateQuery} from './core.js';
import {fetchFirstPage,fetchRepoPage} from './api.js';
const el=id=>document.getElementById(id);
const ui={form:el('owner-form'),owner:el('owner'),ownerError:el('owner-error'),search:el('search'),language:el('language'),sort:el('sort'),forks:el('forks'),grid:el('repositories'),status:el('status'),error:el('error'),errorMessage:el('error-message'),retry:el('retry'),empty:el('empty'),clear:el('clear'),more:el('more'),share:el('share')};
const initial=readState(location.search);
const state={...initial,repos:[],page:0,accountType:'org',hasNext:false,loading:false,controller:null,version:0,error:''};
ui.owner.value=state.owner;ui.search.value=state.search;ui.sort.value=state.sort;ui.forks.checked=state.includeForks;
function make(tag,klass,text){const x=document.createElement(tag);if(klass)x.className=klass;if(text!==undefined)x.textContent=text;return x;}
function card(repo){
  const item=make('article','card'), top=make('div','card-top');
  top.append(make('span','icon','</>'),make('span','tag',repo.archived?'ARCHIVED':repo.isFork?'FORK':'PUBLIC'));
  item.append(top);
  const h=make('h3'), a=make('a','',repo.name);
  a.href=repo.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','View '+repo.fullName+' on GitHub, new tab');h.append(a);item.append(h);
  item.append(make('p','',repo.description||'No description provided.'));
  const topics=make('div','topics');for(const topic of repo.topics.slice(0,4))topics.append(make('span','topic',topic));item.append(topics);
  const meta=make('div','meta');
  if(repo.language)meta.append(make('span','', '● '+repo.language));
  meta.append(make('span','', '★ '+compactCount(repo.stars)),make('span','', '⑂ '+compactCount(repo.forks)));
  if(repo.homepage){const hlink=make('a','','Website ↗');hlink.href=repo.homepage;hlink.target='_blank';hlink.rel='noopener noreferrer';meta.append(hlink);}
  item.append(meta);return item;
}
function updateUrl(){history.replaceState(null,'',location.pathname+stateQuery(state)+location.hash);}
function languageOptions(){const langs=languageChoices(state.repos,state.language);ui.language.replaceChildren(new Option('All languages',''),...langs.map(x=>new Option(x,x)));ui.language.value=state.language;}
function render(){
  const shown=filterRepos(state.repos,state),fragment=document.createDocumentFragment();for(const r of shown)fragment.append(card(r));ui.grid.replaceChildren(fragment);
  ui.grid.setAttribute('aria-busy',String(state.loading));
  ui.empty.hidden=state.loading||!!state.error||shown.length>0;
  ui.error.hidden=!state.error;ui.errorMessage.textContent=state.error;
  ui.status.textContent=state.loading?(state.repos.length?'Loading more repositories…':'Loading repositories…'):shown.length+' '+(shown.length===1?'repository':'repositories')+' shown'+(state.hasNext?' · more available':'');
  ui.more.hidden=!state.hasNext||state.loading||!!state.error;
  updateUrl();
}
async function loadOwner(owner){
  state.controller?.abort();const version=++state.version;state.controller=new AbortController();
  Object.assign(state,{owner,repos:[],page:0,hasNext:false,loading:true,error:''});ui.owner.value=owner;ui.ownerError.hidden=true;render();
  try {const data=await fetchFirstPage(owner,state.controller.signal);if(version!==state.version)return;state.repos=data.repos;state.page=1;state.accountType=data.accountType;state.hasNext=data.hasNext;languageOptions();}
  catch(e){if(version!==state.version||e.name==='AbortError')return;state.error=e.message||'Could not load repositories.';}
  finally{if(version===state.version){state.loading=false;render();}}
}
async function loadMore(){
  if(state.loading||!state.hasNext)return;
  const version=state.version;state.loading=true;state.error='';render();
  try{const data=await fetchRepoPage({owner:state.owner,page:state.page+1,accountType:state.accountType,signal:state.controller.signal});if(version!==state.version)return;state.repos=mergeRepos(state.repos,data.repos);state.page++;state.hasNext=data.hasNext;languageOptions();}
  catch(e){if(version!==state.version||e.name==='AbortError')return;state.error=e.message||'Could not load next page.';}
  finally{if(version===state.version){state.loading=false;render();}}
}
ui.form.addEventListener('submit',e=>{e.preventDefault();const owner=ui.owner.value.trim();if(!validOwner(owner)){ui.ownerError.textContent='Use a valid GitHub owner: letters, numbers and single hyphens, up to 39 characters.';ui.ownerError.hidden=false;ui.owner.focus();return;}state.search='';state.language='';state.sort='updated';state.includeForks=false;ui.search.value='';ui.sort.value='updated';ui.forks.checked=false;loadOwner(owner);});
ui.search.addEventListener('input',()=>{state.search=ui.search.value.slice(0,200);render();});
ui.language.addEventListener('change',()=>{state.language=ui.language.value;render();});
ui.sort.addEventListener('change',()=>{state.sort=ui.sort.value;render();});
ui.forks.addEventListener('change',()=>{state.includeForks=ui.forks.checked;render();});
ui.clear.addEventListener('click',()=>{state.search='';state.language='';state.sort='updated';state.includeForks=false;ui.search.value='';ui.language.value='';ui.sort.value='updated';ui.forks.checked=false;render();});
ui.more.addEventListener('click',loadMore);
ui.retry.addEventListener('click',()=>state.page&&state.hasNext?loadMore():loadOwner(state.owner));
ui.share.addEventListener('click',async()=>{const url=location.href;try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(url);ui.share.textContent='Link copied!';}catch{ui.share.textContent='Copy URL manually';window.prompt('Copy this URL:',url);}setTimeout(()=>ui.share.textContent='Copy gallery link',2000);});
window.addEventListener('popstate',()=>{const next=readState(location.search);state.search=next.search;state.language=next.language;state.sort=next.sort;state.includeForks=next.includeForks;ui.search.value=state.search;ui.sort.value=state.sort;ui.forks.checked=state.includeForks;if(next.owner.toLowerCase()!==state.owner.toLowerCase())loadOwner(next.owner);else{languageOptions();render();}});
loadOwner(state.owner||DEFAULT_OWNER);
