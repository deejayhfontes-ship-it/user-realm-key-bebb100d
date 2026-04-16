import { forwardRef } from "react";
import type { PecaFormato, PecaData, PecaTom } from "./gerador-data";
import nuppeFasbLogo from "@/assets/faculdade/nuppe-fasb-logo.png";
import logonuppe2 from "@/assets/faculdade/logonuppe-2.png";
import sombraOverlay from "@/assets/faculdade/sombra.png";

interface PecaCanvasProps {
  peca: PecaData & { bgZoom?: number; bgPosX?: number; bgPosY?: number };
  formato: PecaFormato;
  scale?: number;
}

const formatDimensions: Record<PecaFormato, { w: number; h: number }> = {
  "1080x1080": { w: 1080, h: 1080 },
  "1080x1440": { w: 1080, h: 1440 },
  "1080x1920": { w: 1080, h: 1920 },
};

const tomAccents: Record<PecaTom, string> = {
  institucional: "hsl(190, 90%, 50%)",
  comercial: "hsl(190, 95%, 55%)",
  jovem: "hsl(175, 85%, 48%)",
  informativo: "hsl(195, 85%, 52%)",
};

const FT = "'Suisse Intl Condensed', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FB = "'Suisse Intl', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const PecaCanvas = forwardRef<HTMLDivElement, PecaCanvasProps>(
  ({ peca, formato, scale = 0.25 }, ref) => {
    const dim = formatDimensions[formato];
    const accent = tomAccents[peca.tom];
    const sq = formato === "1080x1080";
    const st = formato === "1080x1920";
    const h = dim.h;
    const u = h <= 1440 ? h / 100 : 14.4 + (h - 1440) / 200;

    /* ── Glass card ── */
    const glass = (extra?: React.CSSProperties): React.CSSProperties => ({
      background: "hsla(225, 18%, 28%, 0.5)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      borderRadius: u * 1.2,
      border: "1px solid hsla(0, 0%, 100%, 0.1)",
      ...extra,
    });

    /* Proporções normalizadas — consistentes entre formatos */
    const titleFontSize = u * 8;
    const cardWidth = u * 34;
    const padding = u * 3;

    const splitSubtitle = (text?: string) => {
      const value = (text || "QUALIFICAÇÃO QUE TRANSFORMA").toUpperCase().trim();
      if (value.includes("\n")) return value;

      const words = value.split(/\s+/).filter(Boolean);
      if (words.length <= 3) return value;

      let bestIndex = 1;
      let bestDiff = Infinity;

      for (let i = 1; i < words.length; i += 1) {
        const left = words.slice(0, i).join(" ");
        const right = words.slice(i).join(" ");
        const diff = Math.abs(left.length - right.length);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestIndex = i;
        }
      }

      return `${words.slice(0, bestIndex).join(" ")}\n${words.slice(bestIndex).join(" ")}`;
    };

    const renderContent = () => {
      switch (peca.tipo) {

        /* ═══ CAPA ═══
           Ref: logo topo-centro pequena
                Zona inferior: título GIGANTE bold caixa alta à esquerda
                + + + e ( subtítulo ) entre título e card
                Glass card à direita com header URL + lista de 3 itens */
        case "capa":
          return (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding }}>
              {/* Logo topo centro */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: u * 1.5 }}>
                <img src={nuppeFasbLogo} alt="" style={{ height: u * 8, objectFit: "contain", opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
              </div>

              {/* Spacer superior — empurra título pra baixo do centro */}
              <div style={{ flex: 4 }} />

              {/* Logo + subtítulo alinhados à esquerda */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingTop: u * 6, gap: u * 1 }}>
                <img src={logonuppe2} alt="" style={{
                  height: u * 9, objectFit: "contain",
                  filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.5))",
                }} />
                <div style={{
                  fontFamily: FB, fontWeight: 500, fontSize: u * 2.0, color: "hsl(190, 90%, 50%)",
                  textAlign: "left", whiteSpace: "pre-line", wordBreak: "normal", maxWidth: u * 26,
                  textShadow: "0 1px 8px rgba(0,0,0,0.5)", letterSpacing: "0.08em", lineHeight: 1.2,
                  marginTop: u * 1,
                }}>
                  {splitSubtitle(peca.textos.subtitulo)}
                </div>
              </div>

              {/* Spacer inferior */}
              <div style={{ flex: 0.5 }} />

              {/* Box na base */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: cardWidth, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: u * 1 }}>
                  {/* Decorativo */}
                  <div style={{ textAlign: "right", marginBottom: u * 0.8 }}>
                    <span style={{ fontFamily: FB, fontWeight: 300, fontSize: u * 1.2, color: "hsla(0,0%,100%,0.55)", letterSpacing: "0.5em", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>+ + +</span>
                  </div>

                  {/* Glass card */}
                  <div style={{ ...glass({ padding: `${u * 1.8}px ${u * 2.2}px`, width: "100%" }) }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      paddingBottom: u * 0.8, marginBottom: u * 0.8,
                      borderBottom: "1px solid hsla(0,0%,100%,0.12)",
                    }}>
                      <span style={{ fontFamily: FB, fontWeight: 200, fontSize: u * 2, color: "hsla(0,0%,100%,0.4)" }}>+</span>
                    </div>
                    {["Qualificação", "Crescimento", "Flexibilidade"].map((item, i, arr) => (
                      <div key={i} style={{
                        padding: `${u * 1}px 0`,
                        borderBottom: i < arr.length - 1 ? "1px solid hsla(0,0%,100%,0.07)" : "none",
                      }}>
                        <span style={{ fontFamily: FB, fontWeight: 500, fontSize: u * 3, color: "white", lineHeight: 1.3 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Margem inferior */}
              <div style={{ height: u * 10 }} />
            </div>
          );

        /* ═══ BENEFÍCIOS ═══ */
        case "beneficios":
          return (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding }}>
              <div style={{ display: "flex", justifyContent: "center", paddingTop: u * 0.5 }}>
                <img src={nuppeFasbLogo} alt="" style={{ height: u * 8, objectFit: "contain", opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
              </div>
              <div style={{ flex: 4 }} />
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <h2 style={{
                  fontFamily: FT, fontWeight: 700,
                  fontSize: titleFontSize * 0.85, color: "white",
                  lineHeight: 0.9, textTransform: "uppercase",
                  letterSpacing: "-0.02em", margin: 0,
                }}>{peca.textos.titulo}</h2>
              </div>
              <div style={{ flex: 0.5 }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: cardWidth }}>
                  <div style={{ ...glass({ padding: `${u * 1.8}px ${u * 2.2}px` }) }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      paddingBottom: u * 0.8, marginBottom: u * 0.8,
                      borderBottom: "1px solid hsla(0,0%,100%,0.12)",
                    }}>
                      <span style={{ fontFamily: FB, fontWeight: 400, fontSize: u * 1.5, color: "hsla(0,0%,100%,0.5)" }}>Diferenciais</span>
                      <span style={{ fontFamily: FB, fontWeight: 200, fontSize: u * 2, color: "hsla(0,0%,100%,0.4)" }}>+</span>
                    </div>
                    {["item1", "item2", "item3", "item4"].map((key, i) => (
                      <div key={key} style={{
                        padding: `${u * 0.9}px 0`,
                        borderBottom: i < 3 ? "1px solid hsla(0,0%,100%,0.07)" : "none",
                      }}>
                        <span style={{ fontFamily: FB, fontWeight: 500, fontSize: u * 2.5, color: "white", lineHeight: 1.3 }}>{peca.textos[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ height: u * 5 }} />
            </div>
          );

        /* ═══ CURSOS ═══ */
        case "cursos":
          return (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding }}>
              <div style={{ display: "flex", justifyContent: "center", paddingTop: u * 0.5 }}>
                <img src={nuppeFasbLogo} alt="" style={{ height: u * 8, objectFit: "contain", opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
              </div>
              <div style={{ flex: 4 }} />
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <h2 style={{
                  fontFamily: FT, fontWeight: 700,
                  fontSize: titleFontSize * 0.85, color: "white",
                  lineHeight: 0.9, textTransform: "uppercase",
                  letterSpacing: "-0.02em", margin: 0,
                }}>{peca.textos.titulo}</h2>
              </div>
              <div style={{ flex: 0.5 }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: cardWidth }}>
                  <div style={{ ...glass({ padding: `${u * 1.8}px ${u * 2.2}px` }) }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      paddingBottom: u * 0.8, marginBottom: u * 0.8,
                      borderBottom: "1px solid hsla(0,0%,100%,0.12)",
                    }}>
                      <span style={{ fontFamily: FB, fontWeight: 400, fontSize: u * 1.5, color: "hsla(0,0%,100%,0.5)" }}>Cursos disponíveis</span>
                      <span style={{ fontFamily: FB, fontWeight: 200, fontSize: u * 2, color: "hsla(0,0%,100%,0.4)" }}>+</span>
                    </div>
                    {peca.textos.lista?.split("\n").map((line, i, arr) => (
                      <div key={i} style={{
                        padding: `${u * 0.9}px 0`,
                        borderBottom: i < arr.length - 1 ? "1px solid hsla(0,0%,100%,0.07)" : "none",
                      }}>
                        <span style={{ fontFamily: FB, fontWeight: 500, fontSize: u * 2.2, color: "white", lineHeight: 1.25 }}>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ height: u * 5 }} />
            </div>
          );

        /* ═══ DATAS ═══ */
        case "datas":
          return (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding }}>
              <div style={{ display: "flex", justifyContent: "center", paddingTop: u * 0.5 }}>
                <img src={nuppeFasbLogo} alt="" style={{ height: u * 8, objectFit: "contain", opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
              </div>
              <div style={{ flex: 4 }} />
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <h2 style={{
                  fontFamily: FT, fontWeight: 700,
                  fontSize: titleFontSize * 0.85, color: "white",
                  lineHeight: 0.9, textTransform: "uppercase",
                  letterSpacing: "-0.02em", margin: 0, whiteSpace: "pre-line",
                }}>{"DATAS\nIMPORTANTES"}</h2>
              </div>
              <div style={{ flex: 0.5 }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: cardWidth }}>
                  <div style={{ ...glass({ padding: `${u * 2}px ${u * 2.5}px` }) }}>
                    {[
                      { label: "MATRÍCULAS", value: peca.textos.matriculas },
                      { label: "INÍCIO DAS AULAS", value: peca.textos.inicioAulas },
                    ].map((item, i) => (
                      <div key={i} style={{
                        padding: `${u * 1.2}px 0`,
                        borderBottom: i === 0 ? "1px solid hsla(0,0%,100%,0.1)" : "none",
                      }}>
                        <span style={{
                          fontFamily: FB, fontWeight: 500, fontSize: u * 1.4,
                          color: accent, letterSpacing: "0.2em", display: "block", marginBottom: u * 0.4,
                        }}>{item.label}</span>
                        <span style={{
                          fontFamily: FT, fontWeight: 700,
                          fontSize: u * 4, color: "white", lineHeight: 1, display: "block",
                        }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ height: u * 5 }} />
            </div>
          );

        /* ═══ VALOR ═══ */
        case "valor":
          return (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding }}>
              <div style={{ display: "flex", justifyContent: "center", paddingTop: u * 0.5 }}>
                <img src={nuppeFasbLogo} alt="" style={{ height: u * 8, objectFit: "contain", opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
              </div>
              <div style={{ flex: 4 }} />
              <div style={{ display: "flex", alignItems: "flex-start", flexDirection: "column" }}>
                <span style={{
                  fontFamily: FB, fontSize: u * 1.8, fontWeight: 400,
                  color: "hsla(0,0%,100%,0.45)", letterSpacing: "0.1em",
                  textTransform: "uppercase", display: "block", marginBottom: u * 0.5,
                }}>Investimento</span>
                <h2 style={{
                  fontFamily: FT, fontWeight: 700,
                  fontSize: titleFontSize * 0.85, color: "white",
                  lineHeight: 0.9, margin: 0,
                }}>{peca.textos.valor}</h2>
              </div>
              <div style={{ flex: 0.5 }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: cardWidth }}>
                  <div style={{ ...glass({ padding: `${u * 2}px ${u * 2.5}px` }) }}>
                    <p style={{
                      fontFamily: FB, fontWeight: 400,
                      fontSize: u * 2, color: "hsla(0,0%,100%,0.7)",
                      lineHeight: 1.4, margin: 0, marginBottom: u * 1.5,
                    }}>{peca.textos.condicao}</p>
                    <div style={{
                      background: `${accent}20`, borderRadius: u * 0.8,
                      border: `1px solid ${accent}30`,
                      padding: `${u * 1}px ${u * 2}px`, display: "inline-block",
                    }}>
                      <span style={{
                        fontFamily: FB, fontWeight: 600, fontSize: u * 1.5, color: "white", letterSpacing: "0.1em",
                      }}>CONDIÇÕES ESPECIAIS →</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ height: u * 5 }} />
            </div>
          );

        /* ═══ CTA ═══ */
        case "cta":
          return (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding }}>
              <div style={{ display: "flex", justifyContent: "center", paddingTop: u * 0.5 }}>
                <img src={nuppeFasbLogo} alt="" style={{ height: u * 8, objectFit: "contain", opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
              </div>
              <div style={{ flex: 4 }} />
              <div style={{ display: "flex", alignItems: "flex-start", flexDirection: "column" }}>
                <h2 style={{
                  fontFamily: FT, fontWeight: 700,
                  fontSize: titleFontSize * 0.85, color: "white",
                  lineHeight: 0.9, textTransform: "uppercase",
                  letterSpacing: "-0.02em", margin: 0,
                }}>{peca.textos.titulo}</h2>
                <p style={{
                  fontFamily: FB, fontWeight: 300,
                  fontSize: u * 1.8, color: "hsla(0,0%,100%,0.45)",
                  lineHeight: 1.3, margin: `${u * 1}px 0 0`,
                }}>{peca.textos.subtitulo}</p>
              </div>
              <div style={{ flex: 0.5 }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: cardWidth }}>
                  <div style={{
                    ...glass({
                      padding: `${u * 2.5}px ${u * 2.5}px`,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: u * 1.5,
                    }),
                  }}>
                    <div style={{
                      background: accent, borderRadius: u * 0.8,
                      padding: `${u * 1.2}px ${u * 3}px`,
                    }}>
                      <span style={{
                        fontFamily: FB, fontWeight: 700, fontSize: u * 2,
                        color: "hsl(215, 35%, 6%)", letterSpacing: "0.1em",
                      }}>{peca.textos.cta || "INSCREVA-SE AGORA"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ height: u * 5 }} />
            </div>
          );

        default:
          return null;
      }
    };

    const bgUrl = peca.bgImage;
    const hasBg = !!bgUrl;
    const bgZoom = (peca as any).bgZoom ?? 100;
    const bgScale = bgZoom / 100;
    const bgPosX = (peca as any).bgPosX ?? 0;
    const bgPosY = (peca as any).bgPosY ?? 0;

    return (
      <div
        ref={ref}
        style={{
          width: dim.w, height: dim.h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative", overflow: "hidden",
          background: hasBg ? undefined : "hsl(215, 35%, 6%)",
        }}
      >
        {/* Background image with zoom */}
        {hasBg && (
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(${bgScale}) translate(${bgPosX}%, ${bgPosY}%)`,
            transformOrigin: "center center",
          }} />
        )}
        {/* Sombra overlay — imagem de sombra sobre a foto */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${sombraOverlay})`,
          backgroundSize: "cover", backgroundPosition: "center",
          pointerEvents: "none", opacity: 0.85,
        }} />

        {/* Gradiente extra na base para legibilidade do texto */}
        <div style={{
          position: "absolute", inset: 0,
          background: hasBg
            ? "linear-gradient(180deg, hsla(0,0%,0%,0) 0%, hsla(0,0%,0%,0) 40%, hsla(0,0%,0%,0.3) 70%, hsla(0,0%,0%,0.6) 90%, hsla(0,0%,0%,0.7) 100%)"
            : "linear-gradient(165deg, hsl(218,35%,5%) 0%, hsl(210,40%,10%) 40%, hsl(205,32%,7%) 100%)",
          pointerEvents: "none",
        }} />

        {/* Glow ciano atmosférico — iluminação azul difusa */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 20% 80%, hsla(190,90%,50%,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 85% 20%, hsla(200,80%,45%,0.12) 0%, transparent 65%)",
          mixBlendMode: "screen",
        }} />

        {/* Fog / névoa suave no topo */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, hsla(200,60%,70%,0.08) 0%, transparent 35%, transparent 75%, hsla(190,80%,50%,0.06) 100%)",
        }} />

        {renderContent()}

        {/* ── Footer bar NUPPE • FASB / 2026 ── */}
        <div style={{
          position: "absolute", bottom: u * 3.6, left: padding, right: padding,
          pointerEvents: "none", zIndex: 10,
          display: "flex", flexDirection: "column", gap: u * 0.6,
        }}>
          {/* Linha separadora sutil */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg, hsla(190,80%,50%,0.25) 0%, hsla(0,0%,100%,0.08) 50%, hsla(190,80%,50%,0.25) 100%)",
          }} />
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{
              fontFamily: FB, fontSize: u * 1.1, fontWeight: 500, color: "hsla(0,0%,100%,0.35)",
              letterSpacing: "0.25em", textTransform: "uppercase",
            }}>NUPPE &nbsp;•&nbsp; FASB</span>
            <span style={{
              fontFamily: FB, fontSize: u * 1.1, fontWeight: 300, color: "hsla(0,0%,100%,0.22)",
              letterSpacing: "0.2em",
            }}>2026</span>
          </div>
        </div>
      </div>
    );
  }
);

PecaCanvas.displayName = "PecaCanvas";
export default PecaCanvas;
