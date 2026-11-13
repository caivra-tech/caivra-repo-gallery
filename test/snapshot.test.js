import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSnapshot,validateSnapshot,resolveCommit,validRepositoryFullName,SNAPSHOT_SCHEMA} from '../src/snapshot.js';
const SHA='a'.repeat(40);
const repo={fullName:'caivra-tech/example',url:'https://github.com/caivra-tech/example',description:'Example',language:'JS',stars:2};
const mock=async()=>({ok:true,json:async()=>({sha:SHA})});
test('resolves immutable HEAD SHA',async()=>assert.equal(await resolveCommit(repo.fullName,mock),SHA));
test('exports and imports a version-pinned snapshot',async()=>{
 const s=await buildSnapshot([repo],{owner:'caivra-tech',search:'',language:'',sort:'updated',includeForks:false},mock);
 assert.equal(s.schema,SNAPSHOT_SCHEMA);assert.equal(validateSnapshot(JSON.parse(JSON.stringify(s))).repositories[0].commitSha,SHA);
});
test('rejects unresolved commits rather than claiming a snapshot',async()=>{
 await assert.rejects(buildSnapshot([repo],{},async()=>({ok:false,status:403})),/Commit resolution failed/);
});
test('rejects malicious or malformed imported records',()=>{
 const base={schema:SNAPSHOT_SCHEMA,createdAt:new Date().toISOString(),repositories:[{fullName:'caivra-tech/example',commitSha:SHA,observedAt:new Date().toISOString()}]};
 assert.throws(()=>validateSnapshot({...base,repositories:[{...base.repositories[0],commitSha:'main'}]}));
 assert.throws(()=>validateSnapshot({...base,repositories:[base.repositories[0],base.repositories[0]]}));
 assert.throws(()=>validateSnapshot({...base,repositories:[{...base.repositories[0],fullName:'../evil'}]}));
});

test('rejects empty and over-budget imports',()=>{
 const record={fullName:'caivra-tech/example',commitSha:SHA,observedAt:new Date().toISOString()};
 const base={schema:SNAPSHOT_SCHEMA,createdAt:new Date().toISOString()};
 assert.throws(()=>validateSnapshot({...base,repositories:[]}));
 assert.throws(()=>validateSnapshot({...base,repositories:Array.from({length:11},(_,i)=>({...record,fullName:'caivra-tech/repo'+i}))}));
});
test('rejects invalid GitHub commit payload',async()=>{
 await assert.rejects(resolveCommit(repo.fullName,async()=>({ok:true,json:async()=>({sha:'main'})})),/invalid commit SHA/);
});
test('refuses export beyond ten selected repositories before network access',async()=>{
 await assert.rejects(buildSnapshot(Array.from({length:11},()=>repo),{},()=>{throw Error('unexpected request')}),/Select 1–10/);
});

test('rejects path-normalizing repository names at import and API boundaries',async()=>{
 const now=new Date().toISOString();
 for(const name of ['octocat/..','octocat/.','-bad/repo','octocat/../evil']){
  assert.equal(validRepositoryFullName(name),false);
  assert.throws(()=>validateSnapshot({schema:SNAPSHOT_SCHEMA,createdAt:now,repositories:[{fullName:name,commitSha:SHA,observedAt:now}]}));
  await assert.rejects(resolveCommit(name,()=>{throw Error('network must not be called')}),/Invalid repository name/);
 }
});
test('aborted export does not resolve further commits',async()=>{
 const controller=new AbortController();
 const first={...repo,fullName:'caivra-tech/first'};
 const second={...repo,fullName:'caivra-tech/second'};
 let calls=0;
 await assert.rejects(buildSnapshot([first,second],{},async()=>{
  calls++;controller.abort();return {ok:true,json:async()=>({sha:SHA})};
 },controller.signal),{name:'AbortError'});
 assert.equal(calls,1);
});
