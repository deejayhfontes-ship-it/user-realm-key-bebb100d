import { useEffect, useRef } from "react";

interface CursorDistortionProps {
  imageSrc: string;
}

const CursorDistortion = ({ imageSrc }: CursorDistortionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;

      varying vec2 v_texCoord;

      uniform sampler2D u_image;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_intensity;
      uniform vec2 u_resolution;
      uniform vec2 u_imageSize;

      vec2 getCoverUV(vec2 uv, vec2 resolution, vec2 imageSize) {
        float screenAspect = resolution.x / resolution.y;
        float imageAspect = imageSize.x / imageSize.y;

        vec2 scale = vec2(1.0);
        vec2 offset = vec2(0.0);

        if (screenAspect > imageAspect) {
          scale.y = imageAspect / screenAspect;
          offset.y = (1.0 - scale.y) * 0.5;
        } else {
          scale.x = screenAspect / imageAspect;
          offset.x = (1.0 - scale.x) * 0.5;
        }

        vec2 imageUV = (uv - offset) / scale;

        if (
          imageUV.x < 0.0 || imageUV.x > 1.0 ||
          imageUV.y < 0.0 || imageUV.y > 1.0
        ) {
          return vec2(-1.0);
        }

        return imageUV;
      }

      void main() {
        vec2 uv = getCoverUV(v_texCoord, u_resolution, u_imageSize);
        if (uv.x < 0.0) {
          gl_FragColor = vec4(0.0);
          return;
        }

        vec2 mouseNorm = u_mouse / u_resolution;
        mouseNorm.y = 1.0 - mouseNorm.y;

        float dist = distance(v_texCoord, mouseNorm);
        float radius = 0.25;
        float strength = u_intensity * 0.04;
        float effect = smoothstep(radius, 0.0, dist);

        vec2 dir = normalize(v_texCoord - mouseNorm);
        float wave = sin(dist * 20.0 - u_time * 2.0) * 0.5 + 0.5;

        vec2 displacement = dir * effect * strength * wave;

        float turbulence =
          sin(uv.x * 10.0 + u_time) *
          cos(uv.y * 10.0 + u_time * 0.7) *
          0.003 * effect;

        vec2 finalUV = clamp(uv + displacement + vec2(turbulence), 0.0, 1.0);

        float aberration = effect * 0.008;

        float r = texture2D(u_image, clamp(finalUV + vec2(aberration, 0.0), 0.0, 1.0)).r;
        float g = texture2D(u_image, finalUV).g;
        float b = texture2D(u_image, clamp(finalUV - vec2(aberration, 0.0), 0.0, 1.0)).b;
        float a = texture2D(u_image, finalUV).a;

        gl_FragColor = vec4(r, g, b, a);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positions = new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]);

    const texCoords = new Float32Array([
      0, 1, 1, 1, 0, 0,
      0, 0, 1, 1, 1, 0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const intensityLocation = gl.getUniformLocation(program, "u_intensity");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const imageSizeLocation = gl.getUniformLocation(program, "u_imageSize");

    const texture = gl.createTexture();
    const image = new Image();
    image.crossOrigin = "anonymous";

    let imageLoaded = false;
    let imageWidth = 0;
    let imageHeight = 0;

    image.onload = () => {
      imageWidth = image.naturalWidth;
      imageHeight = image.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      imageLoaded = true;
    };

    image.src = imageSrc;

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let intensity = 0;
    let targetIntensity = 0;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      targetIntensity = 1;
    };

    const onLeave = () => {
      targetIntensity = 0;
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    let startTime = Date.now();
    let animationId: number;

    const render = () => {
      if (!imageLoaded) {
        animationId = requestAnimationFrame(render);
        return;
      }

      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;
      intensity += (targetIntensity - intensity) * 0.05;

      const time = (Date.now() - startTime) * 0.001;
      const dpr = Math.min(window.devicePixelRatio, 2);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(mouseLocation, mouseX * dpr, mouseY * dpr);
      gl.uniform1f(timeLocation, time);
      gl.uniform1f(intensityLocation, intensity);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(imageSizeLocation, imageWidth, imageHeight);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(animationId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteTexture(texture);
    };
  }, [imageSrc]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default CursorDistortion;
