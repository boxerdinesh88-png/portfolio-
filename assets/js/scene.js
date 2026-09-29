// Three.js background: a noise-displaced iridescent blob, an orbit ring and a particle field.
// Exposes `state` so GSAP ScrollTrigger can choreograph it while the user scrolls.
import * as THREE from "three";

const noise = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+2.0*C.xxx; vec3 x3=x0-1.0+3.0*C.xxx;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const blobVertex = /* glsl */ `
uniform float uTime; uniform float uAmp; uniform float uFreq; uniform vec2 uMouse;
varying vec3 vNormal; varying vec3 vView; varying float vNoise;
${noise}
float disp(vec3 p){ return snoise(p*uFreq + vec3(uTime*0.25, uTime*0.18, uMouse.x*0.4)) ; }
void main(){
  float n = disp(position);
  vNoise = n;
  vec3 pos = position + normal * n * uAmp;
  // approximate the displaced normal with two neighbour samples
  vec3 t = normalize(cross(normal, vec3(0.0,1.0,0.0) + 0.001));
  vec3 bt = normalize(cross(normal, t));
  float e = 0.02;
  vec3 p1 = position + t*e;  p1 += normalize(p1) * disp(p1) * uAmp;
  vec3 p2 = position + bt*e; p2 += normalize(p2) * disp(p2) * uAmp;
  vec3 nrm = normalize(cross(p1 - pos, p2 - pos));
  if (dot(nrm, normal) < 0.0) nrm = -nrm;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vNormal = normalize(normalMatrix * nrm);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const blobFragment = /* glsl */ `
uniform float uTime; uniform float uOpacity; uniform float uHue;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
varying vec3 vNormal; varying vec3 vView; varying float vNoise;
void main(){
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
  float band = 0.5 + 0.5 * sin(vNoise * 3.0 + uTime * 0.6 + uHue * 3.14);
  vec3 col = mix(uA, uB, band);
  col = mix(col, uC, smoothstep(0.2, 0.9, vNormal.y * 0.5 + 0.5) * 0.55);
  vec3 light = normalize(vec3(0.4, 0.8, 0.6));
  float diff = max(dot(vNormal, light), 0.0);
  float spec = pow(max(dot(reflect(-light, vNormal), vView), 0.0), 40.0);
  vec3 base = col * (0.16 + diff * 0.55);
  base += fres * mix(uB, vec3(1.0), 0.35) * 1.25;
  base += spec * 0.6;
  gl_FragColor = vec4(base, uOpacity);
}`;

export const state = {
  x: 0, y: 0, scale: 1, amp: 0.32, freq: 0.9, rotSpeed: 0.12,
  ring: 1, particles: 1, opacity: 1, hue: 0,
};

export function createScene(canvas, { mobile = false, reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.setClearColor(0x06070b, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06070b, 0.06);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const root = new THREE.Group();
  scene.add(root);

  // blob
  const blobMat = new THREE.ShaderMaterial({
    vertexShader: blobVertex,
    fragmentShader: blobFragment,
    transparent: true,
    uniforms: {
      uTime: { value: 0 }, uAmp: { value: state.amp }, uFreq: { value: state.freq },
      uMouse: { value: new THREE.Vector2() }, uOpacity: { value: 1 }, uHue: { value: 0 },
      uA: { value: new THREE.Color("#4f46e5") }, uB: { value: new THREE.Color("#22d3ee") }, uC: { value: new THREE.Color("#c084fc") },
    },
  });
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, mobile ? 28 : 56), blobMat);
  root.add(blob);

  // orbit rings
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.006, 8, 220), ringMat);
  ring.rotation.set(1.2, 0.2, 0);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.004, 8, 220), ringMat.clone());
  ring2.material.color.set(0x22d3ee); ring2.material.opacity = 0.22;
  ring2.rotation.set(1.9, -0.5, 0.3);
  root.add(ring, ring2);

  // satellite
  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  ring.add(moon);

  // particles
  const count = mobile ? 900 : 2200;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const palette = [new THREE.Color("#818cf8"), new THREE.Color("#22d3ee"), new THREE.Color("#c084fc"), new THREE.Color("#ffffff")];
  for (let i = 0; i < count; i++) {
    const r = 3.2 + Math.random() * 9;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.7, r * Math.cos(ph) - 2], i * 3);
    const c = palette[(Math.random() * palette.length) | 0];
    col.set([c.r, c.g, c.b], i * 3);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const dotTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"); const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.35, "rgba(255,255,255,.5)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const pMat = new THREE.PointsMaterial({ size: mobile ? 0.07 : 0.055, map: dotTex, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // interaction
  const mouse = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  window.addEventListener("pointermove", (e) => {
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  }, { passive: true });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  let scrollVel = 0;
  function setVelocity(v) { scrollVel = v; }

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = reduced ? 0 : clock.elapsedTime;
    smooth.lerp(mouse, 0.05);

    const vel = Math.min(Math.abs(scrollVel) * 0.004, 0.35);
    blobMat.uniforms.uTime.value = t;
    blobMat.uniforms.uAmp.value = state.amp + vel;
    blobMat.uniforms.uFreq.value = state.freq;
    blobMat.uniforms.uMouse.value.copy(smooth);
    blobMat.uniforms.uOpacity.value = state.opacity;
    blobMat.uniforms.uHue.value = state.hue;

    root.position.set(state.x + smooth.x * 0.25, state.y + smooth.y * 0.2, 0);
    root.scale.setScalar(state.scale);
    if (!reduced) {
      blob.rotation.y += dt * (state.rotSpeed + vel);
      blob.rotation.x += dt * 0.05;
      ring.rotation.z += dt * 0.25;
      ring2.rotation.z -= dt * 0.15;
      points.rotation.y += dt * 0.02 + vel * 0.01;
    }
    root.rotation.x = smooth.y * 0.25;
    root.rotation.y = smooth.x * 0.35;
    ring.material.opacity = 0.35 * state.ring;
    ring2.material.opacity = 0.22 * state.ring;
    moon.position.set(2.35, 0, 0);
    pMat.opacity = 0.8 * state.particles;
    camera.position.x += (smooth.x * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (smooth.y * 0.2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  return { tick, setVelocity };
}
