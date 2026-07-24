document.getElementById("year").textContent = new Date().getFullYear();

gsap.registerPlugin(ScrollTrigger);

const zones = [
  { eyebrow: "06:00", title: "Gimnasio", subtitle: "Sola, antes de que empiece el día" },
  { eyebrow: "06:30", title: "Ducha y desayuno", subtitle: "En casa, con calma" },
  { eyebrow: "07:00", title: "Camino al trabajo", subtitle: "En coche, con la radio de fondo" },
  { eyebrow: "07:30", title: "Verti", subtitle: "Empieza la jornada" },
  { eyebrow: "18:00", title: "Colegio", subtitle: "A recoger a mis peques, todavía sola" },
  { eyebrow: "18:15", title: "Súper", subtitle: "La compra de cada día, ya en compañía" },
  { eyebrow: "18:45", title: "En casa", subtitle: "A jugar todos juntos" },
];

const DRIVING_ZONE = 2;
const KIDS_JOIN_ZONE = 5;
const ZONE_WIDTH = 1600;
const BOX_CENTER_OFFSET = 1470; // matches CSS: .question-block { left: 1440px; width: 60px; }

const world = document.getElementById("world");
const scene = document.querySelector(".scene");
const ground = document.querySelector(".ground");
const clouds = document.querySelector(".clouds");
const sky = document.querySelector(".sky");
const caption = document.querySelector(".caption");
const captionEyebrow = caption.querySelector(".caption-eyebrow");
const captionTitle = caption.querySelector(".caption-title");
const captionSubtitle = caption.querySelector(".caption-subtitle");
const progressFill = document.querySelector(".progress-fill");
const scrollCue = document.querySelector(".scroll-cue");
const mumFigure = document.querySelector(".mum");
const mumJump = document.querySelector(".mum-jump");
const kidsGroup = document.querySelector(".kids-group");
const familyCar = document.querySelector(".family-car");

const gait = [
  { figure: document.querySelector(".girl"), amplitude: 26, phase: 0.7 },
  { figure: document.querySelector(".boy"), amplitude: 24, phase: 0.35 },
  { figure: mumFigure, amplitude: 20, phase: 0 },
].map((entry) => ({
  ...entry,
  legLeft: entry.figure.querySelector(".leg-left"),
  legRight: entry.figure.querySelector(".leg-right"),
  armLeft: entry.figure.querySelector(".arm-left"),
  armRight: entry.figure.querySelector(".arm-right"),
}));

const wheels = document.querySelectorAll(".stroller-wheel, .car-wheel");

const zoneEls = document.querySelectorAll(".zone");
const rewardBoxes = [
  { zoneIndex: 0 },
  { zoneIndex: 3 },
  { zoneIndex: 4, revealsKids: true },
  { zoneIndex: 5 },
].map((box) => {
  const el = zoneEls[box.zoneIndex].querySelector(".question-block");
  return {
    ...box,
    el,
    icon: el.dataset.reward,
    worldX: box.zoneIndex * ZONE_WIDTH + BOX_CENTER_OFFSET,
    hit: false,
  };
});
const kidsRewardBox = rewardBoxes.find((box) => box.revealsKids);

let lastZoneIndex = -1;
let captionTimer = null;
let kidsVisible = false;
let mumCenterX = 0;

function updateCaption(index) {
  const zone = zones[index];
  caption.classList.remove("visible");
  clearTimeout(captionTimer);
  captionTimer = setTimeout(() => {
    captionEyebrow.textContent = zone.eyebrow;
    captionTitle.textContent = zone.title;
    captionSubtitle.textContent = zone.subtitle;
    caption.classList.add("visible");
  }, lastZoneIndex === -1 ? 0 : 250);
}

function updateCharacters(index) {
  const isDriving = index === DRIVING_ZONE;
  gsap.to(mumFigure, { opacity: isDriving ? 0 : 1, duration: 0.3, overwrite: true });
  gsap.to(familyCar, { opacity: isDriving ? 1 : 0, duration: 0.3, overwrite: true });
}

function triggerBonk(icon, blockEl) {
  gsap.killTweensOf([mumJump, blockEl]);
  const tl = gsap.timeline();
  tl.to(mumJump, { y: -34, duration: 0.18, ease: "power2.out" })
    .to(blockEl, { y: -8, duration: 0.09, ease: "power1.out" }, "<0.13")
    .to(blockEl, { y: 0, duration: 0.14, ease: "power1.in" })
    .to(mumJump, { y: 0, duration: 0.24, ease: "bounce.out" }, "<-0.05");

  const popup = document.createElement("span");
  popup.className = "stat-popup";
  popup.textContent = icon;
  blockEl.appendChild(popup);
  gsap.fromTo(
    popup,
    { y: 0, opacity: 1 },
    { y: -50, opacity: 0, duration: 0.9, ease: "power1.out", onComplete: () => popup.remove() }
  );
}

function checkKidsVisibility(distance) {
  const shouldShow = kidsRewardBox.worldX - distance <= mumCenterX;
  if (shouldShow !== kidsVisible) {
    kidsVisible = shouldShow;
    gsap.to(kidsGroup, { opacity: shouldShow ? 1 : 0, duration: 0.3, overwrite: true });
  }
}

function checkRewardBoxes(distance) {
  rewardBoxes.forEach((box) => {
    if (box.hit) return;
    if (box.worldX - distance <= mumCenterX) {
      box.hit = true;
      box.el.classList.add("hit");
      triggerBonk(box.icon, box.el);
    }
  });
}

function setupWalkScene() {
  const maxShift = world.scrollWidth - window.innerWidth;
  const mumRect = mumFigure.getBoundingClientRect();
  mumCenterX = mumRect.left + mumRect.width / 2;

  const scrollTween = gsap.to(world, {
    x: -maxShift,
    ease: "none",
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: () => "+=" + maxShift,
      scrub: 0.4,
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const distance = progress * maxShift;

        scrollCue.classList.toggle("hidden", progress > 0.03);

        gsap.set(sky, { backgroundPosition: `${-distance}px 0` });
        gsap.set(clouds, { backgroundPosition: `${-distance * 0.3}px 0` });
        gsap.set(ground, { backgroundPosition: `${-distance * 1.15}px 14px` });
        gsap.set(progressFill, { width: `${progress * 100}%` });

        gait.forEach(({ amplitude, phase, legLeft, legRight, armLeft, armRight, figure }) => {
          const angle = Math.sin(distance * 0.045 + phase) * amplitude;
          gsap.set(legLeft, { rotate: angle });
          gsap.set(legRight, { rotate: -angle });
          gsap.set(armLeft, { rotate: -angle * 0.7 });
          gsap.set(armRight, { rotate: angle * 0.7 });
          gsap.set(figure, { y: -Math.abs(Math.sin(distance * 0.045 + phase)) * 3 });
        });

        wheels.forEach((wheel) => gsap.set(wheel, { rotate: distance * 1.2 }));

        checkKidsVisibility(distance);
        checkRewardBoxes(distance);

        const zoneIndex = Math.min(zones.length - 1, Math.floor(progress * zones.length));
        if (zoneIndex !== lastZoneIndex) {
          updateCaption(zoneIndex);
          updateCharacters(zoneIndex);
          lastZoneIndex = zoneIndex;
        }
      },
    },
  });

  updateCaption(0);
  updateCharacters(0);

  return scrollTween;
}

window.addEventListener("load", () => {
  setupWalkScene();
});
