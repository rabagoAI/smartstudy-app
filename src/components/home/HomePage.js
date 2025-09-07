import React from 'react';
import Hero from './Hero';
import SubjectsSection from './SubjectsSection';
import FeaturesSection from '../common/FeaturesSection';
import Testimonials from '../common/Testimonials';
import AIToolsTeaser from './AIToolsTeaser';

function HomePage() {
  return (
    <>
      <Hero />
      <SubjectsSection />
      <FeaturesSection />
      <AIToolsTeaser />
      <Testimonials />
    </>
  );
}

export default HomePage;