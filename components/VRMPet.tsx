import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
// Use GLTFLoader from three-stdlib for better compatibility and TS support
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";

interface VRMPetProps {
  animation: "idle" | "eat" | "play" | "sleep" | "alert";
  vrmUrl?: string;
}

const PetModel = ({ animation, vrmUrl }: VRMPetProps) => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const { camera } = useThree();
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    // @ts-ignore - Ignore type mismatch between three-stdlib and three-vrm types during build
    loader.register((parser) => new VRMLoaderPlugin(parser));

    // To use your own VRoid model:
    // 1. Place your .vrm file in the /public folder (e.g., /public/pet.vrm)
    // 2. Change the url below to "/pet.vrm"
    const url = vrmUrl || "https://raw.githubusercontent.com/pixiv/three-vrm/dev/packages/three-vrm/examples/models/three-vrm-girl.vrm";

    loader.load(
      url,
      (gltf) => {
        const vrmData = gltf.userData.vrm as VRM;
        VRMUtils.rotateVRM0(vrmData); // Fix for VRM 0.0 models orientation
        setVrm(vrmData);
      },
      undefined,
      (error) => console.error("Error loading VRM:", error)
    );
  }, [vrmUrl]);

  useFrame((state, delta) => {
    if (!vrm) return;

    // Simple idle breathing / swaying
    const time = state.clock.getElapsedTime();
    
    // Smooth transitions based on animation state
    if (animation === "sleep") {
      vrm.humanoid?.getRawBoneNode("neck")?.rotation.set(0.4, 0, 0);
      vrm.expressionManager?.setValue("relaxed", 1.0);
      vrm.expressionManager?.setValue("blink", 1.0);
    } else if (animation === "eat") {
      vrm.expressionManager?.setValue("aa", Math.sin(time * 10) * 0.5 + 0.5);
      vrm.expressionManager?.setValue("happy", 1.0);
    } else if (animation === "play") {
      vrm.humanoid?.getRawBoneNode("leftUpperArm")?.rotation.set(0, 0, Math.sin(time * 5) + 1);
      vrm.humanoid?.getRawBoneNode("rightUpperArm")?.rotation.set(0, 0, -Math.sin(time * 5) - 1);
      vrm.expressionManager?.setValue("happy", 1.0);
      vrm.expressionManager?.setValue("blink", 0);
    } else {
      // Idle
      vrm.humanoid?.getRawBoneNode("neck")?.rotation.set(Math.sin(time) * 0.1, 0, 0);
      vrm.expressionManager?.setValue("relaxed", 0.2);
      vrm.expressionManager?.setValue("blink", Math.sin(time * 0.5) > 0.95 ? 1.0 : 0);
    }

    vrm.update(delta);
  });

  return vrm ? <primitive object={vrm.scene} position={[0, -1, 0]} scale={[1, 1, 1]} /> : null;
};

export const VRMPet = (props: VRMPetProps) => {
  return (
    <div className="h-[300px] w-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.2, 2.5], fov: 35 }}>
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        <PetModel {...props} />
      </Canvas>
    </div>
  );
};
