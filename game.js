const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerSprite = new Image();
playerSprite.src = "assets/sprite-ninja.png";
const bossSprite = new Image();
bossSprite.src = "assets/sprite-boss.png";

const hitSound = document.getElementById("hitSound");

let keys = {};
let touches = { left: false, right: false, attack: false };

class Character {
  constructor(x, y, sprite, isBoss = false) {
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.sprite = sprite;
    this.health = isBoss ? 300 : 100;
    this.alive = true;
    this.isBoss = isBoss;
    this.frameX = 0;
    this.frameY = 0;
    this.frameDelay = 0;
  }

  draw() {
    if (this.alive) {
      ctx.drawImage(this.sprite, this.frameX * this.width, this.frameY * this.height, this.width, this.height,
        this.x, this.y, this.width, this.height);
      ctx.fillStyle = 'red';
      ctx.fillRect(this.x, this.y - 10, this.width, 5);
      ctx.fillStyle = 'lime';
      ctx.fillRect(this.x, this.y - 10, this.width * (this.health / (this.isBoss ? 300 : 100)), 5);
    } else {
      ctx.fillStyle = 'gray';
      ctx.fillRect(this.x, this.y + this.height - 10, this.width, 10);
    }
  }

  updateAnimation() {
    if (++this.frameDelay % 10 === 0) {
      this.frameX = (this.frameX + 1) % 4; // Assume 4 frames per animation
    }
  }

  attack(target) {
    if (this.alive && target.alive && Math.abs(this.x - target.x) < 60) {
      hitSound.currentTime = 0;
      hitSound.play();
      target.health -= this.isBoss ? 20 : 10;
      if (target.health <= 0) {
        target.alive = false;
      }
    }
  }
}

const player = new Character(100, 300, playerSprite);
let level = 1;
let score = 0;
let wave = 1;
let maxWaves = 3;
let enemies = [];

function spawnEnemies(count) {
  enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push(new Character(500 + i * 80, 300, playerSprite));
  }
}

function update() {
  if (keys["ArrowRight"] || touches.right) player.x += 5;
  if (keys["ArrowLeft"] || touches.left) player.x -= 5;
  if (keys[" "] || touches.attack) {
    for (const e of enemies) {
      if (e.alive) {
        player.attack(e);
        break;
      }
    }
    touches.attack = false;
  }
  player.updateAnimation();
  enemies.forEach(e => e.updateAnimation());
}

function drawUI() {
  ctx.fillStyle = 'white';
  ctx.font = '10px "Press Start 2P"';
  ctx.fillText(`Level: ${level}  Wave: ${wave}/${maxWaves}`, 10, 20);
  ctx.fillText(`Player HP: ${player.health}`, 10, 40);
  ctx.fillText(`Score: ${score}`, 10, 60);
}

function drawButtons() {
  const size = 60;
  ctx.globalAlpha = 0.5;
  ctx.drawImage(leftBtn, 20, 320, size, size);
  ctx.drawImage(rightBtn, 100, 320, size, size);
  ctx.drawImage(attackBtn, 700, 320, size, size);
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();
  enemies.forEach(e => e.draw());
  drawUI();
  drawButtons();
}

function allEnemiesDefeated() {
  return enemies.every(e => !e.alive);
}

function nextWaveOrLevel() {
  if (wave < maxWaves) {
    wave++;
    spawnEnemies(wave + 1);
  } else {
    level++;
    wave = 1;
    spawnEnemies(wave + 1);
  }
}

function gameLoop() {
  update();
  draw();
  if (allEnemiesDefeated()) {
    score += 100;
    nextWaveOrLevel();
  }
  requestAnimationFrame(gameLoop);
}

// Touch controls setup
const leftBtn = new Image();
leftBtn.src = "assets/button-left.png";
const rightBtn = new Image();
rightBtn.src = "assets/button-right.png";
const attackBtn = new Image();
attackBtn.src = "assets/button-attack.png";

canvas.addEventListener('touchstart', function (e) {
  const touchesList = e.changedTouches;
  for (let t of touchesList) {
    if (t.clientX < 80) touches.left = true;
    else if (t.clientX < 160) touches.right = true;
    else if (t.clientX > 650) touches.attack = true;
  }
});

canvas.addEventListener('touchend', function (e) {
  touches.left = touches.right = touches.attack = false;
});

function characterSelect() {
  player.sprite = playerSprite;
  spawnEnemies(wave + 1);
  gameLoop();
}

// Fix: defer start until DOM is ready and script is fully loaded
window.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startButton");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      document.getElementById("startScreen").style.display = "none";
      document.getElementById("gameCanvas").style.display = "block";
      characterSelect();
    });
  }
});