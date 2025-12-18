const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let keys = {};
let level = 1;
let gameOver = false;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

class Player {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.x = 100;
    this.y = canvas.height / 2 - this.height / 2;
    this.speed = 5;
    this.bullets = [];
  }

  draw() {
    ctx.fillStyle = "cyan";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (keys["ArrowUp"] && this.y > 0) this.y -= this.speed;
    if (keys["ArrowDown"] && this.y + this.height < canvas.height) this.y += this.speed;
    if (keys[" "]) this.shoot();

    this.bullets.forEach(b => b.update());
    this.bullets = this.bullets.filter(b => !b.outOfBounds);
  }

  shoot() {
    if (this.bullets.length === 0 || Date.now() - this.bullets[this.bullets.length - 1].timestamp > 300) {
      this.bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2));
    }
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 8;
    this.radius = 5;
    this.outOfBounds = false;
    this.timestamp = Date.now();
  }

  update() {
    this.x += this.speed;
    if (this.x > canvas.width) this.outOfBounds = true;
    this.draw();
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Missile {
  constructor() {
    this.width = 20;
    this.height = 10;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.speed = 3 + level;
    this.hit = false;
  }

  update() {
    this.x -= this.speed;
    this.draw();
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const player = new Player();
let missiles = [];
let lastMissileSpawn = Date.now();
let levelStartTime = Date.now();

function spawnMissile() {
  if (Date.now() - lastMissileSpawn > 1000 - level * 80) {
    missiles.push(new Missile());
    lastMissileSpawn = Date.now();
  }
}

function detectCollisions() {
  missiles.forEach((m, mi) => {
    // Missile hits player
    if (
      m.x < player.x + player.width &&
      m.x + m.width > player.x &&
      m.y < player.y + player.height &&
      m.y + m.height > player.y
    ) {
      gameOver = true;
    }

    // Bullet hits missile
    player.bullets.forEach((b, bi) => {
      if (
        b.x < m.x + m.width &&
        b.x + b.radius > m.x &&
        b.y < m.y + m.height &&
        b.y + b.radius > m.y
      ) {
        missiles.splice(mi, 1);
        player.bullets.splice(bi, 1);
      }
    });
  });
}

function nextLevel() {
  level++;
  if (level > 10) {
    alert("🎉 YOU WON! Level 10 completed!");
    location.reload();
  } else {
    document.getElementById("level").textContent = level;
    levelStartTime = Date.now();
    missiles = [];
  }
}

function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("💀 GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.update();
  player.draw();

  spawnMissile();
  missiles.forEach(m => m.update());
  detectCollisions();

  if (Date.now() - levelStartTime > 15000) nextLevel(); // Each level lasts 15 seconds

  requestAnimationFrame(gameLoop);
}

gameLoop();
