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

function ChromaPlane({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();
  
  // Detectar mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  }, []);

  // Carregar textura
  const texture = useTexture(imageUrl);

  // Memoizar uniforms para performance
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uIntensity: { value: isMobile ? 0.02 : 0.04 },
    }),
    [texture, isMobile]
  );

  // Mouse tracking com lerp (suavização)
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Animation frame
  useFrame((state) => {
    if (!materialRef.current) return;
    
    const material = materialRef.current;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    
    const targetX = mouseRef.current.x;
    const targetY = mouseRef.current.y;
    
    material.uniforms.uMouse.value.x += (targetX - material.uniforms.uMouse.value.x) * 0.05;
    material.uniforms.uMouse.value.y += (targetY - material.uniforms.uMouse.value.y) * 0.05;
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
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
        <Suspense fallback={<ChromaHeroLoading />}>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 1] }}
            onError={() => setHasError(true)}
            gl={{
              antialias: false,
              alpha: false,
              powerPreference: "high-performance"
            }}
          >
            <Suspense fallback={null}>
              <ChromaPlane imageUrl={heroPortrait} />
            </Suspense>
          </Canvas>
        </Suspense>
      ) : (
        <FallbackImage imageUrl={heroPortrait} />
      )}
    </div>
  );
}
