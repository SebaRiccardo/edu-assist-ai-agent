import React from 'react';
import {
  Mail,
  Zap,
  Shield,
  CheckCircle,
  Sparkles,
  BookOpen,
  MessageSquare,
  Tag,
  Trash2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { AuroraBackground } from './aurora-background';
import { LandingNav } from './landing-nav';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const plans = [
    {
      name: 'Free',
      subtitle: 'Just Getting Started',
      price: '$0',
      period: 'forever',
      description:
        'Smart labeling for one inbox and up to 2 courses. See how much time you save.',
      features: [
        'Smart labeling for 1 inbox',
        'Up to 2 courses',
        'Basic email organization',
        'Course-aware filtering',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Basic',
      subtitle: 'Stay on Top of It',
      price: '$29',
      period: 'per month',
      description: 'Unlimited courses, faster labeling, and advanced sorting.',
      features: [
        'Unlimited courses',
        'Advanced smart labeling',
        'Priority sorting',
        'Faster processing',
        'Email analytics',
        'Custom label rules',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Pro',
      subtitle: 'Full Autopilot',
      price: '$79',
      period: 'per month',
      description:
        'Your inbox runs itself — background cleanup, auto-replies, and smart prioritization.',
      features: [
        'Everything in Basic',
        'Auto-replies (AI-powered)',
        'Background cleanup',
        'Smart prioritization',
        'Continuous organization',
        'Custom response templates',
        'Advanced analytics',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <AuroraBackground>
        <div className="relative w-full h-full flex flex-col">
          {/* Navigation */}
          <LandingNav onGetStarted={onGetStarted} />

          {/* Hero Section */}
          <section className="flex-1 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                  Your inbox, finally{' '}
                  <span className="text-primary">earns tenure</span>.
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground mb-4 leading-relaxed">
                  InboxProfs AI organizes, labels, and replies to academic
                  emails — automatically.
                </p>
                <p className="text-lg text-muted-foreground/80 mb-10">
                  So you can spend less time managing messages and more time
                  mentoring minds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={onGetStarted}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    🎓 Start Free Trial
                  </button>
                  <button
                    onClick={() =>
                      document
                        .getElementById('pricing')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium"
                  >
                    or <span className="underline">View Pricing</span>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground/70 mt-6">
                  No setup. No credit card. Just peace of mind.
                </p>
              </div>
            </div>
          </section>
        </div>
      </AuroraBackground>

      {/* Value Proposition Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            Teach. Research. Think.
            <br />
            <span className="text-primary">We'll handle your inbox.</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 leading-relaxed max-w-3xl mx-auto">
            InboxProfs AI learns from your courses and communication patterns.
            It sorts messages by class, filters distractions, and keeps
            important student emails front and center.
          </p>
          <p className="text-xl font-semibold text-foreground">
            Your inbox stays calm — even in midterm season.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="relative">
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border border-border/40 hover:border-primary/40 transition-all h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-2">
                  Connect your inbox
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  InboxProfs syncs with Gmail or Outlook in seconds.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border border-border/40 hover:border-primary/40 transition-all h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-2">
                  Watch it organize itself
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI detects course-related emails and labels them
                  automatically.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border border-border/40 hover:border-primary/40 transition-all h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-2">
                  Stay focused
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Important threads rise to the top. Routine emails handle
                  themselves.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border border-primary/40 h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  4
                </div>
                <div className="inline-block bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  PRO ONLY
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Sit back
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  InboxProfs runs continuously — even replying to common
                  messages for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Features That Actually Help
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                🧠 Smart Labeling
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Understands subjects, courses, and students — and organizes
                emails by context, instantly.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-chart-1/20 rounded-lg flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                ✨ Inbox Clean-Up
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Removes clutter like spam and outdated threads, keeping your
                inbox zen.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                💬 Auto-Replies{' '}
                <span className="text-xs text-primary">(Pro)</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Politely responds to routine requests — like syllabus links or
                deadlines — using your tone and style.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                📚 Course Awareness
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Knows your classes, projects, and committees — keeping each
                conversation in its right place.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-chart-4/20 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-chart-4" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                🔒 Private by Design
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Built with privacy in mind. Your academic data stays secure and
                confidential.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                ⚡ Lightning Fast
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Processes hundreds of emails in seconds, keeping you ahead of
                the curve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground mb-2">
              Every plan starts free. Upgrade anytime.
            </p>
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
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3
                    className={`text-2xl font-bold mb-1 ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                  >
                    {plan.subtitle}
                  </p>
                </div>
                <div className="text-center mb-6">
                  <span
                    className={`text-5xl font-bold ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ml-2 ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-center mb-8 text-sm leading-relaxed ${plan.highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                >
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle
                        className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                          plan.highlighted
                            ? 'text-primary-foreground/80'
                            : 'text-primary'
                        }`}
                      />
                      <span
                        className={`text-sm ${plan.highlighted ? 'text-primary-foreground/90' : 'text-foreground'}`}
                      >
                        {feature}
                      </span>
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
              🚀 Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            More time teaching.
            <br />
            <span className="text-primary">Less time triaging.</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            InboxProfs AI gives you your inbox — and your sanity — back.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              🎓 Start Free Trial
            </button>
            <button
              onClick={() =>
                document
                  .getElementById('pricing')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium"
            >
              or <span className="underline">View Pricing</span>
            </button>
          </div>
          <p className="text-sm text-muted-foreground/70 mt-8">
            Loved by professors. Trusted by inboxes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Mail className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                InboxProfs AI
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 InboxProfs AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
