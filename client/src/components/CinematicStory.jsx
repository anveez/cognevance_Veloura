import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

/* Camera path: [progress, camX,camY,camZ, lookX,lookY,lookZ, fogDensity, amberMix] */
const K = [
  [0, 0, .4, 8, 0, .2, 0, 0, 0],
  [.12, 2.6, .5, 5.8, 0, .2, 0, 0, 0],
  [.24, .3, .1, 2.6, 0, 0, 0, .05, .1],
  [.31, 0, 0, 1.3, 0, 0, -3, .7, .9],
  [.36, 0, 0, -.8, 0, 0, -5, .24, 1],
  [.5, .5, .3, -4.5, -.5, 0, -9, .2, 1],
  [.62, -.6, -.2, -7.5, .5, 0, -12, .2, 1],
  [.74, 0, 0, -10.5, 0, 0, -14, .18, 1],
  [.745, 0, 1, 9, 0, .4, 0, 0, 0],
  [.8, -1.8, .6, 6.4, 0, .6, 0, 0, 0],
  [.88, .8, 2.4, 4.2, 0, 1.9, 0, 0, 0],
  [.94, 0, .8, 9.5, 0, .2, 0, 0, 0],
  [1, 0, .3, 11.5, 0, .2, 0, 0, 0],
];
const RG = [[0, .1], [.13, .27], [.375, .5], [.52, .64], [.66, .735], [.8, .9], [.935, 1.2]];
const ease = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
function kf(p) {
  let a = K[0], b = K[K.length - 1];
  if (p >= b[0]) return b.slice(1);
  for (let i = 0; i < K.length - 1; i++) if (p < K[i + 1][0]) { a = K[i]; b = K[i + 1]; break; }
  const u = (p - a[0]) / (b[0] - a[0]), s = .5 * u + .5 * u * u * (3 - 2 * u);
  return a.slice(1).map((v, j) => v + (b[j + 1] - v) * s);
}
const rnd = (a, b) => a + Math.random() * (b - a);

export default function CinematicStory({ onFail }) {
  const sec = useRef(null), wrap = useRef(null), cv = useRef(null);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv.current, antialias: true, powerPreference: 'high-performance' });
    } catch { onFail?.(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 1, .05, 60);
    const DARK = new THREE.Color(0x0b0705), AMB = new THREE.Color(0x8f4a12);
    scene.background = DARK.clone();
    scene.fog = new THREE.FogExp2(0x0b0705, 0);

    // Studio reflections: bright cards baked into an environment map
    const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 16), new THREE.MeshBasicMaterial({ color: 0x0a0604, side: THREE.BackSide })));
    const card = (w, h, x, y, z, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); };
    card(8, 3, 0, 6, 4, new THREE.Color(5, 3.6, 2.2)); card(2, 8, -7, 1, 2, new THREE.Color(1.6, 2, 3));
    card(2, 8, 7, 0, -2, new THREE.Color(3, 2, 1.2)); card(10, 2, 0, -4, 5, new THREE.Color(1.2, .8, .5));
    scene.environment = pm.fromScene(es, .02).texture;

    const sprite = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
    })();

    // ---------- bottle ----------
    const outline = new THREE.SplineCurve([[0, -1.5], [.55, -1.5], [.9, -1.4], [.99, -1.1], [.99, .8], [.9, 1.12], [.55, 1.26], [.34, 1.34], [.32, 1.62]].map((p) => new THREE.Vector2(p[0], p[1]))).getPoints(90);
    const glassG = new THREE.LatheGeometry(outline, 72);
    const liqG = new THREE.LatheGeometry([[0, -1.36], [.55, -1.36], [.8, -1.27], [.89, -1.05], [.89, .72], [.82, .92], [0, .92]].map((p) => new THREE.Vector2(p[0], p[1])), 64);
    const labels = [];
    const drawLabel = (o) => {
      const g = o.c.getContext('2d');
      g.fillStyle = '#efe3cc'; g.fillRect(0, 0, 480, 300); g.strokeStyle = '#8a6a2c'; g.lineWidth = 2; g.strokeRect(14, 14, 452, 272);
      g.textAlign = 'center'; g.fillStyle = '#17110d'; g.font = '500 54px "Bodoni Moda",Georgia,serif'; g.fillText('ATELIER', 240, 100); g.fillRect(200, 120, 80, 2);
      g.font = 'italic 400 40px "Bodoni Moda",Georgia,serif'; g.fillText(o.name, 240, 182);
      g.fillStyle = '#6b5a45'; g.font = '400 20px "Hanken Grotesk",sans-serif'; g.fillText('EAU DE PARFUM', 240, 250);
      o.t.needsUpdate = true;
    };
    function bottle(col, name) {
      const g = new THREE.Group();
      const glass = new THREE.Mesh(glassG, new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .03, metalness: 0, transmission: 1, thickness: 1.1, ior: 1.5, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: .05 }));
      const liq = new THREE.Mesh(liqG, new THREE.MeshPhysicalMaterial({ color: col, roughness: .12, emissive: col, emissiveIntensity: .45, clearcoat: .6 }));
      const c = document.createElement('canvas'); c.width = 480; c.height = 300;
      const t = new THREE.CanvasTexture(c), lo = { c, t, name }; labels.push(lo); drawLabel(lo);
      const label = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .95, 32, 1, true, -.75, 1.5), new THREE.MeshStandardMaterial({ map: t, roughness: .55 })); label.position.y = -.25;
      const cap = new THREE.Group();
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(.38, .4, .16, 40), new THREE.MeshStandardMaterial({ color: 0xc9a45c, metalness: 1, roughness: .25 })); collar.position.y = 1.6;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .95, 48), new THREE.MeshStandardMaterial({ color: 0x120c09, metalness: .6, roughness: .15, envMapIntensity: 1.4 })); top.position.y = 2.2;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(.47, .47, .05, 48), new THREE.MeshStandardMaterial({ color: 0xc9a45c, metalness: 1, roughness: .3 })); ring.position.y = 1.76;
      cap.add(collar, top, ring); g.add(liq, glass, label, cap); scene.add(g); return { g, cap };
    }
    const main = bottle(0xc4761c, 'Noir Oud'), L = bottle(0x9b2f45, 'Rose Absolu'), R = bottle(0x4d6b3c, 'Cedar & Smoke');
    L.g.position.set(-3, 0, -.6); R.g.position.set(3, 0, -.6);
    document.fonts?.ready.then(() => labels.forEach(drawLabel));

    // ---------- lights ----------
    const key = new THREE.DirectionalLight(0xffd9a0, 2.2); key.position.set(3, 4, 5);
    const rim = new THREE.DirectionalLight(0x7fa6ff, 1.4); rim.position.set(-4, 2, -3);
    const pl = new THREE.PointLight(0xffa24a, 0, 22, 1.2);
    scene.add(key, rim, pl, new THREE.AmbientLight(0xffffff, .15));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite, color: 0xff9a3a, transparent: true, opacity: .4, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    glow.scale.set(15, 15, 1); glow.position.set(0, .2, -2.5); scene.add(glow);

    // ---------- particles ----------
    function pts(n, size, col, rx, ry, z0, z1, blend) {
      const a = new Float32Array(n * 3), sd = [];
      for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() * 2 - 1) * rx; a[i * 3 + 1] = (Math.random() * 2 - 1) * ry; a[i * 3 + 2] = z0 + Math.random() * (z1 - z0); sd.push(Math.random() * 6.28); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
      const m = new THREE.PointsMaterial({ map: sprite, size, color: col, transparent: true, opacity: .5, depthWrite: false, blending: blend, sizeAttenuation: true });
      const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p); return { a, sd, n, ry, m, g };
    }
    const dust = pts(300, .07, 0xffd79a, 6, 3.5, -13, 6, THREE.AdditiveBlending);
    const bub = pts(90, .32, 0xffc87a, 4, 3, -13, 3, THREE.AdditiveBlending);
    const smoke = pts(80, 1.8, 0xb59a7a, .3, .3, -.3, .3, THREE.NormalBlending);
    const rise = (o, dt, t, sp) => {
      for (let i = 0; i < o.n; i++) { let y = o.a[i * 3 + 1] + dt * sp * (.4 + (i % 3) * .3); if (y > o.ry) y = -o.ry; o.a[i * 3 + 1] = y; o.a[i * 3] += Math.sin(t + o.sd[i]) * .002; }
      o.g.attributes.position.needsUpdate = true;
    };
    function inst(geo, mat, n, xr, yr, z0, z1) {
      const m = new THREE.InstancedMesh(geo, mat, n), d = [];
      for (let i = 0; i < n; i++) d.push({ x: rnd(-xr, xr), y: rnd(-yr, yr), z: rnd(z0, z1), rx: rnd(-1, 1), ry: rnd(-1, 1), rz: rnd(-1, 1), sp: rnd(.3, 1), ph: rnd(0, 6.28) });
      m.frustumCulled = false; scene.add(m); return { m, d };
    }
    const petals = inst(new THREE.PlaneGeometry(.4, .26, 3, 1), new THREE.MeshStandardMaterial({ color: 0xd5738c, side: THREE.DoubleSide, roughness: .5, emissive: 0x4a1020 }), 70, 3.2, 2, -13, -2.5);
    const shards = inst(new THREE.BoxGeometry(.1, .85, .07), new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: .45, metalness: .25 }), 45, 3, 2.2, -13, -5);
    const dm = new THREE.Object3D();
    const drift = (o, t) => {
      o.d.forEach((d, i) => { dm.position.set(d.x + Math.sin(t * d.sp + d.ph) * .25, d.y + Math.cos(t * d.sp * .8 + d.ph) * .2, d.z); dm.rotation.set(t * d.rx + d.ph, t * d.ry, t * d.rz); dm.updateMatrix(); o.m.setMatrixAt(i, dm.matrix); });
      o.m.instanceMatrix.needsUpdate = true;
    };

    // ---------- layout + loop ----------
    const w = wrap.current, chs = [...w.querySelectorAll('.cine-chap')];
    const flashEl = w.querySelector('.cine-flash'), bar = w.querySelector('.cine-bar'), hint = w.querySelector('.cine-hint');
    const resize = () => {
      const hh = document.querySelector('header')?.offsetHeight || 0;
      w.style.top = hh + 'px'; w.style.height = `calc(100svh - ${hh}px)`;
      renderer.setSize(w.clientWidth, w.clientHeight, false);
      cam.aspect = w.clientWidth / w.clientHeight; cam.updateProjectionMatrix();
    };
    addEventListener('resize', resize); resize();

    let P = 0, last = performance.now(), raf = 0, alive = true;
    const frame = (now) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, .05), t = now / 1000; last = now;
      const rect = sec.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return; // off-screen: skip all work
      const T = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - w.clientHeight)));
      P += (T - P) * (reduce ? 1 : 1 - Math.pow(.01, dt));

      const k = kf(P), wide = w.clientWidth / w.clientHeight < 1 ? 1.5 : 1, out = k[2] > 1.5, sw = reduce ? 0 : 1;
      cam.position.set(k[0] * (out ? wide : 1) + Math.sin(t * .5) * .12 * sw, k[1] + Math.sin(t * .7) * .07 * sw, out ? k[2] * wide : k[2]);
      cam.lookAt(k[3], k[4], k[5]);
      const mix = k[7];
      scene.background.copy(DARK).lerp(AMB, mix); scene.fog.color.copy(scene.background); scene.fog.density = k[6];

      main.g.visible = !(k[2] < 1.3);
      const base = t * .22 + P * 5, e = ease(.76, .86, P);
      main.g.rotation.y = base + (Math.round(base / 6.2832) * 6.2832 - base) * e;
      const lift = ease(.82, .9, P) * 2.2;
      main.cap.position.y = lift; main.cap.rotation.z = lift * .12; main.cap.rotation.y = lift * 1.5;

      const s = ease(.9, .96, P);
      [L, R].forEach((b, i) => { b.g.visible = s > .01; b.g.scale.setScalar(.001 + s); b.g.rotation.y = (i ? -1 : 1) * (.5 - .5 * s) + Math.sin(t * .4 + i) * .1; b.g.position.y = Math.sin(t * .8 + i * 2) * .08; });

      pl.position.copy(cam.position); pl.intensity = mix * 3; key.intensity = 2.2 * (1 - mix * .7);
      glow.material.opacity = .1 + .35 * (1 - mix);
      dust.m.opacity = .45; bub.m.opacity = .15 + .5 * mix;
      rise(dust, dt, t, .15); rise(bub, dt, t, .35);

      const sm = ease(.84, .92, P); smoke.m.opacity = sm * .2; smoke.m.visible = sm > .01;
      if (sm > .01) {
        for (let i = 0; i < smoke.n; i++) {
          const age = (t * .3 + i / smoke.n) % 1;
          smoke.a[i * 3] = Math.sin(smoke.sd[i] + age * 3) * age * .9; smoke.a[i * 3 + 1] = 1.7 + lift * .2 + age * 3.2; smoke.a[i * 3 + 2] = Math.cos(smoke.sd[i] * 2) * age * .7;
        }
        smoke.g.attributes.position.needsUpdate = true;
      }
      petals.m.visible = shards.m.visible = P > .3 && P < .76;
      if (petals.m.visible) { drift(petals, t); drift(shards, t); }

      flashEl.style.opacity = Math.max(Math.max(0, 1 - Math.abs(P - .7425) / .012), .55 * Math.max(0, 1 - Math.abs(P - .315) / .025));
      chs.forEach((el, i) => {
                const [a, b] = RG[i], o = (i === 0 ? 1 : ease(a, a + .025, P)) * (1 - ease(b - .025, b, P));
        el.style.opacity = o; el.style.visibility = o < .01 ? 'hidden' : 'visible';
        el.style.setProperty('--y', (1 - o) * 26 + 'px');
        if (el.dataset.final) el.style.pointerEvents = o > .5 ? 'auto' : 'none';
      });
      bar.style.width = P * 100 + '%'; hint.style.opacity = 1 - ease(0, .03, P);
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false; cancelAnimationFrame(raf); removeEventListener('resize', resize);
            pm.dispose(); renderer.dispose();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <section ref={sec} className="cine-sec" aria-label="Noir Oud: an interactive scroll story">
      <div ref={wrap} className="cine-wrap">
        <canvas ref={cv} />
        <div className="cine-vig" /><div className="cine-grain" /><div className="cine-flash" /><div className="cine-bar" />

        <div className="cine-chap low"><h1>Atelier</h1><p>Noir Oud, N°07. A perfume you do not read about. You go inside it.</p></div>
        <div className="cine-chap"><h2>Every perfume begins as a liquid.</h2><p>Keep scrolling. We are going in.</p></div>
        <div className="cine-chap r"><h2>Rose, picked before sunrise.</h2><p>Soft, damp petals open the heart of this blend.</p></div>
        <div className="cine-chap"><h2>Oud, aged in the dark.</h2><p>Resin from wood left to rest for twelve years.</p></div>
        <div className="cine-chap c"><h2>Saffron, amber, smoke.</h2><p>Three notes. One long evening.</p></div>
        <div className="cine-chap r"><h2>Now open it.</h2><p>Noir Oud arrives in a hand-finished glass flacon.</p></div>
        <div className="cine-chap c" data-final="1">
          <h2>Find your signature.</h2>
          <p>Three houses, three moods. Choose the one you will be remembered by.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn btn-gold">Enter the collection</Link>
            <a href="#finder" className="btn btn-line">Find my scent</a>
          </div>
        </div>
        <div className="cine-hint" />
      </div>
    </section>
  );
}