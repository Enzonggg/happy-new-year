/* ================== SOUND ================== */
const fireworkSounds = [
    new Audio('firework.mp3')
];
fireworkSounds.forEach(s => s.volume = 0.6); // Fixed volume

/* ================== FIREWORK ================== */
class Firework {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;               // Random horizontal start
        this.y = h;                               // Start at bottom
        this.tx = this.x;                         // Target x = same (straight up)
        this.ty = Math.random() * (h / 2) + 100; // Target y
        this.vx = 0;                              // No horizontal movement
        this.vy = (this.ty - this.y) / 50;       // Vertical velocity
        this.exploded = false;
        this.particles = [];
        this.colors = ['#ff0044','#00ffcc','#ffff00','#ff6600','#00ff00','#ff00ff'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    explode() {
        // 🔊 Play explosion sound
        const sound = fireworkSounds[Math.floor(Math.random() * fireworkSounds.length)];
        sound.currentTime = 0;
        sound.play();

        for (let i = 0; i < 150; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = Math.random() * 6 + 4;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                life: 80,
                alpha: 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }

    update(ctx) {
        if (!this.exploded) {
            this.x += this.vx;
            this.y += this.vy;

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();

            if (Math.abs(this.y - this.ty) < 5) {
                this.exploded = true;
                this.explode();
            }
            return true;
        } else {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1;
                p.life--;
                p.alpha = p.life / 80;

                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            this.particles = this.particles.filter(p => p.life > 0);
            return this.particles.length > 0;
        }
    }
}

/* ================== SHOW ================== */
class FireworkShow {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.fireworks = [];
        this.last = 0;
        this.countdown = 10;
    }

    resize() {
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
    }

    drawCountdown() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 120px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.countdown, this.canvas.width / 2, this.canvas.height / 2);
    }

    startCountdown() {
        const timer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(timer);
                this.startShow();

                document.getElementById('newYearText').style.animation =
                    'newYearAnim 3s ease forwards';

                document.getElementById('videoBtn').classList.add('show');
            }
        }, 1000);

        const animate = () => {
            if (this.countdown > 0) {
                this.drawCountdown();
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    startShow() {
        const animate = () => {
            this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            if (Date.now() - this.last > 800) {
                this.fireworks.push(new Firework(this.canvas.width, this.canvas.height));
                this.last = Date.now();
            }

            this.fireworks = this.fireworks.filter(f => f.update(this.ctx));
            requestAnimationFrame(animate);
        };
        animate();
    }
}

/* ================== VIDEO ================== */
const videoBtn = document.getElementById('videoBtn');
const video = document.getElementById('newYearVideo');

videoBtn.addEventListener('click', () => {
    video.style.display = 'block';
    video.play();
});

/* ================== START ================== */
window.onload = () => {
    new FireworkShow().startCountdown();
};
