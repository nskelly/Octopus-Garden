const PIXEL_FONT = '"Press Start 2P", monospace';
let STATE = 'menu';
let imgs = {};
let octopus;
let flowers = [];
let sharks  = [];
let shells  = [];
let score;
let hasShell, shellTimer;
let spawnTimer, spawnInterval;
let speed, speedTimer;
let collectedFlowers = [];
let gardenPage = 0;

const FLOWER_KEYS = [
  'flowerPink','flowerBlue','flowerPurple',
  'flowerOrange','flowerRed','flowerGreen','flowerYellow'
];

function preload() {
  imgs.background    = loadImage('background.png');
  imgs.octopus       = loadImage('octopus.png');
  imgs.shark         = loadImage('shark.png');
  imgs.start         = loadImage('start.png');
  imgs.score         = loadImage('score.png');
  imgs.logo          = loadImage('logo.png');
  imgs.gameOver      = loadImage('game-over.png');
  imgs.playAgain     = loadImage('play-again.png');
  imgs.mainMenu      = loadImage('main-menu.png');
  imgs.viewGarden    = loadImage('view-garden.png');
  imgs.shell         = loadImage('shell.png');
  imgs.flowerPink    = loadImage('pink-flower.png');
  imgs.flowerBlue    = loadImage('blue-flower.png');
  imgs.flowerRainbow = loadImage('rainbow-flower.png');
  imgs.flowerPurple  = loadImage('purple-flower.png');
  imgs.flowerOrange  = loadImage('orange-flower.png');
  imgs.flowerRed     = loadImage('red-flower.png');
  imgs.flowerGreen   = loadImage('green-flower.png');
  imgs.flowerYellow  = loadImage('yellow-flower.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  resetGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function resetGame() {
  score = 0;
  hasShell = false;
  shellTimer = 0;
  spawnTimer = 0;
  spawnInterval = 65;
  speed = 4.5;
  speedTimer = 1;
  collectedFlowers = [];
  gardenPage = 0;
  flowers = [];
  sharks  = [];
  shells  = [];
  octopus = { x: width*0.15, y: height/2, w: 175*1.344, h: 175, vy: 0, bob: 0 };
}

function draw() {
  background(0, 20, 60);
  if      (STATE === 'menu')     drawMenu();
  else if (STATE === 'playing')  drawGame();
  else if (STATE === 'gameover') drawGameOver();
  else if (STATE === 'garden')   drawGarden();
}

// main menu
function drawMenu() {
  image(imgs.background, width/2, height/2, width, height);
  fill(0,10,40,80); noStroke(); rect(0,0,width,height);

  let lw = min(width*0.88, 860);
  image(imgs.logo, width/2, height*0.3, lw, lw*(imgs.logo.height/imgs.logo.width));

  let bw = min(width*0.38, 340);
  let bh = bw*(imgs.start.height/imgs.start.width);
  let by = height*0.68;
  if (abs(mouseX-width/2)<bw/2 && abs(mouseY-by)<bh/2) { tint(255,255,180); cursor(HAND); }
  else { noTint(); cursor(ARROW); }
  image(imgs.start, width/2, by, bw, bh);
  noTint();

  textFont(PIXEL_FONT);
  textSize(min(width*0.016,13));
  fill(200,240,255,230); noStroke();
  text('USE UP + DOWN ARROWS TO MOVE', width/2, height*0.83);
  text('COLLECT FLOWERS', width/2, height*0.88);
  text('AVOID SHARKS', width/2, height*0.93);
  textFont('sans-serif');
}

// game
function drawGame() {
  image(imgs.background, width/2, height/2, width, height);

  speedTimer++;
  if (speedTimer > 1 && speedTimer % 300 === 0) {
    speed += 0.6;
    spawnInterval = max(28, spawnInterval - 6);
  }

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnFlowerAndMaybeShark();
  }

  if (frameCount % 600 === 0) {
    shells.push({ x: width+30, y: random(80, height-80), size: 90 });
  }

  updateFlowers();
  updateShells();
  if (STATE !== 'gameover') updateSharks();
  if (STATE !== 'gameover') drawOctopus();
  if (STATE !== 'gameover') drawHUD();
  if (STATE !== 'gameover') handleInput();
}

function spawnFlowerAndMaybeShark() {
  let y = random(100, height-100);
  if (random() < 0.06) {
    flowers.push({ x: width+80, y: y, size: 90, rainbow: true, key: 'flowerRainbow', points: 10, bob: random(TWO_PI) });
  } else {
    let k = FLOWER_KEYS[floor(random(FLOWER_KEYS.length))];
    flowers.push({ x: width+80, y: y, size: 90, rainbow: false, key: k, points: 1, bob: random(TWO_PI) });
  }
  // increase sharks as game goes on
  let sharkChance = min(0.85, 0.2 + (speedTimer / 7200));
  if (random() < sharkChance) {
    let sw = min(width*0.42, 380);
    sharks.push({ x: width+sw, y: random(80,height-80), w: sw, h: sw*(imgs.shark.height/imgs.shark.width), spd: speed+random(-0.3,0.8), phase: random(TWO_PI) });
  }
}

function updateFlowers() {
  let keep = [];
  for (let i = 0; i < flowers.length; i++) {
    let f = flowers[i];
    f.x -= speed * 0.85;
    f.bob += 0.05;
    let fy = f.y + sin(f.bob) * 6;
    let fh = f.size;
    let fw = fh * 1.772;

    if (f.rainbow) {
      push(); translate(f.x, fy);
      let steps = [3,2,1,0];
      for (let si = 0; si < steps.length; si++) {
        let r = steps[si];
        colorMode(HSB);
        fill((frameCount*3 + r*30)%360, 80, 100, 40 - r*8);
        colorMode(RGB); noStroke();
        ellipse(0, 0, fw+r*14, fh+r*14);
      }
      pop();
      image(imgs.flowerRainbow, f.x, fy, fw, fh);
    } else {
      let fi = imgs[f.key];
      if (fi) {
        image(fi, f.x, fy, fw, fh);
      } else {
        fill(255, 80, 180); noStroke();
        ellipse(f.x, fy, fw, fh);
      }
    }

    if (dist(octopus.x, octopus.y, f.x, fy) < (octopus.w/2 + fw/2)*0.55) {
      score += f.points;
      collectedFlowers.push(f);
    } else if (f.x > -100) {
      keep.push(f);
    }
  }
  flowers = keep;
}

function updateShells() {
  let keep = [];
  for (let i = 0; i < shells.length; i++) {
    let s = shells[i];
    s.x -= speed * 0.85;
    fill(255, 210, 60, 50 + (sin(frameCount*0.1)+1)/2*60);
    noStroke(); ellipse(s.x, s.y, s.size*1.477+18, s.size+18);
    image(imgs.shell, s.x, s.y, s.size*1.477, s.size);
    if (dist(octopus.x, octopus.y, s.x, s.y) < (octopus.w/2+s.size/2)*0.6) {
      hasShell = true; shellTimer = 300;
    } else if (s.x > -100) {
      keep.push(s);
    }
  }
  shells = keep;
  if (hasShell) { shellTimer--; if (shellTimer <= 0) hasShell = false; }
}

function updateSharks() {
  let keep = [];
  let dead = false, blocked = false;
  for (let i = 0; i < sharks.length; i++) {
    let s = sharks[i];
    s.x -= s.spd;
    s.y += sin(frameCount*0.03 + s.phase)*1.2;
    s.y = constrain(s.y, 40, height-40);
    image(imgs.shark, s.x, s.y, s.w, s.h);
    let hit = dist(octopus.x, octopus.y, s.x, s.y) < (octopus.w/2+s.w/2)*0.45;
    if (hit && hasShell && !blocked) {
      blocked = true;
    } else if (hit && !hasShell) {
      dead = true;
    } else if (s.x > -200) {
      keep.push(s);
    }
  }
  if (blocked) { hasShell = false; shellTimer = 0; }
  sharks = keep;
  if (dead) STATE = 'gameover';
}

function drawOctopus() {
  octopus.bob += 0.07;
  let by = sin(octopus.bob)*4;
  if (hasShell) {
    fill(255, 215, 60, 55 + (sin(frameCount*0.15)+1)/2*85);
    noStroke(); ellipse(octopus.x, octopus.y+by, octopus.w+36, octopus.h+36);
    image(imgs.shell, octopus.x+octopus.w*0.42, octopus.y+by-octopus.h*0.44, 28*1.477, 28);
  }
  image(imgs.octopus, octopus.x, octopus.y+by, octopus.w, octopus.h);
}

function drawHUD() {
  let sbW = min(width*0.46, 400);
  let sbH = sbW*(imgs.score.height/imgs.score.width);
  image(imgs.score, sbW/2+8, sbH/2+4, sbW, sbH);
  let numCX = 8 + sbW * 0.62 + (sbW * 0.36) / 2;
  let dh = min(sbH * 0.72, 52);
  drawPixelScore(score, numCX, sbH/2+4, dh);
}

function handleInput() {
  if (keyIsDown(UP_ARROW)||keyIsDown(87)) octopus.vy = -5;
  else if (keyIsDown(DOWN_ARROW)||keyIsDown(83)) octopus.vy = 5;
  else octopus.vy *= 0.82;
  octopus.y += octopus.vy;
  octopus.y = constrain(octopus.y, octopus.h/2+10, height-octopus.h/2-10);
}

function drawPixelScore(n, cx, cy, dh) {
  textFont(PIXEL_FONT);
  textSize(dh * 0.72); 
  textAlign(CENTER, CENTER);
  fill(0, 0, 0);
  let o = 1.5; 
  let s = String(n);
  text(s, cx-o, cy-o); text(s, cx+o, cy-o);
  text(s, cx-o, cy+o); text(s, cx+o, cy+o);
  fill(254, 144, 186); 
  noStroke();
  text(s, cx, cy);
  textFont('sans-serif');
  textAlign(CENTER, CENTER);
}

// game over
function drawGameOver() {
  image(imgs.background, width/2, height/2, width, height);
  fill(0,0,30,165); noStroke(); rect(0,0,width,height);

  let gw = min(width*0.52,460);
  let gh = gw*(imgs.gameOver.height/imgs.gameOver.width);
  let gcy = height*0.22;
  image(imgs.gameOver, width/2, gcy, gw, gh);

  textFont(PIXEL_FONT);
  textSize(min(width*0.018,15));
  fill(220,80,140); noStroke();
  text('A SHARK GOT YOU!', width/2, gcy+gh*0.22);
  textFont('sans-serif');

  let sw = min(width*0.5,420);
  let sh = sw*(imgs.score.height/imgs.score.width);
  image(imgs.score, width/2, height*0.46, sw, sh);

  let numCX2 = width/2 - sw/2 + sw*0.62 + (sw*0.36)/2;
  let dh2 = min(sh * 0.72, 56);
  drawPixelScore(score, numCX2, height*0.46, dh2);
  
  let btnW = min(width*0.38, 340);
  drawHoverBtn(imgs.playAgain,  width/2, height*0.59, btnW);
  drawHoverBtn(imgs.mainMenu,   width/2, height*0.72, btnW);
  drawHoverBtn(imgs.viewGarden, width/2, height*0.85, btnW);
}

function drawHoverBtn(img, x, y, w) {
  let h = w*(img.height/img.width);
  if (abs(mouseX-x)<w/2 && abs(mouseY-y)<h/2) { tint(255,255,170); cursor(HAND); }
  else noTint();
  image(img, x, y, w, h);
  noTint();
}

function drawHoverBtnH(img, x, y, h) {
  let w = h*(img.width/img.height);
  if (abs(mouseX-x)<w/2 && abs(mouseY-y)<h/2) { tint(255,255,170); cursor(HAND); }
  else noTint();
  image(img, x, y, w, h);
  noTint();
}

// garden
function drawGarden() {
  image(imgs.background, width/2, height/2, width, height);
  fill(0,0,30,150); noStroke(); rect(0,0,width,height);

  textFont(PIXEL_FONT);
  textSize(min(width*0.028,22)); fill(255,210,255);
  text('YOUR GARDEN', width/2, height*0.1);
  textSize(min(width*0.014,11)); fill(200,235,255,210);
  text(collectedFlowers.length+' FLOWERS  |  SCORE: '+score, width/2, height*0.17);
  textFont('sans-serif');

  if (collectedFlowers.length === 0) {
    textFont(PIXEL_FONT); textSize(min(width*0.018,14)); fill(255,200,210);
    text('NO FLOWERS THIS ROUND...', width/2, height/2);
    textFont('sans-serif');
  } else {
    let cols   = min(9, max(5, floor(width/80)));
    let cellSz = min((width*0.8)/cols, 68);
    let startX = width/2-(cols*cellSz)/2+cellSz/2;
    let startY = height*0.26;
    let rows   = floor((height*0.56)/cellSz);
    let perPg  = cols*rows;
    let totPg  = ceil(collectedFlowers.length/perPg);
    gardenPage = constrain(gardenPage, 0, totPg-1);
    let pf = collectedFlowers.slice(gardenPage*perPg, (gardenPage+1)*perPg);
    for (let i = 0; i < pf.length; i++) {
      let f   = pf[i];
      let fx  = startX + (i%cols)*cellSz;
      let fy  = startY + floor(i/cols)*cellSz;
      let bob = sin(frameCount*0.04+i*0.5)*3;
      let gh  = cellSz*0.72, gw = gh*1.772;
      if (f.rainbow) {
        colorMode(HSB);
        fill((frameCount*2+i*25)%360,70,100,120); colorMode(RGB);
        noStroke(); ellipse(fx,fy+bob,gw*0.9,gh*0.9);
        image(imgs.flowerRainbow,fx,fy+bob,gw,gh);
      } else {
        let gi=imgs[f.key];
        if (gi) image(gi,fx,fy+bob,gw,gh);
      }
    }
    if (totPg>1) {
      textFont(PIXEL_FONT); textSize(min(width*0.014,11)); fill(255,200,255,220);
      text('< >  PAGE '+(gardenPage+1)+' / '+totPg, width/2, height*0.87);
      textFont('sans-serif');
    }
  }
  drawHoverBtnH(imgs.mainMenu, width/2, height*0.93, min(height*0.09,70));
}

// input
function mousePressed() {
  cursor(ARROW);
  if (STATE==='menu') {
    let bw=min(width*0.38,340), bh=bw*(imgs.start.height/imgs.start.width);
    if (abs(mouseX-width/2)<bw/2 && abs(mouseY-height*0.68)<bh/2) { resetGame(); STATE='playing'; }
  } else if (STATE==='gameover') {
    let btnW=min(width*0.38,340);
    let chkW=(img,cy)=>{ let h=btnW*(img.height/img.width); return abs(mouseX-width/2)<btnW/2&&abs(mouseY-cy)<h/2; };
    if (chkW(imgs.playAgain,height*0.59))  { resetGame(); STATE='playing'; }
    if (chkW(imgs.mainMenu,height*0.72))   { STATE='menu'; }
    if (chkW(imgs.viewGarden,height*0.85)) { gardenPage=0; STATE='garden'; }
  } else if (STATE==='garden') {
    let btnH=min(height*0.09,70);
    let bw=btnH*(imgs.mainMenu.width/imgs.mainMenu.height);
    if (abs(mouseX-width/2)<bw/2 && abs(mouseY-height*0.93)<btnH/2) STATE='menu';
  }
}

function keyPressed() {
  if (STATE==='garden') {
    if (keyCode===RIGHT_ARROW) gardenPage++;
    if (keyCode===LEFT_ARROW)  gardenPage--;
  }
  if (STATE==='menu' && keyCode===ENTER) { resetGame(); STATE='playing'; }
}