# BEM Topografia e Engenharia — landing page cinematográfica

Site one-page estático (HTML + CSS + JS puros, caminhos relativos, sem build). Funciona
aberto direto do arquivo, em qualquer hosting estático, ou em subpasta (`/bemengenharia/`).

## Estrutura

```
index.html            página inteira (10 seções + 2 interlúdios de cena)
styles.css            design system + camada cinematográfica (bloco final do arquivo)
main.js               interações: header, menu, reveal, acordeão, formulário → WhatsApp
cinematic.js          engine das cenas (scroll-driven, placeholders, fallbacks)
assets/               logos oficiais + identidade-aplicada.webp
assets/cinematic/     frames e vídeos das 6 cenas (ver README interno) + placeholders/
assets/static/        imagens estáticas opcionais (og-image, surface-topo, prism-detail)
VISUAL-PROMPTS.md     prompts completos para gerar todos os assets manualmente
```

## Ordem da experiência

| # | Seção | Cena |
|---|---|---|
| 01 | HERO — PRECISÃO PARA TRANSFORMAR TERRITÓRIOS. | SEQ 01 (fixado, scrub) |
| 02 | MANIFESTO — Antes de construir, é preciso entender. | — |
| — | Interlúdio MEDIÇÃO | SEQ 02 (fixado) |
| 03 | SERVIÇOS — lista editorial com painel fixo | SEQ 04 (painel) |
| — | Interlúdio DADOS — curvas/grid/pontos em SVG | SEQ 03 (fixado) |
| 04 | PRECISÃO — 4 pilares | — |
| 05 | PROCESSO — linha topográfica em 5 etapas | fundo estático opcional |
| 06 | IMPACTO — Cada centímetro conta. | SEQ 05 (fundo) |
| 07 | PROJETOS — estrutura pronta, sem cases inventados | — |
| 08 | SOBRE | — |
| 09 | ATENDIMENTO — formulário → WhatsApp | figura estática opcional |
| 10 | CTA FINAL — Seu projeto começa pelo terreno. | SEQ 06 (fundo) |

## Bibliotecas

GSAP 3.12 + ScrollTrigger (cdnjs) e Lenis 1.1 (jsdelivr), carregadas com `defer`.
Se a CDN falhar ou o navegador bloquear, `cinematic.js` usa scroll nativo e a página
continua íntegra. Em `prefers-reduced-motion: reduce` não há fixação, scrub nem vídeo.

## Informações confirmadas vs. provisórias

Confirmado: nome, cidade (Pouso Alegre · MG), WhatsApp (+55 35 9892-0557), Instagram
(@bem.topografia), logos oficiais.

Provisório (marcado no site): lista de serviços, quatro pilares, cases de projeto,
textos institucionais. Nenhum endereço, e-mail, CREA, equipe, cliente, obra, número ou
certificação foi inventado. Os microdados (PONTO / 004, GRID / 08, X / 428…) são gráficos.

## Contato

Formulário e botão WhatsApp abrem `wa.me/553598920557` com a mensagem preenchida. Para
envio por e-mail, ligar o `submit` em `main.js` a um serviço (Formspree, EmailJS, backend).

## Substituir os assets

Ver `assets/cinematic/README.md`. Nomes de arquivo fixos; sem edição de código.

## Instalar no servidor do cliente

Copiar a pasta inteira para a raiz (ou subpasta) do hosting. Trocar `og:image` no
`<head>` por URL absoluta do domínio final.
