import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {diagnoseFreshness, watchFreshness} from '../lib/weather-freshness.mjs';
const cases=JSON.parse(readFileSync(new URL('../docs/t05/fixed-tests.json',import.meta.url)));
assert.equal(cases.length,10);
assert.equal(new Set(cases.map(c=>c.id)).size,10);
for(const c of cases) test(c.id,()=>{
 const {record,now,error}=c.input;
 if(c.id==='T05-04'){
  let clock=Date.parse('2026-10-17T08:29:59.999Z');
  let nextId=0;const scheduled=new Map();const seen=[];
  const stop=watchFreshness({record,error,now:()=>clock,
   schedule:(fn,delay)=>{const id=++nextId;scheduled.set(id,{fn,due:clock+delay});return id},
   cancel:id=>scheduled.delete(id),onChange:s=>seen.push(s)});
  try{
   assert.deepEqual(seen.at(-1),{state:'fresh',label:'최신값',value:21.6});
   clock=Date.parse(now);
   for(let n=0;n<100;n++){
    const due=[...scheduled].filter(([,v])=>v.due<=clock);
    if(!due.length)break;
    for(const [id,v] of due){scheduled.delete(id);v.fn()}
   }
   assert.deepEqual(seen.at(-1),c.expected,'추가 클릭 없이 30분 경계에서 구독자 갱신');
  }finally{stop()}
  assert.equal(scheduled.size,0,'구독 해제 시 예약 작업 정리');
 }else{
  if(c.id==='T05-10'){
   const previous=cases.find(c=>c.id==='T05-08');
   assert.deepEqual(diagnoseFreshness(previous.input),previous.expected);
  }
  assert.deepEqual(diagnoseFreshness({record,now,error}),c.expected);
 }
});
