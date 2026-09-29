// 3D tech-stack: glossy logo balls that cluster to the centre, collide with each other
// and get pushed around by the cursor. Lightweight custom physics — no physics engine needed.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const TECH = [
  "python", "django", "react", "nextjs", "typescript", "javascript", "mysql", "wordpress",
  "tailwindcss", "bootstrap", "git", "html5", "css3", "figma", "threejs", "nodejs",
];
const LABEL = {
  python: "Python", django: "Django", react: "React", nextjs: "Next.js", typescript: "TypeScript", javascript: "JavaScript",
  mysql: "MySQL", wordpress: "WordPress", tailwindcss: "Tailwind", bootstrap: "Bootstrap", git: "Git", html5: "HTML5",
  css3: "CSS3", figma: "Figma", threejs: "Three.js", nodejs: "Node.js",
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Equirectangular texture: logo painted on the front (u=.25) and back (u=.75) of the sphere.
function makeTexture(img, name, maxAniso) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 512;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, "#ffffff"); grd.addColorStop(1, "#e9ebf5");
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 512);
  for (const cx of [256, 768]) {
    if (img) g.drawImage(img, cx - 92, 256 - 118, 184, 184);
    g.fillStyle = "#1b1e2b";
    g.font = "600 34px 'Inter Tight', system-ui, sans-serif";
    g.textAlign = "center";
    if (!img) { g.font = "800 64px 'Inter Tight', system-ui, sans-serif"; g.fillText(LABEL[name], cx, 276); }
    else g.fillText(LABEL[name], cx, 118 + 256 - 20 + 50);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export async function createStack(stage, { mobile = false, reduced = false } = {}) {
  const canvas = stage.querySelector("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 20);
  const bounds = { x: 8, y: 5 }; // half-extent of the visible area on the z=0 plane, updated on resize

  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(5, 8, 10); scene.add(key);
  const rim = new THREE.PointLight(0x818cf8, 60, 40); rim.position.set(-9, -4, 6); scene.add(rim);
  const rim2 = new THREE.PointLight(0x22d3ee, 50, 40); rim2.position.set(10, 3, 4); scene.add(rim2);

  const list = mobile ? TECH.slice(0, 12) : TECH;
  const images = await Promise.all(list.map((n) => loadImage(`assets/stack/${n}.svg`)));
  const geo = new THREE.SphereGeometry(1, mobile ? 40 : 64, mobile ? 28 : 48);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const balls = list.map((name, i) => {
    const r = 0.95 + ((i * 37) % 10) / 40; // 0.95 – 1.2, deterministic variety
    const mat = new THREE.MeshPhysicalMaterial({
      map: makeTexture(images[i], name, maxAniso),
      roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.9,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(r);
    // resting orientation: logo facing the camera with a slight random tilt
    const rest = new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.5));
    mesh.quaternion.copy(rest).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, 0)));
    scene.add(mesh);
    const a = (i / list.length) * Math.PI * 2;
    return {
      mesh, r, rest,
      p: new THREE.Vector3(Math.cos(a) * 9, -9 - Math.random() * 5, (Math.random() - 0.5) * 4),
      v: new THREE.Vector3((Math.random() - 0.5) * 6, 16 + Math.random() * 6, 0),
      seed: Math.random() * 100,
    };
  });

  // pointer on the z=0 plane
  const pointer = { p: new THREE.Vector3(999, 999, 0), prev: new THREE.Vector3(999, 999, 0), v: new THREE.Vector3(), r: mobile ? 1.4 : 1.8, active: false };
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  function toWorld(e) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.ray.intersectPlane(plane, hit) ? hit : null;
  }
  stage.addEventListener("pointermove", (e) => {
    const w = toWorld(e);
    if (!w) return;
    if (!pointer.active) pointer.prev.copy(w);
    pointer.p.copy(w);
    pointer.active = true;
  });
  stage.addEventListener("pointerleave", () => { pointer.active = false; pointer.p.set(999, 999, 0); });
  stage.addEventListener("pointerdown", (e) => {
    const w = toWorld(e);
    if (!w) return;
    for (const b of balls) {
      const d = b.p.clone().sub(w);
      const dist = Math.max(d.length(), 0.3);
      if (dist < 7) b.v.add(d.normalize().multiplyScalar((7 - dist) * 3));
    }
  });

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the cluster fully in frame on narrow screens
    camera.position.z = w / h < 1 ? 20 / Math.max(w / h, 0.55) * 0.8 : 20;
    camera.updateProjectionMatrix();
    bounds.y = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    bounds.x = bounds.y * camera.aspect;
  }
  resize();
  new ResizeObserver(resize).observe(stage);

  const tmp = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const q = new THREE.Quaternion();
  let started = false;

  function step(dt, t) {
    pointer.v.copy(pointer.p).sub(pointer.prev).divideScalar(Math.max(dt, 1e-3));
    pointer.prev.copy(pointer.p);

    for (const b of balls) {
      // spring towards the centre (flatter in z) + gentle idle drift
      b.v.x += (-b.p.x * 4 + Math.sin(t * 0.9 + b.seed) * 0.8) * dt;
      b.v.y += (-b.p.y * 4 + Math.cos(t * 0.8 + b.seed) * 0.8) * dt;
      b.v.z += -b.p.z * 5 * dt;
      b.v.multiplyScalar(Math.exp(-3 * dt));
      b.v.clampLength(0, 22);
      b.p.addScaledVector(b.v, dt);
      // soft walls keep every ball inside the frame once it has arrived
      if (b.arrived) {
        for (const [k, lim] of [["x", bounds.x - b.r], ["y", bounds.y - b.r]]) {
          if (b.p[k] > lim) { b.p[k] = lim; b.v[k] = -Math.abs(b.v[k]) * 0.4; }
          if (b.p[k] < -lim) { b.p[k] = -lim; b.v[k] = Math.abs(b.v[k]) * 0.4; }
        }
      } else if (Math.abs(b.p.y) < bounds.y - b.r) b.arrived = true;

      // cursor pushes balls away
      if (pointer.active) {
        tmp.copy(b.p).sub(pointer.p);
        tmp.z *= 0.3;
        const dist = tmp.length();
        const min = b.r + pointer.r;
        if (dist < min && dist > 1e-4) {
          tmp.divideScalar(dist);
          b.p.addScaledVector(tmp, min - dist);
          b.v.addScaledVector(tmp, (min - dist) * 9);
          b.v.addScaledVector(pointer.v.clampLength(0, 30), 0.025);
        }
      }
    }

    // ball–ball collisions
    for (let it = 0; it < 3; it++) {
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], c = balls[j];
          tmp.copy(c.p).sub(a.p);
          const dist = tmp.length();
          const min = a.r + c.r;
          if (dist >= min || dist < 1e-5) continue;
          tmp.divideScalar(dist);
          const push = (min - dist) / 2;
          a.p.addScaledVector(tmp, -push);
          c.p.addScaledVector(tmp, push);
          const vn = c.v.clone().sub(a.v).dot(tmp);
          if (vn < 0) {
            const imp = -(1 + 0.35) * vn / 2;
            a.v.addScaledVector(tmp, -imp);
            c.v.addScaledVector(tmp, imp);
          }
        }
      }
    }

    for (const b of balls) {
      b.mesh.position.copy(b.p);
      // roll with movement, then ease back so the logo faces the viewer
      const speed = Math.hypot(b.v.x, b.v.y);
      if (speed > 1e-3) {
        axis.set(-b.v.y, b.v.x, 0).normalize();
        q.setFromAxisAngle(axis, (speed * dt) / b.r);
        b.mesh.quaternion.premultiply(q);
      }
      b.mesh.quaternion.slerp(b.rest, 1 - Math.exp(-1.6 * dt));
    }
  }

  let visible = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) started = true;
  }, { threshold: 0.05 }).observe(stage);

  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(clock.getDelta(), 1 / 15);
    if (!visible || !started) return;
    const t = clock.elapsedTime;
    if (reduced) {
      // settle instantly, no motion
      for (let i = 0; i < 200; i++) step(1 / 60, i / 60);
      renderer.render(scene, camera);
      visible = false;
      return;
    }
    // fixed-size substeps keep the simulation stable and real-time even on slow frames
    const n = Math.max(2, Math.ceil(dt / (1 / 120)));
    for (let i = 0; i < n; i++) step(dt / n, t);
    renderer.render(scene, camera);
  }

  return { tick };
}
