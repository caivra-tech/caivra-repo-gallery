export const DEFAULT_OWNER = 'caivra-tech';
export const SORT_MODES = ['updated','stars','name','created'];
export function validOwner(v) { return typeof v === 'string' && /^(?!-)(?!.*--)[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(v); }
export function safeHttpUrl(v) { if (typeof v !== 'string' || !v.trim()) return null; try { const u=new URL(v); return ['https:','http:'].includes(u.protocol) && !u.username && !u.password ? u.href : null; } catch { return null; } }
export function normalizeRepo(v) {
  if (!v || typeof v !== 'object' || v.private === true || typeof v.name !== 'string' || !v.name || typeof v.full_name !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(v.full_name)) return null;
  const [owner,name]=v.full_name.split('/');
  if (!validOwner(owner) || name !== v.name) return null;
  const n=x=>Number.isFinite(x)?Math.max(0,Math.trunc(x)):0;
  const d=x=>Number.isFinite(Date.parse(x))?Date.parse(x):0;
  return { id:v.id, name, fullName:v.full_name, url:'https://github.com/'+encodeURIComponent(owner)+'/'+encodeURIComponent(name), homepage:safeHttpUrl(v.homepage),
    description:typeof v.description==='string'?v.description:'', language:typeof v.language==='string'?v.language:'',
    topics:Array.isArray(v.topics)?v.topics.filter(x=>typeof x==='string').slice(0,12):[],
    stars:n(v.stargazers_count), forks:n(v.forks_count), isFork:v.fork===true, archived:v.archived===true, updatedAt:d(v.updated_at), createdAt:d(v.created_at) };
}
export function mergeRepos(oldList,newList) { const m=new Map(oldList.map(v=>[v.fullName.toLowerCase(),v])); for(const v of newList) if(v) m.set(v.fullName.toLowerCase(),v); return [...m.values()]; }
export function filterRepos(repos, {search='',language='',sort='updated',includeForks=false}={}) {
  const terms=search.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean), lang=language.toLocaleLowerCase();
  return repos.filter(v=>(includeForks||!v.isFork)&&(!lang||v.language.toLocaleLowerCase()===lang)&&terms.every(t=>[v.name,v.fullName,v.description,v.language,...v.topics].join(' ').toLocaleLowerCase().includes(t)))
  .sort((a,b)=>sort==='stars'?(b.stars-a.stars||a.name.localeCompare(b.name)):sort==='name'?a.name.localeCompare(b.name):sort==='created'?(b.createdAt-a.createdAt||a.name.localeCompare(b.name)):(b.updatedAt-a.updatedAt||a.name.localeCompare(b.name)));
}
export function languagesOf(repos) { return [...new Set(repos.map(x=>x.language).filter(Boolean))].sort((a,b)=>a.localeCompare(b)); }
export function readState(search) { const p=new URLSearchParams(search), owner=p.get('owner')||DEFAULT_OWNER; return {owner:validOwner(owner)?owner:DEFAULT_OWNER,search:(p.get('q')||'').slice(0,200),language:(p.get('lang')||'').slice(0,60),sort:SORT_MODES.includes(p.get('sort'))?p.get('sort'):'updated',includeForks:p.get('forks')==='1'}; }
export function stateQuery({owner=DEFAULT_OWNER,search='',language='',sort='updated',includeForks=false}={}) { const p=new URLSearchParams(); if(validOwner(owner)&&owner.toLowerCase()!==DEFAULT_OWNER)p.set('owner',owner); if(search.trim())p.set('q',search.trim()); if(language)p.set('lang',language); if(sort!=='updated'&&SORT_MODES.includes(sort))p.set('sort',sort); if(includeForks)p.set('forks','1'); return p.size?'?'+p.toString():''; }
export function pageHasNext(header) { return typeof header==='string' && /<[^>]+>;\s*rel="next"/.test(header); }
export function compactCount(n) { return new Intl.NumberFormat('en-US',{notation:n>=1000?'compact':'standard',maximumFractionDigits:1}).format(n); }
