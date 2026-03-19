import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const moodSettings = {
  calm: {
    core: '#6cbfff',
    emissive: '#3ea6ff',
    aura: '#86d9ff',
    pulseSpeed: 1.1,
    pulseAmplitude: 0.045,
    rotationSpeed: 0.002,
    dimness: 1.1,
  },
  happy: {
    core: '#6dffc4',
    emissive: '#31ebb0',
    aura: '#9bffe4',
    pulseSpeed: 1.8,
    pulseAmplitude: 0.08,
    rotationSpeed: 0.004,
    dimness: 1.75,
  },
  anxious: {
    core: '#ff7d84',
    emissive: '#ff596c',
    aura: '#ffab90',
    pulseSpeed: 3.6,
    pulseAmplitude: 0.12,
    rotationSpeed: 0.006,
    dimness: 1.9,
  },
  sad: {
    core: '#8b7cff',
    emissive: '#6650e8',
    aura: '#948eff',
    pulseSpeed: 0.9,
    pulseAmplitude: 0.04,
    rotationSpeed: 0.0018,
    dimness: 0.82,
  },
  neutral: {
    core: '#9d8cff',
    emissive: '#6d4bff',
    aura: '#4de8ff',
    pulseSpeed: 1.5,
    pulseAmplitude: 0.06,
    rotationSpeed: 0.003,
    dimness: 1.25,
  },
};

const stateModifiers = {
  'Listening...': { boost: 1.08, halo: 0.16, jitter: 0.01 },
  'Thinking...': { boost: 1.2, halo: 0.2, jitter: 0.02 },
  'Responding...': { boost: 1.35, halo: 0.22, jitter: 0.008 },
  Idle: { boost: 1, halo: 0.12, jitter: 0 },
  Responded: { boost: 1.05, halo: 0.14, jitter: 0 },
  'Needs attention': { boost: 0.94, halo: 0.1, jitter: 0.012 },
};

export default function AIOrb({
  mood = 'neutral',
  active = false,
  aiState = 'Idle',
  musicProfile,
  onClick,
  position = [0, 0, 0],
}) {
  const coreRef = useRef(null);
  const auraRef = useRef(null);
  const ringRef = useRef(null);
  const haloRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const currentMood = useMemo(() => moodSettings[mood] ?? moodSettings.neutral, [mood]);
  const stateModifier = stateModifiers[aiState] ?? stateModifiers.Idle;
  const musicEnergy = musicProfile?.isPlaying ? 0.78 + (musicProfile.energy ?? 0.45) * 0.8 : 0.9;
  const musicGlow = musicProfile?.isPlaying ? 0.08 + (musicProfile.energy ?? 0.45) * 0.18 : 0;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const activityBoost = (active ? 1.25 : 1) * stateModifier.boost * musicEnergy;
    const pulse =
      1 +
      Math.sin(t * currentMood.pulseSpeed * activityBoost) *
        currentMood.pulseAmplitude *
        (active ? 1.18 : 1);
    const hoverScale = hovered ? 1.06 : 1;
    const scale = pulse * hoverScale;
    const jitter = stateModifier.jitter ? Math.sin(t * 22) * stateModifier.jitter : 0;

    if (coreRef.current) {
      coreRef.current.scale.set(scale + jitter, scale - jitter * 0.6, scale);
      coreRef.current.rotation.y += currentMood.rotationSpeed * (active ? 1.5 : 1);
      coreRef.current.rotation.x = Math.sin(t * 0.38) * 0.11;
      coreRef.current.position.x = jitter * 0.35;
      coreRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        coreRef.current.material.emissiveIntensity,
        (hovered ? 2.2 : currentMood.dimness) + (active ? 0.45 : 0) + stateModifier.halo + musicGlow,
        0.08,
      );
      coreRef.current.material.color.lerp(new THREE.Color(currentMood.core), 0.08);
      coreRef.current.material.emissive.lerp(new THREE.Color(currentMood.emissive), 0.08);
    }

    if (auraRef.current) {
      auraRef.current.scale.setScalar(1.55 + Math.sin(t * currentMood.pulseSpeed * activityBoost) * 0.13);
      auraRef.current.material.opacity = THREE.MathUtils.lerp(
        auraRef.current.material.opacity,
        hovered ? 0.58 : active ? 0.44 : mood === 'sad' ? 0.2 : 0.3,
        0.08,
      );
      auraRef.current.material.color.lerp(new THREE.Color(currentMood.aura), 0.08);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += currentMood.rotationSpeed * (active ? 0.9 : 0.45) * stateModifier.boost;
      ringRef.current.material.opacity = THREE.MathUtils.lerp(
        ringRef.current.material.opacity,
        hovered ? 0.55 : active ? 0.42 : 0.28,
        0.08,
      );
      ringRef.current.material.color.lerp(new THREE.Color(currentMood.aura), 0.08);
    }

    if (haloRef.current) {
      haloRef.current.scale.setScalar(1.9 + Math.sin(t * 0.7) * 0.05 + stateModifier.halo * 0.15);
      haloRef.current.material.opacity = THREE.MathUtils.lerp(
        haloRef.current.material.opacity,
        active ? 0.18 + stateModifier.halo * 0.2 + musicGlow * 0.5 : mood === 'sad' ? 0.08 : 0.12 + musicGlow * 0.35,
        0.08,
      );
      haloRef.current.material.color.lerp(new THREE.Color(currentMood.emissive), 0.08);
    }
  });

  return (
    <group position={position}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.95, 64, 64]} />
        <meshBasicMaterial color={currentMood.emissive} transparent opacity={0.12} />
      </mesh>

      <mesh ref={auraRef}>
        <sphereGeometry args={[1.55, 64, 64]} />
        <meshBasicMaterial color={currentMood.aura} transparent opacity={0.3} />
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
        <sphereGeometry args={[1.14, 128, 128]} />
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.08}
          roughness={0.16}
          metalness={0.22}
          transmission={0.34}
          thickness={1.9}
          iridescence={0.82}
          color={currentMood.core}
          emissive={currentMood.emissive}
          emissiveIntensity={1.2}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[0, 0, Math.PI / 5]}>
        <torusGeometry args={[1.66, 0.028, 32, 220]} />
        <meshBasicMaterial color={currentMood.aura} transparent opacity={0.28} />
      </mesh>
    </group>
  );
}
