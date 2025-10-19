import React from 'react';
import { Mail } from 'lucide-react';
import { AuroraBackground } from './aurora-background';
import PricingSection from './landing/PricingSection';
import HeroSection from './landing/HeroSection';
import ValuePropositionSection from './landing/ValuePropositionSection';
import HowItWorksSection from './landing/HowItWorksSection';
import FeaturesSection from './landing/FeaturesSection';
import FinalCTASection from './landing/FinalCTASection';
import FAQ from './faq';
import { Navbar } from './landing/navbar';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <AuroraBackground>
        <div className="relative w-full h-full flex flex-col">
          <Navbar />
          <div className="mt-40">
            <HeroSection />
          </div>
        </div>
      </AuroraBackground>

      <ValuePropositionSection />

      <HowItWorksSection />

      <FeaturesSection />

      <PricingSection />

      <FAQ />
      <FinalCTASection />

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Mail className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-foreground">InboxProfs AI</span>
            </div>
            <p className="text-muted-foreground text-sm">© 2025 InboxProfs AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
