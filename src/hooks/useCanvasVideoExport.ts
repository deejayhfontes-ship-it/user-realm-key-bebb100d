// Exportação de vídeo no navegador: canvas.captureStream + MediaRecorder.
// MP4 quando o navegador suportar (Chrome/Safari); fallback WebM (Firefox).

export interface VideoExportResult {
  blob: Blob;
  mimeType: string;
  extension: "mp4" | "webm";
}

export interface ExportVideoOptions {
  canvas: HTMLCanvasElement;
  durationMs: number;
  fps?: number;
  draw: (tMs: number) => void;
  onProgress?: (progress: number) => void;
}

// Ordem de preferência: MP4 nativo primeiro (Instagram/WhatsApp aceitam direto)
const MIME_CANDIDATES: { mimeType: string; extension: "mp4" | "webm" }[] = [
  { mimeType: "video/mp4;codecs=avc1.42E01E", extension: "mp4" },
  { mimeType: "video/mp4", extension: "mp4" },
  { mimeType: "video/webm;codecs=vp9", extension: "webm" },
  { mimeType: "video/webm;codecs=vp8", extension: "webm" },
  { mimeType: "video/webm", extension: "webm" },
];

export function pickSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) return candidate;
  }
  return null;
}

export function exportVideo({
  canvas,
  durationMs,
  fps = 30,
  draw,
  onProgress,
}: ExportVideoOptions): Promise<VideoExportResult> {
  return new Promise((resolve, reject) => {
    const picked = pickSupportedMimeType();
    if (!picked) {
      reject(new Error("Este navegador não suporta gravação de vídeo (MediaRecorder)."));
      return;
    }

    // Primeiro frame antes de capturar o stream, para não gravar canvas vazio
    draw(0);

    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, {
      mimeType: picked.mimeType,
      videoBitsPerSecond: 8_000_000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => {
      stream.getTracks().forEach((track) => track.stop());
      reject(new Error("Erro na gravação do vídeo."));
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve({
        blob: new Blob(chunks, { type: picked.mimeType }),
        mimeType: picked.mimeType,
        extension: picked.extension,
      });
    };

    // timeslice de 1s: chunks incrementais em vez de um blob gigante no final
    recorder.start(1000);

    // Relógio real: se o rAF cair de fps, a duração/velocidade do vídeo não muda
    const startTime = performance.now();
    let rafId = 0;
    let intervalId: number | undefined;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(rafId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
      onProgress?.(1);
      // Garante que o último frame entre na gravação antes do stop
      window.setTimeout(() => recorder.stop(), 120);
    };

    const tick = () => {
      const t = performance.now() - startTime;
      if (t >= durationMs) {
        draw(durationMs - 1);
        finish();
        return;
      }
      draw(t);
      onProgress?.(t / durationMs);
    };

    const rafLoop = () => {
      tick();
      if (!finished) rafId = requestAnimationFrame(rafLoop);
    };
    rafLoop();

    // Aba em segundo plano congela o rAF; setInterval mantém o desenho andando
    intervalId = window.setInterval(() => {
      if (document.hidden) tick();
    }, 1000 / fps);
  });
}
