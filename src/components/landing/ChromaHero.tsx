import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import heroPortrait from "@/assets/hero-portrait.jpg";

// Shader para efeito cromático sutil (apenas separação de cores, sem distorção)
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
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Calcular distância do mouse para efeito localizado
    vec2 mousePos = uMouse * 0.5 + 0.5; // Converter de -1,1 para 0,1
    float dist = distance(uv, mousePos);
    float influence = smoothstep(0.5, 0.0, dist) * uHover;
    
    // Chromatic Aberration sutil - apenas separação de cores RGB
    float aberration = influence * 0.008; // Intensidade bem sutil
    vec2 direction = normalize(uv - mousePos + 0.001);
    
    vec2 redOffset = uv + direction * aberration;
    vec2 greenOffset = uv;
    vec2 blueOffset = uv - direction * aberration;
    
    // Samplear textura com offsets diferentes para cada canal
    float r = texture2D(uTexture, redOffset).r;
    float g = texture2D(uTexture, greenOffset).g;
    float b = texture2D(uTexture, blueOffset).b;
    
    // Adicionar leve brilho prisma nas bordas do efeito
    float prismGlow = influence * 0.15;
    vec3 prismColor = vec3(
      r + prismGlow * 0.3,
      g + prismGlow * 0.1,
      b + prismGlow * 0.4
    );
    
    gl_FragColor = vec4(prismColor, 1.0);
  }
`;

// Componente interno que usa os hooks do Three.js
function ChromaPlaneInner({ texture }: { texture: THREE.Texture }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  // Criar uniforms
  const uniforms = useRef({
    uTexture: { value: texture },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 },
  });

  // Atualizar textura quando mudar
  useEffect(() => {
    uniforms.current.uTexture.value = texture;
  }, [texture]);

  // Mouse tracking com hover detection
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
    
    // Animação contínua para interpolar
    let animationId: number;
    const animate = () => {
      uniforms.current.uMouse.value.x += (targetX - uniforms.current.uMouse.value.x) * 0.08;
      uniforms.current.uMouse.value.y += (targetY - uniforms.current.uMouse.value.y) * 0.08;
      uniforms.current.uHover.value += (isHovering - uniforms.current.uHover.value) * 0.1;
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Calcular aspect ratio para manter proporção da imagem
  const img = texture.image as HTMLImageElement | undefined;
  const imageAspect = img?.width && img?.height ? img.width / img.height : 0.8;
  const viewportAspect = viewport.width / viewport.height;
  
  let scaleX = viewport.width;
  let scaleY = viewport.height;
  
  if (imageAspect > viewportAspect) {
    scaleX = viewport.height * imageAspect;
  } else {
    scaleY = viewport.width / imageAspect;
  }

  return (
    <mesh ref={meshRef} scale={[scaleX, scaleY, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
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
      {/* WebGL Canvas com efeito cromático */}
      {!hasError ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 1] }}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          onError={() => setHasError(true)}
        >
          <Suspense fallback={null}>
            <ChromaPlane imageUrl={heroPortrait} />
          </Suspense>
        </Canvas>
      ) : (
        <FallbackImage imageUrl={heroPortrait} />
      )}
      
      {/* Overlay com título e subtítulo */}
      <div className="absolute inset-0 flex flex-col justify-center pointer-events-none">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-xl">
            {/* Título principal */}
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-4"
              style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                textShadow: '0 4px 30px rgba(0,0,0,0.5)'
              }}
            >
              FONTES
              <br />
              GRAPHICS
            </h1>
            
            {/* Subtítulo */}
            <p 
              className="text-lg md:text-xl text-white/80 tracking-widest uppercase"
              style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                textShadow: '0 2px 20px rgba(0,0,0,0.5)'
              }}
            >
              Aqui, você cria o futuro visual
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
