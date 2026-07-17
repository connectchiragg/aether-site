"use client";

import { useEffect, useRef, useState } from "react";

type EyeState = "checking" | "loading" | "live" | "fallback";

export function EyeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<EyeState>("checking");

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    let disposed = false;
    let animationFrame = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let active = true;
    let visible = true;
    const pointer = { x: 0, y: 0 };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;

    const init = async () => {
      try {
        const probe = document.createElement("canvas");
        if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
          setState("fallback");
          return;
        }

        const [{ getGPUTier }, THREE, loaderModule, meshoptModule] = await Promise.all([
          import("detect-gpu"),
          import("three"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/libs/meshopt_decoder.module.js"),
        ]);
        const gpu = await getGPUTier();
        if (disposed) return;
        if (reducedMotion || compact || gpu.tier < 2) {
          setState("fallback");
          return;
        }

        setState("loading");
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
        camera.position.set(0, 0.05, 5.45);

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        scene.add(new THREE.HemisphereLight(0xe9e2d4, 0x0a0807, 1.6));
        const rustLight = new THREE.DirectionalLight(0xae2620, 7);
        rustLight.position.set(-4, 3, 4);
        scene.add(rustLight);
        const amberLight = new THREE.DirectionalLight(0xde3c2f, 4.5);
        amberLight.position.set(4, -1, 3);
        scene.add(amberLight);

        const loader = new loaderModule.GLTFLoader();
        loader.setMeshoptDecoder(meshoptModule.MeshoptDecoder);
        const gltf = await loader.loadAsync("/models/all-seeing-eye.glb");

        const disposeObject = (root: import("three").Object3D) => {
          root.traverse((object) => {
            const mesh = object as import("three").Mesh;
            mesh.geometry?.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
            materials.forEach((material) => {
              Object.values(material).forEach((value) => {
                if (value instanceof THREE.Texture) value.dispose();
              });
              material.dispose();
            });
          });
        };

        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }

        const eye = gltf.scene;
        const pulseMaterials: Array<{ material: import("three").MeshStandardMaterial; base: number }> = [];
        eye.traverse((object) => {
          const mesh = object as import("three").Mesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
          materials.forEach((candidate) => {
            if (
              candidate instanceof THREE.MeshStandardMaterial &&
              /signal|glow/i.test(candidate.name)
            ) {
              pulseMaterials.push({ material: candidate, base: candidate.emissiveIntensity });
            }
          });
        });
        const bounds = new THREE.Box3().setFromObject(eye);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 3.05 / Math.max(size.x, size.y, size.z);
        eye.position.copy(center).multiplyScalar(-1);
        const eyeRig = new THREE.Group();
        eyeRig.add(eye);
        eyeRig.scale.setScalar(scale);
        eyeRig.position.x = -0.18;
        eyeRig.rotation.set(-0.08, -0.55, -0.04);
        const basePosition = eyeRig.position.clone();
        scene.add(eyeRig);
        setState("live");

        const resize = () => {
          if (!renderer) return;
          const rect = stage.getBoundingClientRect();
          const width = Math.max(1, rect.width);
          const height = Math.max(1, rect.height);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(stage);
        resize();

        intersectionObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
        });
        intersectionObserver.observe(stage);

        const onPointerMove = (event: PointerEvent) => {
          const rect = stage.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        const onVisibility = () => {
          active = !document.hidden;
        };
        let scrollProgress = 0;
        const onScroll = () => {
          const rect = stage.getBoundingClientRect();
          scrollProgress = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
        };
        stage.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        const start = performance.now();
        const frame = (now: number) => {
          if (disposed) return;
          if (active && visible && renderer) {
            const time = (now - start) / 1000;
            eyeRig.rotation.y += (pointer.x * 0.18 + Math.sin(time * 0.28) * 0.16 - eyeRig.rotation.y) * 0.025;
            eyeRig.rotation.x += (-pointer.y * 0.1 - 0.05 - eyeRig.rotation.x) * 0.025;
            eyeRig.position.y = basePosition.y + Math.sin(time * 0.65) * 0.055;
            camera.position.z += (5.45 + scrollProgress * 0.7 - camera.position.z) * 0.035;
            camera.position.y += (scrollProgress * 0.18 - camera.position.y) * 0.035;
            pulseMaterials.forEach(({ material, base }, index) => {
              material.emissiveIntensity = base * (0.82 + Math.sin(time * 1.2 + index * 0.7) * 0.18);
            });
            renderer.render(scene, camera);
          }
          animationFrame = requestAnimationFrame(frame);
        };
        animationFrame = requestAnimationFrame(frame);

        return () => {
          stage.removeEventListener("pointermove", onPointerMove);
          document.removeEventListener("visibilitychange", onVisibility);
          window.removeEventListener("scroll", onScroll);
          disposeObject(eye);
        };
      } catch (error) {
        console.warn("Aether 3D fallback enabled", error);
        setState("fallback");
      }
    };

    let removeListeners: (() => void) | undefined;
    init().then((cleanup) => {
      removeListeners = cleanup;
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      removeListeners?.();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={stageRef} className={`eye-stage eye-stage--${state}`} aria-label="Interactive All Seeing Eye model">
      <div className="eye-orbit eye-orbit--one" />
      <div className="eye-orbit eye-orbit--two" />
      <div className="eye-crosshair" />
      <img className="eye-poster" src="/eye-poster.png" alt="The All Seeing Eye model by The WarVet" />
      <canvas ref={canvasRef} className="eye-canvas" aria-hidden="true" />
      <div className="eye-readout eye-readout--top">
        <span className="live-dot" /> {state === "live" ? "live model" : state === "loading" ? "loading model" : "adaptive render"}
      </div>
      <div className="eye-readout eye-readout--bottom">local signal / 00–∞</div>
    </div>
  );
}
