// "Meet me" — Locomotive-style list: hover a row and a 3D me follows the cursor,
// click it and a full-screen profile opens where every click on me plays the next move.
// The 3D (three.js + Mixamo FBX) only loads once the section is near the viewport;
// until then, or if WebGL fails, a cut-out photo with CSS moves stands in.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const year = (period) => (String(period).match(/\d{4}/) || [""])[0];

// photo fallback moves, in click order
const PHOTO_MOVES = [
  { cls: "m-idle", label: "Idle" },
  { cls: "m-dance", label: "Dance" },
  { cls: "m-jump", label: "Jump" },
  { cls: "m-spin", label: "Spin" },
  { cls: "m-glitch", label: "Glitch" },
];

export function createMeet(root, { experience, education, meet, lenis, mobile }) {
  const rows = [
    ...experience.map((e) => ({
      name: e.company, role: e.role, since: year(e.period),
      details: [["Highlights", e.points.slice(0, 2).map(esc).join("<br>")], ["Period", esc(e.period)], ["Where", esc(e.place)]],
    })),
    ...education.filter((e) => e.kind !== "done").map((e) => ({
      name: e.place.split(",")[0], role: e.title, since: year(e.period),
      details: [["Studying", esc(e.title)], ["Period", esc(e.period)], ["Where", esc(e.place)]],
    })),
  ];

  /* ---------- list ---------- */
  root.querySelector("#meetCount").textContent = `${rows.length} chapters`;
  if (mobile) root.querySelector(".meet__hint").textContent = "Tap a chapter to meet me";
  const list = root.querySelector("#meetRows");
  list.innerHTML = rows.map((r, i) => `
    <li><button class="meet__row" data-i="${i}">
      <span class="meet__name">${esc(r.name)}</span><span class="meet__role">${esc(r.role)}</span>
      <span class="meet__year"><b>${r.since}</b><i>(+)</i></span>
    </button></li>`).join("");

  const follower = document.createElement("div");
  follower.className = "meet__follower";
  follower.setAttribute("aria-hidden", "true");
  follower.innerHTML = `<img src="${meet.photo}" alt="">`;
  document.body.appendChild(follower);

  // eased cursor tracking, tilting with horizontal speed
  let mx = 0, my = 0, fx = 0, fy = 0, tilt = 0, raf = 0;
  const tick = () => {
    const px = fx;
    fx += (mx - fx) * 0.14; fy += (my - fy) * 0.14;
    tilt += (Math.max(-14, Math.min(14, (fx - px) * 0.9)) - tilt) * 0.15;
    follower.style.transform = `translate(${fx - follower.offsetWidth / 2}px, ${fy - follower.offsetHeight / 2}px) rotate(${tilt}deg)`;
    raf = follower.classList.contains("show") || Math.abs(mx - fx) > 0.5 ? requestAnimationFrame(tick) : 0;
  };
  // each row has its own move: row i plays move i (the same one its profile opens on)
  let hoverRow = -1, followerView = null, avatar = null;
  const playHoverMove = () => {
    if (!followerView || hoverRow < 0) return;
    const n = hoverRow % avatar.names.length;
    avatar.clipAt(n).then((clip) => {
      if (clip && hoverRow >= 0 && hoverRow % avatar.names.length === n) followerView.play(clip);
    });
  };
  if (!mobile) {
    list.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!follower.classList.contains("show")) { fx = mx; fy = my; follower.classList.add("show"); }
      if (!raf) raf = requestAnimationFrame(tick);
      const row = e.target.closest(".meet__row");
      if (row && +row.dataset.i !== hoverRow) { hoverRow = +row.dataset.i; playHoverMove(); }
    });
    list.addEventListener("pointerleave", () => { follower.classList.remove("show"); hoverRow = -1; });
  }
  list.addEventListener("click", (e) => {
    const b = e.target.closest(".meet__row");
    if (b) open(+b.dataset.i);
  });

  /* ---------- profile ---------- */
  const profile = document.createElement("div");
  profile.className = "mp";
  profile.hidden = true;
  profile.setAttribute("role", "dialog");
  profile.setAttribute("aria-modal", "true");
  profile.setAttribute("aria-label", "Dinesh Kumar");
  profile.setAttribute("data-lenis-prevent", "");   // let the overlay scroll on its own (phones)
  profile.innerHTML = `
    <h2 class="mp__name">Dinesh Kumar</h2>
    <button class="mp__close">Close</button>
    <div class="mp__stage" role="button" tabindex="0" aria-label="Make Dinesh move">
      <div class="mp__person m-idle"><img src="${meet.photo}" alt="Dinesh Kumar"></div>
      <span class="mp__shadow"></span>
    </div>
    <p class="mp__hint"></p>
    <ul class="mp__others">${rows.map((r, i) => `<li><button data-i="${i}">${esc(r.name)}</button></li>`).join("")}</ul>
    <dl class="mp__details"></dl>`;
  document.body.appendChild(profile);

  const $ = (sel) => profile.querySelector(sel);
  const stage = $(".mp__stage"), person = $(".mp__person"), hint = $(".mp__hint"), closeBtn = $(".mp__close");
  let current = 0, move = 0, three = null;

  const moveCount = () => (three ? three.names.length : PHOTO_MOVES.length);
  function setMove(n) {
    move = n;
    if (three) three.play(n);
    else person.className = "mp__person " + PHOTO_MOVES[n].cls;
    const label = three ? three.names[n] : PHOTO_MOVES[n].label;
    hint.innerHTML = `Click me to move · <b>${esc(label)}</b> ${n + 1}/${moveCount()}`;
  }
  stage.addEventListener("click", () => setMove((move + 1) % moveCount()));
  stage.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMove((move + 1) % moveCount()); }
  });

  function select(i) {
    current = i;
    profile.querySelectorAll(".mp__others button").forEach((b, j) => b.setAttribute("aria-current", j === i));
    $(".mp__details").innerHTML = rows[i].details.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    setMove(i % moveCount());   // each chapter starts on a different move
  }
  $(".mp__others").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) select(+b.dataset.i);
  });

  function open(i) {
    follower.classList.remove("show");
    profile.hidden = false;
    profile.offsetWidth;   // commit the closed state so the reveal transition runs
    profile.classList.add("open");
    lenis?.stop();
    document.documentElement.classList.add("mp-open");
    select(i);
    if (meet.avatar && !three) hint.textContent = "Loading 3D me…";
    loadOnce();
    closeBtn.focus();
  }
  // keyboard users get focus back on their row; for mouse users that would leave
  // the row looking hovered, so just drop focus
  function close(byKeyboard) {
    profile.classList.remove("open");
    lenis?.start();
    document.documentElement.classList.remove("mp-open");
    setTimeout(() => { if (!profile.classList.contains("open")) profile.hidden = true; }, 800);
    if (byKeyboard) list.querySelectorAll(".meet__row")[current]?.focus();
    else document.activeElement?.blur();
  }
  closeBtn.addEventListener("click", (e) => close(e.detail === 0));   // detail 0: Enter/Space
  addEventListener("keydown", (e) => { if (e.key === "Escape" && profile.classList.contains("open")) close(true); });

  /* ---------- 3D, loaded when the section comes close ---------- */
  let started = false;
  function loadOnce() {
    if (started || !meet.avatar) return;
    started = true;
    loadAvatar(meet).then((av) => {
      const stageView = createViewer(av, stage, () => profile.classList.contains("open"));
      three = {
        names: av.names,
        play(n) {
          av.clipAt(n).then((clip) => { if (clip && move === n) stageView.play(clip); });
          av.clipAt((n + 1) % av.names.length);   // warm up the next click
        },
      };
      person.style.display = "none";
      if (profile.classList.contains("open")) setMove(current % three.names.length);
      if (!mobile) {
        follower.classList.add("is3d");
        avatar = av;
        followerView = createViewer(av, follower, () => follower.classList.contains("show"));
        followerView.play(av.hoverClip);   // shown while a row's own move is still downloading
        playHoverMove();
      }
    }).catch((err) => console.warn("Meet me: 3D unavailable, using the photo", err));
  }
  new IntersectionObserver((entries, io) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); loadOnce(); }
  }, { rootMargin: "600px 0px" }).observe(root);
}

/* ---------- three.js ---------- */
async function loadAvatar(meet) {
  const THREE = await import("three");
  const { FBXLoader } = await import("three/addons/loaders/FBXLoader.js");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const SkeletonUtils = await import("three/addons/utils/SkeletonUtils.js");
  const fbx = new FBXLoader(), gltf = new GLTFLoader();

  // -> { scene, animations } whatever the format; each file is fetched once
  const files = {};
  const load = (url) => files[url] ??= /\.fbx(\?|$)/i.test(url)
    ? fbx.loadAsync(url).then((group) => ({ scene: group, animations: group.animations }))
    : gltf.loadAsync(url);
  const base = await load(meet.avatar);
  base.scene.traverse((o) => { if (o.isMesh && !o.geometry.attributes.normal) smoothNormals(o.geometry); });

  const clipFor = async (move) => {
    let clip = move.file ? (await load(move.file)).animations[0] : base.animations.find((c) => c.name === move.name);
    if (!clip) { console.warn("Meet me: no animation for", move); return null; }
    clip = clip.clone();
    clip.name = move.name || clip.name;
    return keepInPlace(clip);
  };
  // moves load on first use (each Mixamo file is a few MB), so the page starts with just two
  const moves = meet.moves.length ? meet.moves : base.animations.map((c) => ({ name: c.name }));
  const pending = {};
  const clipAt = (i) => pending[i] ??= clipFor(moves[i]);
  const firstClip = await clipAt(0);
  const hoverClip = meet.hover ? await clipFor(meet.hover) : firstClip;

  // pose the first move, then measure: feet on the floor, centred
  const mixer = new THREE.AnimationMixer(base.scene);
  if (firstClip) { mixer.clipAction(firstClip).play(); mixer.update(0); }
  base.scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(base.scene, true);
  const center = box.getCenter(new THREE.Vector3());
  const offset = new THREE.Vector3(-center.x, -box.min.y, -center.z);
  const height = box.getSize(new THREE.Vector3()).y;
  mixer.stopAllAction();

  return {
    THREE, clone: () => SkeletonUtils.clone(base.scene), offset, height,
    names: moves.map((m) => m.name), clipAt, hoverClip,
  };

  // models rigged from an OBJ without normals render pitch black; average the face
  // normals of every corner that shares a position so UV seams don't show as creases
  function smoothNormals(geometry) {
    const pos = geometry.attributes.position, idx = geometry.index;
    const count = idx ? idx.count : pos.count, corner = (i) => (idx ? idx.getX(i) : i);
    const sums = new Map(), keys = new Array(pos.count);
    const key = (v) => `${pos.getX(v).toFixed(5)},${pos.getY(v).toFixed(5)},${pos.getZ(v).toFixed(5)}`;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < count; i += 3) {
      const v = [corner(i), corner(i + 1), corner(i + 2)];
      a.fromBufferAttribute(pos, v[0]); b.fromBufferAttribute(pos, v[1]); c.fromBufferAttribute(pos, v[2]);
      const n = c.sub(b).cross(a.sub(b));   // area-weighted face normal
      for (const vi of v) {
        const k = keys[vi] ??= key(vi);
        const s = sums.get(k);
        s ? s.add(n) : sums.set(k, n.clone());
      }
    }
    const normals = new Float32Array(pos.count * 3);
    for (let v = 0; v < pos.count; v++) {
      const n = sums.get(keys[v] ?? key(v))?.normalize();
      if (n) normals.set([n.x, n.y, n.z], v * 3);
    }
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  }

  // walks and jumps from Mixamo can carry the body away; pin the hips' x/z
  function keepInPlace(c) {
    const t = c.tracks.find((t) => /(hips|pelvis|root)[^.]*\.position$/i.test(t.name));
    if (t) for (let i = 0; i < t.values.length; i += 3) { t.values[i] = t.values[0]; t.values[i + 2] = t.values[2]; }
    return c;
  }
}

function createViewer(av, container, isActive) {
  const { THREE } = av;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(2, 4, 3); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb8ff, 1.4); rim.position.set(-3, 2, -3); scene.add(rim);

  const model = av.clone(); model.position.copy(av.offset); scene.add(model);
  // skinned meshes keep their bind-pose bounds; don't let culling hide a mid-jump body
  model.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  const h = av.height;
  const camera = new THREE.PerspectiveCamera(30, 1, h / 100, h * 20);
  camera.position.set(0, h * 0.55, h * 2.35);
  camera.lookAt(0, h * 0.5, 0);

  const mixer = new THREE.AnimationMixer(model);
  let active = null, w = 0, hgt = 0;
  container.prepend(renderer.domElement);
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    if (!isActive()) return;
    const r = container.getBoundingClientRect();
    if (r.width !== w || r.height !== hgt) {
      w = r.width; hgt = r.height;
      renderer.setSize(w, hgt, false);
      camera.aspect = w / hgt; camera.updateProjectionMatrix();
    }
    mixer.update(dt);
    renderer.render(scene, camera);
  });
  return {
    play(clip) {
      const next = mixer.clipAction(clip);
      next.reset().setLoop(THREE.LoopRepeat).fadeIn(0.35).play();
      if (active && active !== next) active.fadeOut(0.35);
      active = next;
    },
  };
}
