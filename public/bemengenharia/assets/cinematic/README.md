# assets/cinematic — onde entram os assets gerados manualmente

O site funciona sem nenhum arquivo aqui: enquanto um asset não existe, `cinematic.js`
usa `placeholders/scene-NN-{start,end}.svg`. Basta soltar os arquivos com os nomes
abaixo. Nenhum código precisa ser editado.

| Cena | Onde aparece no site | Arquivos esperados |
|---|---|---|
| 01 | HERO (fixado, scrub por scroll) | `scene-01-start.webp`, `scene-01-end.webp`, `scene-01.mp4`, `scene-01-mobile.webp` |
| 02 | Interlúdio MEDIÇÃO (fixado) | `scene-02-start.webp`, `scene-02-end.webp`, `scene-02.mp4`, `scene-02-mobile.webp` |
| 03 | Interlúdio DADOS (fixado, curvas SVG por cima) | `scene-03-start.webp`, `scene-03-end.webp`, `scene-03.mp4`, `scene-03-mobile.webp` |
| 04 | Painel fixo ao lado da lista de SERVIÇOS | `scene-04-start.webp`, `scene-04-end.webp`, `scene-04.mp4`, `scene-04-mobile.webp` |
| 05 | Fundo da seção IMPACTO | `scene-05-start.webp`, `scene-05-end.webp`, `scene-05.mp4`, `scene-05-mobile.webp` |
| 06 | Fundo da CTA FINAL | `scene-06-start.webp`, `scene-06-end.webp`, `scene-06.mp4`, `scene-06-mobile.webp` |

## Ordem de prioridade (o que carregar em cada situação)

- **Desktop com movimento:** `scene-NN.mp4` (scrub por scroll). Se não existir, crossfade `start` → `end`.
- **Mobile:** nunca carrega mp4. Usa `scene-NN-mobile.webp` como frame final; se não existir, `scene-NN-end.webp`.
- **prefers-reduced-motion:** só `scene-NN-end.webp` (ou mobile), sem vídeo, sem scrub, sem fixação.
- **Arquivo ausente:** cai no placeholder SVG correspondente.

## Especificações

- **Frames (`start` / `end`):** WEBP, 2560×1440 (16:9), qualidade 82, sRGB. Peso alvo ≤ 450 KB.
- **Mobile (`-mobile`):** WEBP, 1080×1920 (9:16), qualidade 82. Peso alvo ≤ 250 KB.
- **Vídeo (`.mp4`):** H.264 High, 1280×720 ou 1920×1080, 24 fps, 5–10 s, **sem áudio**, `-movflags +faststart`,
  **todo frame keyframe** (`-g 1 -bf 0`) para o scrub por scroll não travar. Peso ~6–8 MB por cena em 720p.
  Exemplo ffmpeg:

  ```
  ffmpeg -i scene-01-raw.mp4 -an -c:v libx264 -profile:v high -preset medium -crf 21 -g 1 -keyint_min 1 -bf 0 -sc_threshold 0 -tune fastdecode -pix_fmt yuv420p -movflags +faststart scene-01.mp4
  ```

- **Primeiro frame do mp4 = `start.webp`; último frame = `end.webp`.** O crossfade dos frames e o vídeo têm de bater.

## Assets estáticos (pasta `../static/`)

| Arquivo | Onde | Tamanho |
|---|---|---|
| `og-image.jpg` | preview de link (WhatsApp/redes) | 1200×630 JPG |
| `surface-topo.webp` | fundo sutil da seção PROCESSO (16% opacidade) | 2400×1350 |
| `prism-detail.webp` | figura na coluna esquerda de ATENDIMENTO (desktop) | 1200×1500 (4:5) |

Os prompts completos de todos os assets estão em `../../VISUAL-PROMPTS.md`.
