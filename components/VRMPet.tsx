import React, { useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin, VRMUtils, VRMHumanBoneName } from "@pixiv/three-vrm";
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

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
          
          // Kill T-Pose immediately
          const leftArm = vrmData.humanoid?.getNormalizedBoneNode("leftUpperArm");
          const rightArm = vrmData.humanoid?.getNormalizedBoneNode("rightUpperArm");
          if (leftArm) leftArm.rotation.z = 1.3;
          if (rightArm) rightArm.rotation.z = -1.3;
        }
      }, undefined, () => tryLoad(index + 1));
    };
    tryLoad(0);
  }, [vrmUrl]);

  useFrame((state, delta) => {
    if (!vrm) return;
    const time = state.clock.getElapsedTime();

    // 1. Procedural Body Movement (Breathing & Swaying)
    const s1 = Math.sin(time * 0.5);
    const s2 = Math.sin(time * 1.5);
    
    // Hips swaying
    vrm.humanoid?.getNormalizedBoneNode("hips")?.position.set(s1 * 0.02, Math.cos(time * 2) * 0.01, 0);
    
    // Spine swaying
    vrm.humanoid?.getNormalizedBoneNode("spine")?.rotation.set(s1 * 0.05, 0, s1 * 0.02);
    vrm.humanoid?.getNormalizedBoneNode("chest")?.rotation.set(s2 * 0.03, 0, 0);

    // 2. Head & LookAt
    // Occasionally look away for realism
    const isLookingAtCamera = Math.sin(time * 0.2) > -0.5;
    if (isLookingAtCamera) {
      vrm.lookAt?.lookAt(camera.position);
    } else {
      vrm.lookAt?.lookAt(new THREE.Vector3(Math.sin(time) * 5, 1, 5));
    }

    // 3. Expressions & State Animations
    if (animation === "sleep") {
      vrm.humanoid?.getNormalizedBoneNode("neck")?.rotation.set(0.4, 0, 0);
      vrm.expressionManager?.setValue("relaxed", 1.0);
      vrm.expressionManager?.setValue("blink", 1.0);
      vrm.expressionManager?.setValue("happy", 0);
    } else if (animation === "eat") {
      const chew = Math.sin(time * 15) * 0.6 + 0.4;
      vrm.expressionManager?.setValue("aa", chew);
      vrm.expressionManager?.setValue("happy", 0.7);
      vrm.humanoid?.getNormalizedBoneNode("neck")?.rotation.set(chew * 0.1, 0, 0);
    } else if (animation === "play") {
      // Jump and wave
      vrm.humanoid?.getNormalizedBoneNode("hips")?.position.y += Math.abs(Math.sin(time * 10)) * 0.1;
      vrm.humanoid?.getNormalizedBoneNode("leftUpperArm")?.rotation.set(0, 0, Math.sin(time * 10) + 1.5);
      vrm.humanoid?.getNormalizedBoneNode("rightUpperArm")?.rotation.set(0, 0, -Math.sin(time * 10) - 1.5);
      vrm.expressionManager?.setValue("happy", 1.0);
      vrm.expressionManager?.setValue("blink", 0);
    } else {
      // Idle expressions
      vrm.expressionManager?.setValue("relaxed", 0.2);
      vrm.expressionManager?.setValue("happy", 0.1);
      
      // Auto-blink
      const blink = Math.sin(time * 0.5) > 0.98 ? 1.0 : 0;
      vrm.expressionManager?.setValue("blink", blink);

      // Natural arm breathing
      vrm.humanoid?.getNormalizedBoneNode("leftUpperArm")?.rotation.set(0, 0, 1.3 + Math.sin(time) * 0.05);
      vrm.humanoid?.getNormalizedBoneNode("rightUpperArm")?.rotation.set(0, 0, -1.3 - Math.sin(time) * 0.05);
      vrm.humanoid?.getNormalizedBoneNode("leftLowerArm")?.rotation.set(0, 0, 0.2);
      vrm.humanoid?.getNormalizedBoneNode("rightLowerArm")?.rotation.set(0, 0, -0.2);
    }

    vrm.update(delta);
  });

  if (!vrm) {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }

  return <primitive object={vrm.scene} position={[0, -1.2, 0]} scale={[1.2, 1.2, 1.2]} />;
};

export const VRMPet = (props: VRMPetProps) => {
  return (
    <div className="h-[450px] w-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.2, 1.8], fov: 40 }}>
        <ambientLight intensity={1.2} />
        <spotLight position={[5, 5, 5]} angle={0.25} penumbra={1} intensity={2} color="#ffffff" />
        <pointLight position={[-5, 2, -5]} intensity={1} color="#60a5fa" />
        <PetModel {...props} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};
