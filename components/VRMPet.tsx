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

    const urls = [
      vrmUrl,
      "/Twinkle_Yulelog.vrm",
      "https://vrm-c.github.io/vrm-sample-models/vroid/vrm/Seed-v1.vrm"
    ].filter(Boolean) as string[];

    const tryLoad = (index: number) => {
      if (index >= urls.length) {
        console.error("All VRM sources failed. Using procedural fallback.");
        return;
      }

      loader.load(
        urls[index]!,
        (gltf) => {
          // @ts-ignore
          const vrmData = gltf.userData.vrm as VRM;
          if (vrmData) {
            VRMUtils.rotateVRM0(vrmData);
            setVrm(vrmData);
          }
        },
        undefined,
        () => tryLoad(index + 1)
      );
    };

    tryLoad(0);
  }, [vrmUrl]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    if (vrm) {
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
      } else {
        vrm.humanoid?.getRawBoneNode("neck")?.rotation.set(Math.sin(time) * 0.1, 0, 0);
        vrm.expressionManager?.setValue("blink", Math.sin(time * 0.5) > 0.98 ? 1.0 : 0);
      }
      vrm.update(delta);
    }
  });

  if (!vrm) {
    // A cute procedural 'Pixel Pet' fallback
    return (
      <group position={[0, -0.5, 0]} rotation={[0, Math.sin(Date.now() / 1000) * 0.2, 0]}>
        {/* Body */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.1, 0.1]}>
          <boxGeometry args={[0.6, 0.5, 0.5]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.15, 1.2, 0.35]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0.15, 1.2, 0.35]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {/* Glowing Core */}
        <pointLight position={[0, 0.5, 0.5]} color="#60a5fa" intensity={2} distance={2} />
      </group>
    );
  }

  return <primitive object={vrm.scene} position={[0, -1, 0]} scale={[1, 1, 1]} />;
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
