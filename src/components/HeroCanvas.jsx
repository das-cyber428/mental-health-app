import { Canvas } from '@react-three/fiber';
import { Environment, Float, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import AIOrb from './AIOrb';
import ParticleField from './ParticleField';

function Scene({ mood, active, onOrbClick }) {
  return (
    <>
      <color attach="background" args={['#050816']} />
      <fog attach="fog" args={['#050816', 10, 28]} />
      <ambientLight intensity={1.15} />
      <pointLight position={[0, 2, 4]} intensity={18} color="#7c5cff" />
      <pointLight position={[4, -2, 2]} intensity={12} color="#1fd6ff" />
      <pointLight position={[-4, -2, -1]} intensity={10} color="#20d6c7" />

      <ParticleField count={1600} />

      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
        <AIOrb mood={mood} active={active} onClick={onOrbClick} position={[0.15, 0.2, 0]} />
      </Float>

      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7.5, 64]} />
        <meshBasicMaterial color="#091123" transparent opacity={0.42} />
      </mesh>

      <Environment preset="night" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.28}
        minPolarAngle={Math.PI / 2.3}
        maxPolarAngle={Math.PI / 1.9}
      />
    </>
  );
}

export default function HeroCanvas({ mood, active, onOrbClick }) {
  return (
    <div className="h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene mood={mood} active={active} onOrbClick={onOrbClick} />
        </Suspense>
      </Canvas>
    </div>
  );
}
