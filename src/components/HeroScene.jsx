/* eslint-disable react/no-unknown-property -- three.js/R3F elements use props (position, rotation, intensity, …) that eslint-plugin-react flags as unknown DOM attributes. */
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  useGLTF,
  OrbitControls,
  Environment,
  Lightformer,
  AdaptiveDpr,
} from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = '/api/media/model/chromedeck.glb';
const MODEL_YAW = 0; // rotate so the front faces the camera at rest
// Fraction of the SMALLER viewport dimension the model's diameter fills. Using
// the smaller dimension + the bounding sphere keeps the model fully in-frame on
// every viewport/aspect ratio and at every rotation angle. Lower = smaller.
// Portrait / narrow viewports get a bigger fill because the SMALLER dimension
// (width on a phone) is the constraint — 0.72 of a phone's width made the
// model read tiny even though vertical space was going unused. On landscape /
// desktop the smaller dimension is height, and 0.72 already sits well.
const MODEL_FILL_LANDSCAPE = 0.72;
const MODEL_FILL_PORTRAIT = 1.15;
// Breakpoint under which we treat the viewport as mobile / tablet — matches
// the CSS tablet ceiling. Above this we lock zoom off (desktop stays hands-off).
const MOBILE_TABLET_MAX = 1024;

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Model() {
  const { scene } = useGLTF(MODEL_URL, true);
  const { viewport } = useThree();

  // Center at the origin once, and capture the bounding-sphere radius for fitting.
  const { object, radius } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius || 1;
    return { object: clone, radius };
  }, [scene]);

  // Scale responsively to the current viewport (re-runs on resize), fitting the
  // model's diameter into the smaller of the visible width/height. Portrait
  // (phone) viewports use a larger fill fraction so the model doesn't read
  // small against wasted vertical space.
  const limiting = Math.min(viewport.width, viewport.height);
  const isPortrait = viewport.height > viewport.width;
  const fill = isPortrait ? MODEL_FILL_PORTRAIT : MODEL_FILL_LANDSCAPE;
  const scale = (limiting * fill) / (2 * radius);

  return (
    <group rotation={[0, MODEL_YAW, 0]} scale={scale}>
      <primitive object={object} />
    </group>
  );
}

export default function HeroScene() {
  // Track whether we're in a mobile/tablet viewport so pinch/wheel zoom is only
  // enabled where the user asked for it. Re-evaluate on resize so a rotation
  // between portrait tablet and landscape desktop flips the flag correctly.
  const [zoomEnabled, setZoomEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(`(max-width: ${MOBILE_TABLET_MAX}px)`);
    const update = () => setZoomEnabled(mq.matches);
    update();
    mq.addEventListener?.('change', update) ?? mq.addListener?.(update);
    return () => {
      mq.removeEventListener?.('change', update) ?? mq.removeListener?.(update);
    };
  }, []);

  // The camera is raised on Y so the view looks down ~15°, revealing the deck's
  // keyboard rather than a dead-on front view. Auto-rotate keeps this elevation
  // constant, so the keyboard stays visible from every angle as it spins.
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.95, 3.5], fov: 40, near: 0.1, far: 100 }}
    >
      <AdaptiveDpr pixelated />

      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 2]} intensity={2.2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} />

      <Suspense fallback={null}>
        <Model />

        {/* Reflections built procedurally from lightformers — no CDN asset. */}
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={1.6} position={[0, 3, 2]} scale={[6, 3, 1]} color="#ffffff" />
          <Lightformer intensity={0.8} position={[-4, 1, -3]} scale={[4, 4, 1]} color="#9fb4ff" />
          <Lightformer intensity={0.6} position={[4, -1, 3]} scale={[4, 4, 1]} color="#ffd9a8" />
        </Environment>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={zoomEnabled}
        enableDamping
        dampingFactor={0.08}
        autoRotate={!prefersReducedMotion}
        autoRotateSpeed={3.2}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.9}
        minDistance={1.6}
        maxDistance={5.5}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL, true);
