import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative w-full text-white bg-[#0B0B0B]">
      {/* Linha separadora sutil no topo com gradiente laranja */}
      <div 
        className="w-full h-px opacity-30"
        style={{ background: 'linear-gradient(90deg, transparent, #F97316 30%, #EF4444 70%, transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* LADO ESQUERDO — Branding */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Everest Retail
              </span>
            </Link>
            <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-sm font-medium">
              Plataforma inteligente para gestão, dados e crescimento de varejo com IA. 
              Conectando estratégia, tecnologia e performance.
            </p>
          </div>

          {/* COLUNA LINKS — Legal */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B5563]">
              Informações
            </h3>
            <div className="flex flex-col gap-4">
              <Link 
                to="/privacidade" 
                className="text-sm text-[#D1D5DB] hover:text-orange-500 transition-all duration-300 w-fit"
              >
                Política de Privacidade
              </Link>
              <Link 
                to="/termos" 
                className="text-sm text-[#D1D5DB] hover:text-orange-500 transition-all duration-300 w-fit"
              >
                Termos de Uso
              </Link>
            </div>
          </div>

          {/* COLUNA CONTATO */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B5563]">
              Suporte & Contato
            </h3>
            <div className="flex flex-col gap-4">
              <a 
                href="mailto:suporte@everestretail.com.br" 
                className="text-sm text-[#D1D5DB] hover:text-orange-500 transition-all duration-300 w-fit"
              >
                suporte@everestretail.com.br
              </a>
              <p className="text-sm text-[#6B7280]">
                Brasília — DF
              </p>
            </div>
          </div>
        </div>

        {/* Linha separadora final */}
        <div className="mt-16 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-[#4B5563] font-medium tracking-wide">
            © 2026 Everest Retail — Todos os direitos reservados.
          </p>
          
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-[#4B5563] uppercase font-black tracking-widest">
              Sistemas Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
