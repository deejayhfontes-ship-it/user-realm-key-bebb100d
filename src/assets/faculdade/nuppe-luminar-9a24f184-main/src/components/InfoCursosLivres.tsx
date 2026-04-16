import { motion } from "framer-motion";
import { CalendarDays, BookOpen } from "lucide-react";

// ====== EDITAR AQUI ======
const MATRICULAS = "A DEFINIR";
const INICIO_AULAS = "A DEFINIR";
// =========================

const InfoCursosLivres = () => {
  return (
    <section className="relative py-20 lg:py-28 bg-dot-pattern overflow-hidden">
      <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Dates */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-2 gap-6"
          >
            <div className="glass-card rounded-lg p-6 glow-border">
              <div className="flex items-center gap-3 mb-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-lg tracking-wider text-foreground">
                  MATRÍCULAS:
                </span>
              </div>
              <p className="font-display text-primary text-2xl font-bold text-glow">
                {MATRICULAS}
              </p>
            </div>

            <div className="glass-card rounded-lg p-6 glow-border">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-lg tracking-wider text-foreground">
                  INÍCIO DAS AULAS:
                </span>
              </div>
              <p className="font-display text-primary text-2xl font-bold text-glow">
                {INICIO_AULAS}
              </p>
            </div>
          </motion.div>

          {/* Institutional text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-lg p-8 lg:p-10 glow-border text-center space-y-6"
          >
            <p className="font-body text-sm sm:text-base leading-relaxed text-muted-foreground uppercase tracking-wide">
              OS CURSOS SÃO ABERTOS AO PÚBLICO (INCLUSIVE PARA NÃO GRADUADOS),
              COM CERTIFICAÇÃO FASB, AULAS SEMIPRESENCIAIS (TEORIA ONLINE +
              PRÁTICA PRESENCIAL) E CONDIÇÕES DE PAGAMENTO ACESSÍVEIS,
            </p>

            <p className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-foreground text-glow leading-snug">
              COM OPÇÃO DE PARCELAMENTO EM ATÉ 4X SEM JUROS.
            </p>

            <div className="pt-2">
              <a href="#cursos" className="btn-nuppe inline-block text-sm rounded">
                ABERTO AO PÚBLICO
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InfoCursosLivres;
