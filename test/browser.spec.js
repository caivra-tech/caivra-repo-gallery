import { test, expect } from '@playwright/test';

const sha = 'a'.repeat(40);
const repoRecord = {id:1,name:'example',full_name:'caivra-tech/example',private:false,description:'Test repository',language:'JavaScript',topics:[],stargazers_count:2,forks_count:0,fork:false,archived:false,updated_at:'2026-11-01T00:00:00Z',created_at:'2026-01-01T00:00:00Z',homepage:null};
const validSnapshot = {schema:'caivra.repo-evaluation.v1',createdAt:'2026-11-13T00:00:00Z',repositories:[{fullName:'caivra-tech/example',commitSha:sha,observedAt:'2026-11-13T00:00:00Z'}]};

test.beforeEach(async ({page})=>{
 await page.route('https://api.github.com/**',async route=>{
  const url=route.request().url();
  if(url.includes('/commits/HEAD')) return route.fulfill({json:{sha}});
  if(url.includes('/repos?')) return route.fulfill({json:[repoRecord]});
  return route.fulfill({status:404,json:{message:'Not found'}});
 });
 await page.goto('/');
 await expect(page.getByRole('checkbox',{name:'Add caivra-tech/example to evaluation shortlist'})).toBeVisible();
});

test('shortlist keyboard interaction and pinned JSON download/import',async ({page})=>{
 const checkbox=page.getByRole('checkbox',{name:'Add caivra-tech/example to evaluation shortlist'});
 await checkbox.focus();await page.keyboard.press('Space');await expect(checkbox).toBeChecked();
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export selected snapshot'}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('caivra-repository-evaluation.json');
 const fs=await import('node:fs/promises');
 const file=await download.path();expect(file).toBeTruthy();
 const snapshot=JSON.parse(await fs.readFile(file,'utf8'));
 expect(snapshot.repositories[0].commitSha).toMatch(/^[a-f0-9]{40}$/);
 await page.locator('#import-snapshot').setInputFiles({name:'snapshot.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(snapshot))});
 await expect(page.getByRole('link',{name:/caivra-tech\/example @ a{12}/})).toHaveAttribute('href','https://github.com/caivra-tech/example/tree/'+sha);
 await expect(page.locator('#snapshot-status')).toContainText('historical records');
});

test('invalid JSON and path-normalizing names rejected',async ({page})=>{
 const input=page.locator('#import-snapshot');
 await input.setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{broken')});
 await expect(page.locator('#snapshot-status')).toContainText('Import rejected');
 await input.setInputFiles({name:'unsafe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...validSnapshot,repositories:[{...validSnapshot.repositories[0],fullName:'octocat/..'}]}))});
 await expect(page.locator('#snapshot-status')).toContainText('Import rejected');
 await expect(page.locator('#snapshot-view a')).toHaveCount(0);
});

test('changing owner during commit resolution prevents stale download',async ({page})=>{
 let resolveRequest;
 await page.unrouteAll();
 await page.route('https://api.github.com/**',async route=>{
  const url=route.request().url();
  if(url.includes('/commits/HEAD')) {
   await new Promise(resolve=>{resolveRequest=resolve;});
   try {await route.fulfill({json:{sha}});} catch {}
  } else if(url.includes('/repos?')) {
   await route.fulfill({json:[repoRecord]});
  } else await route.fulfill({status:404,json:{}});
 });
 await page.getByRole('checkbox',{name:'Add caivra-tech/example to evaluation shortlist'}).check();
 await page.getByRole('button',{name:'Export selected snapshot'}).click();
 await expect.poll(()=>Boolean(resolveRequest)).toBe(true);
 await page.locator('#owner').fill('octocat');
 await page.getByRole('button',{name:'Load',exact:true}).click();
 resolveRequest();
 await expect(page.locator('#snapshot-status')).toHaveText('0 selected');
 await expect(page.getByRole('button',{name:'Export selected snapshot'})).toBeEnabled();
});
