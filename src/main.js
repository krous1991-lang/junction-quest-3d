const canvas=document.querySelector('#board'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const SAVE='junction-quest-save-v1';
const names=['Meadow Circuit','Copper Coast','Cloudline Pass','Neon Harbor','Crystal Basin','Solar Ridge','Moonlit Metro','Frostbyte Valley','Sky Garden','Aurora Nexus'];
let saved=JSON.parse(localStorage.getItem(SAVE)||'{"level":1,"coins":120,"unlocked":1}');
let level=Math.min(5000,Math.max(1,saved.level||1)),coins=saved.coins??120,moves=0,won=false,tiles=[],anim=0,particles=[];
const palettes=[['#6fe0b8','#65a9ff','#ffbd69'],['#ff9c78','#79d9e9','#c5a0ff'],['#f6d66b','#79a9ff','#ff8db4']];
const world=()=>Math.floor((level-1)/100)+1,worldName=()=>names[(world()-1)%names.length];
function seeded(n){let x=(n*9301+49297)%233280;return()=>{x=(x*9301+49297)%233280;return x/233280}}
function makeLevel(){const rand=seeded(level),count=3+Math.min(3,Math.floor((level-1)/700)),size=5;tiles=[];moves=0;won=false;$('nextBtn').disabled=true;
 const cells=[];for(let r=0;r<size;r++)for(let c=0;c<size;c++)cells.push({r,c,turn:Math.floor(rand()*4),active:false});
 // A connected, winding route is generated from source to destination. Player rotates marked junctions to align it.
 let path=[{r:0,c:0}];while(path[path.length-1].r<size-1||path[path.length-1].c<size-1){let p=path[path.length-1],opts=[];if(p.c<size-1)opts.push({r:p.r,c:p.c+1});if(p.r<size-1)opts.push({r:p.r+1,c:p.c});let q=opts[Math.floor(rand()*opts.length)];if(!path.some(v=>v.r===q.r&&v.c===q.c))path.push(q)}
 const dirs=(a,b)=>b.c>a.c?1:b.r>a.r?2:a.c<b.c?3:0;
 path.forEach((p,i)=>{let entry=i?dirs(p,path[i-1]):3,exit=i<path.length-1?dirs(p,path[i+1]):1;let desired=[entry,exit];let t=cells.find(v=>v.r===p.r&&v.c===p.c);t.route=desired;t.turn=(Math.floor(rand()*4));t.targetTurn=(t.turn+4-Math.floor(rand()*4))%4;t.active=true;t.solved=false});
 // Keep endpoints and several route pieces as interactive; route completion is checked by matching each tile's orientation.
 tiles=cells; $('goalText').textContent=count+' energy pods';$('moves').textContent='0';$('best').textContent='—';updateHud();draw();
}
function updateHud(){$('world').textContent=String(world()).padStart(2,'0');$('worldName').textContent=worldName();$('level').textContent=String(level).padStart(3,'0');$('coins').textContent=coins;$('progressFill').style.width=((level-1)/4999*100)+'%';}
function save(){localStorage.setItem(SAVE,JSON.stringify({level,coins,unlocked:level}));$('saveState').textContent='SAVED LOCALLY'}
function resize(){const dpr=Math.min(devicePixelRatio||1,2),rect=canvas.getBoundingClientRect();canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
function geom(){let w=canvas.clientWidth,h=canvas.clientHeight,cell=Math.min((w-44)/5,(h-80)/5),ox=(w-cell*5)/2,oy=(h-cell*5)/2-5;return{w,h,cell,ox,oy}}
function draw(){if(!ctx||!tiles.length)return;let {w,h,cell,ox,oy}=geom();ctx.clearRect(0,0,w,h);
 // soft floating lights
 for(let i=0;i<18;i++){let x=(i*83+level*7)%w,y=(i*47+level*3)%h;ctx.fillStyle='#b4dfff12';ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,Math.PI*2);ctx.fill()}
 tiles.forEach(t=>{let x=ox+t.c*cell,y=oy+t.r*cell,sz=cell-7;ctx.save();ctx.translate(x+sz/2+3,y+sz/2+3);ctx.rotate(Math.PI/4);ctx.fillStyle=t.active?'#294c68':'#1a304b';roundRect(ctx,-sz*.39,-sz*.39,sz*.78,sz*.78,8);ctx.fill();ctx.restore();
 if(t.active){ctx.strokeStyle='#7de5d0';ctx.lineWidth=4;ctx.lineCap='round';let cx=x+sz/2+3,cy=y+sz/2+3,rad=sz*.32;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,cy-rad);ctx.moveTo(cx,cy);ctx.lineTo(cx+rad,cy);ctx.stroke();ctx.fillStyle='#d9fff5';ctx.beginPath();ctx.arc(cx,cy,4,0,7);ctx.fill();
 if(t.solved){ctx.strokeStyle='#ffe28a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,rad+8,0,Math.PI*2);ctx.stroke()}}
 if(t.r===0&&t.c===0||t.r===4&&t.c===4){ctx.fillStyle=t.r===0?'#70e2d0':'#ffc36e';ctx.beginPath();ctx.arc(x+sz/2+3,y+sz/2+3,7,0,7);ctx.fill()}
 });}
function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function tap(e){if(won)return;let rect=canvas.getBoundingClientRect(),{cell,ox,oy}=geom(),x=e.clientX-rect.left,y=e.clientY-rect.top,c=Math.floor((x-ox)/cell),r=Math.floor((y-oy)/cell);let t=tiles.find(v=>v.r===r&&v.c===c&&v.active);if(!t){toast('Choose a glowing junction');return}t.turn=(t.turn+1)%4;t.solved=t.turn===t.targetTurn;moves++;$('moves').textContent=moves;draw();if(tiles.filter(v=>v.active).every(v=>v.solved)){win()} }
function win(){won=true;coins+=15+Math.max(0,10-moves);$('coins').textContent=coins;$('nextBtn').disabled=false;$('hint').textContent='Beautiful route! All energy pods delivered.';toast('Route complete · rewards collected');save()}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1800)}
$('resetBtn').onclick=()=>{makeLevel();$('hint').textContent='Tap a glowing junction to rotate its track.'};
$('hintBtn').onclick=()=>{if(coins<25){toast('Not enough stars');return}let t=tiles.find(v=>v.active&&!v.solved);if(!t){toast('No hint needed');return}coins-=25;t.turn=t.targetTurn;t.solved=true;moves++;$('moves').textContent=moves;updateHud();draw();toast('One junction aligned');if(tiles.filter(v=>v.active).every(v=>v.solved))win();save()};
$('nextBtn').onclick=()=>{if(!won)return;level=Math.min(5000,level+1);$('hint').textContent='Tap a glowing junction to rotate its track.';makeLevel();save()};
canvas.addEventListener('pointerup',tap);window.addEventListener('resize',resize);makeLevel();resize();