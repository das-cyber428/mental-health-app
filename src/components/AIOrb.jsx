import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const moodSettings = {
  anxious: {
    core: '#ff7a88',
    emissive: '#ff5a7a',
    aura: '#ff9670',
    pulseSpeed: 3.2,
    pulseAmplitude: 0.11,
    rotationSpeed: 0.006,
  },
  sad: {
    core: '#7f8cff',
    emissive: '#6075ff',
    aura: '#84b8ff',
    pulseSpeed: 1.3,
    pulseAmplitude: 0.05,
    rotationSpeed: 0.002,
  },
  happy: {
    core: '#6dffe5',
    emissive: '#40eec7',
    aura: '#9df8ff',
    pulseSpeed: 2.1,
    pulseAmplitude: 0.08,
    rotationSpeed: 0.004,
  },
  neutral: {
    core: '#9d8cff',
    emissive: '#6d4bff',
    aura: '#4de8ff',
    pulseSpeed: 1.8,
    pulseAmplitude: 0.06,
    rotationSpeed: 0.003,
  },
};

export default function AIOrb({ mood = 'neutral', onClick, position = [0, 0, 0] }) {
  const coreRef = useRef(null);
  const auraRef = useRef(null);
  const ringRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const currentMood = useMemo(
    () => moodSettings[mood] ?? moodSettings.neutral,
    [mood],
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * currentMood.pulseSpeed) * currentMood.pulseAmplitude;
    const hoverScale = hovered ? 1.08 : 1;
    const scale = pulse * hoverScale;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(scale);
      coreRef.current.rotation.y += currentMood.rotationSpeed;
      coreRef.current.rotation.x = Math.sin(t * 0.4) * 0.12;
      coreRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        coreRef.current.material.emissiveIntensity,
        hovered ? 2.1 : mood === 'anxious' ? 1.8 : 1.2,
        0.08,
      );
      coreRef.current.material.color.lerp(new THREE.Color(currentMood.core), 0.08);
      coreRef.current.material.emissive.lerp(new THREE.Color(currentMood.emissive), 0.08);
    }

    if (auraRef.current) {
      auraRef.current.scale.setScalar(1.55 + Math.sin(t * currentMood.pulseSpeed) * 0.11);
      auraRef.current.material.opacity = THREE.MathUtils.lerp(
        auraRef.current.material.opacity,
        hovered ? 0.56 : mood === 'anxious' ? 0.4 : 0.28,
        0.08,
      );
      auraRef.current.material.color.lerp(new THREE.Color(currentMood.aura), 0.08);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += currentMood.rotationSpeed * 0.45;
      ringRef.current.material.opacity = THREE.MathUtils.lerp(
        ringRef.current.material.opacity,
        hovered ? 0.55 : 0.35,
        0.08,
      );
      ringRef.current.material.color.lerp(new THREE.Color(currentMood.aura), 0.08);
    }
  });

  return (
    <group position={position}>
      <mesh ref={auraRef}>
        <sphereGeometry args={[1.55, 64, 64]} />
        <meshBasicMaterial color={currentMood.aura} transparent opacity={0.28} />
      </mesh>

      <mesh
        ref={coreRef}
        onClick={onClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          setHovered(false);
        }}
      >
        <sphereGeometry args={[1.15, 128, 128]} />
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.08}
          roughness={0.18}
          metalness={0.22}
          transmission={0.28}
          thickness={1.8}
          iridescence={0.72}
          color={currentMood.core}
          emissive={currentMood.emissive}
          emissiveIntensity={1.2}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[0, 0, Math.PI / 5]}>
        <torusGeometry args={[1.65, 0.03, 32, 200]} />
        <meshBasicMaterial color={currentMood.aura} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
