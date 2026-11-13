export const SNAPSHOT_SCHEMA = 'caivra.repo-evaluation.v1';
export const MAX_SNAPSHOT_REPOS = 10;
const repositoryNamePattern = /^[a-z0-9_.-]{1,100}$/i;
export function validRepositoryFullName(value) {
  if (typeof value !== 'string') return false;
  const parts = value.split('/');
  return parts.length === 2 && /^[a-z0-9-]{1,39}$/i.test(parts[0]) &&
    !parts[0].startsWith('-') && !parts[0].endsWith('-') &&
    repositoryNamePattern.test(parts[1]) && parts[1] !== '.' && parts[1] !== '..';
}
const shaPattern = /^[0-9a-f]{40}$/i;
export function validateSnapshot(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.schema !== SNAPSHOT_SCHEMA ||
      !Number.isFinite(Date.parse(data.createdAt)) || !Array.isArray(data.repositories) ||
      data.repositories.length === 0 || data.repositories.length > 10) throw new Error('Unsupported or invalid snapshot.');
  const seen = new Set();
  for (const r of data.repositories) {
    if (!r || typeof r !== 'object' || !validRepositoryFullName(r.fullName) ||
        !shaPattern.test(r.commitSha) || !Number.isFinite(Date.parse(r.observedAt)) ||
        seen.has(r.fullName.toLowerCase())) throw new Error('Invalid repository snapshot record.');
    seen.add(r.fullName.toLowerCase());
  }
  return data;
}
export async function resolveCommit(fullName, fetchImpl = fetch, signal) {
  if (!validRepositoryFullName(fullName)) throw new Error('Invalid repository name.');
  const url = 'https://api.github.com/repos/' + fullName.split('/').map(encodeURIComponent).join('/') + '/commits/HEAD';
  const response = await fetchImpl(url, {signal,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});
  if (!response.ok) throw new Error('Commit resolution failed (HTTP ' + response.status + ').');
  const payload = await response.json();
  if (!shaPattern.test(payload?.sha)) throw new Error('GitHub returned an invalid commit SHA.');
  return payload.sha.toLowerCase();
}
export async function buildSnapshot(repositories, filters, fetchImpl = fetch, signal) {
  if (!Array.isArray(repositories) || repositories.length === 0 || repositories.length > 10) throw new Error('Select 1–10 repositories.');
  const records = [];
  for (const repo of repositories) {
    if (signal?.aborted) throw new DOMException('Snapshot export cancelled.', 'AbortError');
    const commitSha = await resolveCommit(repo.fullName, fetchImpl, signal);
    records.push({fullName:repo.fullName,commitSha,observedAt:new Date().toISOString(),
      url:repo.url,description:repo.description,language:repo.language,stars:repo.stars});
  }
  return validateSnapshot({schema:SNAPSHOT_SCHEMA,createdAt:new Date().toISOString(),
    scope:'selected-public-repositories',filters:{owner:filters.owner,search:filters.search,language:filters.language,
      sort:filters.sort,includeForks:filters.includeForks},repositories:records,
    limitations:'Historical public metadata and resolved HEAD commits; not a security audit or dependency inventory.'});
}
