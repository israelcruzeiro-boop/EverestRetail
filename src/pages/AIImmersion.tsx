import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Zap, Target, Cpu, MousePointer2, Workflow, TrendingUp, CheckCircle2, Clock, Calendar, MapPin, Laptop, ChevronRight, ShieldCheck, Users, Briefcase, Layers, Sparkles, Ticket, Star, Home as HomeIcon,
  Brain,
  Terminal,
  Rocket,
  Map,
  MessageCircle
} from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

const BANNER_URL = 'https://ik.imagekit.io/lflb43qwh/ENTStore/Imers%C3%A3o%20de%20IA%20.png.jpeg';
const PAYMENT_URL = 'https://clkdmg.site/pay/imersao-de-ia-na-pratica';

const SPEAKERS = [
  {
    name: 'Gabriel Cunha',
    role: 'Especialista em tecnologia e inovação aplicada a negócios',
    image: 'https://ik.imagekit.io/lflb43qwh/ENTStore/Gabriel.png'
  },
  {
    name: 'Leandro Korting',
    role: 'Especialista em estratégias e transformação digital',
    image: 'https://ik.imagekit.io/lflb43qwh/ENTStore/Leandro%20Korting.jpeg'
  }
];

const SICREDI_LOGO = 'https://ik.imagekit.io/lflb43qwh/ENTStore/Sicredi.png';
const SANTA_PERMUTA_LOGO = 'https://ik.imagekit.io/lflb43qwh/ENTStore/Santa%20Permuta.jpg';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

export default function AIImmersion() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">

      {/* ===== HEADER / NAVIGATION OVERLAY ===== */}
      <nav className="absolute top-0 inset-x-0 z-50 py-10 px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 pointer-events-auto"
          >
            <Link to="/" className="flex items-center group pointer-events-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-12 md:h-16 flex items-center transition-transform"
              >
                <img src={APP_CONFIG.logoPath} alt="Everest Logo" className="h-full w-auto object-contain" />
              </motion.div>
            </Link>
          </motion.div>

          <motion.a
            href={PAYMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all hidden md:block"
          >
            Garanta sua Vaga
          </motion.a>
        </div>
      </nav>

      {/* ===== SECTION 1: HERO CINEMATIC ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-40 pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1)_0%,rgba(5,5,5,1)_70%)]" />
          <motion.div
            style={{ opacity }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"
          />
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        <div className="container relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Left Content */}
            <div className="lg:col-span-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-transparent border-l-2 border-orange-500 px-4 py-2 mb-8">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-400 flex items-center gap-2">
                    <Ticket className="w-3 h-3" />
                    Lotes Limitados - Garanta o seu
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tighter uppercase mb-8">
                  Aprenda a usar IA<br />
                  <span className="text-orange-500 relative">
                    no que gera
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1, duration: 1 }}
                      className="absolute bottom-2 left-0 h-2 bg-white/10 -z-10"
                    />
                  </span><br />
                  <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">Resultado.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
                  Nada de teoria vazia. Aqui é mão na massa, aplicação real e criação prática durante o evento. <span className="text-white font-bold italic">Você vai sair com projetos prontos.</span>
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-8 mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Data e Hora</p>
                      <p className="text-sm font-bold">26 de Março, 09h00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-500" />
                    </div>
                    <a
                      href="https://share.google/iwTMfnKGByLRP19Xb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-left group/loc hover:opacity-80 transition-opacity"
                    >
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1 group-hover/loc:text-orange-500 transition-colors">Localização</p>
                      <p className="text-sm font-bold uppercase underline decoration-orange-500/30 underline-offset-4">Auditório Sicredi</p>
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                  <motion.a
                    href={PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-flex items-center gap-4 bg-orange-600 px-8 py-5 rounded-xl font-black uppercase tracking-widest text-[15px] overflow-hidden shadow-2xl shadow-orange-600/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <span>Garantir minha vaga</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.a>

                  <div className="flex flex-col items-center sm:items-start">
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-500 line-through text-lg font-bold">R$ 1.500</span>
                      <span className="text-3xl font-black text-green-500 tracking-tighter">R$ 997,00</span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Investimento Lote Especial</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Visual */}
            <div className="lg:col-span-6 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                style={{ scale }}
                className="relative z-10"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/50 to-amber-500/50 rounded-2xl blur-2xl opacity-30 animate-pulse" />
                <div className="relative border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <img src={BANNER_URL} alt="IA na Prática" className="w-full h-auto" />
                  {/* Floating Badge */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-6 right-6 z-20 bg-white text-black px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2"
                  >
                    <Users className="w-3 h-3" />
                    Vagas Limitadas
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION: PALESTRANTES ===== */}
      <section className="py-32 relative bg-[#080808]">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Experts</h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase mb-6">Quem vai te guiar?</h3>
            <p className="text-slate-400 text-lg">Aprenda com quem vive a tecnologia e a estratégia de negócios todos os dias.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {SPEAKERS.map((speaker, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.05] hover:border-orange-500/30 transition-all"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10" />
                  <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />

                  {/* Speaker Info Overlay - Corner Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="p-2 rounded-lg bg-orange-500 shadow-lg">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                </div>

                <div className="p-8 relative z-20 -mt-20">
                  <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">{speaker.name}</h4>
                  <p className="text-orange-500 text-sm font-black uppercase tracking-widest mb-4">Palestrante</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{speaker.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: PARA QUEM É ===== */}
      <section className="py-32 relative border-t border-white/5">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Público Alvo</h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase mb-6">Para quem é esta imersão?</h3>
            <p className="text-slate-400 text-lg">Projetada para tomadores de decisão que não querem ser deixados para trás pela revolução das máquinas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, title: 'Empresários', desc: 'Que precisam de eficiência operacional imediata.' },
              { icon: Users, title: 'Gestores', desc: 'Que buscam escalar a produtividade do time.' },
              { icon: Workflow, title: 'Profissionais de Opér.', desc: 'Que lidam com processos repetitivos e lentos.' },
              { icon: TrendingUp, title: 'Time Financeiro', desc: 'Que busca precisão e análise de dados veloz.' },
              { icon: Target, title: 'Líderes de Inovação', desc: 'Que precisam implementar IA com estratégia, não hype.' },
              { icon: Sparkles, title: 'Visionários', desc: 'Pessoas que querem usar IA de verdade no negócio.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-orange-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="text-lg font-black uppercase tracking-tight mb-3">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: O QUE VOCÊ VAI CONSTRUIR ===== */}
      <section className="py-32 bg-white text-black">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-orange-600 mb-4">Mão na Massa</h2>
              <h3 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] mb-8">
                Você não vai <span className="text-orange-600">apenas ouvir.</span><br />
                Você vai <span className="underline decoration-8 decoration-orange-600/30 underline-offset-8">construir.</span>
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed mb-10">
                O diferencial desta imersão é o <strong>Output Real</strong>. Ao final do dia, você terá em mãos ferramentas prontas para serem usadas na sua empresa.
              </p>

              <div className="space-y-4">
                {[
                  'Biblioteca de Prompts Estratégicos personalizada',
                  'Mapeamento de Fluxos de Trabalho Automatizáveis',
                  'Estrutura de Tomada de Decisão baseada em Dados',
                  'Automações simples usando ChatGPT e plugins',
                  'Mecanismos de IA para produtividade diária',
                  'Canais de atualização e suporte pós-evento'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="aspect-square bg-slate-100 rounded-3xl p-8 flex flex-col justify-end">
                  <Cpu className="w-10 h-10 text-orange-600 mb-4" />
                  <p className="font-black text-xs uppercase tracking-widest">Algoritmos Reais</p>
                </div>
                <div className="aspect-[3/4] bg-orange-600 rounded-3xl p-8 flex flex-col justify-end text-white">
                  <Sparkles className="w-10 h-10 text-white fill-white/20 mb-4" />
                  <p className="font-black text-xs uppercase tracking-widest leading-tight">Implementação de IA Generativa</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-slate-900 rounded-3xl p-8 flex flex-col justify-end text-white">
                  <MousePointer2 className="w-10 h-10 text-orange-500 mb-4" />
                  <p className="font-black text-xs uppercase tracking-widest">Dashboards Inteligentes</p>
                </div>
                <div className="aspect-square bg-slate-100 rounded-3xl p-8 flex flex-col justify-end">
                  <Workflow className="w-10 h-10 text-slate-800 mb-4" />
                  <p className="font-black text-xs uppercase tracking-widest">Workflow Automatizado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sponsors Area - Integrated with White Background */}
          <div className="mt-24 pt-16 border-t border-slate-100">
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-40">
              <div className="flex flex-col items-center gap-8">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Patrocinador</span>
                <div className="h-32 md:h-44 hover:scale-105 transition-transform duration-500">
                  <img src={SICREDI_LOGO} alt="Sicredi" className="h-full w-auto object-contain" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-8">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Apoio</span>
                <div className="h-32 md:h-44 hover:scale-105 transition-transform duration-500">
                  <img src={SANTA_PERMUTA_LOGO} alt="Santa Permuta" className="h-full w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: DIFERENCIAL COMPARATIVO ===== */}
      <section className="py-32 relative overflow-hidden">
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h3 className="text-3xl md:text-5xl font-black uppercase">Por que esta imersão<br />é <span className="text-orange-500 underline decoration-white/20 underline-offset-8">fundamentalmente diferente?</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Common Courses */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 opacity-60">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Cursos Comuns</h4>
              <ul className="space-y-6">
                {[
                  'Muita teoria e slides chatos',
                  'Falta de aplicação prática no negócio',
                  'Conteúdo genérico de internet',
                  'Sem acompanhamento real',
                  'Somente "o que é" IA'
                ].map((txt, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-400">
                    <div className="w-5 h-5 border-2 border-slate-700/50 rounded-full flex items-center justify-center text-[10px] font-bold">X</div>
                    <span className="text-sm font-medium">{txt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Immersion */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[34px] blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-gradient-to-br from-orange-600 to-amber-600 border border-white/20 rounded-3xl p-10 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Target className="w-32 h-32" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 mb-8">Nossa Imersão</h4>
                <ul className="space-y-6">
                  {[
                    'Prática guiada passo a passo',
                    'Aplicação direta no seu negócio atual',
                    'Foco em execução e ferramentas',
                    'Mentor acompanhando cada etapa',
                    'Oportunidade de criar soluções ao vivo'
                  ].map((txt, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-3 h-3 text-orange-600" />
                      </div>
                      <span className="text-sm font-bold text-white tracking-tight">{txt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: TIMELINE DO DIA ===== */}
      <section className="py-32 relative border-y border-white/5 bg-[#080808]">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Cronograma</h2>
            <h3 className="text-4xl font-black uppercase mb-6">A Jornada do Imersão</h3>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/0 via-orange-500/50 to-orange-500/0" />

            <div className="space-y-12">
              {[
                { icon: Brain, title: 'Fundamentos de Elite', desc: 'Desmistificando a IA e alinhando os modelos mentais para extrair o máximo das máquinas.' },
                { icon: Terminal, title: 'Engenharia de Comando Profissional', desc: 'A arte de dar ordens. Aprenda a estruturar prompts que geram respostas perfeitas na primeira tentativa.' },
                { icon: Rocket, title: 'Laboratório de Execução', desc: 'Mão na massa. Criação de fluxos de automação e implementações reais que você já começa a usar no evento.' },
                { icon: Star, title: 'Mentoria de Negócios 1:1', desc: 'Aplicação personalizada. Ajustamos as ferramentas especificamente para o seu nicho e a realidade da sua empresa.' },
                { icon: Map, title: 'Blueprint de Futuro', desc: 'O plano de ação pós-evento. Você sai com um roteiro claro de como escalar o uso de IA na sua operação.' },
              ].map((step, i) => (
                <div key={i} className="relative pl-16 group">
                  <div className="absolute left-[20px] top-6 w-[20px] h-[20px] bg-[#080808] border-2 border-orange-500 rounded-full z-10 flex items-center justify-center p-1 group-hover:scale-125 transition-transform">
                    <step.icon className="w-full h-full text-orange-500" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl group-hover:bg-white/[0.04] group-hover:border-orange-500/20 transition-all shadow-xl">
                    <h5 className="text-xl md:text-2xl font-black uppercase mb-3 tracking-tight group-hover:text-orange-500 transition-colors">{step.title}</h5>
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: ALERTA NOTEBOOK ===== */}
      <section className="py-12 bg-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-10 border-y-2 border-white/20 border-dashed">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center shrink-0">
                <Laptop className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="text-2xl font-black uppercase italic leading-none mb-1 text-white">Importante: Leve seu Notebook</h4>
                <p className="text-white/80 font-medium tracking-tight">A experiência será 100% prática e acompanhada em tempo real pelo mentor.</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Recomendado</p>
              <span className="bg-white text-orange-600 px-4 py-2 rounded font-black text-xs uppercase tracking-widest">Notebook ou Tablet</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: TRANSFORMAÇÃO ===== */}
      <section className="py-32 relative">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/10 rounded-full blur-[100px]" />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Eficiência', val: '+250%', color: 'text-orange-500' },
                  { label: 'Tempo ganho', val: '4h/dia', color: 'text-white' },
                  { label: 'Decisões', val: 'Datadriven', color: 'text-white' },
                  { label: 'Vantagem', val: 'Comp.', color: 'text-orange-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-3xl text-center">
                    <p className={`text-3xl font-black mb-2 ${stat.color}`}>{stat.val}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">A Transformação</h2>
              <h3 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] mb-8">Saia com <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">vantagem competitiva real.</span></h3>
              <div className="space-y-8">
                {[
                  { icon: Clock, title: 'Mais Velocidade', desc: 'Execute em minutos o que antes levava horas integras.' },
                  { icon: Target, title: 'Mais Clareza', desc: 'Entenda exatamente onde a IA se encaixa no seu organograma.' },
                  { icon: ShieldCheck, title: 'Menos Desperdício', desc: 'Pare de gastar tempo e dinheiro com ferramentas erradas.' },
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h5 className="text-lg font-black uppercase tracking-tight mb-2">{benefit.title}</h5>
                      <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: FECHAMENTO / OFERTA FINAL ===== */}
      <section id="garantir-vaga" className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-orange-600/10 rounded-[100%] blur-[120px]" />
        </div>

        <div className="container max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/10 rounded-[40px] p-10 md:p-20 shadow-2xl backdrop-blur-sm"
          >
            <h2 className="text-[13px] font-black uppercase tracking-[0.5em] text-orange-500 mb-4">Lotes Limitados</h2>
            <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-1.5 rounded-full mb-8">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Restam poucas vagas no lote promocional</span>
            </div>

            <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
              Domine a IA ou será <span className="text-white relative">dominado por quem</span><br />
              <span className="text-orange-500">já a usa.</span>
            </h3>

            <div className="inline-block bg-white/5 border border-white/10 px-8 py-6 rounded-2xl mb-12">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Investimento Lote I (Limitado)</p>
              <div className="flex flex-col items-center">
                <span className="text-slate-500 line-through text-xl font-bold mb-1">R$ 1.500,00</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl md:text-7xl font-black italic text-green-500 tracking-tighter">R$ 997,00</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <motion.a
                href={PAYMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-white text-black px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[16px] shadow-2xl hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-3 group"
              >
                <span>Quero Garantir Meu Ingresso</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Compra Segura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Vagas Limitadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-black tracking-widest">B2B Friendly</span>
                </div>
              </div>
            </div>

            <p className="mt-16 text-slate-500 text-sm max-w-xl mx-auto italic">
              "Você pode continuar assistindo o mercado mudar ou aprender a usar IA a seu favor agora."
            </p>
          </motion.div>
        </div>
      </section>


      {/* ===== FOOTER OVERLAY ===== */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <div className="h-12 md:h-14 flex items-center overflow-hidden">
                <img src={APP_CONFIG.logoPath} alt="Everest Logo" className="h-full w-auto object-contain" />
              </div>
            </div>
            <p className="text-[11px] text-slate-600 uppercase font-black tracking-widest">© 2026 Empresas no Topo LTDA — Todos os direitos reservados.</p>
          </div>

          <div className="flex items-center gap-10">
            <Link to="/termos" className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">Termos</Link>
            <Link to="/privacidade" className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">Privacidade</Link>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>
      </footer>

      {/* ===== FLOATING WHATSAPP BUTTON ===== */}
      <motion.a
        href="https://wa.me/556199280069"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.1, shadow: "0 0 20px rgba(34,197,94,0.4)" }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[60] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl transition-all"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">1</span>
      </motion.a>

    </div>
  );
}
