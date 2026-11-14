/* Krishna Kumar T S portfolio, 3D stage.
   One fixed canvas behind the copy. The camera moves down a corridor as the page scrolls;
   each chapter has one object built in code. If WebGL is missing the page still reads fine. */
(function () {
  'use strict';
  var sections = Array.prototype.slice.call(document.querySelectorAll('.ch'));
  var rail = document.querySelector('.rail');
  sections.forEach(function (s, i) {
    var a = document.createElement('a'); a.href = '#' + s.id; a.setAttribute('aria-label', s.dataset.name);
    a.innerHTML = '<span>' + s.dataset.name + '</span>'; rail.appendChild(a); s._dot = a;
  });

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('stage'), renderer = null;
  try { if (window.THREE) renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }

  /* scroll position > chapter index (fractional) */
  var anchors = [], idx = 0, shown = 0, mobile = false;
  function measure() {
    mobile = window.innerWidth <= 860;
    anchors = sections.map(function (s) { return mobile ? s.offsetTop + window.innerHeight * 0.5 : s.offsetTop + s.offsetHeight / 2; });
  }
  function readScroll() {
    var y = window.scrollY + window.innerHeight / 2, n = anchors.length, v = 0;
    if (y <= anchors[0]) v = 0; else if (y >= anchors[n - 1]) v = n - 1;
    else for (var i = 0; i < n - 1; i++) if (y >= anchors[i] && y < anchors[i + 1]) { v = i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]); break; }
    idx = v;
    var near = Math.round(v);
    sections.forEach(function (s, i) { s._dot.classList.toggle('on', i === near); });
  }
  window.addEventListener('scroll', readScroll, { passive: true });

  if (!renderer) { document.body.classList.add('no3d'); measure(); readScroll(); window.addEventListener('resize', function () { measure(); readScroll(); }); return; }

  var PAPER = 0xF6F3EC, INK = 0x1d1830, VIOLET = 0x7C4DF0, GREEN = 0x1fa37a, ALERT = 0xB4472E, WHITE = 0xffffff;
  var G = 30, AHEAD = 12;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(PAPER, 1);
  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PAPER, 15, 40);
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d0c0, 1.9));
  var sun = new THREE.DirectionalLight(0xffffff, 1.7); sun.position.set(4, 8, 7); scene.add(sun);

  function sm(a, b, v) { v = Math.min(1, Math.max(0, (v - a) / (b - a))); return v * v * (3 - 2 * v); }
  function lam(c, o) { o = o || {}; o.color = c; return new THREE.MeshLambertMaterial(o); }
  function flat(c, o) { o = o || {}; o.color = c; return new THREE.MeshBasicMaterial(o); }
  function box(w, h, d, m, x, y, z, p) { var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x || 0, y || 0, z || 0); if (p) p.add(b); return b; }
  var seed = 7; function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function canvasTex(w, h, draw) { var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  function textSprite(text, color, scale) {
    var t = canvasTex(512, 160, function (g) { g.font = '800 96px "Inter Tight", Inter, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = color; g.fillText(text, 256, 84); });
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.scale.set(scale, scale * 160 / 512, 1); return s;
  }
  var loader = new THREE.TextureLoader();
  function tex(url, mat) { loader.load(url, function (t) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true; }, undefined, function () {}); }

  /* one group per chapter. side: +1 object on the right, -1 on the left */
  var stations = sections.map(function (s, i) {
    var g = new THREE.Group(); g.userData.side = s.classList.contains('tl') ? 1 : -1; g.userData.i = i; scene.add(g); return g;
  });
  var tick = [];

  /* 0. hero: portrait with his own LinkedIn visuals floating behind */
  (function (g) {
    var pm = flat(0xe9e4f7, { transparent: true, alphaTest: 0.02 });
    var me = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 5.18), pm); me.position.set(0, -0.75, 0.6); g.add(me); tex('assets/krishna-cutout.webp', pm); pm.visible = false;
    loader.load('assets/krishna-cutout.webp', function () { pm.visible = true; });
    var disc = new THREE.Mesh(new THREE.CircleGeometry(2.75, 64), flat(VIOLET)); disc.position.set(0, -0.35, 0.1); g.add(disc);
    var ring = new THREE.Mesh(new THREE.RingGeometry(3.0, 3.06, 96), flat(INK)); ring.position.set(0, -0.35, 0.05); g.add(ring);
    var files = ['ace-pipeline-audit', 'agreed-not-ready', 'claim-vs-evidence', 'listing-view-not-outcome', 'gtm-motion', 'listing-five-jobs'];
    var spots = [[-3.5, 1.5, -1.6, 0.16], [3.4, 1.9, -2.2, -0.2], [-3.9, -1.7, -3.0, 0.24], [3.9, -1.2, -1.2, -0.14], [-1.3, 3.2, -4.2, 0.08], [1.7, 3.5, -5.4, -0.1]];
    var cards = files.map(function (f, k) {
      var m = flat(0xddd6f3), c = new THREE.Group(), p = spots[k];
      c.add(box(1.86, 2.31, 0.04, flat(INK), 0, 0, -0.03));
      var face = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.25), m); c.add(face); tex('assets/work/' + f + '.webp', m);
      c.position.set(p[0], p[1], p[2]); c.rotation.set(0, p[3] * 2.2, p[3]); c.userData.p = p; c.userData.ph = k * 1.3; g.add(c); return c;
    });
    tick.push(function (T, a) {
      cards.forEach(function (c) { c.position.y = c.userData.p[1] + Math.sin(T * 0.6 + c.userData.ph) * 0.14; c.rotation.z = c.userData.p[3] + Math.sin(T * 0.4 + c.userData.ph) * 0.03; });
      ring.rotation.z = T * 0.05;
    });
  })(stations[0]);

  /* 1. belief: one listing card, alone, and a dotted path that carries on past it */
  (function (g) {
    var t = canvasTex(600, 760, function (c, w, h) {
      c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#1d1830'; c.fillRect(0, 0, w, 64); c.fillStyle = '#F6F3EC'; c.font = '700 26px Inter, Arial'; c.fillText('Marketplace listing', 28, 42);
      c.fillStyle = '#7C4DF0'; c.fillRect(40, 110, 110, 110);
      c.fillStyle = '#1d1830'; c.fillRect(180, 118, 330, 26); c.fillStyle = '#b9b3c9'; c.fillRect(180, 162, 240, 16); c.fillRect(180, 192, 290, 16);
      for (var i = 0; i < 7; i++) { c.fillStyle = '#d6d1e0'; c.fillRect(40, 280 + i * 40, 380 + ((i * 53) % 130), 16); }
      c.fillStyle = '#7C4DF0'; c.fillRect(40, 600, 230, 64); c.fillStyle = '#fff'; c.font = '700 26px Inter, Arial'; c.fillText('View options', 74, 641);
      c.strokeStyle = '#1d1830'; c.lineWidth = 3; c.strokeRect(300, 600, 230, 64);
    });
    var card = new THREE.Group(); card.add(box(3.12, 3.92, 0.08, flat(INK), 0, 0, -0.05));
    card.add(new THREE.Mesh(new THREE.PlaneGeometry(3, 3.8), flat(WHITE, { map: t }))); card.rotation.y = 0.32 * -g.userData.side; g.add(card);
    box(9, 0.04, 0.04, flat(INK), 0, -2.05, 0, g);
    var dots = []; for (var i = 0; i < 16; i++) { var d = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), flat(VIOLET)); d.position.set(1.9 + i * 0.5 + Math.sin(i * 0.7) * 0.3, -1.6 + Math.sin(i * 0.5) * 0.5, -0.4 - i * 1.5); g.add(d); dots.push(d); }
    tick.push(function (T, a) {
      card.position.y = Math.sin(T * 0.7) * 0.08;
      dots.forEach(function (d, i) { var on = sm(i / 16, i / 16 + 0.2, a * 1.2); var pulse = 0.75 + 0.35 * Math.sin(T * 2.2 - i * 0.55); d.scale.setScalar(on * pulse + 0.001); });
    });
  })(stations[1]);

  /* 2. storefronts: a wall of shop tiles that fills in. 36 tiles, illustration only */
  (function (g) {
    var wall = new THREE.Group(); wall.rotation.y = -0.3 * g.userData.side; g.add(wall);
    box(6.5, 6.5, 0.12, lam(INK), 0, 0, -0.14, wall);
    var N = 36, tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.84, 0.84, 0.14), lam(WHITE), N), strips = new THREE.InstancedMesh(new THREE.BoxGeometry(0.84, 0.2, 0.16), lam(WHITE), N), pills = new THREE.InstancedMesh(new THREE.BoxGeometry(0.44, 0.12, 0.16), lam(WHITE), N);
    var order = []; for (var i = 0; i < N; i++) order.push(i); order.sort(function () { return rnd() - 0.5; });
    var rank = []; order.forEach(function (v, k) { rank[v] = k; });
    var c = new THREE.Color(), cols = [VIOLET, VIOLET, 0x5b2fd0, GREEN, 0x9b7bf5];
    for (var j = 0; j < N; j++) { strips.setColorAt(j, c.setHex(cols[j % cols.length])); pills.setColorAt(j, c.setHex(INK)); }
    wall.add(tiles); wall.add(strips); wall.add(pills);
    var num = textSprite('35+', '#5b2fd0', 3.2); num.position.set(0, 4.05, 0.2); wall.add(num);
    var dm = new THREE.Object3D();
    tick.push(function (T, a) {
      for (var i = 0; i < N; i++) {
        var x = (i % 6 - 2.5) * 1.0, y = (2.5 - Math.floor(i / 6)) * 1.0, s = sm(rank[i] / N * 0.8, rank[i] / N * 0.8 + 0.2, a), z = 0.02 + Math.sin(T * 0.9 + i) * 0.02;
        dm.rotation.set(0, (1 - s) * 1.6, 0); dm.scale.setScalar(s + 0.0001);
        dm.position.set(x, y, z); dm.updateMatrix(); tiles.setMatrixAt(i, dm.matrix);
        dm.position.set(x, y + 0.32, z + 0.01); dm.updateMatrix(); strips.setMatrixAt(i, dm.matrix);
        dm.position.set(x - 0.14, y - 0.24, z + 0.01); dm.updateMatrix(); pills.setMatrixAt(i, dm.matrix);
      }
      tiles.instanceMatrix.needsUpdate = strips.instanceMatrix.needsUpdate = pills.instanceMatrix.needsUpdate = true;
      num.material.opacity = sm(0.7, 1, a);
    });
  })(stations[2]);

  /* 3. competencies: 43 audit gaps flip from open to closed, 17 case studies stack up */
  (function (g) {
    var wall = new THREE.Group(); wall.rotation.y = -0.3 * g.userData.side; wall.position.y = 0.7; g.add(wall);
    box(7.3, 4.3, 0.12, lam(INK), 0, 0, -0.2, wall);
    var N = 43, cubes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.56, 0.56, 0.2), lam(WHITE), N); wall.add(cubes);
    var dm = new THREE.Object3D(), c = new THREE.Color(), cA = new THREE.Color(ALERT), cB = new THREE.Color(GREEN);
    var pages = []; for (var k = 0; k < 17; k++) { var p = box(1.5, 0.05, 2.0, lam(k % 4 === 0 ? 0xe4dcfb : WHITE), 0, 0, 0, g); p.userData.r = (rnd() - 0.5) * 0.35; pages.push(p); }
    var edge = box(1.56, 0.02, 2.06, flat(INK), 0, -3.14, 0.4, g); edge.rotation.y = 0.2;
    tick.push(function (T, a) {
      for (var i = 0; i < N; i++) {
        var col = i % 9, row = Math.floor(i / 9), f = sm(i / N * 0.75, i / N * 0.75 + 0.14, a);
        dm.position.set((col - 4) * 0.74, (2 - row) * 0.74, 0.02); dm.rotation.set(f * Math.PI, 0, 0); dm.scale.setScalar(1); dm.updateMatrix(); cubes.setMatrixAt(i, dm.matrix);
        cubes.setColorAt(i, c.copy(cA).lerp(cB, sm(0.4, 0.6, f)));
      }
      cubes.instanceMatrix.needsUpdate = true; if (cubes.instanceColor) cubes.instanceColor.needsUpdate = true;
      pages.forEach(function (p, k) { var s = sm(k / 17 * 0.8, k / 17 * 0.8 + 0.2, a); p.position.set(0, -3.1 + k * 0.062 + (1 - s) * 2.5, 0.4); p.rotation.y = 0.2 + p.userData.r; p.scale.setScalar(s + 0.0001); });
    });
  })(stations[3]);

  /* 4. website: a blank browser window, and the page assembling inside it */
  (function (g) {
    var win = new THREE.Group(); win.rotation.y = -0.28 * g.userData.side; g.add(win);
    box(6.72, 4.42, 0.08, flat(INK), 0, 0, -0.06, win); box(6.6, 4.3, 0.08, flat(WHITE), 0, 0, 0, win);
    box(6.6, 0.42, 0.1, flat(INK), 0, 1.94, 0.01, win);
    [VIOLET, GREEN, PAPER].forEach(function (c, i) { var d = new THREE.Mesh(new THREE.CircleGeometry(0.08, 20), flat(c)); d.position.set(-3.0 + i * 0.28, 1.94, 0.07); win.add(d); });
    var defs = [[-2.3, 1.38, 1.3, 0.2, INK], [1.2, 1.38, 0.5, 0.14, 0xb9b3c9], [1.9, 1.38, 0.5, 0.14, 0xb9b3c9], [2.7, 1.38, 0.7, 0.24, VIOLET],
      [-1.2, 0.55, 3.6, 0.36, INK], [-1.6, 0.05, 2.8, 0.3, VIOLET], [-1.75, -0.42, 2.5, 0.12, 0xb9b3c9], [-2.3, -0.82, 1.4, 0.34, VIOLET],
      [2.0, 0.05, 2.1, 1.5, 0xe4dcfb], [-2.2, -1.62, 1.9, 0.62, PAPER], [0, -1.62, 1.9, 0.62, PAPER], [2.2, -1.62, 1.9, 0.62, PAPER]];
    var parts = defs.map(function (d, i) { var b = box(d[2], d[3], 0.06, flat(d[4]), d[0], d[1], 0.08, win); b.userData = { x: d[0], y: d[1], ox: (rnd() - 0.5) * 5, oy: (rnd() - 0.5) * 4, oz: 3 + rnd() * 5, k: i / defs.length }; return b; });
    tick.push(function (T, a) {
      win.position.y = Math.sin(T * 0.6) * 0.07;
      parts.forEach(function (b) { var u = b.userData, s = sm(u.k * 0.75, u.k * 0.75 + 0.25, a), e = 1 - s; b.position.set(u.x + u.ox * e, u.y + u.oy * e, 0.08 + u.oz * e); b.rotation.z = e * 0.8; b.material.transparent = true; b.material.opacity = Math.min(1, s * 1.6); });
    });
  })(stations[4]);

  /* 5. brand and demand: the follower curve, 200 to 4,300+ */
  (function (g) {
    var grp = new THREE.Group(); grp.rotation.y = -0.3 * g.userData.side; grp.position.y = -0.4; g.add(grp);
    var vals = [200, 420, 780, 1250, 1800, 2500, 3100, 3700, 4300], bars = [];
    box(7.4, 0.06, 1.3, flat(INK), 0, -2.03, 0, grp);
    vals.forEach(function (v, i) { var h = v / 4300 * 4.4; var b = box(0.56, 1, 0.56, lam(i === vals.length - 1 ? VIOLET : 0xb7a1f7), (i - 4) * 0.8, -2, 0, grp); b.userData.h = h; bars.push(b); });
    var a0 = textSprite('200', '#1d1830', 1.5); a0.position.set(-3.2, -1.2, 0.5); grp.add(a0);
    var a1 = textSprite('4,300+', '#5b2fd0', 2.6); a1.position.set(3.2, 3.0, 0.5); grp.add(a1);
    var motes = []; for (var i = 0; i < 26; i++) { var m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), flat(i % 3 ? VIOLET : GREEN)); m.userData = { x: (rnd() - 0.5) * 7, z: (rnd() - 0.5) * 2, s: 0.3 + rnd() * 0.5, o: rnd() * 6 }; grp.add(m); motes.push(m); }
    tick.push(function (T, a) {
      bars.forEach(function (b, i) { var s = sm(i / 9 * 0.8, i / 9 * 0.8 + 0.25, a); var h = Math.max(0.02, b.userData.h * s); b.scale.y = h; b.position.y = -2 + h / 2; });
      a1.material.opacity = sm(0.8, 1, a); a0.material.opacity = sm(0.05, 0.3, a);
      motes.forEach(function (m) { var u = m.userData; var y = ((T * u.s + u.o) % 6); m.position.set(u.x, -2 + y, u.z); m.scale.setScalar(Math.sin(y / 6 * Math.PI) * a + 0.001); });
    });
  })(stations[5]);

  /* 6. background: five credentials as hex badges, two degrees as plaques */
  (function (g) {
    var grp = new THREE.Group(); grp.rotation.y = -0.25 * g.userData.side; g.add(grp);
    var cols = [VIOLET, INK, GREEN, 0x5b2fd0, 0x9b7bf5], badges = [];
    for (var i = 0; i < 5; i++) {
      var b = new THREE.Group(), ang = (i - 2) * 0.5;
      var hex = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.16, 6), lam(cols[i])); hex.rotation.x = Math.PI / 2; b.add(hex);
      var inn = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 6), lam(WHITE)); inn.rotation.x = Math.PI / 2; b.add(inn);
      b.position.set(Math.sin(ang) * 3.6, 1.5 - Math.abs(i - 2) * 0.35, Math.cos(ang) * 1.2 - 1.2); b.userData.k = i; grp.add(b); badges.push(b);
    }
    var plaques = [[-1.5, 0xffffff], [1.5, 0xffffff]].map(function (p, i) { var q = new THREE.Group(); q.add(box(2.5, 1.7, 0.1, flat(INK), 0, 0, -0.04)); q.add(box(2.36, 1.56, 0.1, flat(WHITE), 0, 0, 0)); q.add(box(1.5, 0.14, 0.12, flat(INK), -0.2, 0.36, 0.01)); q.add(box(1.9, 0.08, 0.12, flat(0xb9b3c9), 0, 0.05, 0.01)); q.add(box(1.3, 0.08, 0.12, flat(0xb9b3c9), -0.3, -0.18, 0.01)); var seal = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), flat(VIOLET)); seal.position.set(0.8, -0.46, 0.07); q.add(seal); q.position.set(p[0], -1.5, 0.2); q.rotation.z = i ? -0.05 : 0.05; grp.add(q); return q; });
    tick.push(function (T, a) {
      badges.forEach(function (b) { var s = sm(b.userData.k / 5 * 0.7, b.userData.k / 5 * 0.7 + 0.3, a); b.scale.setScalar(s + 0.0001); b.rotation.y = Math.sin(T * 0.8 + b.userData.k) * 0.5 + (1 - s) * 3; b.position.y = 1.5 - Math.abs(b.userData.k - 2) * 0.35 + Math.sin(T * 0.7 + b.userData.k * 1.4) * 0.08; });
      plaques.forEach(function (q, i) { var s = sm(0.5 + i * 0.15, 0.85 + i * 0.15, a); q.scale.setScalar(s + 0.0001); });
    });
  })(stations[6]);

  /* 7. contact: a paper plane on its way out */
  (function (g) {
    var geo = new THREE.BufferGeometry();
    var n = [0, 0, -1.6], l = [-1.1, 0.12, 1.0], r = [1.1, 0.12, 1.0], c = [0, 0.12, 1.0], k = [0, -0.5, 1.0];
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([].concat(n, l, c, n, c, r, n, c, k)), 3)); geo.computeVertexNormals();
    var plane = new THREE.Group(); plane.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: VIOLET, side: THREE.DoubleSide, flatShading: true })));
    plane.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), new THREE.LineBasicMaterial({ color: INK })));
    plane.scale.setScalar(1.5); g.add(plane);
    var trail = []; for (var i = 0; i < 14; i++) { var d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), flat(VIOLET)); g.add(d); trail.push(d); }
    function pos(t, out) { out.set(Math.sin(t) * 2.6, Math.sin(t * 2) * 0.9 + 0.2, Math.cos(t) * 1.6 - 0.5); return out; }
    var v = new THREE.Vector3(), w = new THREE.Vector3();
    tick.push(function (T, a) {
      var t = T * 0.55; pos(t, plane.position); pos(t + 0.05, w); plane.lookAt(g.localToWorld(w.clone())); plane.rotateY(Math.PI); plane.rotateZ(Math.cos(t) * 0.5);
      trail.forEach(function (d, i) { pos(t - 0.25 - i * 0.13, v); d.position.copy(v); d.scale.setScalar((1 - i / 14) * a + 0.001); });
      plane.scale.setScalar(1.5 * (0.4 + 0.6 * a));
    });
  })(stations[7]);

  /* layout that depends on viewport */
  function layout() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    measure();
    var aspect = w / h;
    camera.fov = mobile ? 58 : 42; camera.updateProjectionMatrix();
    var halfW = Math.tan(camera.fov * Math.PI / 360) * AHEAD * aspect;
    stations.forEach(function (g, i) {
      var sc = mobile ? Math.min(1, halfW / 4.6) : Math.min(1, halfW / 9.2);
      g.scale.setScalar(sc);
      g.position.set(mobile ? 0 : g.userData.side * halfW * 0.5, mobile ? Math.tan(camera.fov * Math.PI / 360) * AHEAD * 0.42 : 0, -i * G - AHEAD);
    });
    readScroll();
  }
  window.addEventListener('resize', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  window.addEventListener('load', layout);

  var mx = 0, my = 0, cmx = 0, cmy = 0;
  window.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; }, { passive: true });

  var last = performance.now(), T = 0, frames = 0;
  function frame(now) {
    var dt = Math.min(0.1, (now - last) / 1000); last = now; if (!reduce) T += dt;
    shown += (idx - shown) * (reduce ? 1 : Math.min(1, dt * 5));
    cmx += (mx - cmx) * Math.min(1, dt * 4); cmy += (my - cmy) * Math.min(1, dt * 4);
    camera.position.set(cmx * 0.9, 0.2 - cmy * 0.5, -shown * G);
    camera.rotation.set(cmy * 0.05, -cmx * 0.09, 0);
    for (var i = 0; i < stations.length; i++) {
      var near = Math.abs(shown - i) < 1.05; stations[i].visible = near;
      if (near) tick[i](T, i === 0 ? 1 : sm(i - 0.8, i - 0.12, shown));
    }
    renderer.render(scene, camera); frames++;
    requestAnimationFrame(frame);
  }
  layout(); requestAnimationFrame(frame);
  window.__site = { state: function () { return { idx: idx, shown: shown, frames: frames, mobile: mobile, z: camera.position.z }; } };
})();
