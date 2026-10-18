import React from 'react';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import EcosystemSection from '../components/home/EcosystemSection';

export default function HomePage({ onOpenDemo, onSelectFeature }) {
  return (
    <div className="flex-grow">
      <HeroSection onOpenDemo={onOpenDemo} />
      <StatsSection />
      <FeaturesSection onSelectFeature={onSelectFeature} />
      <EcosystemSection onOpenDemo={onOpenDemo} />
    </div>
  );
}
