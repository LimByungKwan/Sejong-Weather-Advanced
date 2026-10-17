import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const hashes=JSON.parse(readFileSync(new URL('docs/t05/frozen-hashes.json',root)));
for(const [name,hash] of Object.entries(hashes)){
 assert.equal(createHash('sha256').update(readFileSync(new URL(name,root))).digest('hex'),hash,name+' was changed');
}
console.log('Frozen plan, inputs, expectations and ten-test harness unchanged.');
