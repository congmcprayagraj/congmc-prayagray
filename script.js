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
/* IMAGE LIGHTBOX GALLERY */

document.addEventListener("DOMContentLoaded", function () {

    const images = document.querySelectorAll(
        ".real-gallery img, .gallery-card img"
    );

    if (!images.length) return;

    const lightbox = document.createElement("div");

    lightbox.className = "image-lightbox";

    lightbox.innerHTML = `
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-prev">&#10094;</button>
        <img src="" alt="College Gallery Image">
        <button class="lightbox-next">&#10095;</button>
    `;

    document.body.appendChild(lightbox);

    const displayImage = lightbox.querySelector("img");
    let currentIndex = 0;

    function showImage(index) {
        currentIndex = (index + images.length) % images.length;
        displayImage.src = images[currentIndex].src;
        lightbox.classList.add("active");
    }

    images.forEach((img, index) => {
        img.addEventListener("click", function () {
            showImage(index);
        });
    });

    lightbox.querySelector(".lightbox-close")
        .onclick = () => lightbox.classList.remove("active");

    lightbox.querySelector(".lightbox-next")
        .onclick = () => showImage(currentIndex + 1);

    lightbox.querySelector(".lightbox-prev")
        .onclick = () => showImage(currentIndex - 1);

    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) {
            lightbox.classList.remove("active");
        }
    });

    document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("active")) return;

        if (e.key === "Escape") {
            lightbox.classList.remove("active");
        }

        if (e.key === "ArrowRight") {
            showImage(currentIndex + 1);
        }

        if (e.key === "ArrowLeft") {
            showImage(currentIndex - 1);
        }
    });

});
