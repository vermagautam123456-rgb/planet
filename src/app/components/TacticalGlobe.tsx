'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

const Earth = ({ earthquakes, iss }: { earthquakes: any[], iss: any }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  
  // Load textures
  const [colorMap, nightMap, bumpMap] = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return [
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png'),
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg')
    ];
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (earthRef.current) {
      earthRef.current.rotation.y = elapsed * 0.05;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = elapsed * 0.07;
    }
  });

  // Convert lat/lng to 3D coords
  const getCoords = (lat: number, lng: number, radius: number = 2.02) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return [
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ] as [number, number, number];
  };

  return (
    <group>
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      
      {/* Earth Base */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap} 
          normalMap={bumpMap}
          emissiveMap={nightMap} 
          emissive={new THREE.Color(0xffffcc)} 
          emissiveIntensity={0.6}
          roughness={0.7}
          metalness={0.2}
        />
        
        {/* Earthquake Markers */}
        {earthquakes.map((q) => {
          const coords = getCoords(parseFloat(q.lat), parseFloat(q.lng));
          const isMajor = parseFloat(q.magnitude) >= 4.5;
          return (
            <mesh key={q.id} position={coords}>
              <sphereGeometry args={[isMajor ? 0.04 : 0.02, 16, 16]} />
              <meshBasicMaterial color={isMajor ? "#ef4444" : "#f59e0b"} />
              <Html distanceFactor={10}>
                <div style={{ 
                  color: isMajor ? '#ef4444' : '#f59e0b', 
                  fontSize: '8px', 
                  whiteSpace: 'nowrap', 
                  pointerEvents: 'none',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '2px 4px',
                  borderRadius: '2px',
                  border: `1px solid ${isMajor ? '#ef4444' : '#f59e0b'}`,
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}>
                  MAG {q.magnitude}
                </div>
              </Html>
            </mesh>
          );
        })}

        {/* ISS Marker */}
        {iss && (
          <mesh position={getCoords(iss.latitude, iss.longitude, 2.3)}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" />
            <Html distanceFactor={10}>
              <div style={{ 
                color: '#38bdf8', 
                fontSize: '10px', 
                fontWeight: 'bold', 
                whiteSpace: 'nowrap',
                background: 'rgba(0,0,0,0.6)',
                padding: '3px 6px',
                borderRadius: '4px',
                border: '1px solid var(--primary)',
                fontFamily: 'monospace' 
              }}>
                ISS [OVR_STREAM]
              </div>
            </Html>
          </mesh>
        )}
      </mesh>
      
      {/* Glossy atmosphere effect */}
      <mesh>
        <sphereGeometry args={[2.01, 64, 64]} />
        <meshPhongMaterial 
          color="#38bdf8"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#38bdf8" />
    </group>
  );
};

const TacticalGlobe = ({ earthquakes, iss }: { earthquakes: any[], iss: any }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '350px', background: '#020617', position: 'relative' }}>
      {/* Tactical Overlays */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '4px', textShadow: '0 0 10px rgba(56,189,248,0.5)' }}>
          ORSAT // TRACKING
        </div>
        <div style={{ color: 'rgba(56,189,248,0.4)', fontSize: '0.6rem', fontFamily: 'monospace' }}>
          DECRYPTING ORBITAL TELEMETRY... <br/>
          SIGNAL: 4.8kbps [SECURE]
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10, color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', fontFamily: 'monospace', textAlign: 'right' }}>
        AXIS_ROT: +0.05rad/s <br/>
        REF_FRAME: WGS84
      </div>

      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true }}>
        <Earth earthquakes={earthquakes} iss={iss} />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={12} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      {/* CRT Scanline effect specific to the globe */}
      <div style={{ 
        position: 'absolute', inset: 0, 
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)',
        backgroundSize: '100% 4px',
        pointerEvents: 'none',
        opacity: 0.3
      }}></div>
    </div>
  );
};

export default TacticalGlobe;
