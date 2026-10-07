import * as THREE from 'three';

export type SceneName =
  | 'hero'
  | 'world'
  | 'city'
  | 'ai'
  | 'space'
  | 'timeline'
  | 'message'
  | 'about'
  | 'final';

export interface SceneConfig {
  cameraPos: THREE.Vector3;
  cameraLook: THREE.Vector3;
  fogDensity: number;
  bg: THREE.Color;
}

export interface SceneEntry {
  name: SceneName;
  label: string;
  navIndex: number;
  start: number; // scroll fraction start
  end: number;
}

export const SCENES: SceneEntry[] = [
  { name: 'hero', label: 'HOME', navIndex: 0, start: 0, end: 0.09 },
  { name: 'world', label: 'WORLD 2096', navIndex: 1, start: 0.09, end: 0.27 },
  { name: 'city', label: 'FUTURE CITY', navIndex: 2, start: 0.27, end: 0.36 },
  { name: 'ai', label: 'AI & HUMAN', navIndex: 3, start: 0.36, end: 0.45 },
  { name: 'space', label: 'SPACE', navIndex: 4, start: 0.45, end: 0.63 },
  { name: 'timeline', label: 'TIMELINE', navIndex: 5, start: 0.63, end: 0.72 },
  { name: 'message', label: 'MESSAGE', navIndex: 6, start: 0.72, end: 0.81 },
  { name: 'about', label: 'ABOUT', navIndex: 9, start: 0.81, end: 0.90 },
  { name: 'final', label: 'COMPLETE', navIndex: 9, start: 0.90, end: 1 },
];

const NAV_LABELS = ['HOME', 'WORLD 2096', 'FUTURE CITY', 'AI & HUMAN', 'SPACE', 'TIMELINE', 'MESSAGE', 'KNOWLEDGE', '🎮 FUTURE SURVIVOR', 'ABOUT'];
export const NAV_ITEMS = NAV_LABELS.map((label, i) => ({ label, index: i }));

interface CameraCfg {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fog: number;
  bg: THREE.Color;
}

export class SceneManager {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;
  private visible = true;

  // scroll state
  private scrollProgress = 0;
  private targetScrollProgress = 0;
  private entered = false;
  private enterAnim = 0; // 0 -> 1

  // objects
  private starField!: THREE.Points;
  private dustField!: THREE.Points;
  private earth!: THREE.Mesh;
  private earthGroup!: THREE.Group;
  private city!: THREE.Group;
  private cityBuildings: THREE.Mesh[] = [];
  private cityDrones: THREE.Mesh[] = [];
  private neuralNet!: THREE.Group;
  private neuralLines!: THREE.LineSegments;
  private neuralNodes!: THREE.Points;
  private memoryFragments: THREE.Mesh[] = [];
  private aiOrb!: THREE.Group;
  private aiRings: THREE.Mesh[] = [];
  private aiParticles!: THREE.Points;
  private planet!: THREE.Mesh;
  private orbitalStation!: THREE.Group;
  private spacecraft!: THREE.Group;
  private introFlame!: THREE.Mesh;
  private introParticles!: THREE.Points;
  private introParticlePositions!: Float32Array;
  private warpStreaks!: THREE.LineSegments;
  private warpPositions!: Float32Array;
  private introActive = true;
  private holoGrid!: THREE.LineSegments;

  // interaction
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(-2, -2);
  private hoveredObject: THREE.Object3D | null = null;
  public onHoverChange: ((info: HoverInfo | null) => void) | null = null;
  public onClickObject: ((info: HoverInfo) => void) | null = null;

  // quality
  private quality: 'high' | 'medium' | 'low';

  // current scene
  public currentScene: SceneName = 'hero';

  // reusable temp
  private tmpVec = new THREE.Vector3();
  private tmpVec2 = new THREE.Vector3();

  // pre-computed camera configs
  private cameraConfigs: Record<SceneName, CameraCfg>;
  private raycastCounter = 0;

  constructor(canvas: HTMLCanvasElement) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.quality = this.detectQuality(w);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.quality === 'high',
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality === 'high' ? 1.5 : 1));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x03060d, 1);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x03060d, 0.012);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    this.camera.position.set(0, 0, 60);

    // pre-compute camera configs to avoid allocations per frame
    this.cameraConfigs = {
      hero: { pos: new THREE.Vector3(0, 0, 60), look: new THREE.Vector3(0, 0, 0), fog: 0.008, bg: new THREE.Color(0x03060d) },
      world: { pos: new THREE.Vector3(0, 0, 30), look: new THREE.Vector3(0, 0, -20), fog: 0.012, bg: new THREE.Color(0x040814) },
      city: { pos: new THREE.Vector3(0, 6, 30), look: new THREE.Vector3(0, 0, -20), fog: 0.02, bg: new THREE.Color(0x040a16) },
      ai: { pos: new THREE.Vector3(0, 0, 18), look: new THREE.Vector3(0, 0, -12), fog: 0.03, bg: new THREE.Color(0x060a1c) },
      space: { pos: new THREE.Vector3(0, 0, 35), look: new THREE.Vector3(0, 0, -25), fog: 0.006, bg: new THREE.Color(0x02040a) },
      timeline: { pos: new THREE.Vector3(0, 0, 28), look: new THREE.Vector3(0, 0, 0), fog: 0.04, bg: new THREE.Color(0x020308) },
      message: { pos: new THREE.Vector3(0, 0, 22), look: new THREE.Vector3(0, 0, -15), fog: 0.025, bg: new THREE.Color(0x05081a) },
      about: { pos: new THREE.Vector3(0, 0, 50), look: new THREE.Vector3(0, 0, 0), fog: 0.01, bg: new THREE.Color(0x03060d) },
      final: { pos: new THREE.Vector3(0, 0, 32), look: new THREE.Vector3(0, 0, 0), fog: 0.03, bg: new THREE.Color(0x020308) },
    };

    this.buildLights();
    this.buildStarField();
    this.buildDustField();
    this.buildHoloGrid();
    this.buildEarth();
    this.buildCity();
    this.buildNeuralNet();
    this.buildMemoryFragments();
    this.buildAIOrb();
    this.buildSpaceScene();
    this.buildIntroEffects();

    this.setInitialPositions();

    window.addEventListener('resize', this.onResize);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('click', this.onClick);
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private detectQuality(w: number): 'high' | 'medium' | 'low' {
    if (w < 640) return 'low';
    if (w < 1024) return 'medium';
    return 'high';
  }

  private get particleScale() {
    return this.quality === 'low' ? 0.2 : this.quality === 'medium' ? 0.4 : 0.6;
  }

  private get cityBuildingCount() {
    return this.quality === 'low' ? 30 : this.quality === 'medium' ? 60 : 90;
  }

  private buildLights() {
    const amb = new THREE.AmbientLight(0x223355, 0.6);
    this.scene.add(amb);
    const dir = new THREE.DirectionalLight(0x88bbff, 0.8);
    dir.position.set(10, 20, 15);
    this.scene.add(dir);
    const cyan = new THREE.PointLight(0x4fd6ff, 2.5, 80);
    cyan.position.set(0, 0, 0);
    this.scene.add(cyan);
    const violet = new THREE.PointLight(0x8b6cff, 1.5, 60);
    violet.position.set(-20, 10, -10);
    this.scene.add(violet);
  }

  // ---------- Star Field ----------
  private buildStarField() {
    const count = Math.floor(2500 * this.particleScale);
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 120 + Math.random() * 280;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const tint = Math.random();
      if (tint < 0.6) {
        col[i * 3] = 0.75; col[i * 3 + 1] = 0.9; col[i * 3 + 2] = 1.0;
      } else if (tint < 0.85) {
        col[i * 3] = 0.5; col[i * 3 + 1] = 0.7; col[i * 3 + 2] = 1.0;
      } else {
        col[i * 3] = 0.55; col[i * 3 + 1] = 0.42; col[i * 3 + 2] = 1.0;
      }
      sz[i] = Math.random() * 1.6 + 0.3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float aSize;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float twinkle = 0.7 + 0.3 * sin(uTime * 1.5 + position.x * 0.1);
          gl_PointSize = aSize * twinkle * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.starField = new THREE.Points(geo, mat);
    this.scene.add(this.starField);
  }

  // ---------- Dust / floating particles ----------
  private buildDustField() {
    const count = Math.floor(400 * this.particleScale);
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.4,
      color: 0x6fb8ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.dustField = new THREE.Points(geo, mat);
    this.scene.add(this.dustField);
  }

  // ---------- Holographic grid ----------
  private buildHoloGrid() {
    const size = 200;
    const div = 30;
    const geo = new THREE.PlaneGeometry(size, size, div, div);
    const mat = new THREE.LineBasicMaterial({
      color: 0x2b7fff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const wire = new THREE.WireframeGeometry(geo);
    this.holoGrid = new THREE.LineSegments(wire, mat);
    this.holoGrid.rotation.x = -Math.PI / 2;
    this.holoGrid.position.y = -18;
    this.holoGrid.visible = false;
    this.scene.add(this.holoGrid);
    geo.dispose();
  }

  // ---------- Earth ----------
  private buildEarth() {
    this.earthGroup = new THREE.Group();
    const radius = this.quality === 'low' ? 4 : 6;
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uGlow: { value: 1 },
      },
      vertexShader: `
        varying vec3 vNorm;
        varying vec3 vPos;
        void main() {
          vNorm = normalize(normalMatrix * normal);
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNorm;
        varying vec3 vPos;
        uniform float uTime;
        uniform float uGlow;
        float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float noise(vec3 p) {
          vec3 i = floor(p); vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                         mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                         mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
        void main() {
          vec3 p = normalize(vPos);
          float n = noise(p * 3.0 + uTime * 0.05);
          float n2 = noise(p * 8.0);
          float land = smoothstep(0.45, 0.55, n);
          vec3 ocean = vec3(0.04, 0.12, 0.28);
          vec3 continent = vec3(0.08, 0.28, 0.22);
          vec3 col = mix(ocean, continent, land);
          col += vec3(0.1, 0.3, 0.5) * n2 * 0.3;
          float rim = 1.0 - max(dot(vNorm, vec3(0.0, 0.0, 1.0)), 0.0);
          col += vec3(0.3, 0.7, 1.0) * pow(rim, 2.5) * uGlow;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    this.earth = new THREE.Mesh(geo, mat);
    this.earth.name = 'earth';
    this.earth.userData.interactable = true;
    this.earth.userData.label = 'โลก · ปี 2026';
    this.earthGroup.add(this.earth);

    // atmosphere
    const atmoGeo = new THREE.SphereGeometry(radius * 1.12, 24, 24);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vNorm;
        void main() {
          vNorm = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNorm;
        void main() {
          float rim = 1.0 - max(dot(vNorm, vec3(0.0, 0.0, 1.0)), 0.0);
          float a = pow(rim, 3.0) * 0.7;
          gl_FragColor = vec4(0.3, 0.7, 1.0, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    this.earthGroup.add(atmo);

    this.earthGroup.visible = true;
    this.earthGroup.position.set(0, 0, -20);
    this.scene.add(this.earthGroup);
  }

  // ---------- Future City ----------
  private buildCity() {
    this.city = new THREE.Group();
    const count = this.cityBuildingCount;
    const matBase = new THREE.MeshStandardMaterial({
      color: 0x0a1424,
      metalness: 0.6,
      roughness: 0.4,
      emissive: 0x0a1a30,
      emissiveIntensity: 0.4,
    });

    for (let i = 0; i < count; i++) {
      const w = 1.2 + Math.random() * 2.2;
      const d = 1.2 + Math.random() * 2.2;
      const h = 6 + Math.random() * 30;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = matBase.clone();
      const lit = Math.random() < 0.7;
      mat.emissive = new THREE.Color(lit ? 0x1a3a66 : 0x050a14);
      mat.emissiveIntensity = lit ? 0.6 + Math.random() * 0.6 : 0.15;
      const mesh = new THREE.Mesh(geo, mat);
      const ang = Math.random() * Math.PI * 2;
      const rad = 4 + Math.random() * 30;
      mesh.position.set(Math.cos(ang) * rad, h / 2 - 18, Math.sin(ang) * rad - 20);
      mesh.userData.interactable = true;
      mesh.userData.label = this.cityLabel(i);
      this.city.add(mesh);
      this.cityBuildings.push(mesh);
    }

    // drones
    const droneCount = this.quality === 'low' ? 3 : 5;
    for (let i = 0; i < droneCount; i++) {
      const geo = new THREE.OctahedronGeometry(0.35, 0);
      const mat = new THREE.MeshBasicMaterial({ color: 0x4fd6ff, transparent: true, opacity: 0.85 });
      const drone = new THREE.Mesh(geo, mat);
      drone.position.set((Math.random() - 0.5) * 50, 10 + Math.random() * 20, -25 + (Math.random() - 0.5) * 30);
      drone.userData.droneSpeed = 0.5 + Math.random() * 1;
      drone.userData.dronePhase = Math.random() * Math.PI * 2;
      this.city.add(drone);
      this.cityDrones.push(drone);
    }

    this.city.visible = false;
    this.scene.add(this.city);
  }

  private cityLabel(i: number): string {
    const labels = ['อาคารอัจฉริยะ', 'เสาสัญญาณโฮโลแกรม', 'ท่ายานบิน', 'ศูนย์ควบคุมจราจร'];
    return labels[i % labels.length];
  }

  // ---------- Neural Network ----------
  private buildNeuralNet() {
    this.neuralNet = new THREE.Group();
    const nodeCount = this.quality === 'low' ? 40 : this.quality === 'medium' ? 80 : 120;
    const positions: THREE.Vector3[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const r = 8 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta) * 1.4,
        r * Math.sin(phi) * Math.sin(theta) * 0.9,
        r * Math.cos(phi),
      ));
    }

    const posArr = new Float32Array(nodeCount * 3);
    positions.forEach((p, i) => {
      posArr[i * 3] = p.x;
      posArr[i * 3 + 1] = p.y;
      posArr[i * 3 + 2] = p.z;
    });
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const nodeMat = new THREE.PointsMaterial({
      size: 0.5,
      color: 0x4fd6ff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.neuralNodes = new THREE.Points(nodeGeo, nodeMat);
    this.neuralNet.add(this.neuralNodes);

    const linePos: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (positions[i].distanceTo(positions[j]) < 5.5) {
          linePos.push(positions[i].x, positions[i].y, positions[i].z);
          linePos.push(positions[j].x, positions[j].y, positions[j].z);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePos), 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x2b7fff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.neuralLines = new THREE.LineSegments(lineGeo, lineMat);
    this.neuralNet.add(this.neuralLines);

    this.neuralNet.visible = false;
    this.neuralNet.position.set(0, 0, -15);
    this.scene.add(this.neuralNet);
  }

  // ---------- Memory fragments ----------
  private buildMemoryFragments() {
    const count = this.quality === 'low' ? 6 : 10;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.PlaneGeometry(2.2, 2.2);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.55 + Math.random() * 0.08, 0.7, 0.6),
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const frag = new THREE.Mesh(geo, mat);
      frag.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 18,
        -15 + (Math.random() - 0.5) * 20,
      );
      frag.userData.floatPhase = Math.random() * Math.PI * 2;
      frag.userData.floatSpeed = 0.3 + Math.random() * 0.4;
      frag.userData.interactable = true;
      frag.userData.label = 'ชิ้นส่วนความทรงจำ';
      this.memoryFragments.push(frag);
      this.scene.add(frag);
    }
  }

  // ---------- AI Orb ----------
  private buildAIOrb() {
    this.aiOrb = new THREE.Group();
    const coreGeo = new THREE.IcosahedronGeometry(2.2, 2);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec3 vNorm;
        void main() {
          vNorm = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNorm;
        uniform float uTime;
        void main() {
          float rim = 1.0 - max(dot(vNorm, vec3(0.0, 0.0, 1.0)), 0.0);
          vec3 col = mix(vec3(0.1, 0.4, 0.8), vec3(0.5, 0.85, 1.0), rim);
          col += vec3(0.6, 0.4, 1.0) * sin(uTime + rim * 4.0) * 0.15;
          gl_FragColor = vec4(col, 0.9);
        }
      `,
      transparent: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    this.aiOrb.add(core);

    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const rg = new THREE.TorusGeometry(3 + i * 1.3, 0.05, 8, 60);
      const rm = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x4fd6ff : i === 1 ? 0x8b6cff : 0x2b7fff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(rg, rm);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      ring.userData.ringSpeed = (Math.random() - 0.5) * 0.6;
      this.aiRings.push(ring);
      this.aiOrb.add(ring);
    }

    const pCount = this.quality === 'low' ? 120 : 250;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 4 + Math.random() * 3;
      const t = Math.random() * Math.PI * 2;
      pPos[i * 3] = Math.cos(t) * r;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pPos[i * 3 + 2] = Math.sin(t) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0xbfe9ff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.aiParticles = new THREE.Points(pGeo, pMat);
    this.aiOrb.add(this.aiParticles);

    this.aiOrb.userData.interactable = true;
    this.aiOrb.userData.label = 'AI · ปัญญาประดิษฐ์รอบตัว';
    this.aiOrb.visible = false;
    this.aiOrb.position.set(0, 0, -12);
    this.scene.add(this.aiOrb);
  }

  // ---------- Space colony ----------
  private buildSpaceScene() {
    this.planet = new THREE.Mesh(
      new THREE.SphereGeometry(5, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x6a3a2a,
        roughness: 0.9,
        metalness: 0.1,
        emissive: 0x2a1408,
        emissiveIntensity: 0.3,
      })
    );
    this.planet.position.set(8, -2, -28);
    this.planet.userData.interactable = true;
    this.planet.userData.label = 'ดาวอังคาร · ถิ่นฐานใหม่';
    this.planet.visible = false;
    this.scene.add(this.planet);

    this.orbitalStation = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(3, 0.4, 10, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc, metalness: 0.8, roughness: 0.3, emissive: 0x223344, emissiveIntensity: 0.4,
    });
    const stationRing = new THREE.Mesh(ringGeo, ringMat);
    this.orbitalStation.add(stationRing);
    const hubGeo = new THREE.CylinderGeometry(0.6, 0.6, 4, 10);
    const hub = new THREE.Mesh(hubGeo, ringMat);
    hub.rotation.z = Math.PI / 2;
    this.orbitalStation.add(hub);
    this.orbitalStation.position.set(-8, 4, -22);
    this.orbitalStation.userData.interactable = true;
    this.orbitalStation.userData.label = 'สถานีอวกาศในวงโคจร';
    this.orbitalStation.visible = false;
    this.scene.add(this.orbitalStation);

    this.spacecraft = new THREE.Group();
    const bodyGeo = new THREE.ConeGeometry(0.5, 2.4, 10);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xe0e8f0, metalness: 0.7, roughness: 0.3, emissive: 0x4fd6ff, emissiveIntensity: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    this.spacecraft.add(body);
    const glowGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x4fd6ff, transparent: true, opacity: 0.8 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 0, -1.3);
    this.spacecraft.add(glow);
    this.spacecraft.position.set(4, 6, -18);
    this.spacecraft.userData.interactable = true;
    this.spacecraft.userData.label = 'ยานสำรวจระหว่างดาว';
    this.spacecraft.visible = false;
    this.scene.add(this.spacecraft);
  }

  private buildIntroEffects() {
    const flameGeometry = new THREE.ConeGeometry(0.48, 2.8, 10);
    const flameMaterial = new THREE.MeshBasicMaterial({
      color: 0xff9c48,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.introFlame = new THREE.Mesh(flameGeometry, flameMaterial);
    this.introFlame.rotation.x = -Math.PI / 2;
    this.introFlame.position.z = -2;
    this.spacecraft.add(this.introFlame);

    const particleCount = this.quality === 'low' ? 36 : 90;
    this.introParticlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      this.introParticlePositions[i * 3] = (Math.random() - 0.5) * 0.75;
      this.introParticlePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.75;
      this.introParticlePositions[i * 3 + 2] = -2.5 - Math.random() * 7;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.introParticlePositions, 3));
    this.introParticles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xffbd73,
        size: 0.16,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.spacecraft.add(this.introParticles);

    const streakCount = this.quality === 'low' ? 70 : 150;
    this.warpPositions = new Float32Array(streakCount * 6);
    for (let i = 0; i < streakCount; i++) {
      const x = (Math.random() - 0.5) * 180;
      const y = (Math.random() - 0.5) * 110;
      const z = -220 + Math.random() * 300;
      const offset = i * 6;
      this.warpPositions[offset] = x;
      this.warpPositions[offset + 1] = y;
      this.warpPositions[offset + 2] = z;
      this.warpPositions[offset + 3] = x;
      this.warpPositions[offset + 4] = y;
      this.warpPositions[offset + 5] = z - 1.5;
    }
    const streakGeometry = new THREE.BufferGeometry();
    streakGeometry.setAttribute('position', new THREE.BufferAttribute(this.warpPositions, 3));
    this.warpStreaks = new THREE.LineSegments(
      streakGeometry,
      new THREE.LineBasicMaterial({ color: 0x9bdfff, transparent: true, opacity: 0.75, depthWrite: false })
    );
    this.warpStreaks.visible = false;
    this.scene.add(this.warpStreaks);
  }

  private setInitialPositions() {
    this.earthGroup.position.set(0, 0, -40);
  }

  // ---------- Public API ----------
  public setScrollProgress(p: number) {
    this.targetScrollProgress = Math.max(0, Math.min(1, p));
  }

  public enter() {
    if (this.entered) return;
    this.entered = true;
  }

  public finishIntro() {
    if (!this.introActive) return;
    this.introActive = false;
    this.warpStreaks.visible = false;
    this.enter();
  }

  public getEnterAnim() {
    return this.enterAnim;
  }

  public start() {
    this.clock.start();
    this.animate();
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('click', this.onClick);
    this.renderer.domElement.removeEventListener('touchstart', this.onTouchStart);
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry?.dispose();
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material?.dispose();
      }
    });
    this.renderer.dispose();
  }

  // ---------- Events ----------
  private onVisibilityChange = () => {
    this.visible = !document.hidden;
    if (this.visible && !this.disposed) {
      this.clock.start();
      if (!this.raf) this.animate();
    }
  };

  private onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
  };

  private onClick = () => {
    if (this.hoveredObject) {
      const info = this.getHoverInfo(this.hoveredObject);
      if (info && this.onClickObject) this.onClickObject(info);
    }
  };

  private getHoverInfo(obj: THREE.Object3D): HoverInfo | null {
    let o: THREE.Object3D | null = obj;
    while (o) {
      if (o.userData && o.userData.interactable) {
        return {
          label: o.userData.label || 'วัตถุในอนาคต',
          x: (this.pointer.x + 1) / 2 * window.innerWidth,
          y: (1 - this.pointer.y) / 2 * window.innerHeight,
        };
      }
      o = o.parent;
    }
    return null;
  }

  private sceneAt(p: number): { scene: SceneName; localT: number } {
    for (const s of SCENES) {
      if (p >= s.start && p <= s.end) {
        return { scene: s.name, localT: (p - s.start) / (s.end - s.start) };
      }
    }
    if (p < SCENES[0].start) return { scene: SCENES[0].name, localT: 0 };
    return { scene: SCENES[SCENES.length - 1].name, localT: 1 };
  }

  // ---------- Animate ----------
  private animate = () => {
    if (this.disposed || !this.visible) {
      this.raf = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.animate);
    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;

    if (this.introActive) {
      this.animateIntro(t, dt);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // smooth scroll
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;
    if (this.entered && this.enterAnim < 1) {
      this.enterAnim = Math.min(1, this.enterAnim + dt * 0.6);
    }

    const p = this.scrollProgress;
    const { scene, localT } = this.sceneAt(p);
    this.currentScene = scene;

    // camera config with blend (pre-computed, no allocations)
    const cfg = this.cameraConfigs[scene];
    const nextIdx = SCENES.findIndex((s) => s.name === scene);
    const following = SCENES[Math.min(SCENES.length - 1, nextIdx + 1)];
    const cfgNext = this.cameraConfigs[following.name];
    const blendT = localT;
    this.tmpVec.lerpVectors(cfg.pos, cfgNext.pos, blendT * 0.4);
    if (this.enterAnim < 1) {
      this.tmpVec.z += (1 - this.enterAnim) * 40;
    }
    this.camera.position.lerp(this.tmpVec, 0.06);
    this.tmpVec2.lerpVectors(cfg.look, cfgNext.look, blendT * 0.4);
    this.camera.lookAt(this.tmpVec2);

    // fog
    const fog = this.scene.fog as THREE.FogExp2;
    fog.density += (cfg.fog - fog.density) * 0.05;
    this.renderer.setClearColor(cfg.bg, 1);

    // update objects
    const sm = (this.starField.material as THREE.ShaderMaterial);
    sm.uniforms.uTime.value = t;
    this.starField.rotation.y = t * 0.01;
    this.starField.rotation.x = t * 0.005;

    this.dustField.rotation.y = t * 0.02;

    // earth
    const earthMat = this.earth.material as THREE.ShaderMaterial;
    earthMat.uniforms.uTime.value = t;
    const earthVisible = this.isVisible('hero', p) || this.isVisible('world', p) || this.isVisible('space', p) || this.isVisible('timeline', p) || this.isVisible('final', p);
    this.earthGroup.visible = earthVisible;
    if (earthVisible) {
      this.earth.rotation.y = t * 0.08;
      if (this.isVisible('hero', p)) {
        const heroT = this.localTAt('hero', p);
        this.earthGroup.position.set(0, 0, -40 + heroT * 20);
        this.earthGroup.scale.setScalar(1);
        earthMat.uniforms.uGlow.value = 0.6 + heroT * 0.4;
      } else if (this.isVisible('world', p)) {
        const worldT = this.localTAt('world', p);
        this.earthGroup.position.set(0, 0, -28 + worldT * 8);
        this.earthGroup.scale.setScalar(1);
        earthMat.uniforms.uGlow.value = 0.8 + worldT * 0.2;
      } else if (this.isVisible('timeline', p) || this.isVisible('final', p)) {
        const tT = this.localTAt('timeline', p);
        const fT = this.localTAt('final', p);
        const scale = this.isVisible('final', p) ? 0.4 + (1 - fT) * 0.6 : 1 - tT * 0.3;
        this.earthGroup.scale.setScalar(Math.max(0.15, scale));
        this.earthGroup.position.set(0, 0, -15);
        earthMat.uniforms.uGlow.value = this.isVisible('final', p) ? 0.3 + (1 - fT) * 0.4 : 0.8;
      } else {
        this.earthGroup.scale.setScalar(0.5);
        this.earthGroup.position.set(-15, 5, -45);
        earthMat.uniforms.uGlow.value = 0.5;
      }
    }

    // holo grid
    this.holoGrid.visible = this.isVisible('city', p);
    if (this.holoGrid.visible) {
      (this.holoGrid.material as THREE.LineBasicMaterial).opacity = 0.15 + Math.sin(t) * 0.05;
      this.holoGrid.position.z = -20;
    }

    // city
    this.city.visible = this.isVisible('city', p);
    if (this.city.visible) {
      this.city.rotation.y = t * 0.02;
      this.cityDrones.forEach((d) => {
        d.position.x += Math.sin(t * d.userData.droneSpeed + d.userData.dronePhase) * 0.04;
        d.position.y += Math.cos(t * d.userData.droneSpeed * 0.7 + d.userData.dronePhase) * 0.03;
        d.rotation.y = t * 0.5;
      });
    }

    // neural net
    this.neuralNet.visible = this.isVisible('message', p);
    if (this.neuralNet.visible) {
      this.neuralNet.rotation.y = t * 0.05;
      this.neuralNet.rotation.x = Math.sin(t * 0.2) * 0.1;
      (this.neuralLines.material as THREE.LineBasicMaterial).opacity = 0.18 + Math.sin(t) * 0.08;
    }

    // memory fragments
    const memVis = this.isVisible('message', p);
    this.memoryFragments.forEach((f) => {
      f.visible = memVis;
      if (memVis) {
        f.position.y += Math.sin(t * f.userData.floatSpeed + f.userData.floatPhase) * 0.005;
        f.rotation.y = t * 0.2;
        f.rotation.z = Math.sin(t * 0.3 + f.userData.floatPhase) * 0.15;
      }
    });

    // AI orb
    this.aiOrb.visible = this.isVisible('ai', p);
    if (this.aiOrb.visible) {
      this.aiOrb.rotation.y = t * 0.1;
      const coreMesh = this.aiOrb.children[0] as THREE.Mesh;
      const coreMat = coreMesh.material as THREE.ShaderMaterial;
      if (coreMat && coreMat.uniforms && coreMat.uniforms.uTime) {
        coreMat.uniforms.uTime.value = t;
      }
      this.aiRings.forEach((r) => {
        r.rotation.x += r.userData.ringSpeed * dt;
        r.rotation.y += r.userData.ringSpeed * 0.5 * dt;
      });
      this.aiParticles.rotation.y = t * 0.3;
    }

    // space
    const spaceVis = this.isVisible('space', p);
    this.planet.visible = spaceVis;
    this.orbitalStation.visible = spaceVis;
    this.spacecraft.visible = spaceVis;
    if (spaceVis) {
      this.planet.rotation.y = t * 0.04;
      this.orbitalStation.rotation.z = t * 0.15;
      this.spacecraft.position.x = 4 + Math.sin(t * 0.3) * 3;
      this.spacecraft.position.y = 6 + Math.cos(t * 0.2) * 2;
      this.spacecraft.rotation.z = t * 0.1;
    }

    // raycast hover — throttle to every 2nd frame
    this.raycastCounter++;
    if (this.raycastCounter % 2 === 0) {
      this.updateHover();
    }

    this.renderer.render(this.scene, this.camera);
  };

  private animateIntro(t: number, dt: number) {
    const launchT = Math.max(0, Math.min(1, (t - 1.35) / 3.2));
    const easedLaunch = launchT * launchT * (3 - 2 * launchT);

    this.earthGroup.visible = true;
    this.earthGroup.position.set(0, 0, -24);
    this.earthGroup.scale.setScalar(1.65);
    this.earth.rotation.y = t * 0.035;
    (this.earth.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    this.city.visible = false;
    this.neuralNet.visible = false;
    this.aiOrb.visible = false;
    this.planet.visible = false;
    this.orbitalStation.visible = false;
    this.holoGrid.visible = false;
    this.memoryFragments.forEach((fragment) => { fragment.visible = false; });

    this.spacecraft.visible = true;
    this.spacecraft.position.set(-10 + easedLaunch * 6, 1.5 + Math.sin(t * 2) * 0.3, -13 + easedLaunch * 88);
    this.spacecraft.rotation.set(0.03, 0, 0.08 - easedLaunch * 0.08);
    const ignition = Math.max(0, Math.min(1, (t - 0.9) * 1.8));
    this.introFlame.scale.setScalar(0.2 + ignition * (0.8 + Math.sin(t * 24) * 0.14));
    this.introFlame.visible = ignition > 0;
    (this.introParticles.material as THREE.PointsMaterial).opacity = ignition * 0.85;
    const particlePositions = this.introParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particlePositions.length; i += 3) {
      particlePositions[i + 2] -= dt * (3 + ignition * 9);
      if (particlePositions[i + 2] < -10) particlePositions[i + 2] = -2.5;
    }
    this.introParticles.geometry.attributes.position.needsUpdate = true;

    const cameraTrack = Math.min(1, launchT * 1.35);
    this.tmpVec.set(-3 * cameraTrack, 3 - cameraTrack * 2, 26 + cameraTrack * 9);
    this.camera.position.lerp(this.tmpVec, 0.035);
    if (t < 4.15) {
      this.tmpVec2.set(this.spacecraft.position.x * 0.5, 0, -18 + launchT * 28);
    } else {
      this.tmpVec2.set(this.camera.position.x, 0, this.camera.position.z + 90);
    }
    this.camera.lookAt(this.tmpVec2);

    this.warpStreaks.visible = t > 3.35;
    if (this.warpStreaks.visible) {
      const speed = 45 + Math.min(1, (t - 3.35) / 1) * 250;
      for (let i = 0; i < this.warpPositions.length; i += 6) {
        this.warpPositions[i + 2] += dt * speed;
        this.warpPositions[i + 5] = this.warpPositions[i + 2] - (1.5 + speed * 0.018);
        if (this.warpPositions[i + 2] > 100) {
          this.warpPositions[i + 2] = -220;
          this.warpPositions[i + 5] = -225;
        }
      }
      this.warpStreaks.geometry.attributes.position.needsUpdate = true;
    }
  }

  private isVisible(name: SceneName, p: number): boolean {
    const s = SCENES.find((x) => x.name === name)!;
    const margin = 0.02;
    return p >= s.start - margin && p <= s.end + margin;
  }

  private localTAt(name: SceneName, p: number): number {
    const s = SCENES.find((x) => x.name === name)!;
    return Math.max(0, Math.min(1, (p - s.start) / (s.end - s.start)));
  }

  private updateHover() {
    // skip raycast if pointer is off-screen
    if (this.pointer.x < -1.5) {
      if (this.hoveredObject) {
        this.hoveredObject = null;
        if (this.onHoverChange) this.onHoverChange(null);
        this.renderer.domElement.style.cursor = '';
      }
      return;
    }

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const candidates: THREE.Object3D[] = [];
    if (this.earthGroup.visible) candidates.push(this.earth);
    if (this.city.visible) candidates.push(...this.cityBuildings);
    if (this.neuralNet.visible) candidates.push(this.neuralNodes);
    if (this.memoryFragments.some((f) => f.visible)) candidates.push(...this.memoryFragments);
    if (this.aiOrb.visible) candidates.push(this.aiOrb);
    if (this.planet.visible) candidates.push(this.planet, this.orbitalStation, this.spacecraft);

    let found: THREE.Object3D | null = null;
    if (candidates.length > 0) {
      const intersects = this.raycaster.intersectObjects(candidates, false);
      if (intersects.length > 0) {
        found = intersects[0].object;
      }
    }

    if (found !== this.hoveredObject) {
      this.hoveredObject = found;
      const info = found ? this.getHoverInfo(found) : null;
      if (this.onHoverChange) this.onHoverChange(info);
      this.renderer.domElement.style.cursor = found ? 'crosshair' : '';
    } else if (found) {
      const info = this.getHoverInfo(found);
      if (info && this.onHoverChange) this.onHoverChange(info);
    }
  }

  // external drag rotate for planet in space scene
  public dragRotate(dx: number, dy: number) {
    if (this.isVisible('space', this.scrollProgress)) {
      this.planet.rotation.y += dx * 0.005;
      this.planet.rotation.x += dy * 0.005;
    } else if (this.isVisible('hero', this.scrollProgress) || this.isVisible('world', this.scrollProgress)) {
      this.earth.rotation.y += dx * 0.005;
    }
  }
}

export interface HoverInfo {
  label: string;
  x: number;
  y: number;
}
