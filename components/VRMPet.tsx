import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";

interface VRMPetProps {
  animation: "idle" | "eat" | "play" | "sleep" | "alert";
  vrmUrl?: string;
}

const PetModel = ({ animation, vrmUrl }: VRMPetProps) => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    const loader = new GLTFLoader();
    // @ts-ignore
    loader.register((parser) => new VRMLoaderPlugin(parser));

    const urls = [
      vrmUrl,
      "/Twinkle_Yulelog.vrm",
      "https://vrm-c.github.io/vrm-sample-models/vroid/vrm/Seed-v1.vrm"
    ].filter(Boolean) as string[];

    const tryLoad = (index: number) => {
      if (index >= urls.length) return;
      loader.load(urls[index]!, (gltf) => {
        // @ts-ignore
        const vrmData = gltf.userData.vrm as VRM;
        if (vrmData) {
          VRMUtils.rotateVRM0(vrmData);
          setVrm(vrmData);
          // Set initial relaxed pose
          vrmData.humanoid?.getRawBoneNode("leftUpperArm")?.rotation.set(0, 0, 1.2);
          vrmData.humanoid?.getRawBoneNode("rightUpperArm")?.rotation.set(0, 0, -1.2);
        }
      }, undefined, () => tryLoad(index + 1));
    };
    tryLoad(0);
  }, [vrmUrl]);

  useFrame((state, delta) => {
    if (!vrm) return;
    const time = state.clock.getElapsedTime();

    // 1. Basic Breathing & Swaying (Idle)
    const sway = Math.sin(time * 0.8) * 0.05;
    const breath = Math.sin(time * 2) * 0.02;
    
    vrm.humanoid?.getRawBoneNode("hips")?.position.set(0, breath, 0);
    vrm.humanoid?.getRawBoneNode("spine")?.rotation.set(sway, 0, sway * 0.5);
    
    // 2. Head LookAt Camera
    vrm.lookAt?.lookAt(camera.position);

    // 3. Animation States & Expressions
    if (animation === "sleep") {
      vrm.humanoid?.getRawBoneNode("neck")?.rotation.set(0.3, 0, 0);
      vrm.expressionManager?.setValue("relaxed", 1.0);
      vrm.expressionManager?.setValue("blink", 1.0);
      vrm.expressionManager?.setValue("happy", 0);
    } else if (animation === "eat") {
      const chew = Math.sin(time * 12) * 0.5 + 0.5;
      vrm.expressionManager?.setValue("aa", chew);
      vrm.expressionManager?.setValue("happy", 0.8);
      vrm.expressionManager?.setValue("blink", 0);
    } else if (animation === "play") {
      vrm.humanoid?.getRawBoneNode("leftUpperArm")?.rotation.set(0, 0, Math.sin(time * 8) + 1);
      vrm.humanoid?.getRawBoneNode("rightUpperArm")?.rotation.set(0, 0, -Math.sin(time * 8) - 1);
      vrm.expressionManager?.setValue("happy", 1.0);
      vrm.expressionManager?.setValue("ee", 0.5);
      vrm.expressionManager?.setValue("blink", 0);
    } else {
      // Natural Idle
      vrm.humanoid?.getRawBoneNode("neck")?.rotation.set(Math.sin(time) * 0.1, Math.cos(time * 0.5) * 0.1, 0);
      vrm.expressionManager?.setValue("relaxed", 0.3);
      vrm.expressionManager?.setValue("happy", 0.1);
      // Auto-blink
      const blink = Math.sin(time * 0.4) > 0.98 ? 1.0 : 0;
      vrm.expressionManager?.setValue("blink", blink);
      
      // Reset arms to relaxed
      vrm.humanoid?.getRawBoneNode("leftUpperArm")?.rotation.set(0, 0, 1.2 + Math.sin(time) * 0.05);
      vrm.humanoid?.getRawBoneNode("rightUpperArm")?.rotation.set(0, 0, -1.2 - Math.sin(time) * 0.05);
    }

    vrm.update(delta);
  });

  if (!vrm) {
    return (
      <group position={[0, -0.5, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.5} />
        </mesh>
        <pointLight position={[0, 0.5, 0.5]} color="#60a5fa" intensity={2} />
      </group>
    );
  }

  return <primitive object={vrm.scene} position={[0, -1.2, 0]} scale={[1.2, 1.2, 1.2]} />;
};

export const VRMPet = (props: VRMPetProps) => {
  return (
    <div className="h-[400px] w-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.2, 2.0], fov: 35 }}>
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        <PetModel {...props} />
      </Canvas>
    </div>
  );
};
