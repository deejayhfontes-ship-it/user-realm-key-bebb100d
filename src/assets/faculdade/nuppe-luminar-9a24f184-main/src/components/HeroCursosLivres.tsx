import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import rocketImg from "@/assets/rocket.png";
import { Rocket, Award, DollarSign, Briefcase, Wand2 } from "lucide-react";

const diferenciais = [
  { icon: Rocket, text: "FORMATO SEMIPRESENCIAL" },
  { icon: Award, text: "CERTIFICAÇÃO" },
  { icon: DollarSign, text: "OPÇÕES ACESSÍVEIS" },
  { icon: Briefcase, text: "FORMAÇÃO PARA APLICAR NO MERCADO" },
];

const HeroCursosLivres = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dot-pattern">
      {/* Top bar with Gerador link */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 sm:p-8 lg:p-10 flex justify-center">
        <Link
          to="/gerador"
          className="btn-nuppe inline-flex items-center gap-3 text-lg sm:text-xl lg:text-2xl px-10 py-5 rounded-lg font-display font-bold tracking-wider"
        >
          <Wand2 className="w-7 h-7" />
          GERADOR DE PEÇAS
        </Link>
      </div>

      {/* Glow effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/8 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 relative z-10"
          >
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display font-bold text-primary text-xl tracking-[0.3em] mb-2"
              >
                NUPPE
              </motion.h2>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-foreground leading-none tracking-tight"
              >
                CURSOS
                <br />
                LIVRES
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-display text-muted-foreground text-lg sm:text-xl mt-4 tracking-wide"
              >
                APRENDA UMA NOVA HABILIDADE EM POUCO TEMPO.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              {diferenciais.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-primary/10 border border-primary/20">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-display font-semibold text-sm sm:text-base tracking-wider text-foreground">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <a href="#cursos" className="btn-nuppe inline-block text-sm rounded">
                ABERTO AO PÚBLICO
              </a>
            </motion.div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            {/* 3D NUPPE text */}
            <div className="relative select-none">
              <span className="font-display font-bold text-[8rem] sm:text-[10rem] lg:text-[12rem] leading-none text-foreground/5 tracking-tighter">
                NU
              </span>
              <span className="font-display font-bold text-[8rem] sm:text-[10rem] lg:text-[12rem] leading-none text-foreground/5 tracking-tighter block -mt-12 sm:-mt-16 lg:-mt-20">
                PPE
              </span>
            </div>

            {/* Rocket */}
            <motion.img
              src={rocketImg}
              alt="Foguete decorativo NUPPE"
              className="absolute w-48 sm:w-64 lg:w-72 -left-4 bottom-0 drop-shadow-[0_0_30px_hsl(190_90%_50%/0.4)]"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Glow behind text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroCursosLivres;
