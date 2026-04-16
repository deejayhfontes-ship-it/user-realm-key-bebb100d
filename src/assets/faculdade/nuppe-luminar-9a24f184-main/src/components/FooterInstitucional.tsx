const FooterInstitucional = () => {
  return (
    <footer className="relative py-12 border-t border-border/30 bg-dot-pattern">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
            {/* NUPPE */}
            <div className="text-center">
              <h3 className="font-display font-bold text-2xl text-foreground tracking-wider">
                NUPPE
              </h3>
              <p className="font-body text-xs text-muted-foreground tracking-wide mt-1 uppercase">
                NÚCLEO DE PÓS-GRADUAÇÃO, PESQUISA E EXTENSÃO
              </p>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-12 bg-primary/30" />

            {/* FASB */}
            <div className="text-center">
              <h3 className="font-display font-bold text-2xl text-foreground tracking-wider">
                FASB
              </h3>
              <p className="font-body text-xs text-muted-foreground tracking-wide mt-1">
                Faculdade do Sul da Bahia
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterInstitucional;
