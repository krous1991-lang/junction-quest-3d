// Deterministic, data-driven campaign generator. Directions: N=1, E=2, S=4, W=8.
export const rotateMask = mask => ((mask << 1) & 15) | ((mask >> 3) & 1);
export const isSolved = tiles => tiles.filter(t => t.route).every(t => t.mask === t.targetMask);
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const bit = { N:1, E:2, S:4, W:8 };
export function generateLevel(level) {
  const rand = rng(level * 7919 + 104729), size = level % 100 === 0 ? 6 : 5;
  const path = [{r:0,c:0}];
  // A monotonic path is guaranteed to reach the opposite corner without loops.
  while (path.at(-1).r < size-1 || path.at(-1).c < size-1) {
    const p = path.at(-1), choices = [];
    if (p.r < size-1) choices.push({r:p.r+1,c:p.c});
    if (p.c < size-1) choices.push({r:p.r,c:p.c+1});
    path.push(choices[Math.floor(rand()*choices.length)]);
  }
  const key = p => p.r+','+p.c, pathKeys = new Set(path.map(key));
  const tiles = [];
  for (let r=0;r<size;r++) for(let c=0;c<size;c++) {
    const i=path.findIndex(p=>p.r===r&&p.c===c);
    if(i<0){tiles.push({r,c,route:false,mask:0,targetMask:0});continue;}
    let target=0;
    if(i>0){const p=path[i-1];if(p.r<r)target|=bit.N;else if(p.r>r)target|=bit.S;else if(p.c<c)target|=bit.W;else target|=bit.E;}
    if(i<path.length-1){const p=path[i+1];if(p.r<r)target|=bit.N;else if(p.r>r)target|=bit.S;else if(p.c<c)target|=bit.W;else target|=bit.E;}
    let turns=1+Math.floor(rand()*3),mask=target;
    for(let k=0;k<turns;k++)mask=rotateMask(mask);
    tiles.push({r,c,route:true,mask,targetMask:target,start:i===0,end:i===path.length-1});
  }
  return {size,tiles,routeLength:path.length,boss:level%100===0,world:Math.floor((level-1)/100)+1};
}
