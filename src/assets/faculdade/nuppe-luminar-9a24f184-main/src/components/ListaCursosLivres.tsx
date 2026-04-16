import { motion } from "framer-motion";
import { Clock, Tag } from "lucide-react";

const cursos = [
  { nome: "TÉCNICAS DE VENDAS E AVALIAÇÃO DE IMÓVEIS", horas: "30 HORAS", valor: "R$380,00" },
  { nome: "EDUCAÇÃO INCLUSIVA / TÉCNICAS EM MASSOTERAPIA", horas: "30 HORAS", valor: "R$360,00" },
  { nome: "MAQUIAGEM", horas: "30 HORAS", valor: "R$380,00" },
  { nome: "TÉCNICAS EM ESTÉTICA FACIAL E CAPILAR", horas: "30 HORAS", valor: "R$360,00" },
  { nome: "ALIMENTAÇÃO PERFORMANCE: FUNDAMENTOS DA NUTRIÇÃO ESPORTIVA", horas: "30 HORAS", valor: "R$380,00" },
  { nome: "MARKETING DIGITAL PARA AS REDES SOCIAIS", horas: "28 HORAS", valor: "R$380,00" },
  { nome: "TRATAMENTO EM FERIDAS E QUEIMADURAS", horas: "30 HORAS", valor: "R$380,00" },
  { nome: "ASSISTÊNCIA À SAÚDE DA PESSOA IDOSA", horas: "30 HORAS", valor: "R$380,00" },
  { nome: "ENFERMAGEM NO PÓS OPERATÓRIO DE CIRURGIAS ESTÉTICAS", horas: "30 HORAS", valor: "R$380,00" },
];

const ListaCursosLivres = () => {
  return (
    <section id="cursos" className="relative py-20 lg:py-28 bg-dot-pattern overflow-hidden">
      <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight">
            CURSOS LIVRES <span className="text-primary text-glow">2026</span>
          </h2>
          <p className="font-display text-muted-foreground text-base sm:text-lg mt-3 tracking-wide">
            APRENDA UMA NOVA HABILIDADE EM POUCO TEMPO.
          </p>
        </motion.div>

        {/* Course list */}
        <div className="max-w-4xl mx-auto space-y-3">
          {cursos.map((curso, i) => (
            <motion.div
              key={curso.nome}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="course-row rounded-md px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4"
            >
              <span className="font-display font-semibold text-sm sm:text-base text-foreground tracking-wide flex-1">
                {curso.nome}
              </span>
              <div className="flex items-center gap-4 shrink-0">
                <span className="flex items-center gap-1 font-display font-bold text-sm text-primary">
                  <Clock className="w-3.5 h-3.5" />
                  {curso.horas}
                </span>
                <span className="flex items-center gap-1 font-body text-sm text-muted-foreground">
                  <Tag className="w-3.5 h-3.5" />
                  {curso.valor}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListaCursosLivres;
