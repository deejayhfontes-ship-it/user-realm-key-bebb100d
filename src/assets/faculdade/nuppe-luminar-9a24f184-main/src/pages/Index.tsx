import HeroCursosLivres from "@/components/HeroCursosLivres";
import InfoCursosLivres from "@/components/InfoCursosLivres";
import ListaCursosLivres from "@/components/ListaCursosLivres";
import FooterInstitucional from "@/components/FooterInstitucional";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroCursosLivres />
      <InfoCursosLivres />
      <ListaCursosLivres />
      <FooterInstitucional />
    </main>
  );
};

export default Index;
