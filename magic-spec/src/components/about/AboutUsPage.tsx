import React, { useEffect, useState } from 'react';
import { PageHeader } from '../PageHeader';
import { HeroSection } from './HeroSection';
import { StoryTimeline } from './StoryTimeline';
import { TeamSection } from './TeamSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CommunityImpactSection } from './CommunityImpactSection';
import { ValuesSection } from './ValuesSection';
import { ContactSection } from './ContactSection';
import { useLocationDetection } from '../location/LocationDetector';
export const AboutUsPage = () => {
  const { locationData } = useLocationDetection();
  const [animatedStats, setAnimatedStats] = useState({
    storiesPublished: 0,
    communitiesServed: 0,
    readersReached: 0,
    localBusinessesSupported: 0
  });
  const targetStats = {
    storiesPublished: 15783,
    communitiesServed: 87,
    readersReached: 1250000,
    localBusinessesSupported: 3426
  };
  // Animate the stats on page load
  useEffect(() => {
    const duration = 2000; // 2 seconds for the animation
    const steps = 50; // Number of steps in the animation
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        storiesPublished: Math.floor(targetStats.storiesPublished * progress),
        communitiesServed: Math.floor(targetStats.communitiesServed * progress),
        readersReached: Math.floor(targetStats.readersReached * progress),
        localBusinessesSupported: Math.floor(
          targetStats.localBusinessesSupported * progress
        )
      });
      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <PageHeader />
      <main>
        {/* Hero Section */}
        <HeroSection locationName={locationData?.city || 'Clearwater'} />
        {/* Our Story Timeline */}
        <StoryTimeline />
        {/* Meet the Team Section */}
        <TeamSection />
        {/* How It Works Section */}
        <HowItWorksSection />
        {/* Community Impact Section */}
        <CommunityImpactSection stats={animatedStats} />
        {/* Values & Ethics Section */}
        <ValuesSection />
        {/* Contact Section */}
        <ContactSection />
      </main>
    </div>);

};