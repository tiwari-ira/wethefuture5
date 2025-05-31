const STAR_COUNT = 80;
const STAR_MIN_SIZE = 1;
const STAR_MAX_SIZE = 3.5;
const STAR_MIN_DURATION = 2;
const STAR_MAX_DURATION = 5;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function createStar() {
  const star = document.createElement('div');
  star.className = 'star';
  const size = randomBetween(STAR_MIN_SIZE, STAR_MAX_SIZE);
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.top = `${randomBetween(0, 100)}vh`;
  star.style.left = `${randomBetween(0, 100)}vw`;
  star.style.opacity = randomBetween(0.6, 1).toFixed(2);
  star.style.animationDuration = `${randomBetween(STAR_MIN_DURATION, STAR_MAX_DURATION)}s`;
  return star;
}

window.addEventListener('DOMContentLoaded', () => {
  const bg = document.querySelector('.stars-bg');
  for (let i = 0; i < STAR_COUNT; i++) {
    bg.appendChild(createStar());
  }
}); 