"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface NodeProps {
  position: [number, number, number];
  color: string;
  size: number;
}

function Node({ position, color, size }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const originalPos = useMemo(() => new THREE.Vector3(...position), [position]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const { mouse } = state;
    
    
    const mousePos = new THREE.Vector3(mouse.x * 5, mouse.y * 5, 0);
    const nodePos = meshRef.current.position;
    const dist = nodePos.distanceTo(mousePos);
    
    if (dist < 2) {
      const force = mousePos.clone().sub(nodePos).normalize().multiplyScalar(-0.02);
      meshRef.current.position.add(force);
    }
    
    
    meshRef.current.position.lerp(originalPos, 0.02);
    
    
    meshRef.current.position.y += Math.sin(time + position[0]) * 0.002;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

function Connection({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const lineRef = useRef<THREE.Line>(null);
  
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [start, end]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const material = lineRef.current.material as THREE.LineBasicMaterial;
    material.opacity = 0.2 + Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 }))} />
  );
}

function DataField() {
  const nodes = useMemo(() => {
    const nodeData: NodeProps[] = [];
    const colors = ["#00ff88", "#0088ff", "#ff0055", "#ffaa00"];
    
    
    for (let i = 0; i < 22; i++) {
      nodeData.push({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 2,
        ],
        color: colors[i < 11 ? 0 : 2], 
        size: i === 10 || i === 21 ? 0.08 : 0.05,
      });
    }
    
    
    nodeData.push({
      position: [0, 0, 0.5],
      color: "#ffffff",
      size: 0.06,
    });
    
    return nodeData;
  }, []);

  const connections = useMemo(() => {
    const connData: { start: [number, number, number]; end: [number, number, number]; color: string }[] = [];
    
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = new THREE.Vector3(...nodes[i].position).distanceTo(new THREE.Vector3(...nodes[j].position));
        if (dist < 2.5) {
          connData.push({
            start: nodes[i].position,
            end: nodes[j].position,
            color: nodes[i].color,
          });
        }
      }
    }
    
    return connData;
  }, [nodes]);

  return (
    <group>
      {connections.map((conn, i) => (
        <Connection key={i} {...conn} />
      ))}
      {nodes.map((node, i) => (
        <Node key={i} {...node} />
      ))}
    </group>
  );
}

export function DataVisualizer() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <DataField />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          rotateSpeed={0.3}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
