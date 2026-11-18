"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/*
 * GPU sakura field. Every petal is one instance of a single notched-petal
 * mesh; position, fall, sway, spin, wind and cursor repulsion are all computed
 * in the vertex shader from per-instance seeds, so the CPU only updates a
 * handful of uniforms per frame.
 */

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uWind;
  uniform vec2  uMouse;      // NDC
  uniform float uMouseForce; // 0..1, eased on the CPU
  uniform vec3  uBounds;     // wrap volume
  uniform float uTanHalfFov;
  uniform float uAspect;
  uniform float uCamZ;

  attribute vec4 aSeed;   // xyz start position, w random 0..1
  attribute vec4 aParams; // fall speed, spin speed, sway amplitude, scale

  varying vec2  vLocal;
  varying float vShade;
  varying float vFade;

  mat3 rotation(vec3 axis, float a) {
    float s = sin(a), c = cos(a), oc = 1.0 - c;
    return mat3(
      oc*axis.x*axis.x + c,        oc*axis.x*axis.y + axis.z*s, oc*axis.z*axis.x - axis.y*s,
      oc*axis.x*axis.y - axis.z*s, oc*axis.y*axis.y + c,        oc*axis.y*axis.z + axis.x*s,
      oc*axis.z*axis.x + axis.y*s, oc*axis.y*axis.z - axis.x*s, oc*axis.z*axis.z + c
    );
  }

  void main() {
    float r = aSeed.w;
    float fall = aParams.x;
    vec3 p;
    p.z = aSeed.z + cos(uTime * 0.37 + r * 12.0) * 0.25;
    p.y = mod(aSeed.y - uTime * fall + uBounds.y * 0.5, uBounds.y) - uBounds.y * 0.5;
    float sway = sin(uTime * (0.45 + r * 0.4) + r * 6.2831) * aParams.z;
    p.x = mod(aSeed.x + uWind * (0.55 + fall) + sway + uBounds.x * 0.5, uBounds.x) - uBounds.x * 0.5;

    // Cursor: project the pointer onto this petal's depth plane and push away.
    float halfH = uTanHalfFov * (uCamZ - p.z);
    vec2 mouse = uMouse * vec2(halfH * uAspect, halfH);
    vec2 d = p.xy - mouse;
    float dist = length(d);
    float radius = 0.22 * halfH;
    float push = smoothstep(radius, 0.0, dist) * uMouseForce;
    p.xy += normalize(d + 1e-4) * push * radius * 0.85;

    // Tumble around a per-petal axis, spin faster when disturbed.
    vec3 axis = normalize(vec3(sin(r * 31.0), cos(r * 17.0), 0.6));
    float angle = uTime * aParams.y + r * 6.2831 + push * 2.5;
    mat3 R = rotation(axis, angle);

    vec3 v = position * aParams.w;
    v.z += sin(v.y * 7.0 + uTime * 2.0 + r * 10.0) * 0.012; // soft flutter
    v = R * v;

    vLocal = position.xy;
    vShade = abs((R * vec3(0.0, 0.0, 1.0)).z);
    // Fade petals near the far plane and very close to the camera.
    vFade = smoothstep(-5.5, -2.5, p.z) * (1.0 - smoothstep(2.6, 3.6, p.z)) * 0.65 + 0.35 * smoothstep(-6.0, -4.0, p.z);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p + v, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  varying vec2  vLocal;
  varying float vShade;
  varying float vFade;

  void main() {
    // Pale at the base, deeper pink toward the notched tip.
    float t = clamp(vLocal.y + 0.5, 0.0, 1.0);
    vec3 base = vec3(1.0, 0.92, 0.94);
    vec3 tip  = vec3(0.95, 0.62, 0.74);
    vec3 col = mix(base, tip, smoothstep(0.1, 1.0, t));
    col *= 1.0 - 0.12 * smoothstep(0.05, 0.0, abs(vLocal.x)) * t; // faint vein
    col *= 0.55 + 0.45 * vShade;
    gl_FragColor = vec4(col, 0.9 * vFade);
  }
`;

function petalGeometry(count: number) {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(0.42, -0.32, 0.46, 0.28, 0.14, 0.5);
  s.lineTo(0, 0.38);
  s.lineTo(-0.14, 0.5);
  s.bezierCurveTo(-0.46, 0.28, -0.42, -0.32, 0, -0.5);
  const base = new THREE.ShapeGeometry(s, 5);

  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute("position", base.getAttribute("position"));
  geo.instanceCount = count;

  // Deterministic seeds: same field on every load.
  let a = 1337;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const seed = new Float32Array(count * 4);
  const params = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    seed[i * 4 + 0] = (rand() - 0.5) * 30;
    seed[i * 4 + 1] = (rand() - 0.5) * 30;
    seed[i * 4 + 2] = -6 + rand() * 8.5;
    seed[i * 4 + 3] = rand();
    params[i * 4 + 0] = 0.18 + rand() * 0.35; // fall
    params[i * 4 + 1] = 0.4 + rand() * 1.4; // spin
    params[i * 4 + 2] = 0.2 + rand() * 0.6; // sway
    params[i * 4 + 3] = 0.09 + rand() * 0.09; // scale
  }
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 4));
  geo.setAttribute("aParams", new THREE.InstancedBufferAttribute(params, 4));
  base.dispose();
  return geo;
}

type Uniforms = Record<string, THREE.IUniform>;
type FrameState = { time: number; wind: number; gust: number; ready: boolean };
type Pointer = { x: number; y: number; vx: number; inside: boolean; lastX: number };

/** Per-frame uniform update: time, breathing wind + cursor gusts, eased pointer. */
function step(u: Uniforms, s: FrameState, p: Pointer, delta: number) {
  const dt = Math.min(delta, 1 / 20); // no jumps after a pause
  s.time += dt;
  s.gust += (THREE.MathUtils.clamp(p.vx, -2, 2) - s.gust) * Math.min(1, dt * 1.5);
  p.vx *= 0.9;
  s.wind += (0.22 + Math.sin(s.time * 0.21) * 0.12 + s.gust * 1.2) * dt;

  u.uTime.value = s.time;
  u.uWind.value = s.wind;
  const m = u.uMouse.value as THREE.Vector2;
  m.x += (p.x - m.x) * Math.min(1, dt * 8);
  m.y += (p.y - m.y) * Math.min(1, dt * 8);
  u.uMouseForce.value += ((p.inside ? 1 : 0) - u.uMouseForce.value) * Math.min(1, dt * 3);
}

function Petals({ count, onReady }: { count: number; onReady: () => void }) {
  const { camera, size } = useThree();
  const geometry = useMemo(() => petalGeometry(count), [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uWind: { value: 0 },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uMouseForce: { value: 0 },
          uBounds: { value: new THREE.Vector3(20, 14, 10) },
          uTanHalfFov: { value: 0.47 },
          uAspect: { value: 1 },
          uCamZ: { value: 6 },
        },
      }),
    [],
  );

  const mesh = useRef<THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>>(null);
  const pointer = useRef<Pointer>({ x: 9, y: 9, vx: 0, inside: false, lastX: 0 });
  const state = useRef<FrameState>({ time: 0, wind: 0, gust: 0, ready: false });

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  // Wrap volume tracks the visible frustum at the farthest petal depth.
  useEffect(() => {
    const u = mesh.current?.material.uniforms;
    if (!u) return;
    const cam = camera as THREE.PerspectiveCamera;
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const aspect = size.width / Math.max(1, size.height);
    const halfH = tan * (cam.position.z + 6);
    u.uTanHalfFov.value = tan;
    u.uAspect.value = aspect;
    u.uCamZ.value = cam.position.z;
    u.uBounds.value.set(halfH * aspect * 2 + 2, halfH * 2 + 2, 10);
  }, [camera, size]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = document.getElementById("hero-canvas");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = pointer.current;
      p.inside = e.clientY >= r.top && e.clientY <= r.bottom;
      p.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      p.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      p.vx += (e.clientX - p.lastX) * 0.002;
      p.lastX = e.clientX;
    };
    const onLeave = () => {
      pointer.current.inside = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useFrame((_, delta) => {
    const u = mesh.current?.material.uniforms;
    if (!u) return;
    step(u, state.current, pointer.current, delta);
    if (!state.current.ready) {
      state.current.ready = true;
      onReady();
    }
  });

  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} />;
}

export default function PetalField({ count, active, onReady }: { count: number; active: boolean; onReady: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 30 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: false }}
      frameloop={active ? "always" : "never"}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Petals count={count} onReady={onReady} />
    </Canvas>
  );
}
