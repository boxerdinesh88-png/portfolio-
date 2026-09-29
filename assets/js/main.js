import { profile, services, featured, projects, experience, skills, education } from "./data.js";
import { createScene, state } from "./scene.js";

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
    <div class="pcard__img"><img src="${p.img}" alt="${esc(p.title)} screenshot" loading="lazy" /></div>
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
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { offset: 0, duration: 1.6 }) : target.scrollIntoView({ behavior: "smooth" });
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

// 3D object choreography: a pose per section, blended by scroll position.
// Computed from scroll every frame (not chained tweens) so jumping around the page always lands on the right pose.
const base = { ...state, ...(mobile ? { x: 0, y: 0.9, scale: 0.8, opacity: 0.55 } : { x: 2.1 }) };
const poses = mobile
  ? [
      ["#about", { y: 1.6, scale: 0.6, opacity: 0.3, hue: 0.8 }],
      ["#experience", { y: -1.2, scale: 0.7, hue: 2 }],
      ["#contact", { y: 1, scale: 0.9, opacity: 0.55, hue: 3.2 }],
    ]
  : [
      ["#about", { x: -2.9, y: 0.3, scale: 0.75, amp: 0.5, freq: 1.3, hue: 0.6 }],
      ["#work", { x: 0, y: 0, scale: 1.55, amp: 0.2, freq: 0.7, ring: 0, opacity: 0.35, hue: 1.2 }],
      ["#projects", { x: 2.8, y: -0.4, scale: 0.9, amp: 0.45, ring: 1, opacity: 0.8, hue: 1.6 }],
      ["#experience", { x: 4.3, y: 0.2, scale: 0.75, amp: 0.35, freq: 1.1, opacity: 0.45, hue: 2.1 }],
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

/* ───────────── intro (loader → hero) ───────────── */
function intro() {
  const counter = { v: 0 };
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.to(counter, {
    v: 100, duration: reduced ? 0.2 : 1.6, ease: "power2.inOut",
    onUpdate: () => {
      $("#loaderCount").textContent = Math.round(counter.v);
      $("#loaderBar").style.width = counter.v + "%";
    },
  })
    .to("#loader", { yPercent: -100, duration: 1.1, ease: "expo.inOut" })
    .add(() => { document.body.classList.remove("is-loading"); lenis?.start(); $("#loader").remove(); })
    .from(".hero__title .ch", { yPercent: 115, rotate: 8, duration: 1.3, stagger: 0.035 }, "-=0.55")
    .from(".hero__eyebrow", { y: 20, opacity: 0, duration: 1 }, "-=1.1")
    .from(".hero__role, .hero__cta", { y: 30, opacity: 0, duration: 1.1, stagger: 0.1 }, "-=1")
    .from(".hero__stats .stat", { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, "-=0.9")
    .to(intro3d, { grow: 1, duration: 2.2, ease: "expo.out" }, "-=2")
    .add(() => {
      $$("[data-count]").forEach((el) => {
        const o = { v: 0 };
        gsap.to(o, { v: +el.dataset.count, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v) + el.dataset.suffix) });
      });
    }, "-=1.6");
}
document.body.classList.add("is-loading");
(document.fonts?.ready ?? Promise.resolve()).then(intro);

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

// created last so their positions include the pinned section's spacing
["about", "work", "experience", "skills", "contact"].forEach((id) => {
  const link = $(`.nav__links a[href="#${id}"]`);
  ScrollTrigger.create({ trigger: `#${id}`, start: "top 50%", end: "bottom 50%", onToggle: (s) => link.classList.toggle("is-active", s.isActive) });
});
poseTriggers = poses.map(([sel]) => ScrollTrigger.create({ trigger: sel, start: "top bottom", end: "top 15%" }));
window.addEventListener("load", () => ScrollTrigger.refresh());
