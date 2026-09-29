import { profile, services, featured, projects, experience, skills, education } from "./data.js?v=9";
import { createScene, state } from "./scene.js?v=7";
import { createStack } from "./stack.js?v=9";

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 900px), (pointer: coarse)").matches;
const ext = 'target="_blank" rel="noopener"';

/* ───────────── render content ───────────── */
$("#heroHeadline").textContent = profile.headline;
$("#stats").innerHTML = profile.stats
  .map((s) => `<div class="stat"><b data-count="${s.value}" data-suffix="${s.suffix}">0${s.suffix}</b><span>${esc(s.label)}</span></div>`)
  .join("");

const marqueeWords = ["Python", "Django", "React", "Next.js", "REST APIs", "MySQL", "WordPress", "Elementor", "GSAP", "Three.js", "TypeScript", "Tailwind"];
const mChunk = marqueeWords.map((w) => `<span class="marquee__item">${w}<i></i></span>`).join("");
$("#marquee").innerHTML = mChunk + mChunk;

$("#avatar").src = profile.avatar;
$("#bio").innerHTML = profile.bio.split(" ").map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
$("#spec").textContent = `${profile.specialization} — ${profile.location}`;

$("#services").innerHTML = services
  .map((s, i) => `<div class="service" data-reveal><span class="service__n">0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`)
  .join("");

$("#featured").innerHTML = featured
  .map((p, i) => `
  <article class="fcard">
    <a class="fcard__img" href="${p.link}" ${ext} aria-label="Open ${esc(p.title)}">
      <img src="${p.img}" alt="${esc(p.title)} screenshot" loading="lazy" />
      <span class="fcard__n">${String(i + 1).padStart(2, "0")} / ${String(featured.length).padStart(2, "0")}</span>
    </a>
    <div class="fcard__body">
      <div class="fcard__top"><h3>${esc(p.title)}</h3><span class="fcard__year">${p.year}</span></div>
      <div class="fcard__sub">${esc(p.subtitle)}</div>
      <p>${esc(p.text)}</p>
      <div class="tags">${p.stack.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="fcard__links">
        <a href="${p.link}" ${ext}>Live site ↗</a>
        ${p.github ? `<a href="${p.github}" ${ext}>Source code</a>` : ""}
      </div>
    </div>
  </article>`)
  .join("");

$("#grid").innerHTML = projects
  .map((p) => `
  <a class="pcard" data-cat="${p.cat}" href="${p.link}" ${ext}>
    <div class="pcard__img">
      <img src="${p.img}" alt="${esc(p.title)} screenshot" loading="lazy" />
      <span class="pcard__cat">${{ wp: "WordPress", ec: "E-commerce", fe: "Front-end" }[p.cat]}</span>
      <span class="pcard__visit">Visit site ↗</span>
    </div>
    <div class="pcard__body">
      <div class="pcard__row"><h3>${esc(p.title)}</h3><span class="pcard__arrow">→</span></div>
      <p>${esc(p.subtitle)}</p>
      <div class="tags">${p.stack.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    </div>
  </a>`)
  .join("");

$("#timeline").insertAdjacentHTML("beforeend", experience
  .map((j) => `
  <div class="job ${j.current ? "is-current" : ""}" data-reveal>
    <div>
      <div class="job__period">${esc(j.period)}</div>
      <div class="job__place">${esc(j.place)}</div>
      ${j.current ? '<span class="job__now">Current</span>' : ""}
    </div>
    <div>
      <h3>${esc(j.company)}</h3>
      <h4>${esc(j.role)}</h4>
      <ul>${j.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
    </div>
  </div>`)
  .join(""));

$("#skillsList").innerHTML = skills
  .map((g) => `<div class="skills__row" data-reveal><h3>${esc(g.group)}</h3><div class="chips">${g.items.map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>`)
  .join("");
$("#edu").innerHTML = education
  .map((e) => `<div class="edu__item" data-reveal><span>${esc(e.period)}</span><h3>${esc(e.title)}</h3><p>${esc(e.place)}</p></div>`)
  .join("");

const email = $("#email");
email.href = `mailto:${profile.email}`;
email.textContent = profile.email;
$("#contactLinks").innerHTML = [
  ["LinkedIn ↗", profile.linkedin],
  ["GitHub ↗", profile.github],
  ["WhatsApp ↗", profile.whatsapp],
  ["Download résumé ↓", profile.resume],
].map(([t, h], i) => `<a class="btn ${i === 3 ? "btn--primary" : ""}" href="${h}" ${ext} data-magnetic>${t}</a>`).join("");
$("#year").textContent = new Date().getFullYear();

// project filters
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  $$("#filters button").forEach((x) => x.classList.toggle("is-active", x === b));
  const f = b.dataset.f;
  const cards = $$(".pcard");
  cards.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
  gsap.fromTo(cards.filter((c) => !c.classList.contains("is-hidden")), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: "power3.out" });
  ScrollTrigger.refresh();
});

/* ───────────── split text ───────────── */
$$(".split").forEach((el) => {
  const chars = [...el.textContent];
  // background-clip:text doesn't paint through transformed children, so tint serif chars individually
  const tint = (i) => {
    const t = chars.length > 1 ? i / (chars.length - 1) : 0;
    const a = [129, 140, 248], b = [34, 211, 238];
    return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(",")})`;
  };
  const serif = el.classList.contains("serif");
  el.innerHTML = chars
    .map((c, i) => `<span class="ch"${serif ? ` style="color:${tint(i)}"` : ""}>${c === " " ? "&nbsp;" : esc(c)}</span>`)
    .join("");
});

/* ───────────── smooth scroll (Lenis + GSAP) ───────────── */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
// re-measure first: Lenis caches the page height, which grows as images and pinned sections settle
function smoothTo(target) {
  if (!lenis) return target.scrollIntoView({ behavior: "smooth" });
  lenis.resize();
  lenis.scrollTo(target, { duration: 1.6 });
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    smoothTo(target);
  })
);

/* ───────────── three.js scene ───────────── */
let scene = null;
try {
  scene = createScene($("#webgl"), { mobile, reduced });
} catch (err) {
  console.warn("WebGL unavailable", err);
  $("#webgl").remove();
}

// 3D tech-stack balls (own renderer, only renders while on screen)
let stack = null;
createStack($("#stackStage"), { mobile, reduced })
  .then((s) => { stack = s; })
  .catch((err) => { console.warn("Tech stack 3D unavailable", err); $("#stackStage").remove(); });
gsap.ticker.add(() => stack?.tick());

// 3D object choreography: a pose per section, blended by scroll position.
// Computed from scroll every frame (not chained tweens) so jumping around the page always lands on the right pose.
const base = { ...state, ...(mobile ? { x: 0, y: 0.9, scale: 0.8, opacity: 0.55 } : { x: 2.1 }) };
const poses = mobile
  ? [
      ["#about", { y: 1.6, scale: 0.6, opacity: 0.3, hue: 0.8 }],
      ["#experience", { y: -1.2, scale: 0.7, hue: 2 }],
      ["#stack", { y: 2.2, scale: 0.5, opacity: 0.15, hue: 2.4 }],
      ["#contact", { y: 1, scale: 0.9, opacity: 0.55, hue: 3.2 }],
    ]
  : [
      ["#about", { x: -2.9, y: 0.3, scale: 0.75, amp: 0.5, freq: 1.3, hue: 0.6 }],
      ["#glance", { x: 4.4, y: -0.3, scale: 0.8, opacity: 0.4, hue: 0.9 }],
      ["#work", { x: 0, y: 0, scale: 1.55, amp: 0.2, freq: 0.7, ring: 0, opacity: 0.35, hue: 1.2 }],
      ["#projects", { x: 2.8, y: -0.4, scale: 0.9, amp: 0.45, ring: 1, opacity: 0.8, hue: 1.6 }],
      ["#experience", { x: 4.3, y: 0.2, scale: 0.75, amp: 0.35, freq: 1.1, opacity: 0.45, hue: 2.1 }],
      ["#stack", { x: -4.8, y: 0.4, scale: 0.7, amp: 0.5, opacity: 0.25, hue: 2.4 }],
      ["#skills", { x: -4.4, y: -0.6, scale: 0.8, amp: 0.6, opacity: 0.45, hue: 2.6 }],
      ["#contact", { x: 3.1, y: 0, scale: 1.05, amp: 0.4, freq: 0.9, opacity: 1, ring: 1, hue: 3.2 }],
    ];
let poseTriggers = []; // created at the end, after the pinned section, so pin spacing is included
const intro3d = { grow: 0 }; // tweened by the intro: 0 = collapsed, 1 = full size
Object.assign(state, base);

gsap.ticker.add((_, deltaMs) => {
  if (!scene) return;
  const y = window.scrollY;
  const target = { ...base };
  poses.forEach(([, vars], i) => {
    const st = poseTriggers[i];
    if (!st) return;
    const p = gsap.utils.clamp(0, 1, (y - st.start) / Math.max(st.end - st.start, 1));
    const e = p * p * (3 - 2 * p); // smoothstep
    for (const k in vars) target[k] += (vars[k] - target[k]) * e;
  });
  target.scale *= 0.15 + 0.85 * intro3d.grow;
  target.amp += (1 - intro3d.grow) * 0.9;
  const f = reduced ? 1 : 1 - Math.pow(0.92, deltaMs / 16.67); // same easing speed at any frame rate
  for (const k in target) state[k] += (target[k] - state[k]) * f;
  scene.setVelocity(lenis ? lenis.velocity : 0);
  scene.tick();
});

/* ───────────── cursor & magnetic ───────────── */
if (!mobile) {
  const cur = $("#cursor");
  const cx = gsap.quickTo(cur, "x", { duration: 0.25, ease: "power3" });
  const cy = gsap.quickTo(cur, "y", { duration: 0.25, ease: "power3" });
  window.addEventListener("pointermove", (e) => { cx(e.clientX); cy(e.clientY); }, { passive: true });
  document.addEventListener("pointerover", (e) => cur.classList.toggle("is-hover", !!e.target.closest("a, button")));

  $$("[data-magnetic]").forEach((el) => {
    const mx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const my = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.3);
      my((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("pointerleave", () => { mx(0); my(0); });
  });

  const tilt = $("[data-tilt]");
  const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.6, ease: "power3" });
  const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.6, ease: "power3" });
  gsap.set(tilt, { transformPerspective: 900 });
  tilt.addEventListener("pointermove", (e) => {
    const r = tilt.getBoundingClientRect();
    ry(((e.clientX - r.left) / r.width - 0.5) * 16);
    rx(-((e.clientY - r.top) / r.height - 0.5) * 16);
  });
  tilt.addEventListener("pointerleave", () => { rx(0); ry(0); });
}

/* ───────────── nav + progress ───────────── */
const nav = $("#nav");
const progress = $("#progress");
let lastY = 0;
ScrollTrigger.create({
  start: 0, end: "max",
  onUpdate: (self) => {
    const y = self.scroll();
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > 400);
    lastY = y;
    progress.style.transform = `scaleX(${self.progress})`;
  },
});

/* ───────────── marquee (speeds up with scroll velocity) ───────────── */
{
  const track = $("#marquee");
  let x = 0, dir = 1;
  gsap.ticker.add((_, delta) => {
    if (reduced) return;
    const v = lenis ? lenis.velocity : 0;
    if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1;
    x -= (0.05 + Math.min(Math.abs(v) * 0.02, 1.2)) * delta * dir;
    const half = track.scrollWidth / 2;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    track.style.transform = `translate3d(${x}px,0,0)`;
  });
}

function countUp(el) {
  const o = { v: 0 };
  gsap.to(o, { v: +el.dataset.count, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v) + el.dataset.suffix) });
}
$$(".bento [data-count]").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => countUp(el) }));

/* ───────────── intro (loader → hero) ───────────── */
const loader = $("#loader");
const loaderCount = $("#loaderCount");
const loaderBar = $("#loaderBar");
const loaderWord = $("#loaderWord");
const loaderStatus = $("#loaderStatus");
let introTl = null;
let wordTimer = 0;

function unlock() {
  clearInterval(wordTimer);
  document.body.classList.remove("is-loading");
  lenis?.start();
  loader.remove();
}

// Real progress: fonts, the page's eager assets and the 3D scene, eased so it never jumps.
const loadProg = { shown: 0, target: 0 };
const tasks = [
  [(document.fonts?.ready ?? Promise.resolve()), "Loading fonts"],
  [new Promise((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", r, { once: true }))), "Loading assets"],
  [new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))), "Preparing 3D scene"],
];
let done = 0;
tasks.forEach(([p, label]) => p.then(() => {
  done++;
  loadProg.target = Math.max(loadProg.target, (done / tasks.length) * 100);
  if (done < tasks.length) loaderStatus.textContent = tasks[done]?.[1] ?? label;
}));
const allLoaded = Promise.all(tasks.map(([p]) => p));

function drawProgress() {
  loaderCount.textContent = Math.round(loadProg.shown);
  loaderBar.style.transform = `scaleX(${loadProg.shown / 100})`;
}

function startLoader() {
  // greeting in several languages
  const words = ["Hello", "नमस्ते", "Hola", "Bonjour", "Ciao", "Hallo", "こんにちは", "Olá"];
  let w = 0;
  if (!reduced) wordTimer = setInterval(() => {
    w = (w + 1) % words.length;
    gsap.fromTo(loaderWord, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "power3.out", overwrite: true });
    loaderWord.textContent = words[w];
  }, 260);

  // logo: stroke draws itself, then fills
  gsap.timeline()
    .to(".loader__logo text", { strokeDashoffset: 0, duration: reduced ? 0.1 : 1.4, ease: "power2.inOut" })
    .to(".loader__logo text", { fillOpacity: 1, strokeOpacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.25");
  gsap.from(".loader__foot > *, .loader__word", { y: 20, opacity: 0, duration: 0.9, stagger: 0.08, ease: "expo.out" });

  // counter eases toward the real target; holds at 90 until everything is loaded
  const minTime = new Promise((r) => setTimeout(r, reduced ? 200 : 1700));
  const floor = { v: 0 }; // a slow first byte still shows motion
  gsap.to(floor, { v: 35, duration: 1.2, ease: "power1.out" });
  const tick = () => {
    const cap = loadProg.finished ? 100 : Math.min(Math.max(loadProg.target, floor.v), 90);
    loadProg.shown += (cap - loadProg.shown) * 0.08 + (loadProg.shown < cap ? 0.25 : 0);
    loadProg.shown = Math.min(loadProg.shown, cap);
    drawProgress();
  };
  gsap.ticker.add(tick);

  Promise.race([Promise.all([allLoaded, minTime]), new Promise((r) => setTimeout(r, 4500))]).then(() => {
    loadProg.finished = true;
    loaderStatus.textContent = "Ready";
    gsap.delayedCall(reduced ? 0 : 0.55, () => { gsap.ticker.remove(tick); loadProg.shown = 100; drawProgress(); reveal(); });
  });
}

function reveal() {
  if (introTl) return;
  clearInterval(wordTimer);
  introTl = gsap.timeline({ defaults: { ease: "expo.out" } });
  introTl
    .to(".loader__center, .loader__foot, .loader__bar", { y: -40, opacity: 0, duration: 0.6, ease: "power3.in", stagger: 0.05 })
    // curtain lifts with a curved bottom edge
    .to(loader, { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=0.15")
    .to("#loaderCurve", { attr: { d: "M0 0 L100 0 L100 0 Q50 100 0 0 Z" }, duration: 0.6, ease: "power2.in" }, "<")
    .to("#loaderCurve", { attr: { d: "M0 0 L100 0 L100 0 Q50 0 0 0 Z" }, duration: 0.6, ease: "power2.out" }, ">")
    .add(unlock, "-=0.35")
    .from(".hero__title .ch", { yPercent: 115, rotate: 8, duration: 1.3, stagger: 0.035 }, "-=0.9")
    .from(".hero__eyebrow", { y: 20, opacity: 0, duration: 1 }, "-=1.1")
    .from(".hero__role, .hero__cta", { y: 30, opacity: 0, duration: 1.1, stagger: 0.1 }, "-=1")
    .from(".hero__stats .stat", { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, "-=0.9")
    .from(".nav", { yPercent: -100, opacity: 0, duration: 1, clearProps: "transform,opacity" }, "-=1.2")
    .to(intro3d, { grow: 1, duration: 2.2, ease: "expo.out" }, "-=2")
    .add(() => {
      $$(".hero [data-count]").forEach(countUp);
    }, "-=1.6");
}

document.body.classList.add("is-loading");
startLoader();
// safety net: if animation frames are stalled (e.g. opened in a background tab), jump straight to the page
setTimeout(() => {
  if (!loader.isConnected) return;
  loadProg.finished = true;
  loadProg.shown = 100;
  drawProgress();
  reveal();
  introTl.progress(1);
}, 8000);

/* ───────────── scroll animations ───────────── */
if (!reduced) {
  // generic reveal
  $$("[data-reveal]").forEach((el) => {
    gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  $$(".section .h2, .featured__head .h2, .more__head .h2").forEach((el) => {
    gsap.from(el, { yPercent: 40, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  $$(".pcard").forEach((el, i) => {
    gsap.from(el, { y: 80, opacity: 0, duration: 1.1, ease: "expo.out", delay: (i % 3) * 0.08, scrollTrigger: { trigger: el, start: "top 92%" } });
  });

  // hero parallax out
  gsap.to(".hero__content", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // bio word-by-word highlight
  gsap.to("#bio .w", { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: "#bio", start: "top 80%", end: "bottom 45%", scrub: true } });
  gsap.fromTo(".about__photo img", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".about__photo", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".about__photo", { clipPath: "inset(100% 0 0 0 round 24px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: ".about__photo", start: "top 80%" } });

  // experience line draws as you scroll
  gsap.to("#timelineFill", { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#timeline", start: "top 70%", end: "bottom 60%", scrub: true } });

  // contact title
  gsap.from(".contact__title .ch", { yPercent: 115, duration: 1.2, stagger: 0.02, ease: "expo.out", scrollTrigger: { trigger: ".contact__title", start: "top 80%" } });

  const mm = gsap.matchMedia();

  // horizontal featured projects (desktop)
  mm.add("(min-width: 901px)", () => {
    const track = $("#featured");
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".featured", pin: ".featured__pin", start: "top top", end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    $$(".fcard", track).forEach((card) => {
      gsap.fromTo(card.querySelector("img"), { xPercent: -6 }, {
        xPercent: 6, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
      });
      gsap.from(card, {
        rotateY: -18, opacity: 0.3, transformPerspective: 1200, transformOrigin: "left center", ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 55%", scrub: true },
      });
    });
  });
  mm.add("(max-width: 900px)", () => {
    $$(".fcard").forEach((el) => gsap.from(el, { y: 80, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  });
}

/* ───────────── spotlight, clock, copy email ───────────── */
$$(".service, .fcard, .pcard, .edu__item").forEach((el) => el.classList.add("spot"));
document.addEventListener("pointermove", (e) => {
  const el = e.target.closest?.(".spot");
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}, { passive: true });

{
  const clock = $("#clock");
  const fmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
  const hourFmt = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" });
  const draw = () => {
    const now = new Date();
    const [time, ampm = ""] = fmt.format(now).split(" ");
    clock.innerHTML = `${time}<small>${ampm.toUpperCase()}</small>`;
    const h = +hourFmt.format(now);
    $("#clockNote").textContent = `IST · UTC+5:30 · ${h >= 10 && h < 19 ? "working hours" : "outside working hours"}`;
  };
  draw();
  setInterval(draw, 15000);
}

const toast = (msg) => {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("is-on"), 2200);
};
async function copyEmail() {
  try { await navigator.clipboard.writeText(profile.email); toast("Email copied — " + profile.email); }
  catch { location.href = `mailto:${profile.email}`; }
}
$("#copyEmail").addEventListener("click", copyEmail);

/* ───────────── command palette (Ctrl/⌘ + K) ───────────── */
{
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  $("#cmdKey").textContent = mobile ? "Menu" : isMac ? "⌘ K" : "Ctrl K";
  const go = (sel) => () => smoothTo($(sel));
  const open = (url) => () => window.open(url, "_blank", "noopener");
  const commands = [
    { group: "Navigate", icon: "⌂", label: "Home", run: go("#top") },
    { group: "Navigate", icon: "◎", label: "About", run: go("#about") },
    { group: "Navigate", icon: "▦", label: "At a glance", run: go("#glance") },
    { group: "Navigate", icon: "★", label: "Featured work", run: go("#work") },
    { group: "Navigate", icon: "◧", label: "Client work", run: go("#projects") },
    { group: "Navigate", icon: "⌁", label: "Experience", run: go("#experience") },
    { group: "Navigate", icon: "◍", label: "Tech stack (3D)", run: go("#stack") },
    { group: "Navigate", icon: "✦", label: "Skills & education", run: go("#skills") },
    { group: "Navigate", icon: "✉", label: "Contact", run: go("#contact") },
    { group: "Actions", icon: "⧉", label: "Copy email address", hint: profile.email, run: copyEmail },
    { group: "Actions", icon: "↓", label: "Download résumé", hint: "PDF", run: open(profile.resume) },
    { group: "Actions", icon: "☏", label: "Chat on WhatsApp", run: open(profile.whatsapp) },
    { group: "Links", icon: "in", label: "LinkedIn", run: open(profile.linkedin) },
    { group: "Links", icon: "⌥", label: "GitHub", run: open(profile.github) },
    ...featured.map((p) => ({ group: "Projects", icon: "↗", label: p.title, hint: p.subtitle, run: open(p.link) })),
    ...projects.map((p) => ({ group: "Projects", icon: "↗", label: p.title, hint: p.subtitle, run: open(p.link) })),
  ];
  const root = $("#cmdk"), input = $("#cmdInput"), list = $("#cmdList");
  let items = [], active = 0;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    items = commands.filter((c) => !q || `${c.label} ${c.hint || ""} ${c.group}`.toLowerCase().includes(q));
    active = Math.min(active, Math.max(items.length - 1, 0));
    if (!items.length) { list.innerHTML = `<li class="cmdk__empty">No results for “${esc(input.value)}”</li>`; return; }
    let html = "", last = "";
    items.forEach((c, i) => {
      if (c.group !== last) { html += `<li class="cmdk__group">${c.group}</li>`; last = c.group; }
      html += `<li class="cmdk__item ${i === active ? "is-active" : ""}" role="option" data-i="${i}"><i>${c.icon}</i><span>${esc(c.label)}</span>${c.hint ? `<small>${esc(c.hint)}</small>` : ""}</li>`;
    });
    list.innerHTML = html;
    list.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
  };
  const show = () => {
    root.hidden = false; input.value = ""; active = 0; render(); input.focus(); lenis?.stop();
    gsap.fromTo(".cmdk__panel", { y: -16, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: "expo.out" });
    gsap.fromTo(".cmdk__backdrop", { opacity: 0 }, { opacity: 1, duration: 0.25 });
  };
  const hide = () => { root.hidden = true; lenis?.start(); };
  const runActive = () => { const c = items[active]; if (!c) return; hide(); c.run(); };

  $("#cmdOpen").addEventListener("click", show);
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return hide();
    const li = e.target.closest(".cmdk__item");
    if (li) { active = +li.dataset.i; runActive(); }
  });
  list.addEventListener("pointermove", (e) => {
    const li = e.target.closest(".cmdk__item");
    if (li && +li.dataset.i !== active) { active = +li.dataset.i; render(); }
  });
  input.addEventListener("input", () => { active = 0; render(); });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); root.hidden ? show() : hide(); return; }
    if (root.hidden) return;
    if (e.key === "Escape") hide();
    else if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % items.length; render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + items.length) % items.length; render(); }
    else if (e.key === "Enter") { e.preventDefault(); runActive(); }
  });
}

// created last so their positions include the pinned section's spacing
["about", "work", "experience", "skills", "contact"].forEach((id) => {
  const link = $(`.nav__links a[href="#${id}"]`);
  ScrollTrigger.create({ trigger: `#${id}`, start: "top 50%", end: "bottom 50%", onToggle: (s) => link.classList.toggle("is-active", s.isActive) });
});
poseTriggers = poses.map(([sel]) => ScrollTrigger.create({ trigger: sel, start: "top bottom", end: "top 15%" }));
window.addEventListener("load", () => ScrollTrigger.refresh());
