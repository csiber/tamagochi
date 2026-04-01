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

function lerpEuler(
  bone: THREE.Object3D | null | undefined,
  target: [number, number, number],
  alpha: number
) {
  if (!bone) return;
  bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, target[0], alpha);
  bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, target[1], alpha);
  bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, target[2], alpha);
}

function lerpExpression(
  mgr: VRM["expressionManager"],
  name: string,
  target: number,
  alpha: number
) {
  if (!mgr) return;
  const current = mgr.getValue(name) ?? 0;
  mgr.setValue(name, THREE.MathUtils.lerp(current, target, alpha));
}

const PetModel = ({ animation, vrmUrl }: VRMPetProps) => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { camera } = useThree();

  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(3);
  const isBlinkingRef = useRef(false);
  const blinkPhaseRef = useRef(0);
  const idleSwayPhaseRef = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const urls = [vrmUrl, "/Twinkle_Yulelog.vrm"].filter(Boolean) as string[];
    const tryLoad = (index: number) => {
      if (index >= urls.length) return;
      loader.load(
        urls[index]!,
        (gltf) => {
          const vrmData = gltf.userData.vrm as VRM;
          if (vrmData) {
            VRMUtils.rotateVRM0(vrmData);
            const leftArm = vrmData.humanoid?.getNormalizedBoneNode("leftUpperArm");
            const rightArm = vrmData.humanoid?.getNormalizedBoneNode("rightUpperArm");
            if (leftArm) leftArm.rotation.z = 1.1;
            if (rightArm) rightArm.rotation.z = -1.1;
            setVrm(vrmData);
            setLoaded(true);
          }
        },
        undefined,
        () => tryLoad(index + 1)
      );
    };
    tryLoad(0);
  }, [vrmUrl]);

  useFrame((state, delta) => {
    if (!vrm) return;
    const t = state.clock.getElapsedTime();
    const fast = Math.min(delta * 9, 1);
    const slow = Math.min(delta * 3, 1);

    const breathCycle = Math.sin(t * 1.2 + idleSwayPhaseRef.current);
    const swayCycle = Math.sin(t * 0.4 + idleSwayPhaseRef.current);
    const microSway = Math.sin(t * 0.8 + idleSwayPhaseRef.current * 1.3);

    const hips = vrm.humanoid?.getNormalizedBoneNode("hips");
    const spine = vrm.humanoid?.getNormalizedBoneNode("spine");
    const chest = vrm.humanoid?.getNormalizedBoneNode("chest");
    const neck = vrm.humanoid?.getNormalizedBoneNode("neck");
    const leftUpperArm = vrm.humanoid?.getNormalizedBoneNode("leftUpperArm");
    const rightUpperArm = vrm.humanoid?.getNormalizedBoneNode("rightUpperArm");
    const leftLowerArm = vrm.humanoid?.getNormalizedBoneNode("leftLowerArm");
    const rightLowerArm = vrm.humanoid?.getNormalizedBoneNode("rightLowerArm");
    const leftHand = vrm.humanoid?.getNormalizedBoneNode("leftHand");
    const rightHand = vrm.humanoid?.getNormalizedBoneNode("rightHand");
    const leftUpperLeg = vrm.humanoid?.getNormalizedBoneNode("leftUpperLeg");
    const rightUpperLeg = vrm.humanoid?.getNormalizedBoneNode("rightUpperLeg");

    // Auto-blink
    blinkTimerRef.current += delta;
    if (!isBlinkingRef.current && blinkTimerRef.current > nextBlinkRef.current) {
      isBlinkingRef.current = true;
      blinkPhaseRef.current = 0;
      nextBlinkRef.current = blinkTimerRef.current + 2 + Math.random() * 4;
    }
    let blinkValue = 0;
    if (isBlinkingRef.current) {
      blinkPhaseRef.current += delta * 12;
      blinkValue = Math.max(0, Math.sin(blinkPhaseRef.current * Math.PI));
      if (blinkPhaseRef.current >= 1) { isBlinkingRef.current = false; blinkValue = 0; }
    }

    // LookAt
    const lookTarget = Math.sin(t * 0.15) > 0.7
      ? new THREE.Vector3(Math.sin(t * 0.3) * 3, 1.2, 3)
      : camera.position;
    vrm.lookAt?.lookAt(lookTarget);

    if (animation === "sleep") {
      if (hips) { hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0, slow); hips.position.x = THREE.MathUtils.lerp(hips.position.x, 0, slow); }
      lerpEuler(spine, [0.05, 0, 0], slow);
      lerpEuler(chest, [0.05, 0, 0], slow);
      lerpEuler(neck, [0.5, 0, 0], slow);
      lerpEuler(leftUpperArm, [0, 0, 1.1], slow);
      lerpEuler(rightUpperArm, [0, 0, -1.1], slow);
      lerpEuler(leftLowerArm, [0, 0, 0.1], slow);
      lerpEuler(rightLowerArm, [0, 0, -0.1], slow);
      lerpExpression(vrm.expressionManager, "blink", 1.0, slow);
      lerpExpression(vrm.expressionManager, "relaxed", 0.8, slow);
      lerpExpression(vrm.expressionManager, "happy", 0.2, slow);
      lerpExpression(vrm.expressionManager, "aa", 0, fast);
      lerpExpression(vrm.expressionManager, "surprised", 0, fast);

    } else if (animation === "eat") {
      const chewAmt = Math.max(0, Math.sin(t * 12)) * 0.7;
      if (hips) { hips.position.y = THREE.MathUtils.lerp(hips.position.y, swayCycle * 0.005, fast); hips.position.x = THREE.MathUtils.lerp(hips.position.x, swayCycle * 0.01, fast); }
      lerpEuler(spine, [0.05, 0, 0], fast);
      lerpEuler(chest, [0.05 + chewAmt * 0.05, 0, 0], fast);
      lerpEuler(neck, [-0.1 - chewAmt * 0.1, 0, 0], fast);
      lerpEuler(leftUpperArm, [-0.3, 0, 0.9], fast);
      lerpEuler(rightUpperArm, [-0.3, 0, -0.9], fast);
      lerpEuler(leftLowerArm, [0.8, 0, 0], fast);
      lerpEuler(rightLowerArm, [0.8, 0, 0], fast);
      lerpEuler(leftHand, [0, 0, 0.2], fast);
      lerpEuler(rightHand, [0, 0, -0.2], fast);
      lerpExpression(vrm.expressionManager, "aa", chewAmt, fast);
      lerpExpression(vrm.expressionManager, "happy", 0.8, fast);
      lerpExpression(vrm.expressionManager, "blink", blinkValue, fast);
      lerpExpression(vrm.expressionManager, "relaxed", 0.3, fast);
      lerpExpression(vrm.expressionManager, "surprised", 0, fast);

    } else if (animation === "play") {
      const jumpCycle = Math.abs(Math.sin(t * 6));
      const waveCycle = Math.sin(t * 8);
      if (hips) { hips.position.y = THREE.MathUtils.lerp(hips.position.y, jumpCycle * 0.12, fast); hips.position.x = THREE.MathUtils.lerp(hips.position.x, Math.sin(t * 3) * 0.03, fast); }
      lerpEuler(spine, [0, Math.sin(t * 3) * 0.04, 0], fast);
      lerpEuler(chest, [0.05, 0, 0], fast);
      lerpEuler(neck, [-0.1, 0, waveCycle * 0.05], fast);
      lerpEuler(leftUpperArm, [0, 0, 1.0 + waveCycle * 0.6], fast);
      lerpEuler(rightUpperArm, [0, 0, -1.0 - waveCycle * 0.6], fast);
      lerpEuler(leftLowerArm, [0.3 + waveCycle * 0.2, 0, 0], fast);
      lerpEuler(rightLowerArm, [0.3 - waveCycle * 0.2, 0, 0], fast);
      lerpEuler(leftUpperLeg, [-jumpCycle * 0.08, 0, 0], fast);
      lerpEuler(rightUpperLeg, [-jumpCycle * 0.08, 0, 0], fast);
      lerpExpression(vrm.expressionManager, "happy", 1.0, fast);
      lerpExpression(vrm.expressionManager, "blink", blinkValue * 0.3, fast);
      lerpExpression(vrm.expressionManager, "relaxed", 0, fast);
      lerpExpression(vrm.expressionManager, "aa", jumpCycle * 0.3, fast);
      lerpExpression(vrm.expressionManager, "surprised", 0, fast);

    } else if (animation === "alert") {
      if (hips) { hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0, fast); hips.position.x = THREE.MathUtils.lerp(hips.position.x, 0, fast); }
      lerpEuler(spine, [-0.05, 0, 0], fast);
      lerpEuler(chest, [-0.05, 0, 0], fast);
      lerpEuler(neck, [-0.15, 0, 0], fast);
      lerpEuler(leftUpperArm, [0, 0, 1.2], fast);
      lerpEuler(rightUpperArm, [0, 0, -1.2], fast);
      lerpEuler(leftLowerArm, [0, 0, 0.1], fast);
      lerpEuler(rightLowerArm, [0, 0, -0.1], fast);
      lerpExpression(vrm.expressionManager, "blink", 0, fast);
      lerpExpression(vrm.expressionManager, "happy", 0.2, fast);
      lerpExpression(vrm.expressionManager, "relaxed", 0, fast);
      lerpExpression(vrm.expressionManager, "surprised", 0.8, fast);
      lerpExpression(vrm.expressionManager, "aa", 0, fast);

    } else {
      // IDLE
      if (hips) { hips.position.x = THREE.MathUtils.lerp(hips.position.x, swayCycle * 0.015, slow); hips.position.y = THREE.MathUtils.lerp(hips.position.y, breathCycle * 0.006, slow); }
      lerpEuler(spine, [0, swayCycle * 0.02, microSway * 0.015], slow);
      lerpEuler(chest, [breathCycle * 0.02, 0, 0], slow);
      lerpEuler(neck, [0, swayCycle * 0.03, 0], slow);
      lerpEuler(leftUpperArm, [0, 0, 1.1 + breathCycle * 0.03], slow);
      lerpEuler(rightUpperArm, [0, 0, -1.1 - breathCycle * 0.03], slow);
      lerpEuler(leftLowerArm, [0.15, 0, 0.1], slow);
      lerpEuler(rightLowerArm, [0.15, 0, -0.1], slow);
      lerpEuler(leftHand, [0, 0, 0.1], slow);
      lerpEuler(rightHand, [0, 0, -0.1], slow);
      lerpExpression(vrm.expressionManager, "relaxed", 0.25, slow);
      lerpExpression(vrm.expressionManager, "happy", 0.15, slow);
      lerpExpression(vrm.expressionManager, "blink", blinkValue, fast);
      lerpExpression(vrm.expressionManager, "aa", 0, slow);
      lerpExpression(vrm.expressionManager, "surprised", 0, slow);
    }

    vrm.update(delta);
  });

  if (!loaded) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#6366f1" transparent opacity={0.35} wireframe />
        </mesh>
      </group>
    );
  }

  return <primitive object={vrm!.scene} position={[0, -1.2, 0]} scale={[1.2, 1.2, 1.2]} />;
};

export const VRMPet = (props: VRMPetProps) => {
  return (
    <div className="h-[480px] w-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.1, 1.9], fov: 38 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 5, 3]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-4, 2, -2]} intensity={1.2} color="#a78bfa" />
        <pointLight position={[4, 0, 2]} intensity={0.8} color="#34d399" />
        <PetModel {...props} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2.8}
          maxPolarAngle={Math.PI / 1.7}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  );
};
