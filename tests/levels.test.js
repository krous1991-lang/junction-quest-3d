import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLevel, rotateMask, isSolved } from '../src/levels.js';

test('all 5000 generated levels have valid routes and 50 worlds',()=>{
  for(let level=1;level<=5000;level++){
    const data=generateLevel(level);
    assert.equal(data.world,Math.ceil(level/100));
    assert.equal(data.boss,level%100===0);
    assert.ok(data.routeLength>=data.size);
    assert.equal(data.tiles.length,data.size*data.size);
    const route=data.tiles.filter(t=>t.route);
    assert.equal(route.length,data.routeLength);
    for(const t of route){
      assert.ok([3,5,6,9,10,12].includes(t.targetMask),'each path cell has a two-way track');
      let m=t.mask,solvable=false;
      for(let i=0;i<4;i++){if(m===t.targetMask)solvable=true;m=rotateMask(m)}
      assert.ok(solvable,'every scrambled tile can be aligned by rotation');
    }
    const solved=data.tiles.map(t=>t.route?{...t,mask:t.targetMask}:t);
    assert.equal(isSolved(solved),true);
  }
});
test('rotation cycles through four orientations',()=>{
  for(let mask=1;mask<16;mask++){
    let m=mask;for(let i=0;i<4;i++)m=rotateMask(m);
    assert.equal(m,mask);
  }
});
