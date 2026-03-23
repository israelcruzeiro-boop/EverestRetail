import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Zap, Target, Cpu, MousePointer2, Workflow, TrendingUp, CheckCircle2, Clock, Calendar, MapPin, Laptop, ChevronRight, ShieldCheck, Users, Briefcase, Layers, Sparkles, Ticket, Star, Brain, Terminal, Rocket, Map, MessageCircle, ArrowRight, Check, PlayCircle, Trophy, BarChart3
} from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';
import { trackImersaoEvent } from '@/lib/tracking';

/**
 * IMERSÃO DE IA NA PRÁTICA - LANDING PAGE PREMIUM
 * Designer: Antigravity
 * Objective: High-ticket, professional, executive, and highly persuasive.
 */

const IMAGES = {
  main: 'https://ik.imagekit.io/lflb43qwh/ENT/Imersao%20de%20IA%20-%20ENT.jpeg',
  leandro: 'https://ik.imagekit.io/lflb43qwh/ENT/LeandroK.jpeg',
  gabriel: 'https://ik.imagekit.io/lflb43qwh/ENT/GabrielC.jpeg?updatedAt=1773885482950',
  sicredi: 'https://ik.imagekit.io/lflb43qwh/ENTStore/Sicredi.png?updatedAt=1773712987920',
  santaPermuta: 'https://ik.imagekit.io/lflb43qwh/ENTStore/Santa%20Permuta.jpg?updatedAt=1773712988606',
  ent: 'https://ik.imagekit.io/lflb43qwh/ENT/Empresasnotopo2.png'
};

const PAYMENT_URL = 'https://clkdmg.site/pay/imersao-de-ia-na-pratica';
const TARGET_DATE = new Date('2026-03-26T09:00:00-03:00');

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = TARGET_DATE.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/5 border border-white/10 backdrop-blur-sm w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-2 group hover:border-orange-500/50 transition-colors">
        <span className="text-2xl md:text-4xl font-black text-orange-500 tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] uppercase font-black tracking-widest text-slate-500">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-4 md:gap-6 py-6 border-y border-white/5 my-8">
      <TimeUnit value={timeLeft.days} label="Dias" />
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <TimeUnit value={timeLeft.seconds} label="Seg" />
    </div>
  );
}

// Animation Constants
const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const REVEAL = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" }
};

export default function AIImmersion() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Tracking: Page View
    trackImersaoEvent('page_view');

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Navigation Layer */}
      <nav className="fixed top-0 inset-x-0 z-[100] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5">
          <Link to="/" className="flex items-center group">
            <img src={APP_CONFIG.logoPath} alt="Everest Logo" className="h-10 md:h-12 w-auto object-contain brightness-110" />
          </Link>
          <div className="flex items-center gap-8">
            <a href="#programa" className="hidden md:block text-xs font-bold uppercase tracking-widest text-white/60 hover:text-orange-500 transition-colors">O que vou aprender</a>
            <motion.a
              href={PAYMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => trackImersaoEvent('click_buy')}
              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 transition-all"
            >
              Garantir Vaga
            </motion.a>
          </div>
        </div>
      </nav>

      {/* SEÇÃO 1: HERO IMPACTANTE */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        <div className="container relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                    Evento Presencial • Vagas Limitadas • Imersão Executiva
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tighter uppercase mb-6">
                  Imersão de <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">IA na Prática</span>
                </h1>

                <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-6 max-w-2xl">
                  Aprenda a usar IA no que realmente gera resultado.
                </h2>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
                  Nada de teoria vazia. Aqui você vai aplicar IA no seu negócio de forma prática, guiada e com foco em resultado real. <span className="text-white font-bold">Saia com ferramentas rodando no seu dia a dia.</span>
                </p>

                <div className="flex flex-wrap gap-8 mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Data e Hora</p>
                      <p className="text-lg font-bold">26 de Março, 09h</p>
                    </div>
                  </div>
                  <a 
                    href="https://share.google/IOtYfSZxkvXdhJVVG" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => trackImersaoEvent('click_location')}
                    className="flex items-center gap-4 hover:opacity-80 transition-opacity group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:border-orange-500/50 transition-colors">
                      <MapPin className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Localização</p>
                      <p className="text-lg font-bold">Auditório Sicredi</p>
                    </div>
                  </a>
                </div>

                <CountdownTimer />

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <motion.a
                    href={PAYMENT_URL}
                    target="_blank"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => trackImersaoEvent('click_buy')}
                    className="group relative flex items-center gap-4 bg-orange-600 hover:bg-orange-500 text-white px-6 py-4 md:px-10 md:py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[13px] md:text-[16px] shadow-2xl shadow-orange-600/40"
                  >
                    <span>Garantir Vaga</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                  
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/40 line-through text-lg font-bold">R$ 1.500</span>
                      <span className="text-3xl font-black text-white tracking-tighter">R$ 1.197,00</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-orange-500 uppercase font-black tracking-widest">Investimento Lote Especial</p>
                      <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.15em]">2º LOTE DISPONÍVEL</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative z-10"
              >
                <div className="absolute -inset-4 bg-orange-500/20 blur-[60px] rounded-full animate-pulse" />
                <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/50 aspect-[4/5] lg:aspect-auto">
                  <img src={IMAGES.main} alt="Imersão IA" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-black via-black/60 to-transparent">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-4 shrink-0">
                        <img src={IMAGES.gabriel} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-orange-500 object-cover" alt="Gabriel" />
                        <img src={IMAGES.leandro} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-orange-500 object-cover" alt="Leandro" />
                      </div>
                      <p className="text-[10px] md:text-sm font-bold text-white/90 leading-tight">Mentoria presencial com especialistas do mercado.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO: PATROCÍNIO E APOIO (WHITE AREA) */}
      <section className="bg-white py-24 relative z-10">
         <div className="container max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32">
               {/* REALIZAÇÃO */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="flex flex-col items-center gap-6"
               >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Realização</span>
                  <div className="h-20 md:h-32 hover:scale-105 transition-transform duration-500">
                     <img src={IMAGES.ent} alt="ENT" className="h-full w-auto object-contain" />
                  </div>
               </motion.div>

               {/* PATROCÍNIO */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="flex flex-col items-center gap-6"
               >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Patrocínio Master</span>
                  <div className="h-20 md:h-32 hover:scale-105 transition-transform duration-500">
                     <img src={IMAGES.sicredi} alt="Sicredi" className="h-full w-auto object-contain" />
                  </div>
               </motion.div>

               {/* APOIO */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="flex flex-col items-center gap-6"
               >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Apoio Estratégico</span>
                  <div className="h-20 md:h-32 hover:scale-105 transition-transform duration-500">
                     <img src={IMAGES.santaPermuta} alt="Santa Permuta" className="h-full w-auto object-contain" />
                  </div>
               </motion.div>
            </div>
         </div>
       </section>

      {/* SEÇÃO 2: PARA QUEM É ESSA IMERSÃO */}
      <section className="py-32 relative bg-[#080808]">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div {...FADE_UP} className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-orange-500 text-sm font-black uppercase tracking-[0.4em] mb-4">Público High Ticket</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Para quem é este evento?</h3>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
              Desenhado para quem decide o futuro do negócio e não aceita ficar para trás na era da Inteligência Artificial.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, title: 'Empresários', desc: 'Que precisam otimizar custos e escalar operações com inteligência.' },
              { icon: Users, title: 'Gestores', desc: 'Líderes que buscam transformar times em potências de produtividade.' },
              { icon: Zap, title: 'Profissionais da Operação', desc: 'Quem quer automatizar o trabalho braçal e focar no que é estratégico.' },
              { icon: TrendingUp, title: 'Times Administrativos', desc: 'Setores que lidam com fluxos de dados e precisam de velocidade.' },
              { icon: BarChart3, title: 'Profissionais de Finanças', desc: 'Uso de IA para análise preditiva e organização financeira ágil.' },
              { icon: Rocket, title: 'Intusiastas Práticos', desc: 'Pessoas cansadas de hype que querem aprender a usar IA de verdade.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-orange-600/5 hover:border-orange-500/20 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="w-7 h-7 text-orange-500" />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-4">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: O QUE VOCÊ VAI APRENDER NA PRÁTICA */}
      <section id="programa" className="py-32 relative">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-20 items-center mb-24">
            <motion.div {...FADE_UP} className="lg:w-1/2">
              <h2 className="text-orange-500 text-sm font-black uppercase tracking-[0.4em] mb-4">Conteúdo Programático</h2>
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                O que você vai <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">aprender na prática</span>
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Tiramos a complexidade e entregamos o método. Você vai dominar as ferramentas que os 1% do mercado estão usando para dominar seus nichos.
              </p>
              <div className="space-y-6">
                {[
                  { title: 'IA no dia a dia do negócio', desc: 'Integração de ferramentas em rotinas reais.' },
                  { title: 'Aplicações práticas em finanças', desc: 'Controle, análise e automação financeira profissional.' },
                  { title: 'Automação e Produtividade', desc: 'Como fazer em 10 minutos o que levava 4 horas.' },
                  { title: 'ChatGPT & IAs de Mercado', desc: 'Uso avançado além do "perguntar e responder".' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center shrink-0 mt-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h5 className="font-black uppercase text-sm tracking-widest text-white">{item.title}</h5>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...REVEAL} className="lg:w-1/2 grid grid-cols-2 gap-4">
               <div className="space-y-4 pt-12">
                 <div className="aspect-square bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-end group hover:bg-orange-600 transition-all duration-500">
                    <Brain className="w-12 h-12 text-orange-500 group-hover:text-white mb-6" />
                    <p className="font-black text-xs uppercase tracking-widest leading-tight group-hover:text-white">Tomada de Decisão com Dados</p>
                 </div>
                 <div className="aspect-[4/5] bg-gradient-to-br from-orange-600 to-amber-600 rounded-[2.5rem] p-8 flex flex-col justify-end">
                    <Cpu className="w-12 h-12 text-white mb-6" />
                    <p className="font-black text-xs uppercase tracking-widest leading-tight">Ganhar Tempo Real com Processos de IA</p>
                 </div>
               </div>
               <div className="space-y-4">
                  <div className="aspect-[4/5] bg-[#111] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-end group hover:border-orange-500 transition-all">
                    <Sparkles className="w-12 h-12 text-orange-500 mb-6" />
                    <p className="font-black text-xs uppercase tracking-widest leading-tight">Organização de Processos Inteligentes</p>
                  </div>
                  <div className="aspect-square bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-end">
                    <TrendingUp className="w-12 h-12 text-slate-400 mb-6" />
                    <p className="font-black text-xs uppercase tracking-widest leading-tight">Aumento de Eficiência Operacional</p>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: O QUE VOCÊ VAI CONSTRUIR */}
      <section className="py-32 relative bg-white text-black overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none" />
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-orange-600 text-sm font-black uppercase tracking-[0.4em] mb-4">Hands-on Experience</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">O que você vai <span className="text-orange-600 underline underline-offset-8 decoration-orange-600/20">construir</span></h3>
            <p className="text-slate-600 text-lg">Você não sai apenas com anotações. Você sai com ativos prontos para a sua empresa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Seus Próprios Prompts', desc: 'Comandos estruturados para seu nicho específico de atuação.' },
              { title: 'Fluxos Produtivos', desc: 'Mapeamento de como sua equipe deve usar a IA no cotidiano.' },
              { title: 'Rotinas de Ganho de Tempo', desc: 'Processos que eliminam horas de trabalho repetitivo.' },
              { title: 'Bases de Decisão', desc: 'Estruturas para analisar dados e tomar decisões guiadas por IA.' },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 border border-slate-200 p-10 rounded-[2.5rem] flex flex-col h-full hover:shadow-2xl hover:shadow-orange-600/10 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-black text-xl mb-8">
                  {i + 1}
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-4 leading-tight">{card.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: POR QUE ESSA IMERSÃO É DIFERENTE */}
      <section className="py-40 relative">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-24">
             <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Comparação <span className="text-orange-500">Inevitável</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/[0.02] border border-white/5 p-12 rounded-[3rem] opacity-50 grayscale"
            >
              <h4 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-10 flex items-center gap-3">
                <div className="w-1.5 h-10 bg-slate-600" /> Cursos Comuns
              </h4>
              <ul className="space-y-8">
                {['Muita teoria e slides genéricos', 'Pouca aplicação prática no negócio', 'Conteúdo que você acha no YouTube', 'Discurso bonito, zero execução', 'Solidão absoluta após o curso'].map((txt, i) => (
                  <li key={i} className="flex gap-4 text-slate-500 font-medium">
                    <CheckCircle2 className="w-5 h-5 opacity-20" /> {txt}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group lg:-mt-10 lg:mb-10"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-[3rem] blur-xl opacity-20" />
              <div className="relative bg-[#0A0A0A] border border-orange-500/30 p-12 rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                   <Trophy className="w-40 h-40" />
                </div>
                <h4 className="text-xl font-black uppercase tracking-widest text-orange-500 mb-10 flex items-center gap-3">
                   <div className="w-1.5 h-10 bg-orange-500" /> Nossa Imersão
                </h4>
                <ul className="space-y-8">
                  {[
                    'Prática guiada em tempo real',
                    'Aplicação real no SEU negócio',
                    'Mão na massa e ferramenta aberta',
                    'Execução guiada por especialistas',
                    'Aprendizado útil e imediato'
                  ].map((txt, i) => (
                    <li key={i} className="flex gap-4 text-white font-bold">
                      <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div> 
                      {txt}
                    </li>
                  ))}
                </ul>
                <div className="mt-12 pt-8 border-t border-white/10">
                   <p className="text-orange-500 font-black uppercase tracking-[0.2em] text-xs">A diferença é o resultado real.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: COMO VAI FUNCIONAR (TIMELINE) */}
      <section className="py-32 relative bg-[#080808] border-y border-white/5">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-orange-500 text-sm font-black uppercase tracking-[0.4em] mb-4">The Flow</h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Cronograma de Alta Performance</h3>
          </div>

          <div className="space-y-20 relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-orange-500/20 to-transparent" />
            
            {[
              { time: '09:00', icon: Users, title: 'Recepção e Network', desc: 'Direcionamento e café com outros tomadores de decisão.' },
              { time: '10:00', icon: Brain, title: 'IA: O Novo Mindset', desc: 'Introdução prática e desmistificação do uso da IA no board.' },
              { time: '11:30', icon: Terminal, title: 'Laboratório de Comandos', desc: 'Demonstrações reais e início da construção de prompts ativos.' },
              { time: '14:00', icon: Rocket, title: 'Execução Acompanhada', desc: 'Mão na massa total. Aplicando ferramentas nos seus processos.' },
              { time: '16:00', icon: Target, title: 'Consolidação de Resultados', desc: 'Revisão das entregas e plano de escala pós-imersão.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-24 group"
              >
                <div className="absolute left-[20px] top-0 w-10 h-10 bg-black border-2 border-orange-600 rounded-full z-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <step.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] group-hover:bg-white/[0.04] transition-all">
                  <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-2 block">{step.time}</span>
                  <h4 className="text-2xl font-black uppercase tracking-tight mb-4">{step.title}</h4>
                  <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: AVISO IMPORTANTE */}
      <section className="py-20 relative">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div 
            {...REVEAL}
            className="relative bg-gradient-to-r from-orange-600 to-amber-600 rounded-[3rem] p-12 md:p-20 overflow-hidden text-center md:text-left"
          >
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex flex-col md:flex-row items-center gap-10">
                   <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 shrink-0">
                      <Laptop className="w-10 h-10 text-white animate-pulse" />
                   </div>
                   <div>
                      <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-4 italic">Leve seu Notebook ou Tablet</h4>
                      <p className="text-white/80 text-lg max-w-xl font-medium">Essa imersão foi desenhada para ser prática. Você vai acompanhar e aplicar tudo junto com os palestrantes, em tempo real.</p>
                   </div>
                </div>
                <div className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl">
                   Ferramenta Necessária
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 8: PALESTRANTES */}
      <section className="py-32 relative bg-[#050505]">
        <div className="container max-w-7xl mx-auto px-4">
           <div className="text-center mb-24">
              <h2 className="text-orange-500 text-sm font-black uppercase tracking-[0.4em] mb-4">A Autoridade</h2>
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Quem são os <span className="text-white relative">mentores?</span></h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {[
                { name: 'Gabriel Cunha', img: IMAGES.gabriel, desc: 'Especialista em tecnologia, inteligência artificial e aplicação prática no ambiente de negócios.' },
                { name: 'Leandro Korting', img: IMAGES.leandro, desc: 'Especialista em varejo, estratégia e uso de IA para aumentar eficiência e performance nas empresas.' }
              ].map((speaker, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="group relative"
                >
                  <div className="aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/10 relative">
                     <img src={speaker.img} alt={speaker.name} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-12 flex flex-col justify-end">
                        <p className="text-orange-500 font-black uppercase tracking-widest text-xs mb-2">Mentor Especialista</p>
                        <h4 className="text-3xl font-black uppercase tracking-tighter text-white mb-4 leading-none">{speaker.name}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed max-w-xs">{speaker.desc}</p>
                     </div>
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* SEÇÃO 9: O QUE VOCÊ LEVA NO FINAL */}
      <section className="py-32 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Processos', val: 'Velozes', icon: Zap },
                      { label: 'Visão de', val: 'Execução', icon: PlayCircle },
                      { label: 'Confiança', val: 'Total', icon: ShieldCheck },
                      { label: 'Decisão', val: 'Ágil', icon: MousePointer2 },
                    ].map((idx, i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-orange-500/30 transition-all">
                         <idx.icon className="w-8 h-8 text-orange-500 mb-6 group-hover:scale-110 transition-transform" />
                         <p className="text-2xl font-black text-white">{idx.val}</p>
                         <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{idx.label}</p>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="lg:col-span-7 order-1 lg:order-2">
                 <h2 className="text-orange-500 text-sm font-black uppercase tracking-[0.4em] mb-4">Transformação</h2>
                 <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                    Você vai sair <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">melhor do que entrou.</span>
                 </h3>
                 <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl">
                    Saia com clareza absoluta sobre como a IA vai transformar sua produtividade e os resultados financeiros do seu negócio.
                 </p>
                 <div className="space-y-4">
                   {['Mais clareza estratégica', 'Mais velocidade operacional', 'Menos tempo desperdiçado', 'Uso real de IA além do hype'].map((txt, i) => (
                     <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="font-bold uppercase tracking-widest text-xs text-white/80">{txt}</span>
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SEÇÃO 10: CHAMADA FINAL */}
      <section className="py-40 relative border-t border-white/5 bg-gradient-to-b from-transparent to-black">
        <div className="container max-w-5xl mx-auto px-4 text-center">
           <motion.div 
             {...FADE_UP}
             className="bg-white/5 border border-white/10 rounded-[4rem] p-12 md:p-24 relative overflow-hidden"
           >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-orange-600/10 blur-[100px] -z-10" />
              <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-10">
                 Domine a IA <br /> <span className="text-orange-500">ou seja dominado</span>
              </h2>
              
              <div className="inline-block bg-black p-8 rounded-[2rem] border border-orange-500/20 mb-12 shadow-2xl">
                 <p className="text-xs uppercase font-black tracking-[0.3em] text-orange-500 mb-2">Ingresso Exclusivo</p>
                 <div className="flex flex-col items-center">
                   <span className="text-slate-600 line-through text-2xl font-black mb-1">R$ 1.500,00</span>
                   <span className="text-6xl md:text-8xl font-black text-white tracking-tighter">R$ 1.197,00</span>
                 </div>
              </div>

              <div className="space-y-8">
                  <motion.a
                    href={PAYMENT_URL}
                    target="_blank"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => trackImersaoEvent('click_buy')}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-6 bg-white text-black px-8 py-4 md:px-16 md:py-8 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm md:text-xl shadow-2xl shadow-white/5 hover:bg-orange-600 hover:text-white transition-all group"
                  >
                     <span>Comprar</span>
                     <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </motion.a>
                  <div className="space-y-2">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Vagas extremamente limitadas pelo formato prático.</p>
                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em]">2º LOTE DISPONÍVEL</p>
                  </div>
               </div>

              <div className="mt-20 pt-10 border-t border-white/5">
                 <p className="text-sm text-slate-500 italic max-w-2xl mx-auto">
                    "Você pode continuar assistindo o mercado mudar ou aprender a usar IA a seu favor agora."
                 </p>
              </div>
           </motion.div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="py-20 bg-black border-t border-white/5">
         <div className="container max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
               <div>
                  <img src={APP_CONFIG.logoPath} alt="Everest Logo" className="h-10 mb-6 mx-auto md:mx-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Everest Retail • Empresas no Topo LTDA</p>
               </div>
               <div className="flex gap-12">
                  <Link to="/termos" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Termos de Uso</Link>
                  <Link to="/privacidade" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Privacidade</Link>
               </div>
            </div>
         </div>
      </footer>

      {/* FLOAT CTA */}
      <motion.a
        href="https://wa.me/556199280069"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => trackImersaoEvent('click_whatsapp')}
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl"
      >
        <MessageCircle className="w-8 h-8 fill-current" />
      </motion.a>

    </div>
  );
}
