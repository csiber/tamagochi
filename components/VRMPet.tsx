import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

interface VRMPetProps {
  animation: "idle" | "eat" | "play" | "sleep" | "alert";
  vrmUrl?: string;
}

function lerpEuler(bone: THREE.Object3D | null | undefined, target: [number, number, number], alpha: number) {
  if (!bone) return;
  bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, target[0], alpha);
  bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, target[1], alpha);
  bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, target[2], alpha);
}

function lerpExpr(mgr: VRM["expressionManager"], name: string, target: number, alpha: number) {
  if (!mgr) return;
  mgr.setValue(name, THREE.MathUtils.lerp(mgr.getValue(name) ?? 0, target, alpha));
}

const PetModel = ({ animation, vrmUrl }: VRMPetProps) => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { camera } = useThree();

  const blinkTimer = useRef(0);
  const nextBlink = useRef(3 + Math.random() * 3);
  const isBlinking = useRef(false);
  const blinkPhase = useRef(0);
  const swayOffset = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    const loader = new GLTFLoader();
    // @ts-ignore – three-stdlib / @types/three KTX2Loader type mismatch
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const urls = [vrmUrl, "/Twinkle_Yulelog.vrm"].filter(Boolean) as string[];
    const tryLoad = (i: number) => {
      if (i >= urls.length) return;
      loader.load(urls[i]!, (gltf) => {
        const v = gltf.userData.vrm as VRM;
        if (v) {
          VRMUtils.rotateVRM0(v);
          const la = v.humanoid?.getNormalizedBoneNode("leftUpperArm");
          const ra = v.humanoid?.getNormalizedBoneNode("rightUpperArm");
          if (la) la.rotation.z = 1.1;
          if (ra) ra.rotation.z = -1.1;
          setVrm(v);
          setLoaded(true);
        }
      }, undefined, () => tryLoad(i + 1));
    };
    tryLoad(0);
  }, [vrmUrl]);

  useFrame((state, delta) => {
    if (!vrm) return;
    const t = state.clock.getElapsedTime();
    const fast = Math.min(delta * 9, 1);
    const slow = Math.min(delta * 3, 1);
    const o = swayOffset.current;

    const breath = Math.sin(t * 1.2 + o);
    const sway = Math.sin(t * 0.4 + o);
    const micro = Math.sin(t * 0.8 + o * 1.3);

    const bone = (name: string) => vrm.humanoid?.getNormalizedBoneNode(name as any);

    // Auto-blink
    blinkTimer.current += delta;
    if (!isBlinking.current && blinkTimer.current > nextBlink.current) {
      isBlinking.current = true; blinkPhase.current = 0;
      nextBlink.current = blinkTimer.current + 2 + Math.random() * 4;
    }
    let blinkVal = 0;
    if (isBlinking.current) {
      blinkPhase.current += delta * 12;
      blinkVal = Math.max(0, Math.sin(blinkPhase.current * Math.PI));
      if (blinkPhase.current >= 1) { isBlinking.current = false; blinkVal = 0; }
    }

    // LookAt
    vrm.lookAt?.lookAt(
      Math.sin(t * 0.15) > 0.7
        ? new THREE.Vector3(Math.sin(t * 0.3) * 3, 1.2, 3)
        : camera.position
    );

    const hips = bone("hips");

    if (animation === "sleep") {
      if (hips) { hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0, slow); hips.position.x = THREE.MathUtils.lerp(hips.position.x, 0, slow); }
      lerpEuler(bone("spine"), [0.05, 0, 0], slow);
      lerpEuler(bone("chest"), [0.05, 0, 0], slow);
      lerpEuler(bone("neck"), [0.5, 0, 0], slow);
      lerpEuler(bone("leftUpperArm"), [0, 0, 1.1], slow);
      lerpEuler(bone("rightUpperArm"), [0, 0, -1.1], slow);
      lerpEuler(bone("leftLowerArm"), [0, 0, 0.1], slow);
      lerpEuler(bone("rightLowerArm"), [0, 0, -0.1], slow);
      lerpExpr(vrm.expressionManager, "blink", 1.0, slow);
      lerpExpr(vrm.expressionManager, "relaxed", 0.8, slow);
      lerpExpr(vrm.expressionManager, "happy", 0.2, slow);
      lerpExpr(vrm.expressionManager, "aa", 0, fast);
      lerpExpr(vrm.expressionManager, "surprised", 0, fast);

    } else if (animation === "eat") {
      const chew = Math.max(0, Math.sin(t * 12)) * 0.7;
      if (hips) { hips.position.y = THREE.MathUtils.lerp(hips.position.y, sway * 0.005, fast); hips.position.x = THREE.MathUtils.lerp(hips.position.x, sway * 0.01, fast); }
      lerpEuler(bone("spine"), [0.05, 0, 0], fast);
      lerpEuler(bone("chest"), [0.05 + chew * 0.05, 0, 0], fast);
      lerpEuler(bone("neck"), [-0.1 - chew * 0.1, 0, 0], fast);
      lerpEuler(bone("leftUpperArm"), [-0.3, 0, 0.9], fast);
      lerpEuler(bone("rightUpperArm"), [-0.3, 0, -0.9], fast);
      lerpEuler(bone("leftLowerArm"), [0.8, 0, 0], fast);
      lerpEuler(bone("rightLowerArm"), [0.8, 0, 0], fast);
      lerpEuler(bone("leftHand"), [0, 0, 0.2], fast);
      lerpEuler(bone("rightHand"), [0, 0, -0.2], fast);
      lerpExpr(vrm.expressionManager, "aa", chew, fast);
      lerpExpr(vrm.expressionManager, "happy", 0.8, fast);
      lerpExpr(vrm.expressionManager, "blink", blinkVal, fast);
      lerpExpr(vrm.expressionManager, "relaxed", 0.3, fast);
      lerpExpr(vrm.expressionManager, "surprised", 0, fast);

    } else if (animation === "play") {
      const jump = Math.abs(Math.sin(t * 6));
      const wave = Math.sin(t * 8);
      if (hips) { hips.position.y = THREE.MathUtils.lerp(hips.position.y, jump * 0.12, fast); hips.position.x = THREE.MathUtils.lerp(hips.position.x, Math.sin(t * 3) * 0.03, fast); }
      lerpEuler(bone("spine"), [0, Math.sin(t * 3) * 0.04, 0], fast);
      lerpEuler(bone("chest"), [0.05, 0, 0], fast);
      lerpEuler(bone("neck"), [-0.1, 0, wave * 0.05], fast);
      lerpEuler(bone("leftUpperArm"), [0, 0, 1.0 + wave * 0.6], fast);
      lerpEuler(bone("rightUpperArm"), [0, 0, -1.0 - wave * 0.6], fast);
      lerpEuler(bone("leftLowerArm"), [0.3 + wave * 0.2, 0, 0], fast);
      lerpEuler(bone("rightLowerArm"), [0.3 - wave * 0.2, 0, 0], fast);
      lerpEuler(bone("leftUpperLeg"), [-jump * 0.08, 0, 0], fast);
      lerpEuler(bone("rightUpperLeg"), [-jump * 0.08, 0, 0], fast);
      lerpExpr(vrm.expressionManager, "happy", 1.0, fast);
      lerpExpr(vrm.expressionManager, "blink", blinkVal * 0.3, fast);
      lerpExpr(vrm.expressionManager, "relaxed", 0, fast);
      lerpExpr(vrm.expressionManager, "aa", jump * 0.3, fast);
      lerpExpr(vrm.expressionManager, "surprised", 0, fast);

    } else if (animation === "alert") {
      if (hips) { hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0, fast); hips.position.x = THREE.MathUtils.lerp(hips.position.x, 0, fast); }
      lerpEuler(bone("spine"), [-0.05, 0, 0], fast);
      lerpEuler(bone("chest"), [-0.05, 0, 0], fast);
      lerpEuler(bone("neck"), [-0.15, 0, 0], fast);
      lerpEuler(bone("leftUpperArm"), [0, 0, 1.2], fast);
      lerpEuler(bone("rightUpperArm"), [0, 0, -1.2], fast);
      lerpEuler(bone("leftLowerArm"), [0, 0, 0.1], fast);
      lerpEuler(bone("rightLowerArm"), [0, 0, -0.1], fast);
      lerpExpr(vrm.expressionManager, "blink", 0, fast);
      lerpExpr(vrm.expressionManager, "happy", 0.2, fast);
      lerpExpr(vrm.expressionManager, "relaxed", 0, fast);
      lerpExpr(vrm.expressionManager, "surprised", 0.8, fast);
      lerpExpr(vrm.expressionManager, "aa", 0, fast);

    } else {
      if (hips) { hips.position.x = THREE.MathUtils.lerp(hips.position.x, sway * 0.015, slow); hips.position.y = THREE.MathUtils.lerp(hips.position.y, breath * 0.006, slow); }
      lerpEuler(bone("spine"), [0, sway * 0.02, micro * 0.015], slow);
      lerpEuler(bone("chest"), [breath * 0.02, 0, 0], slow);
      lerpEuler(bone("neck"), [0, sway * 0.03, 0], slow);
      lerpEuler(bone("leftUpperArm"), [0, 0, 1.1 + breath * 0.03], slow);
      lerpEuler(bone("rightUpperArm"), [0, 0, -1.1 - breath * 0.03], slow);
      lerpEuler(bone("leftLowerArm"), [0.15, 0, 0.1], slow);
      lerpEuler(bone("rightLowerArm"), [0.15, 0, -0.1], slow);
      lerpEuler(bone("leftHand"), [0, 0, 0.1], slow);
      lerpEuler(bone("rightHand"), [0, 0, -0.1], slow);
      lerpExpr(vrm.expressionManager, "relaxed", 0.25, slow);
      lerpExpr(vrm.expressionManager, "happy", 0.15, slow);
      lerpExpr(vrm.expressionManager, "blink", blinkVal, fast);
      lerpExpr(vrm.expressionManager, "aa", 0, slow);
      lerpExpr(vrm.expressionManager, "surprised", 0, slow);
    }

    vrm.update(delta);
  });

  if (!loaded) {
    return (
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.3} wireframe />
      </mesh>
    );
  }

  // Position: 0 Y, scale slightly bigger so full body is visible
  return <primitive object={vrm!.scene} position={[0, -0.85, 0]} scale={[1.0, 1.0, 1.0]} />;
};

export const VRMPet = (props: VRMPetProps) => {
  return (
    <div style={{ height: "100%", width: "100%", minHeight: 480 }} className="cursor-grab active:cursor-grabbing">
      <Canvas
        // Camera pulled back and raised to frame full body
        camera={{ position: [0, 0.6, 2.8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 4, 3]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-3, 2, -2]} intensity={1.2} color="#a78bfa" />
        <pointLight position={[3, 0, 2]} intensity={0.9} color="#34d399" />
        <pointLight position={[0, -1, 2]} intensity={0.5} color="#f9a8d4" />
        <PetModel {...props} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          dampingFactor={0.06}
          enableDamping
        />
      </Canvas>
    </div>
  );
};
