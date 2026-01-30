import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import heroPortrait from "@/assets/hero-portrait.jpg";

// Shader para efeito cromático intenso no estilo Magnetto
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
    float influence = smoothstep(0.7, 0.0, dist) * uHover;
    
    // Chromatic Aberration forte - estilo glitch horizontal
    float aberration = influence * 0.04;
    vec2 direction = normalize(uv - mousePos + 0.001);
    
    // Offset horizontal dominante para efeito "speed lines"
    vec2 horizontalDir = vec2(direction.x * 1.5, direction.y * 0.3);
    
    // Múltiplas camadas de separação cromática
    vec2 redOffset = uv + horizontalDir * aberration * 1.5;
    vec2 greenOffset = uv;
    vec2 blueOffset = uv - horizontalDir * aberration * 1.2;
    
    // Efeito de "smear" / rastro horizontal intenso
    float smear = influence * 0.025;
    
    // Samplear com offset para efeito de rastro RGB
    float r = texture2D(uTexture, redOffset + vec2(smear, 0.0)).r;
    float g = texture2D(uTexture, greenOffset).g;
    float b = texture2D(uTexture, blueOffset - vec2(smear * 0.5, 0.0)).b;
    
    // Efeito de linhas de velocidade nas bordas
    float speedLines = smoothstep(0.2, 0.5, dist) * smoothstep(0.8, 0.4, dist) * influence;
    
    // Tint cyan/magenta nas bordas do efeito
    vec3 glitchTint = vec3(
      0.05 + sin(uTime * 0.8 + uv.x * 5.0) * 0.03,
      0.1 + sin(uTime * 0.5 + uv.y * 3.0) * 0.05,
      0.15 + cos(uTime * 0.6 + uv.x * 4.0) * 0.05
    ) * speedLines;
    
    vec3 finalColor = vec3(r, g, b) + glitchTint;
    
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
      uniforms.current.uMouse.value.x += (targetX - uniforms.current.uMouse.value.x) * 0.06;
      uniforms.current.uMouse.value.y += (targetY - uniforms.current.uMouse.value.y) * 0.06;
      uniforms.current.uHover.value += (isHovering - uniforms.current.uHover.value) * 0.08;
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Calcular aspect ratio - CONTAIN: figura completa sempre visível
  const img = texture.image as HTMLImageElement | undefined;
  const imageAspect = img?.width && img?.height ? img.width / img.height : 0.75;
  
  // A imagem deve ocupar no máximo 85% do espaço disponível no canvas
  const maxWidth = viewport.width * 0.85;
  const maxHeight = viewport.height * 0.85;
  
  let scaleX: number;
  let scaleY: number;
  
  // Calcular dimensões mantendo proporção (contain)
  const widthFromHeight = maxHeight * imageAspect;
  const heightFromWidth = maxWidth / imageAspect;
  
  if (widthFromHeight <= maxWidth) {
    // Limitado pela altura
    scaleX = widthFromHeight;
    scaleY = maxHeight;
  } else {
    // Limitado pela largura
    scaleX = maxWidth;
    scaleY = heightFromWidth;
  }

  return (
    <mesh ref={meshRef} scale={[scaleX, scaleY, 1]} position={[0, 0, 0]}>
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
      className="w-full h-full flex items-center justify-center"
    >
      <img 
        src={imageUrl} 
        alt="Hero" 
        className="max-h-[90%] max-w-full object-contain"
      />
    </div>
  );
}

export default function ChromaHero() {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="absolute inset-0 z-0 bg-[#3a3a3a]">
      {/* Gradient vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)'
        }}
      />
      
      {/* Layout principal: 30% | 40% | 30% */}
      <div className="absolute inset-0 flex items-center">
        
        {/* Coluna Esquerda - 30% - Título */}
        <div className="w-[30%] h-full flex flex-col justify-center pl-8 md:pl-12 lg:pl-20 z-10">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-black leading-[0.9] text-left"
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            FONTES
            <br />
            GRAPHICS
          </h1>
          
          {/* Badge verde neon com subtítulo */}
          <div className="mt-4 md:mt-6">
            <span 
              className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-medium tracking-wider uppercase"
              style={{
                backgroundColor: '#a3e635',
                color: '#000000',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              AQUI, VOCÊ CRIA O FUTURO VISUAL
            </span>
          </div>
        </div>
        
        {/* Coluna Central - 40% - Imagem com efeito */}
        <div className="w-[40%] h-full relative">
          {!hasError ? (
            <Canvas
              dpr={[1, 1.5]}
              camera={{ position: [0, 0, 1] }}
              gl={{
                antialias: false,
                alpha: true,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: false,
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
        
        {/* Coluna Direita - 30% - Limpa para equilíbrio */}
        <div className="w-[30%] h-full" />
        
      </div>
    </div>
  );
}
