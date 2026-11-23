import { generateLevel, rotateMask, isSolved } from './levels.js';
const canvas=document.querySelector('#board'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id),SAVE='junction-quest-save-v1';
const worlds=['Meadow Circuit','Copper Coast','Cloudline Pass','Neon Harbor','Crystal Basin','Solar Ridge','Moonlit Metro','Frostbyte Valley','Sky Garden','Aurora Nexus'];
let saved={};try{saved=JSON.parse(localStorage.getItem(SAVE)||'{}')}catch{}
let level=Math.min(5000,Math.max(1,saved.level||1)),coins=saved.coins??120,moves=0,won=false,tiles=[],size=5;
function world(){return Math.floor((level-1)/100)+1}
function worldName(){return worlds[(world()-1)%worlds.length]}
function updateHud(){$('world').textContent=String(world()).padStart(2,'0');$('worldName').textContent=worldName();$('level').textContent=String(level).padStart(3,'0');$('coins').textContent=coins;$('progressFill').style.width=((level-1)/4999*100)+'%';}
function save(){localStorage.setItem(SAVE,JSON.stringify({level,coins}));$('saveState').textContent='SAVED LOCALLY'}
function makeLevel(){const data=generateLevel(level);tiles=data.tiles;size=data.size;moves=0;won=false;$('nextBtn').disabled=true;$('moves').textContent='0';$('best').textContent='—';$('goalText').textContent=data.boss?'BOSS ROUTE · '+data.routeLength+' links':data.routeLength+' route links';$('hint').textContent=data.boss?'BOSS LEVEL · Align every track segment.':'Rotate track pieces to connect the whole route.';updateHud();draw()}
function geom(){const w=canvas.clientWidth,h=canvas.clientHeight,cell=Math.min((w-36)/size,(h-70)/size);return{w,h,cell,ox:(w-cell*size)/2,oy:(h-cell*size)/2-5}}
function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function draw(){if(!ctx||!tiles.length)return;const {w,h,cell,ox,oy}=geom();ctx.clearRect(0,0,w,h);
 for(let i=0;i<20;i++){ctx.fillStyle='#c2e5ff12';ctx.beginPath();ctx.arc((i*89+level*11)%w,(i*53+level*7)%h,1.5+i%3,0,Math.PI*2);ctx.fill()}
 for(const t of tiles){const x=ox+t.c*cell,y=oy+t.r*cell,s=cell-6,cx=x+s/2+3,cy=y+s/2+3;
  ctx.save();ctx.translate(cx,cy);ctx.fillStyle=t.route?'#254968':'#172b44';roundRect(ctx,-s*.43,-s*.43,s*.86,s*.86,10);ctx.fill();ctx.restore();
  if(!t.route)continue;
  const done=t.mask===t.targetMask;ctx.lineCap='round';ctx.lineWidth=Math.max(5,cell*.105);ctx.strokeStyle=done?'#72e5c6':'#75b9ff';ctx.beginPath();ctx.moveTo(cx,cy);
  if(t.mask&1){ctx.moveTo(cx,cy);ctx.lineTo(cx,cy-s*.39)}if(t.mask&2){ctx.moveTo(cx,cy);ctx.lineTo(cx+s*.39,cy)}if(t.mask&4){ctx.moveTo(cx,cy);ctx.lineTo(cx,cy+s*.39)}if(t.mask&8){ctx.moveTo(cx,cy);ctx.lineTo(cx-s*.39,cy)}ctx.stroke();
  ctx.fillStyle='#e7f8ff';ctx.beginPath();ctx.arc(cx,cy,Math.max(3,cell*.055),0,Math.PI*2);ctx.fill();
  if(t.start||t.end){ctx.fillStyle=t.start?'#6de4c4':'#ffc36e';ctx.beginPath();ctx.arc(cx,cy,cell*.16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#10233b';ctx.font='800 '+Math.max(8,cell*.14)+'px Manrope';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.start?'S':'E',cx,cy+1)}
  if(done){ctx.strokeStyle='#ffe18a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,cell*.44,0,Math.PI*2);ctx.stroke()}
 }}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1800)}
function win(){won=true;const reward=15+Math.max(0,10-moves);coins+=reward;$('coins').textContent=coins;$('nextBtn').disabled=false;$('hint').textContent='Route complete! +'+reward+' stars';toast('Perfect connection · +'+reward+' stars');save()}
function tap(e){if(won)return;const rect=canvas.getBoundingClientRect(),{cell,ox,oy}=geom(),c=Math.floor((e.clientX-rect.left-ox)/cell),r=Math.floor((e.clientY-rect.top-oy)/cell),t=tiles.find(v=>v.r===r&&v.c===c&&v.route);if(!t){toast('Tap a track piece');return}t.mask=rotateMask(t.mask);moves++;$('moves').textContent=moves;draw();if(isSolved(tiles))win()}
function resize(){const dpr=Math.min(devicePixelRatio||1,2),rect=canvas.getBoundingClientRect();canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
$('resetBtn').onclick=()=>makeLevel();
$('hintBtn').onclick=()=>{if(coins<25){toast('Not enough stars');return}const t=tiles.find(v=>v.route&&v.mask!==v.targetMask);if(!t){toast('No hint needed');return}coins-=25;t.mask=t.targetMask;moves++;$('moves').textContent=moves;updateHud();draw();toast('One track piece aligned');if(isSolved(tiles))win();save()};
$('nextBtn').onclick=()=>{if(!won)return;if(level===5000){toast('You completed all 50 worlds!');return}level++;makeLevel();save()};
canvas.addEventListener('pointerup',tap);window.addEventListener('resize',resize);makeLevel();resize();
