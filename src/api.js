import {normalizeRepo,pageHasNext,validOwner} from './core.js';
export class GitHubApiError extends Error { constructor(message,status) {super(message);this.name='GitHubApiError';this.status=status;} }
export async function fetchRepoPage({owner,page=1,accountType='org',signal,fetchImpl=fetch}) {
  if(!validOwner(owner))throw new GitHubApiError('Enter a valid GitHub organization or username.',400);
  if(!Number.isInteger(page)||page<1||page>100)throw new GitHubApiError('Invalid page number.',400);
  if(!['org','user'].includes(accountType))throw new GitHubApiError('Invalid account type.',400);
  const endpoint=accountType==='org'?'orgs':'users';
  const type = accountType === 'org' ? 'public' : 'owner';
  const url='https://api.github.com/'+endpoint+'/'+encodeURIComponent(owner)+'/repos?per_page=100&page='+page+'&sort=updated&type='+type;
  let response;
  try { response=await fetchImpl(url,{signal,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}}); }
  catch(e){if(e?.name==='AbortError')throw e;throw new GitHubApiError('Could not connect to GitHub. Check your connection and try again.',0);}
  if(!response.ok){
    if(response.status===429||(response.status===403&&response.headers.get('x-ratelimit-remaining')==='0'))throw new GitHubApiError('GitHub API rate limit reached. Try again after the limit resets.',response.status);
    if(response.status===404)throw new GitHubApiError('GitHub '+(accountType==='org'?'organization':'username')+' not found.',404);
    throw new GitHubApiError('GitHub returned HTTP '+response.status+'. Please try again.',response.status);
  }
  let payload;try{payload=await response.json();}catch{throw new GitHubApiError('GitHub returned an unreadable response.',502);}
  if(!Array.isArray(payload))throw new GitHubApiError('GitHub returned an unexpected response.',502);
  return {repos:payload.map(normalizeRepo).filter(Boolean),hasNext:pageHasNext(response.headers.get('link')),accountType};
}
export async function fetchFirstPage(owner,signal,fetchImpl=fetch){
  try{return await fetchRepoPage({owner,signal,fetchImpl});}
  catch(e){if(e instanceof GitHubApiError&&e.status===404)return fetchRepoPage({owner,accountType:'user',signal,fetchImpl});throw e;}
}
