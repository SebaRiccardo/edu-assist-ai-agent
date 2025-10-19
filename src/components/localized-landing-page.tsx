/**
 * Localized Landing Page Component
 * Supports both English (USD) and Spanish (ARS) versions
 */

'use client';

import React from 'react';
import { Mail, Zap, CheckCircle, BookOpen, MessageSquare, Tag, Trash2, Lock } from 'lucide-react';
import { AuroraBackground } from './aurora-background';
import { LandingNav } from './landing-nav';
import { getLocalizedPlansWithLimits, formatPrice } from '@/subscriptions/plans-utils';

interface LocalizedLandingPageProps {
  onGetStarted: () => void;
  locale?: 'en' | 'es';
}

export function LocalizedLandingPage({ onGetStarted, locale = 'en' }: LocalizedLandingPageProps) {
  // Get localized plans
  const plansConfig = getLocalizedPlansWithLimits(locale);

  const plans = plansConfig.map(plan => ({
    name: plan.name,
    subtitle: plan.subtitle,
    price: formatPrice(plan.price, plan.currency as 'USD' | 'ARS'),
    period: plan.period,
    description: plan.description,
    features: plan.features,
    cta: plan.key === 'basic' ? (locale === 'es' ? 'Comenzar' : 'Get Started') : locale === 'es' ? 'Prueba Gratis' : 'Start Free Trial',
    highlighted: plan.highlighted,
  }));

  const content = {
    en: {
      hero: {
        title: 'Your inbox, finally',
        titleHighlight: 'earns tenure',
        subtitle: 'InboxProfs AI organizes, labels, and replies to academic emails — automatically.',
        description: 'So you can spend less time managing messages and more time mentoring minds.',
        cta: '🎓 Start Free Trial',
        pricing: 'View Pricing',
        or: 'or',
        note: 'No setup. No credit card. Just peace of mind.',
      },
      valueProposition: {
        title: 'Teach. Research. Think.',
        titleHighlight: "We'll handle your inbox.",
        description:
          'InboxProfs AI learns from your courses and communication patterns. It sorts messages by class, filters distractions, and keeps important student emails front and center.',
        tagline: 'Your inbox stays calm — even in midterm season.',
      },
      howItWorks: {
        title: 'How It Works',
        steps: [
          {
            title: 'Connect your inbox',
            description: 'InboxProfs syncs with Gmail or Outlook in seconds.',
          },
          {
            title: 'Watch it organize itself',
            description: 'AI detects course-related emails and labels them automatically.',
          },
          {
            title: 'Stay focused',
            description: 'Important threads rise to the top. Routine emails handle themselves.',
          },
          {
            title: 'Sit back',
            description: 'InboxProfs runs continuously — even replying to common messages for you.',
            badge: 'PRO ONLY',
          },
        ],
      },
      features: {
        title: 'Features That Actually Help',
        items: [
          {
            icon: '🧠',
            title: 'Smart Labeling',
            description: 'Understands subjects, courses, and students — and organizes emails by context, instantly.',
          },
          {
            icon: '✨',
            title: 'Inbox Clean-Up',
            description: 'Removes clutter like spam and outdated threads, keeping your inbox zen.',
          },
          {
            icon: '💬',
            title: 'Auto-Replies',
            badge: '(Pro)',
            description: 'Politely responds to routine requests — like syllabus links or deadlines — using your tone and style.',
          },
          {
            icon: '📚',
            title: 'Course Awareness',
            description: 'Knows your classes, projects, and committees — keeping each conversation in its right place.',
          },
          {
            icon: '🔒',
            title: 'Private by Design',
            description: 'Built with privacy in mind. Your academic data stays secure and confidential.',
          },
          {
            icon: '⚡',
            title: 'Lightning Fast',
            description: 'Processes hundreds of emails in seconds, keeping you ahead of the curve.',
          },
        ],
      },
      pricing: {
        title: 'Choose Your Plan',
        subtitle: 'Every plan starts free. Upgrade anytime.',
        mostPopular: 'Most Popular',
        cta: '🚀 Start Free Trial',
      },
      finalCta: {
        title: 'More time teaching.',
        titleHighlight: 'Less time triaging.',
        description: 'InboxProfs AI gives you your inbox — and your sanity — back.',
        note: 'Loved by professors. Trusted by inboxes.',
      },
      footer: {
        copyright: '© 2025 InboxProfs AI. All rights reserved.',
      },
    },
    es: {
      hero: {
        title: 'Tu bandeja de entrada, finalmente',
        titleHighlight: 'obtiene tenure',
        subtitle: 'InboxProfs AI organiza, etiqueta y responde correos académicos — automáticamente.',
        description: 'Para que puedas pasar menos tiempo gestionando mensajes y más tiempo formando mentes.',
        cta: '🎓 Comenzar Prueba Gratis',
        pricing: 'Ver Precios',
        or: 'o',
        note: 'Sin configuración. Sin tarjeta de crédito. Solo tranquilidad.',
      },
      valueProposition: {
        title: 'Enseña. Investiga. Piensa.',
        titleHighlight: 'Nosotros manejamos tu bandeja.',
        description:
          'InboxProfs AI aprende de tus cursos y patrones de comunicación. Ordena mensajes por clase, filtra distracciones y mantiene los correos importantes de estudiantes al frente.',
        tagline: 'Tu bandeja permanece tranquila — incluso en temporada de parciales.',
      },
      howItWorks: {
        title: 'Cómo Funciona',
        steps: [
          {
            title: 'Conecta tu bandeja',
            description: 'InboxProfs sincroniza con Gmail u Outlook en segundos.',
          },
          {
            title: 'Mira cómo se organiza',
            description: 'La IA detecta correos relacionados con cursos y los etiqueta automáticamente.',
          },
          {
            title: 'Mantente enfocado',
            description: 'Los hilos importantes suben al tope. Los correos rutinarios se manejan solos.',
          },
          {
            title: 'Relájate',
            description: 'InboxProfs funciona continuamente — incluso respondiendo mensajes comunes por ti.',
            badge: 'SOLO PRO',
          },
        ],
      },
      features: {
        title: 'Funciones que Realmente Ayudan',
        items: [
          {
            icon: '🧠',
            title: 'Etiquetado Inteligente',
            description: 'Entiende materias, cursos y estudiantes — y organiza correos por contexto, instantáneamente.',
          },
          {
            icon: '✨',
            title: 'Limpieza de Bandeja',
            description: 'Elimina desorden como spam y hilos obsoletos, manteniendo tu bandeja zen.',
          },
          {
            icon: '💬',
            title: 'Respuestas Automáticas',
            badge: '(Pro)',
            description: 'Responde cortésmente a solicitudes rutinarias — como enlaces al programa o fechas límite — usando tu tono y estilo.',
          },
          {
            icon: '📚',
            title: 'Conciencia de Cursos',
            description: 'Conoce tus clases, proyectos y comités — manteniendo cada conversación en su lugar correcto.',
          },
          {
            icon: '🔒',
            title: 'Privado por Diseño',
            description: 'Construido con privacidad en mente. Tus datos académicos permanecen seguros y confidenciales.',
          },
          {
            icon: '⚡',
            title: 'Ultrarrápido',
            description: 'Procesa cientos de correos en segundos, manteniéndote adelante de la curva.',
          },
        ],
      },
      pricing: {
        title: 'Elige Tu Plan',
        subtitle: 'Cada plan comienza gratis. Actualiza en cualquier momento.',
        mostPopular: 'Más Popular',
        cta: '🚀 Comenzar Prueba Gratis',
      },
      finalCta: {
        title: 'Más tiempo enseñando.',
        titleHighlight: 'Menos tiempo clasificando.',
        description: 'InboxProfs AI te devuelve tu bandeja — y tu cordura.',
        note: 'Amado por profesores. Confiado por bandejas de entrada.',
      },
      footer: {
        copyright: '© 2025 InboxProfs AI. Todos los derechos reservados.',
      },
    },
  };

  const t = content[locale];

  return (
    <div className="min-h-screen">
      <AuroraBackground>
        <div className="relative w-full h-full flex flex-col">
          <LandingNav onGetStarted={onGetStarted} />

          {/* Hero Section */}
          <section className="flex-1 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                  {t.hero.title} <span className="text-primary">{t.hero.titleHighlight}</span>.
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground mb-4 leading-relaxed">{t.hero.subtitle}</p>
                <p className="text-lg text-muted-foreground/80 mb-10">{t.hero.description}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={onGetStarted}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    {t.hero.cta}
                  </button>
                  <button
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium"
                  >
                    {t.hero.or} <span className="underline">{t.hero.pricing}</span>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground/70 mt-6">{t.hero.note}</p>
              </div>
            </div>
          </section>
        </div>
      </AuroraBackground>

      {/* Rest of the sections with translated content... */}
      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.pricing.title}</h2>
            <p className="text-lg text-muted-foreground mb-2">{t.pricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30 scale-105 relative'
                    : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/40'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
                    {t.pricing.mostPopular}
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold mb-1 ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}>{plan.name}</h3>
                  <p className={`text-sm ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{plan.subtitle}</p>
                </div>
                <div className="text-center mb-6">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}>{plan.price}</span>
                  <span className={`text-sm ml-2 ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{plan.period}</span>
                </div>
                <p
                  className={`text-center mb-8 text-sm leading-relaxed ${plan.highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                >
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle
                        className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-primary-foreground/80' : 'text-primary'}`}
                      />
                      <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/90' : 'text-foreground'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-background text-foreground hover:bg-background/90 shadow-md'
                      : 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onGetStarted}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              {t.pricing.cta}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Mail className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-foreground">InboxProfs AI</span>
            </div>
            <p className="text-muted-foreground text-sm">{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
