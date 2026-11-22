'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),message=document.getElementById('message');
const N=20,T=canvas.width/N;
let mode='snake',timer=null,running=false,paused=false,score=0,dir={x:1,y:0},next={x:1,y:0},snake=[],food={x:5,y:5};
let maze=[],player={x:1,y:1},ghosts=[],pellets=0,frame=0;
const MAP=[
'####################',
'#........#.........#',
'#.##.###.#.###.##..#',
'#..................#',
'#.##.#.######.#.##.#',
'#....#....#...#....#',
'####.####.#.####.###',
'#....#.........#...#',
'#.##.#.###.###.#.#.#',
'#....#...#.#...#...#',
'#.######.#.#.#####.#',
'#.................##',
'#.##.###.#.###.##..#',
'#..#.....#.....#...#',
'##.#.#########.#.#.#',
'#....#.......#.....#',
'#.##.#.##.##.#.##..#',
'#....#.......#.....#',
'#..................#',
'####################'
].map(s=>s.slice(0,20).padEnd(20,'#'));
function key(){return 'ines-arcade-best-'+mode}
function best(){try{return Number(localStorage.getItem(key()))||0}catch{return 0}}
function saveBest(){if(score>best()){try{localStorage.setItem(key(),String(score))}catch{}}bestEl.textContent=best()}
function updateScore(){scoreEl.textContent=score;saveBest()}
function stop(text){clearInterval(timer);timer=null;running=false;message.textContent=text;saveBest();draw()}
function randomFood(){const open=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!snake.some(s=>s.x===x&&s.y===y))open.push({x,y});return open.length?open[Math.floor(Math.random()*open.length)]:null}
function initSnake(){snake=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];dir={x:1,y:0};next={...dir};food=randomFood()}
function initPac(){maze=MAP.map(row=>row.split(''));player={x:1,y:1};dir={x:0,y:0};next={x:0,y:0};ghosts=[{x:18,y:18,color:'#ff6b81'},{x:10,y:7,color:'#79c0ff'}];maze[player.y][player.x]=' ';for(const g of ghosts)maze[g.y][g.x]=' ';pellets=maze.flat().filter(c=>c==='.').length;frame=0}
function start(){clearInterval(timer);running=true;paused=false;score=0;mode==='snake'?initSnake():initPac();updateScore();message.textContent='Use arrow keys or WASD';draw();timer=setInterval(tick,mode==='snake'?115:155)}
function switchMode(m){mode=m;clearInterval(timer);timer=null;running=false;paused=false;score=0;scoreEl.textContent=0;bestEl.textContent=best();document.getElementById('mode').textContent=m.toUpperCase();document.getElementById('snakeTab').classList.toggle('active',m==='snake');document.getElementById('pacTab').classList.toggle('active',m==='pac');message.textContent='Press Start to play';m==='snake'?initSnake():initPac();draw()}
function setDirection(d){const dirs={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};const v=dirs[d];if(!v)return;if(mode==='snake'&&v.x===-dir.x&&v.y===-dir.y)return;next=v}
function tick(){if(!running||paused)return;if(mode==='snake')tickSnake();else tickPac();draw()}
function tickSnake(){dir={...next};const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};const eat=food&&h.x===food.x&&h.y===food.y;const body=eat?snake:snake.slice(0,-1);if(h.x<0||h.y<0||h.x>=N||h.y>=N||body.some(s=>s.x===h.x&&s.y===h.y)){stop('Game over — press Start to try again');return}snake.unshift(h);if(eat){score+=10;updateScore();food=randomFood();if(!food){stop('You win! The board is full!');return}}else snake.pop()}
function wall(x,y){return x<0||y<0||x>=N||y>=N||maze[y][x]==='#'}
function tickPac(){frame++;const target={x:player.x+next.x,y:player.y+next.y};if(!wall(target.x,target.y))dir={...next};const p={x:player.x+dir.x,y:player.y+dir.y};if(!wall(p.x,p.y))player=p;if(maze[player.y][player.x]==='.'){maze[player.y][player.x]=' ';pellets--;score+=10;updateScore()}if(ghosts.some(g=>g.x===player.x&&g.y===player.y)){stop('Caught by a ghost — try again!');return}if(pellets===0){stop('You win! All pellets collected!');return}if(frame%2===0){for(const g of ghosts){const moves=[{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0}].filter(v=>!wall(g.x+v.x,g.y+v.y));if(moves.length){const v=moves[Math.floor(Math.random()*moves.length)];g.x+=v.x;g.y+=v.y}}}if(ghosts.some(g=>g.x===player.x&&g.y===player.y))stop('Caught by a ghost — try again!')}
function rect(x,y,color,inset=1){ctx.fillStyle=color;ctx.fillRect(x*T+inset,y*T+inset,T-2*inset,T-2*inset)}
function circle(x,y,color,r=.37){ctx.beginPath();ctx.arc((x+.5)*T,(y+.5)*T,T*r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
function draw(){ctx.fillStyle='#090f15';ctx.fillRect(0,0,canvas.width,canvas.height);if(mode==='snake'){if(food)circle(food.x,food.y,'#ff7b72');snake.forEach((s,i)=>rect(s.x,s.y,i===0?'#79c0ff':'#3fb950',2))}else{for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(maze[y][x]==='#')rect(x,y,'#193d72',1);else if(maze[y][x]==='.')circle(x,y,'#f0e6bd',.09)}circle(player.x,player.y,'#ffd33d');ghosts.forEach(g=>circle(g.x,g.y,g.color))}}
function pause(){if(!running)return;paused=!paused;message.textContent=paused?'Paused':'Keep going!'}
document.getElementById('start').addEventListener('click',start);document.getElementById('pause').addEventListener('click',pause);document.getElementById('snakeTab').addEventListener('click',()=>switchMode('snake'));document.getElementById('pacTab').addEventListener('click',()=>switchMode('pac'));
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>setDirection(b.dataset.dir)));
document.addEventListener('keydown',e=>{const dirs={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};if(dirs[e.key]){e.preventDefault();setDirection(dirs[e.key])}if(e.code==='Space'){e.preventDefault();pause()}});
let touch=null;canvas.addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});canvas.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))>18)setDirection(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));touch=null},{passive:true});
switchMode('snake');
