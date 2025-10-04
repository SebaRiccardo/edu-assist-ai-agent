import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, FileText, MessageSquare, Sparkles, User } from 'lucide-react';
import { AuroraBackground } from './aurora-background';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {


  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out the platform',
      features: [
        '5 AI queries per day',
        'Basic assignment feedback',
        'Email support',
        'Standard response time',
      ],
      cta: 'Get Started',
      highlighted: false,
      planType: 'free',
    },
    {
      name: 'Basic',
      price: '$29',
      period: 'per month',
      description: 'Ideal for individual teachers',
      features: [
        '100 AI queries per day',
        'Advanced assignment feedback',
        'Automated grading assistance',
        'Priority email support',
        'Custom rubric creation',
        'Student progress tracking',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
      planType: 'basic',
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      description: 'For serious educators',
      features: [
        'Unlimited AI queries',
        'All Basic features',
        'Bulk assignment processing',
        'Advanced analytics dashboard',
        'Priority support (24/7)',
        'Integration with LMS',
        'Custom AI training',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
      planType: 'professional',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For institutions and departments',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'On-premise deployment option',
        'Advanced security features',
        'Custom SLA',
        'Team training sessions',
      ],
      cta: 'Contact Sales',
      highlighted: false,
      planType: 'enterprise',
    },
  ];

  return (
    <div className="min-h-screen">
      <AuroraBackground showRadialGradient={false}>
        <div className="relative w-full h-full flex flex-col">
          {/* Navigation */}
          <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <span className="text-xl font-bold text-foreground">EduAssist AI</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onGetStarted}
                    className="text-foreground hover:text-primary px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onGetStarted}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="flex-1 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Your AI Teaching Assistant for
                  <span className="text-primary"> Modern Education</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Save hours every week with intelligent assignment grading, personalized student feedback,
                  and automated administrative tasks. Focus on what matters most - teaching.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={onGetStarted}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                  >
                    Start Free Trial
                  </button>
                  <button
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground border border-border/40 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-background/80 transition-all shadow-sm"
                  >
                    View Pricing
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </AuroraBackground>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features designed specifically for university educators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Intelligent Grading</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered grading that understands context and provides consistent, fair evaluations
                across all assignments.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Personalized Feedback</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate detailed, constructive feedback tailored to each student's work and learning style.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-chart-1/20 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Time Savings</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reduce grading time by up to 80% while maintaining high-quality feedback standards.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Course Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Organize multiple courses, track student progress, and manage assignments effortlessly.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Custom Rubrics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create and save custom grading rubrics that align with your teaching philosophy.
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all">
              <div className="w-12 h-12 bg-chart-4/20 rounded-lg flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-chart-4" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Student Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track individual student progress and identify areas where additional support is needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Flexible pricing for educators at every stage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30 scale-105'
                    : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-none shadow-none'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ml-2 ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mb-6 ${plan.highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle
                        className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? 'text-primary-foreground/80' : 'text-chart-2'
                        }`}
                      />
                      <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/90' : 'text-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-background/95 backdrop-blur text-foreground hover:bg-background/80 shadow-sm'
                      : 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-foreground">EduAssist AI</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 EduAssist AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
