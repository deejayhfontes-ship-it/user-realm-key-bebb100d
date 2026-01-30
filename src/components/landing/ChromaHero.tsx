import { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import heroPortrait from "@/assets/hero-portrait.jpg";

// Shader personalizado para Chromatic Aberration + Glass Distortion
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Calcular distância do mouse para efeito localizado (0 a 1)
    float mouseInfluence = length(uMouse) * uIntensity;
    
    // Efeito de distorção líquida/glass (ripple)
    float ripple = sin(uv.y * 20.0 + uTime * 2.0) * cos(uv.x * 20.0 + uTime) * 0.002;
    float ripple2 = sin(length(uv - 0.5) * 30.0 - uTime * 3.0) * 0.003;
    
    // Aplicar distorção baseada na posição do mouse
    vec2 distortion = vec2(
      ripple * uMouse.x + ripple2 * uMouse.y,
      ripple * uMouse.y + ripple2 * uMouse.x
    );
    
    uv += distortion * mouseInfluence;
    
    // Chromatic Aberration - separar canais RGB
    vec2 direction = normalize(uMouse + 0.001); // evitar divisão por zero
    vec2 redOffset = uv - direction * (mouseInfluence * 0.015);
    vec2 blueOffset = uv + direction * (mouseInfluence * 0.015);
    vec2 greenOffset = uv;
    
    // Samplear textura com offsets diferentes
    float r = texture2D(uTexture, redOffset).r;
    float g = texture2D(uTexture, greenOffset).g;
    float b = texture2D(uTexture, blueOffset).b;
    
    // Adicionar leve glow nos bordos baseado no mouse
    float vignette = 1.0 - length(vUv - 0.5) * 0.8;
    
    gl_FragColor = vec4(r, g, b, 1.0) * vignette;
  }
`;

// Componente interno que usa os hooks do Three.js
function ChromaPlaneInner({ texture }: { texture: THREE.Texture }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  // Detectar mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  }, []);

  // Criar uniforms uma vez
  const uniforms = useRef({
    uTexture: { value: texture },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
    uIntensity: { value: isMobile ? 0.02 : 0.04 },
  });

  // Atualizar textura quando mudar
  useEffect(() => {
    uniforms.current.uTexture.value = texture;
  }, [texture]);

  // Mouse tracking
  useEffect(() => {
    if (isMobile) return;
    
    let targetX = 0;
    let targetY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Animação contínua para interpolar mouse
    let animationId: number;
    const animate = () => {
      uniforms.current.uMouse.value.x += (targetX - uniforms.current.uMouse.value.x) * 0.08;
      uniforms.current.uMouse.value.y += (targetY - uniforms.current.uMouse.value.y) * 0.08;
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isMobile]);

  // Animation frame para time
  useFrame((state) => {
    uniforms.current.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
      />
    </mesh>
  );
}

// Componente que carrega a textura
function ChromaPlane({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  return <ChromaPlaneInner texture={texture} />;
}

// Loading component
function ChromaHeroLoading() {
  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

// Fallback para quando WebGL falhar
function FallbackImage({ imageUrl }: { imageUrl: string }) {
  return (
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${imageUrl})` }}
    />
  );
}

export default function ChromaHero() {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="absolute inset-0 z-0">
      {!hasError ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 1] }}
          onCreated={() => console.log('Canvas created')}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          onError={(e) => {
            console.error('Canvas error:', e);
            setHasError(true);
          }}
        >
          <Suspense fallback={null}>
            <ChromaPlane imageUrl={heroPortrait} />
          </Suspense>
        </Canvas>
      ) : (
        <FallbackImage imageUrl={heroPortrait} />
      )}
    </div>
  );
}
