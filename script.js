const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dot')];
let index = 0;
let timer;

function showSlide(i) {
  index = (i + slides.length) % slides.length;
  slides.forEach((s, n) => s.classList.toggle('active', n === index));
  dots.forEach((d, n) => d.classList.toggle('active', n === index));
}
function startAuto() {
  clearInterval(timer);
  timer = setInterval(() => showSlide(index + 1), 6000);
}
document.querySelector('.next').addEventListener('click', () => { showSlide(index + 1); startAuto(); });
document.querySelector('.prev').addEventListener('click', () => { showSlide(index - 1); startAuto(); });
dots.forEach((dot, n) => dot.addEventListener('click', () => { showSlide(n); startAuto(); }));

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));
showSlide(0);
startAuto();
