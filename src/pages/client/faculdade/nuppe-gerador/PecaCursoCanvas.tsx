import { forwardRef } from "react";
import type { PecaFormato, CursoData } from "./gerador-data";
import nuppeLogo from "@/assets/faculdade/nuppe-logo.png";
import nuppeHeaderLogo from "@/assets/faculdade/logonuppe.png";
import nuppeFasbLogo from "@/assets/faculdade/nuppe-fasb-logo.png";

interface PecaCursoCanvasProps {
  curso: CursoData;
  formato: PecaFormato;
  scale?: number;
  bgImage?: string;
  textoOverrides?: Record<string, string>;
}

const formatDimensions: Record<PecaFormato, { w: number; h: number }> = {
  "1080x1080": { w: 1080, h: 1080 },
  "1080x1440": { w: 1080, h: 1440 },
  "1080x1920": { w: 1080, h: 1920 },
};

const FD = "'Suisse Intl Condensed', sans-serif";
const FB = "'Suisse Intl', sans-serif";

const PecaCursoCanvas = forwardRef<HTMLDivElement, PecaCursoCanvasProps>(
  ({ curso, formato, scale = 0.25, bgImage, textoOverrides }, ref) => {
    const dim = formatDimensions[formato];
    const isPos = curso.categoria === "pos-graduacao";
    const w = dim.w;
    const h = dim.h;

    const accent = "hsl(191 92% 55%)";
    const accentSoft = "hsla(191 92% 55% / 0.18)";
    const accentStrong = "hsla(191 92% 55% / 0.46)";
    const bgGradient = "linear-gradient(180deg, hsl(222 36% 6%) 0%, hsl(214 34% 8%) 45%, hsl(220 34% 5%) 100%)";

    const nome = textoOverrides?.nome || curso.nome;
    const valor = textoOverrides?.valor || curso.valor;

    // Proportional unit system
    const u = h <= 1440 ? h / 100 : 14.4 + (h - 1440) / 200;
    const pad = w * 0.055;

    // Font sizes - scale with height
    const headerTitleFs = u * 7.5;
    const headerSubFs = u * 3.8;
    const cardLabelFs = u * 1.8;
    const cardTitleFs = u * 5.5;
    const cardInfoFs = u * 1.5;
    const cardInfoSmFs = u * 1.2;
    const bulletLabelFs = u * 1.4;
    const bulletValueFs = u * 1.6;
    const investLabelFs = u * 1.2;
    const investValueFs = u * 4;
    const ctaFs = u * 1.8;
    const footerLogoH = u * 9;
    const footerFs = u * 1.6;
    const iconSize = u * 3.5;

    const metaItems = [
      { label: "CARGA", value: curso.cargaHoraria },
      { label: "DURAÇÃO", value: curso.duracao || "—" },
      { label: "MATRICULAS", value: curso.matriculas },
      { label: "INICIO", value: curso.inicioAulas },
    ];

    return (
      <div
        ref={ref}
        style={{
          width: w,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
          overflow: "hidden",
          background: bgImage ? `url(${bgImage}) center/cover no-repeat` : bgGradient,
        }}
      >
        {/* BG overlay when image */}
        {bgImage && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, hsla(222 36% 6% / 0.78) 0%, hsla(214 34% 8% / 0.86) 45%, hsla(220 34% 5% / 0.94) 100%)",
          }} />
        )}

        {/* Dot pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, hsla(191 30% 62% / 0.15) 1px, transparent 1px)",
          backgroundSize: "22px 22px", opacity: 0.4, pointerEvents: "none",
        }} />

        {/* Mesh top-right */}
        <div style={{
          position: "absolute", top: "8%", right: "-5%",
          width: w * 0.6, height: h * 0.22,
          transform: "rotate(-8deg)", opacity: 0.7,
          backgroundImage: `linear-gradient(to right, transparent 47%, ${accentStrong} 49%, transparent 51%), linear-gradient(to bottom, transparent 47%, ${accentSoft} 49%, transparent 51%)`,
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(circle at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Mesh bottom */}
        <div style={{
          position: "absolute", left: "-10%", bottom: "15%",
          width: w * 0.8, height: h * 0.18,
          transform: "rotate(6deg)", opacity: 0.5,
          backgroundImage: `linear-gradient(to right, transparent 47%, ${accentSoft} 49%, transparent 51%), linear-gradient(to bottom, transparent 47%, ${accentStrong} 49%, transparent 51%)`,
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 75%)",
          pointerEvents: "none",
        }} />

        {/* ═══ CONTENT ═══ */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          padding: pad,
        }}>

          {/* ── 1. HEADER: NUPPE + PÓS GRADUAÇÃO ── */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center",
            gap: u * 0.8,
            flexShrink: 0,
            paddingTop: u * 1,
          }}>
            <img src={nuppeHeaderLogo} alt="NUPPE" style={{
              height: headerTitleFs * 1.2,
              objectFit: "contain",
            }} />
            <h2 style={{
              margin: 0,
              fontFamily: FD, fontWeight: 700,
              fontSize: headerSubFs,
              lineHeight: 1,
              letterSpacing: "0.08em",
              color: accent,
              textAlign: "center",
            }}>
              {isPos ? "PÓS GRADUAÇÃO" : "CURSO LIVRE"}
            </h2>
          </div>

          {/* ── 2. MAIN CARD (two columns) ── */}
          <div style={{
            width: "90%", alignSelf: "center",
            borderRadius: u * 2.5,
            padding: `${u * 3}px ${u * 2.8}px`,
            background: "linear-gradient(135deg, hsla(0 0% 100% / 0.08) 0%, hsla(0 0% 100% / 0.03) 50%, hsla(0 0% 100% / 0.02) 100%)",
            border: "1px solid hsla(0 0% 100% / 0.07)",
            boxShadow: "0 24px 80px hsla(220 50% 2% / 0.5), inset 0 1px 0 hsla(0 0% 100% / 0.08)",
            backdropFilter: "blur(18px)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "row",
            gap: u * 2,
            flexShrink: 0,
          }}>
            {/* Card gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(120deg, ${accentSoft} 0%, transparent 40%, transparent 60%, ${accentSoft} 100%)`,
              pointerEvents: "none",
            }} />

            {/* Card glow right */}
            <div style={{
              position: "absolute", right: -30, top: "20%",
              width: 300, height: 200,
              background: `radial-gradient(circle, hsla(191 92% 55% / 0.12) 0%, transparent 70%)`,
              filter: "blur(10px)", pointerEvents: "none",
            }} />

            {/* LEFT COLUMN: label + title + info */}
            <div style={{
              position: "relative", zIndex: 1,
              flex: "1 1 55%",
              display: "flex", flexDirection: "column",
              justifyContent: "space-between",
              gap: u * 2,
              minWidth: 0,
            }}>
              {/* Top: label + title */}
              <div style={{ display: "flex", flexDirection: "column", gap: u * 0.8 }}>
                <span style={{
                  fontFamily: FB, fontWeight: 400, fontStyle: "italic",
                  fontSize: cardLabelFs,
                  color: "hsla(0 0% 100% / 0.85)",
                }}>
                  {isPos ? "Pós em" : "Curso em"}
                </span>
                <h3 style={{
                  margin: 0,
                  fontFamily: FD, fontWeight: 700,
                  fontSize: cardTitleFs,
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  color: "white",
                }}>
                  {nome}
                </h3>
              </div>

              {/* Bottom: icon + info text */}
              <div style={{
                display: "flex", alignItems: "flex-start",
                gap: u * 1.2,
              }}>
                <div style={{
                  width: iconSize, height: iconSize, flexShrink: 0,
                  borderRadius: "50%",
                  border: `2px solid ${accent}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: iconSize * 0.45, height: iconSize * 0.45,
                    borderRadius: "50%",
                    border: `2px solid ${accent}`,
                  }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: u * 0.3 }}>
                  <span style={{
                    fontFamily: FB, fontWeight: 500,
                    fontSize: cardInfoFs, lineHeight: 1.15,
                    color: "hsla(0 0% 100% / 0.9)",
                  }}>
                    {curso.cargaHoraria}{curso.duracao ? ` • ${curso.duracao}` : ""}
                  </span>
                  <span style={{
                    fontFamily: FB, fontWeight: 400,
                    fontSize: cardInfoSmFs, lineHeight: 1.2,
                    color: "hsla(0 0% 100% / 0.6)",
                  }}>
                    Certificação FASB para aplicar<br />no mercado.
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: bullet list */}
            <div style={{
              position: "relative", zIndex: 1,
              flex: "1 1 42%",
              display: "flex", flexDirection: "column",
              justifyContent: "center",
              gap: u * 2,
              paddingLeft: u * 1.5,
              borderLeft: "1px solid hsla(0 0% 100% / 0.06)",
            }}>
              {metaItems.map((item, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", gap: u * 0.2,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: u * 0.6 }}>
                    <div style={{
                      width: u * 0.7, height: u * 0.7, flexShrink: 0,
                      background: accent,
                      borderRadius: 2,
                    }} />
                    <span style={{
                      fontFamily: FD, fontWeight: 700,
                      fontSize: bulletLabelFs,
                      letterSpacing: "0.08em",
                      color: "hsla(0 0% 100% / 0.95)",
                      textTransform: "uppercase",
                    }}>
                      {item.label}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: FD, fontWeight: 700,
                    fontSize: bulletValueFs,
                    letterSpacing: "0.04em",
                    color: accent,
                    textTransform: "uppercase",
                    paddingLeft: u * 1.3,
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. INVESTMENT (centered) ── */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center",
            gap: u * 0.5,
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: FD, fontWeight: 700,
              fontSize: investLabelFs,
              letterSpacing: "0.2em",
              color: accent,
            }}>
              INVESTIMENTO
            </span>
            <span style={{
              fontFamily: FD, fontWeight: 700,
              fontSize: investValueFs,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "white",
            }}>
              {valor}
            </span>
          </div>

          {/* ── 4. CTA BUTTON ── */}
          <div style={{
            alignSelf: "center",
            flexShrink: 0,
            padding: `${u * 1.6}px ${w * 0.08}px`,
            borderRadius: 999,
            background: `linear-gradient(135deg, hsla(191 92% 55% / 0.25) 0%, hsla(191 92% 55% / 0.5) 100%)`,
            border: `1.5px solid ${accent}`,
            boxShadow: `0 12px 36px hsla(220 40% 2% / 0.3), 0 0 30px hsla(191 92% 55% / 0.12)`,
            textAlign: "center",
          }}>
            <span style={{
              fontFamily: FD, fontWeight: 700,
              fontSize: ctaFs,
              letterSpacing: "0.12em",
              color: "white",
              textTransform: "uppercase",
            }}>
              {isPos ? "Especialize-se com quem entende" : "Aprenda uma nova habilidade"}
            </span>
          </div>

          {/* ── 5. LOGOS (centered) ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <img src={nuppeFasbLogo} alt="NUPPE | FASB" style={{ height: footerLogoH, objectFit: "contain" }} />
          </div>

          {/* ── 6. FOOTER BAR ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: FB, fontSize: footerFs,
              color: "hsla(0 0% 100% / 0.3)",
              letterSpacing: "0.14em",
            }}>
              NUPPE • FASB
            </span>
            <span style={{
              fontFamily: FB, fontSize: footerFs,
              color: "hsla(0 0% 100% / 0.25)",
              letterSpacing: "0.14em",
            }}>
              2026
            </span>
          </div>
        </div>
      </div>
    );
  }
);

PecaCursoCanvas.displayName = "PecaCursoCanvas";
export default PecaCursoCanvas;
