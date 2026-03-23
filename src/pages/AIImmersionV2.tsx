"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Laptop, ArrowRight, CheckCircle2, Sparkles, Brain, Zap, Target, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImersaoNavbar from '@/components/ImersaoNavbar';
import CountdownTimer from '@/components/CountdownTimer';
import WhatsAppButton from '@/components/WhatsAppButton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { APP_CONFIG } from '@/config/appConfig';

const AIImmersionV2 = () => {
  const paymentLink = "https://clkdmg.site/pay/imersao-de-ia-na-pratica";
  const locationLink = "https://share.google/IOtYfSZxkvXdhJVVG";
  const robotImg = "https://ik.imagekit.io/lflb43qwh/ENTStore/Design%20sem%20nome%20(1).png";
  const mainEventImg = "https://ik.imagekit.io/lflb43qwh/ENT/Imersao%20de%20IA%20-%20ENT.jpeg";
  const bgHeroImg = "https://ik.imagekit.io/lflb43qwh/ENTStore/IA2.jpg?updatedAt=1773771273536";
  const logoImg = "https://dyad-media://media/patient-griffin-twirl/.dyad/media/bb0b7ac1726218c714a5958210a6923a.png";

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-cyan-500/30">
      <ImersaoNavbar />
      <WhatsAppButton />

      {/* Hero Section - Adjusted padding for desktop */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-24 lg:pt-32">
        {/* Background Lights */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            src={bgHeroImg} 
            alt="IA Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/40 to-[#020617]" />
          
          {/* Neon Glow Spots */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
          
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: Math.random()
                }}
                animate={{ 
                  y: [null, "-20%"],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 5, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </div>

        <div className="container relative z-10 px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-300 to-blue-500 leading-[1] drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  IMERSÃO DE IA <br /> NA PRÁTICA
                </h1>
                <p className="text-lg md:text-xl text-cyan-100/80 max-w-xl font-light leading-relaxed">
                  Aprenda a usar inteligência artificial no que realmente gera resultado. 
                  <span className="block mt-2 font-medium text-white">Nada de teoria. Aqui você aplica IA no seu negócio em tempo real.</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-cyan-500/30 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <Calendar className="text-cyan-400 w-5 h-5" />
                  <span className="text-sm font-bold">26/03 às 9h</span>
                </div>
                <a 
                  href={locationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-cyan-500/30 rounded-full backdrop-blur-md hover:bg-cyan-500/20 hover:border-cyan-500/60 transition-all group shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                >
                  <MapPin className="text-cyan-400 w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold">Auditório do Sicredi</span>
                </a>
              </div>

              <div className="max-w-sm">
                <CountdownTimer />
              </div>

              <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="inline-block">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#020617] font-black text-lg px-10 py-7 rounded-full transition-all hover:scale-105 shadow-[0_0_40px_rgba(34,211,238,0.6)] group">
                  GARANTIR MINHA VAGA
                  <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform w-5 h-5" />
                </Button>
              </a>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-10 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center">
                <img 
                  src={mainEventImg} 
                  alt="Logo Evento" 
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
              </div>
            </motion.div>
            
            {/* Mobile Image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden relative mt-8"
            >
              <div className="relative">
                <img 
                  src={mainEventImg} 
                  alt="Logo Evento" 
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Robot Insight Section */}
      <section className="py-32 relative overflow-hidden bg-[#020617]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Robot Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-cyan-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative rounded-[48px] overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(34,211,238,0.2)]">
                <img 
                  src={robotImg} 
                  alt="AI Robot" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -right-6 bg-cyan-500 text-[#020617] p-6 rounded-3xl shadow-2xl border border-white/20"
              >
                <Brain className="w-8 h-8 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Inteligência<br/>Aumentada</p>
              </motion.div>
            </motion.div>

            {/* Content */}
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                  O Futuro não é <br />
                  <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">sobre máquinas.</span>
                </h2>
                <p className="text-xl text-gray-400 font-light leading-relaxed">
                  É sobre como humanos usam máquinas para alcançar o impossível. A IA é o maior salto de produtividade da história da humanidade.
                </p>
              </div>

              <div className="grid gap-6">
                {[
                  { icon: Zap, title: "Velocidade Exponencial", desc: "Processe em segundos o que levaria semanas de trabalho manual." },
                  { icon: Target, title: "Precisão Cirúrgica", desc: "Elimine o erro humano em tarefas repetitivas e complexas." },
                  { icon: Rocket, title: "Escala Ilimitada", desc: "Cresça seu negócio sem precisar aumentar proporcionalmente sua equipe." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 p-6 bg-white/5 border border-white/10 rounded-[32px] hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <item.icon className="text-cyan-400 w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pattern Break */}
      <section className="py-32 bg-[#020617] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        <div className="container px-4 mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter leading-tight"
          >
            "A maioria ensina IA. <br />
            <span className="text-cyan-400 italic drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">Nós ensinamos aplicação."</span>
          </motion.h2>
        </div>
      </section>

      {/* What You Will Do */}
      <section id="experiencia" className="py-24 relative">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative rounded-[32px] overflow-hidden aspect-square shadow-[0_0_50px_rgba(34,211,238,0.15)] border border-white/10"
            >
              <img 
                src="https://ik.imagekit.io/lflb43qwh/ENTStore/IA1.jpg" 
                alt="IA Application" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="p-5 bg-white/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <p className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] mb-1">Foco Total</p>
                  <h4 className="text-xl font-bold">Resultados Mensuráveis</h4>
                </div>
              </div>
            </motion.div>

            <div className="space-y-10">
              <div className="space-y-3">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter">O que você vai fazer</h3>
                <p className="text-lg text-gray-400 font-light">Um roteiro prático desenhado para quem não tem tempo a perder.</p>
              </div>
              
              <div className="grid gap-4">
                {[
                  "Automatizar tarefas reais",
                  "Usar IA no dia a dia",
                  "Ganhar produtividade",
                  "Tomar decisões mais rápidas",
                  "Estruturar uso de IA no negócio"
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-5 p-6 bg-white/5 border border-white/10 rounded-[24px] hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group cursor-default shadow-[0_0_15px_rgba(0,0,0,0.2)]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/40 transition-all group-hover:scale-110 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      <CheckCircle2 className="text-cyan-400 w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practical Experience */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={robotImg} 
            alt="Robot Future" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="container relative z-10 px-4 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[1]">Você não vai assistir. <br /> <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Você vai fazer.</span></h2>
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              Esqueça palestras passivas. Traga seus desafios reais e saia com soluções implementadas. 
              A imersão é 100% focada em execução guiada por quem vive isso no campo de batalha.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Human + IA */}
      <section className="py-32 bg-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative rounded-[40px] overflow-hidden border border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.15)] group"
            >
              <img 
                src="https://ik.imagekit.io/lflb43qwh/ENTStore/IA1.jpg" 
                alt="Human and AI" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-40" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                  IA não substitui quem sabe usar. <br />
                  <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">Ela potencializa quem entende.</span>
                </h2>
                <div className="h-1 w-20 bg-cyan-500 rounded-full" />
              </div>
              
              <div className="space-y-6 text-lg text-gray-300 font-light leading-relaxed">
                <p>
                  A inteligência artificial não é uma ameaça para quem domina a tecnologia, mas sim um <span className="text-white font-bold">superpoder</span>. Enquanto outros temem a substituição, você estará construindo sistemas que trabalham por você.
                </p>
                <p>
                  Nesta imersão, você vai aprender a delegar o operacional para a máquina, multiplicando sua capacidade de entrega e liberando seu tempo para o que realmente importa: <span className="text-cyan-400 font-medium">a estratégia e o crescimento do seu negócio.</span>
                </p>
                <div className="flex items-center gap-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                  <Sparkles className="text-cyan-400 w-8 h-8 shrink-0" />
                  <p className="text-sm font-medium text-cyan-100">Saia da frente do computador e comece a gerenciar a inteligência que trabalha para você.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="metodologia" className="py-32 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="container px-4 mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Como funciona</h2>
            <p className="text-lg text-gray-400">Uma jornada de 10 horas de pura execução.</p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { title: "Chegada", desc: "Networking estratégico e setup técnico" },
              { title: "Introdução Prática", desc: "Conceitos fundamentais sem enrolação" },
              { title: "Execução Guiada", desc: "Mão na massa total com ferramentas de ponta" },
              { title: "Aplicação no Negócio", desc: "Resolvendo o seu caso real ao vivo" },
              { title: "Consolidação", desc: "Plano de ação final para o seu negócio" }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 bg-white/5 border border-white/10 rounded-[32px] text-center group hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all hover:-translate-y-2 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
              >
                <div className="text-5xl font-black text-cyan-500/10 mb-4 group-hover:text-cyan-500/40 transition-colors">0{i+1}</div>
                <h4 className="text-xl font-bold mb-3 tracking-tight">{step.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Image Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative rounded-[48px] overflow-hidden border border-cyan-500/30 shadow-[0_0_80px_rgba(34,211,238,0.2)]"
          >
            <img 
              src={bgHeroImg} 
              alt="IA Vision" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
          </motion.div>
        </div>
      </section>

      {/* Warning */}
      <section className="py-20 bg-cyan-500 text-[#020617] relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.4)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-[#020617] rounded-[24px] shadow-2xl">
              <Laptop className="w-12 h-12 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-1">Leve seu notebook</h3>
              <p className="text-xl font-medium opacity-90">Você vai executar tudo ao vivo.</p>
            </div>
          </div>
          <div className="h-px md:h-20 w-full md:w-px bg-[#020617]/20" />
          <div className="text-center md:text-right">
            <p className="text-base font-black uppercase tracking-[0.3em] mb-1">Vagas Limitadas</p>
            <p className="text-xl font-light">Ambiente preparado para alta performance.</p>
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section id="palestrantes" className="py-32">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Especialistas</h2>
            <p className="text-lg text-gray-400">Quem vai te guiar nessa jornada.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {[
              { 
                name: "Gabriel Cunha", 
                img: "https://ik.imagekit.io/lflb43qwh/ENT/GabrielC.jpeg?updatedAt=1773885482950",
                role: "Estrategista de IA",
                desc: "Especialista em automação e escala de negócios através de inteligência artificial."
              },
              { 
                name: "Leandro Korting", 
                img: "https://ik.imagekit.io/lflb43qwh/ENT/LeandroK.jpeg",
                role: "Especialista em Implementação",
                desc: "Focado em transformar processos complexos em fluxos simples e eficientes com IA."
              }
            ].map((speaker, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="group relative"
              >
                <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <img 
                    src={speaker.img} 
                    alt={speaker.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10">
                    <p className="text-cyan-400 font-black tracking-[0.3em] uppercase text-[10px] mb-2">{speaker.role}</p>
                    <h4 className="text-4xl font-black mb-3 tracking-tighter">{speaker.name}</h4>
                    <p className="text-gray-300 text-base font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">{speaker.desc}</p>
                  </div>
                </div>
                <div className="absolute -inset-6 bg-cyan-500/10 blur-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Master Sponsor */}
              <div className="flex flex-col items-center space-y-6">
                <p className="text-[10px] font-black tracking-[0.5em] uppercase text-gray-400">Patrocinador Master</p>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="w-full h-56 md:h-72 flex items-center justify-center p-10 bg-gray-50 rounded-[40px] border border-gray-100 shadow-sm"
                >
                  <img 
                    src="https://ik.imagekit.io/lflb43qwh/ENTStore/Sicredi.png?updatedAt=1773712987920" 
                    alt="Sicredi" 
                    className="max-h-full max-w-full object-contain"
                  />
                </motion.div>
              </div>
              
              {/* Strategic Support */}
              <div className="flex flex-col items-center space-y-6">
                <p className="text-[10px] font-black tracking-[0.5em] uppercase text-gray-400">Apoio Estratégico</p>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="w-full h-56 md:h-72 flex items-center justify-center p-10 bg-gray-50 rounded-[40px] border border-gray-100 shadow-sm"
                >
                  <img 
                    src="https://ik.imagekit.io/lflb43qwh/ENTStore/Santa%20Permuta.jpg?updatedAt=1773712988606" 
                    alt="Santa Permuta" 
                    className="max-h-full max-w-full object-contain rounded-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32">
        <div className="container px-4 mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Dúvidas Frequentes</h2>
            <p className="text-lg text-gray-400">Tudo o que você precisa saber antes de garantir sua vaga.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: "Preciso saber programar?", a: "Não. A imersão é focada em ferramentas de IA que não exigem código, permitindo que qualquer pessoa consiga implementar as soluções." },
              { q: "O que preciso levar?", a: "Apenas seu notebook or tablet com carregador. Todo o material de apoio e acesso às ferramentas será fornecido no dia." },
              { q: "Para quem é este evento?", a: "Empresários, gestores, profissionais liberais e qualquer pessoa que queira aumentar sua produtividade e resultados usando IA." },
              { q: "Terei suporte após o evento?", a: "Sim, todos os participantes terão acesso a um grupo exclusivo para troca de experiências e materiais complementares." }
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 bg-white/5 rounded-[24px] px-6 overflow-hidden hover:border-cyan-500/30 transition-colors">
                <AccordionTrigger className="text-lg font-bold hover:no-underline py-6 text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 text-base pb-6 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Pricing & Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter leading-[1]">
              Você pode continuar assistindo conteúdo… <br />
              <span className="text-cyan-400 italic drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">ou aprender a usar IA de verdade.</span>
            </h2>

            <div className="bg-white/5 border border-cyan-500/20 rounded-[48px] p-12 mb-12 backdrop-blur-3xl relative overflow-hidden group shadow-[0_0_60px_rgba(34,211,238,0.15)]">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full" />
              
              <p className="text-gray-500 line-through text-2xl mb-3 font-light">De: R$ 1.500</p>
              <div className="flex flex-col items-center justify-center gap-1 mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">Investimento Único</span>
                <p className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">R$ 1.197,00</p>
              </div>

              <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#020617] font-black text-2xl py-10 rounded-[32px] transition-all hover:scale-[1.02] shadow-[0_20px_50px_rgba(34,211,238,0.5)] group">
                  QUERO PARTICIPAR
                  <ArrowRight className="ml-3 w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </Button>
              </a>
              
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-gray-400 text-xs font-medium">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-cyan-400" /> Pagamento Seguro</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-cyan-400" /> Acesso Imediato</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-cyan-400" /> Vagas Limitadas</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
        <div className="container px-4 mx-auto">
          <img 
            src={APP_CONFIG.logoPath} 
            alt="Empresas no Topo" 
            className="h-12 mx-auto mb-6 opacity-40 grayscale rounded-lg"
          />
          <p className="text-gray-500 text-base font-light">© 2024 Imersão de IA na Prática. Todos os direitos reservados.</p>
          <div className="mt-4 flex flex-col md:flex-row justify-center gap-4 text-gray-600 text-xs uppercase tracking-widest">
            <p className="text-center">Criado por Israel Souza @israelcmadf</p>
            <p className="text-center">Empresas no Topo</p>
            <p className="text-center">www.empresasnotopo.com.br</p>
            <p className="text-center">suporte@ent.app.br</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIImmersionV2;
