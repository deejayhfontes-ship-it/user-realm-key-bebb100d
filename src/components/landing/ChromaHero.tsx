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
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Calcular distância do mouse para efeito localizado
    vec2 mousePos = uMouse * 0.5 + 0.5;
    float dist = distance(uv, mousePos);
    
    // Raio de influência maior e mais suave
    float influence = smoothstep(0.6, 0.0, dist) * uHover;
    
    // Chromatic Aberration mais forte e interessante
    float aberration = influence * 0.025;
    vec2 direction = normalize(uv - mousePos + 0.001);
    
    // Múltiplas camadas de separação cromática
    vec2 redOffset = uv + direction * aberration * 1.2;
    vec2 greenOffset = uv + direction * aberration * 0.3;
    vec2 blueOffset = uv - direction * aberration * 1.0;
    
    // Efeito de "smear" / rastro prisma
    float smear = influence * 0.015;
    vec2 smearDir = vec2(direction.x * 0.8, direction.y * 0.5);
    
    // Samplear com offset adicional para efeito de rastro
    float r = texture2D(uTexture, redOffset + smearDir * smear).r;
    float g = texture2D(uTexture, greenOffset).g;
    float b = texture2D(uTexture, blueOffset - smearDir * smear * 0.5).b;
    
    // Brilho prisma dinâmico nas bordas
    float prismEdge = smoothstep(0.0, 0.4, dist) * smoothstep(0.6, 0.3, dist) * influence;
    
    // Cores do prisma (arco-íris sutil)
    vec3 prismTint = vec3(
      0.1 + sin(uTime * 0.5 + uv.x * 3.0) * 0.05,
      0.05 + sin(uTime * 0.7 + uv.y * 2.0) * 0.03,
      0.15 + cos(uTime * 0.6 + uv.x * 2.5) * 0.05
    ) * prismEdge * 0.8;
    
    vec3 finalColor = vec3(r, g, b) + prismTint;
    
    gl_FragColor = vec4(finalColor, 1.0);
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
    uTime: { value: 0 },
  });

  // Atualizar time para animação
  useFrame((state) => {
    uniforms.current.uTime.value = state.clock.elapsedTime;
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

  // Calcular aspect ratio - CONTAIN: nunca cortar a figura
  const img = texture.image as HTMLImageElement | undefined;
  const imageAspect = img?.width && img?.height ? img.width / img.height : 0.75;
  const viewportAspect = viewport.width / viewport.height;
  
  // Contain logic: figura completa sempre visível
  // Deixar espaço à direita para o texto (60% da largura para imagem)
  const maxWidthPercent = 0.6;
  const availableWidth = viewport.width * maxWidthPercent;
  const availableHeight = viewport.height * 0.95; // Margem vertical
  
  let scaleX: number;
  let scaleY: number;
  
  const fitByWidth = availableWidth;
  const fitByWidthHeight = fitByWidth / imageAspect;
  
  const fitByHeight = availableHeight;
  const fitByHeightWidth = fitByHeight * imageAspect;
  
  if (fitByWidthHeight <= availableHeight) {
    // Cabe pela largura
    scaleX = fitByWidth;
    scaleY = fitByWidthHeight;
  } else {
    // Cabe pela altura
    scaleX = fitByHeightWidth;
    scaleY = fitByHeight;
  }

  // Posicionar à esquerda do viewport
  const offsetX = -viewport.width * 0.2;

  return (
    <mesh ref={meshRef} scale={[scaleX, scaleY, 1]} position={[offsetX, 0, 0]}>
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
      
      {/* Overlay com título e subtítulo - posicionado à direita, sem sobreposição */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        {/* Área esquerda reservada para imagem */}
        <div className="w-[55%] md:w-[60%]" />
        
        {/* Área direita para texto */}
        <div className="w-[45%] md:w-[40%] flex flex-col justify-center pr-6 md:pr-12 lg:pr-20">
          {/* Título principal - único */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-black leading-none"
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            FONTES
            <br />
            GRAPHICS
          </h1>
          
          {/* Subtítulo */}
          <p 
            className="mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-zinc-900 tracking-[0.2em] uppercase font-medium"
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            AQUI, VOCÊ CRIA O FUTURO VISUAL
          </p>
        </div>
      </div>
    </div>
  );
}
