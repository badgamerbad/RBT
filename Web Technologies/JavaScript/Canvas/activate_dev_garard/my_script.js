"use strict"
{
    class Grid {
        constructor(){
            this.max = 100
		}
		initSize(width, height) {
			this.width = (2 + width / kRadius) | 0;
			this.height = (2 + height / kRadius) | 0;
			this.width = 10;
			this.height = 10;
			this.size = kRadius;
			this.cells = new Array(this.width * this.height * this.max);
			this.cellsSize = new Uint8Array(this.width * this.height);
		}
        fill(particles) {
			for (let p of particles) {
				const index = ((1 + p.y / this.size) | 0) * this.width + ((1 + p.x / this.size) | 0)
				if (this.cellsSize[index] < this.max) {
					const cellPos = this.cellsSize[index]++
					this.cells[index * this.max + cellPos] = p
				}
			}
		}
    }
    class Particle {
        constructor(x, y) {
			this.x = x;
			this.y = y;
			this.px = x;
			this.py = y;
		}
        fluid() {
			// Ref Grant Kot Material Point Method http://grantkot.com/
			let pressure = 0;
			let presnear = 0;
			const neighbors = [];
			const xc = (1 + this.x / grid.size) | 0;
			const yc = (1 + this.y / grid.size) | 0;
			for (let x = xc - 1; x < xc + 2; ++x) {
				for (let y = yc - 1; y < yc + 2; ++y) {
					const index = y * grid.width + x;
					for (
						let k = grid.max * index, end = k + grid.cellsSize[index];
						k < end;
						++k
					) {
						const pn = grid.cells[k];
						if (pn !== this) {
							const vx = pn.x - this.x;
							const vy = pn.y - this.y;
							const vlen = Math.sqrt(vx * vx + vy * vy)
							if (vlen < kRadius) {
								const q = 1.0 - vlen / kRadius;
								pressure += q * q;
								presnear += q * q * q;
								neighbors.push(new Contact(pn, q, vx / vlen * q, vy / vlen * q));
							}
						}
					}
				}
			}
			pressure = (pressure - kDensity) * 1.0;
			presnear *= 0.5;
			for (let p of neighbors) {
				const pr = pressure + presnear * p.q;
				const dx = p.vx * pr;
				const dy = p.vy * pr;
				p.n.x += dx;
				p.n.y += dy;
				this.x -= dx;
				this.y -= dy;
				if (p.q > kRendering) {
					ctx.moveTo(this.x, this.y);
					ctx.lineTo(p.n.x, p.n.y);
				}
			}
		}
    }
    class Contact {
		constructor(n, q, vx, vy) {
			this.n = n;
			this.q = q;
			this.vx = vx;
			this.vy = vy;
		}
	}
	const canvas = {
		init() {
			this.elem = document.querySelector('canvas');
			this.resize();
			window.addEventListener("resize", () => canvas.resize(), false);
			return this.elem.getContext("2d", { alpha: false });
		},
		resize() {
			this.width = this.elem.width = this.elem.offsetWidth;
			this.height = this.elem.height = this.elem.offsetHeight;
			kRadius = Math.round(0.04 * Math.sqrt(this.width * this.height));
			grid.initSize(this.width, this.height);
		}
	}
	const initParticles = num => {
		const s = 0.35;
		let x = canvas.width * s * 0.5;
		let y = canvas.height * s * 0.5;
		for (let i = 0; i < num; ++i) {
			particles.push(new Particle(x, y));
			x += kRadius / 2.5;
			if (x > canvas.width * (1 - s * 0.5)) {
				x = canvas.width * s * 0.5;
				y += kRadius / 3;
			}
		}
		grid.fill(particles);
    }
	let kRadius
	const particles = []
	const grid = new Grid()
    const ctx = canvas.init()
    initParticles(1200)
    const kDensity = 3
	const kRendering = 0.45
    const run = () => {
		requestAnimationFrame(run)
		ctx.fillStyle = "#bebebf";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
		ctx.strokeStyle = "#556";
        for (let p of particles) p.fluid();
        ctx.stroke();
    }
    run()
}