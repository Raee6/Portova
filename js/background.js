/* Landing page hero: a slow network of dots and lines behind the headline.
   Colours follow the light/dark theme. Static when reduced motion is requested. */

(() => {
    const host = document.querySelector(".home-hero");
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.prepend(canvas);

    const ctx = canvas.getContext("2d");
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dots = [], running = true;

    function resize() {
        const ratio = Math.min(devicePixelRatio || 1, 2);
        w = host.clientWidth; h = host.clientHeight;
        canvas.width = w * ratio; canvas.height = h * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const count = Math.round(Math.min(70, (w * h) / 18000));
        dots = Array.from({ length: count }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
            r: Math.random() * 1.6 + .8
        }));
    }

    function draw() {
        const dark = document.documentElement.dataset.theme === "dark";
        const rgb = dark ? "45,212,191" : "15,118,110";
        ctx.clearRect(0, 0, w, h);

        for (const a of dots) {
            if (!still) {
                a.x += a.vx; a.y += a.vy;
                if (a.x < 0 || a.x > w) a.vx *= -1;
                if (a.y < 0 || a.y > h) a.vy *= -1;
            }
        }
        for (let i = 0; i < dots.length; i++) {
            const a = dots[i];
            for (let j = i + 1; j < dots.length; j++) {
                const b = dots[j], d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < 140) {
                    ctx.strokeStyle = `rgba(${rgb},${(1 - d / 140) * (dark ? .3 : .2)})`;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
            ctx.fillStyle = `rgba(${rgb},${dark ? .8 : .5})`;
            ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
        }
        if (!still && running) requestAnimationFrame(draw);
    }

    // Pause while the tab is hidden.
    document.addEventListener("visibilitychange", () => {
        running = !document.hidden;
        if (running && !still) requestAnimationFrame(draw);
    });
    addEventListener("resize", () => { resize(); if (still) draw(); });
    if (still) new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    resize();
    draw();
})();
