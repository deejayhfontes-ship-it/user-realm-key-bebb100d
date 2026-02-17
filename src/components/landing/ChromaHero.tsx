import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import heroPortrait from "@/assets/hero-portrait.jpg";
import { useIsMobile } from '@/hooks/use-mobile';

// Shader estilo Magnetto - speed lines horizontais
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
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Mouse position normalizado
    vec2 mousePos = uMouse * 0.5 + 0.5;
    float dist = distance(uv, mousePos);
    
    // Influência baseada na proximidade do mouse
    float influence = smoothstep(0.5, 0.0, dist) * uHover;
    
    // Speed lines horizontais - intensidade 2x
    float speedIntensity = influence * 0.05;
    
    // Offset horizontal para criar "rastros"
    float horizontalSmear = speedIntensity * (1.0 + sin(uv.y * 30.0 + uTime * 1.5) * 0.3);
    
    // RGB split 2x mais forte
    vec2 redOffset = uv + vec2(horizontalSmear * 1.0, 0.0);
    vec2 greenOffset = uv;
    vec2 blueOffset = uv - vec2(horizontalSmear * 0.8, 0.0);
    
    // Samplear canais separados
    float r = texture2D(uTexture, redOffset).r;
    float g = texture2D(uTexture, greenOffset).g;
    float b = texture2D(uTexture, blueOffset).b;
    float a = texture2D(uTexture, uv).a;
    
    // Tint mínimo
    float edgeTint = smoothstep(0.0, 0.5, influence) * 0.05;
    vec3 tint = vec3(
      edgeTint * 0.05,
      edgeTint * 0.1,
      edgeTint * 0.15
    );
    
    vec3 finalColor = vec3(r, g, b) + tint;
    
    gl_FragColor = vec4(finalColor, a);
  }
`;

// Componente interno que usa os hooks do Three.js
function ChromaPlaneInner({ texture }: { texture: THREE.Texture }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();
  
  // Calcula aspect ratio da imagem
  const img = texture.image as HTMLImageElement | undefined;
  const imageAspect = img ? img.width / img.height : 1;
  const viewportAspect = viewport.width / viewport.height;
  
  // Escala para cobrir viewport mantendo aspect ratio (object-fit: cover)
  let scaleX: number, scaleY: number;
  if (viewportAspect > imageAspect) {
    // Viewport mais largo que imagem - ajusta pela largura
    scaleX = viewport.width;
    scaleY = viewport.width / imageAspect;
  } else {
    // Viewport mais alto que imagem - ajusta pela altura
    scaleY = viewport.height;
    scaleX = viewport.height * imageAspect;
  }
  
  const uniforms = useRef({
    uTexture: { value: texture },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
  });

  useFrame((state) => {
    uniforms.current.uTime.value = state.clock.elapsedTime;
  });

  useEffect(() => {
    uniforms.current.uTexture.value = texture;
  }, [texture]);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let isHovering = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -(e.clientY / window.innerHeight) * 2 + 1;
      isHovering = 1;
    };

    const handleMouseLeave = () => {
      isHovering = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    
    let animationId: number;
    const animate = () => {
      uniforms.current.uMouse.value.x += (targetX - uniforms.current.uMouse.value.x) * 0.05;
      uniforms.current.uMouse.value.y += (targetY - uniforms.current.uMouse.value.y) * 0.05;
      uniforms.current.uHover.value += (isHovering - uniforms.current.uHover.value) * 0.06;
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Offset vertical apenas para desktop (>=1280px), não tablet
  const verticalOffset = size.width >= 1280 ? -viewport.height * 0.18 : 0;

  return (
    <mesh ref={meshRef} scale={[scaleX, scaleY, 1]} position={[0, verticalOffset, 0]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
      />
    </mesh>
  );
}

function ChromaPlane({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  return <ChromaPlaneInner texture={texture} />;
}

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
  const isMobile = useIsMobile();

  // Desativa WebGL em mobile para compatibilidade com navegadores
  const useStaticImage = isMobile || hasError;

  return (
    <div className="absolute inset-0 z-0" style={{ backgroundColor: '#b8b8b8' }}>
      {/* Canvas WebGL fullscreen - apenas desktop */}
      <div className="absolute inset-0">
        {!useStaticImage ? (
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 1] }}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "high-performance",
              failIfMajorPerformanceCaveat: true,
            }}
            onError={() => setHasError(true)}
            style={{ background: 'transparent' }}
          >
            <Suspense fallback={null}>
              <ChromaPlane imageUrl={heroPortrait} />
            </Suspense>
          </Canvas>
        ) : (
          <FallbackImage imageUrl={heroPortrait} />
        )}
      </div>
      
      {/* Overlay de texto - à esquerda */}
      <div className="absolute inset-0 flex items-center pointer-events-none z-[5]">
        <div className="pl-8 md:pl-16 lg:pl-24 xl:pl-32">
          <h1 
            className="text-6xl sm:text-7xl md:text-8xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-black leading-[0.9] text-left"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            FONTES
            <br />
            GRAPHICS
          </h1>
          
          {/* Subtítulo discreto */}
          <p 
            className="mt-4 md:mt-6 text-sm md:text-base lg:text-lg tracking-[0.15em] uppercase font-semibold"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#1a1a1a',
            }}
          >
            AQUI, VOCÊ CRIA O FUTURO VISUAL
          </p>
        </div>
      </div>
    </div>
  );
}
