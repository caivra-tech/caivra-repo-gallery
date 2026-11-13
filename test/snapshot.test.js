import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSnapshot,validateSnapshot,resolveCommit,SNAPSHOT_SCHEMA} from '../src/snapshot.js';
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
