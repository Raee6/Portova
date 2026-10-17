/* Landing page demo: one sample portfolio shown in all three layouts.
   It cycles on its own until the visitor picks a layout. */

const stage = document.getElementById("demoStage");
const cards = [...stage.querySelectorAll("[data-demo]")];
const buttons = [...document.querySelectorAll(".demo-switch button")];
const order = cards.map(c => c.dataset.demo);

let index = 0;
let timer = null;

function show(name) {
    index = Math.max(0, order.indexOf(name));
    cards.forEach(c => c.classList.toggle("on", c.dataset.demo === name));
    buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.demo === name)));
}

function start() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => show(order[(index + 1) % order.length]), 3200);
}

buttons.forEach(b => b.addEventListener("click", () => {
    clearInterval(timer);   // the visitor took over, so stop cycling
    show(b.dataset.demo);
}));

show(order[0]);
start();
