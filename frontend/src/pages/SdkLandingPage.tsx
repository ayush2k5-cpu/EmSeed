import React, { useEffect, useState } from 'react';
import HeroSection from '../components/sdk/HeroSection';
import ProblemSection from '../components/sdk/ProblemSection';
import HowItWorksSection from '../components/sdk/HowItWorksSection';
import KillSwitchSection from '../components/sdk/KillSwitchSection';
import SdkPreviewSection from '../components/sdk/SdkPreviewSection';
import FooterSection from '../components/sdk/FooterSection';
import SeedIcon from '../components/SeedIcon';

export default function SdkLandingPage() {
    const [showSplash, setShowSplash] = useState(true);
    const [splashFading, setSplashFading] = useState(false);
    const [splashMounted, setSplashMounted] = useState(false);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);

        // Mount animation logic
        const tMount = setTimeout(() => setSplashMounted(true), 10);

        // Start fading out splash after 3 seconds
        const tFade = setTimeout(() => setSplashFading(true), 3000);

        // Completely remove splash from DOM after fade completes
        const tRemove = setTimeout(() => setShowSplash(false), 3600);

        return () => {
            clearTimeout(tMount);
            clearTimeout(tFade);
            clearTimeout(tRemove);
        };
    }, []);

    return (
        <div className="bg-lemon min-h-screen font-sans selection:bg-violet selection:text-lemon relative">

            {/* Splash Overlay */}
            {showSplash && (
                <div
                    className={`fixed inset-0 z-[100] bg-lemon flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${splashFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <SeedIcon animated={true} size={80} color="#5F4A8B" />

                    <h1
                        className={`font-serif text-[72px] text-violet tracking-[0.05em] transition-all duration-600 ease-out mt-8 ${splashMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: '2000ms' }}
                    >
                        EmSeed
                    </h1>

                    <p
                        className={`font-sans text-[18px] font-light text-muted transition-all duration-600 ease-out mt-2 ${splashMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: '2300ms' }}
                    >
                        Empathy Operationalised
                    </p>

                    <p
                        className={`font-sans italic text-[14px] text-violet/70 transition-all duration-600 ease-out mt-12 ${splashMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: '2600ms' }}
                    >
                        Same message. Right soil. Every time.
                    </p>
                </div>
            )}

            {/* Main Content */}
            <div className={`transition-opacity duration-1000 ${showSplash && !splashFading ? 'opacity-0' : 'opacity-100'}`}>
                <HeroSection />
                <ProblemSection />
                <HowItWorksSection />
                <KillSwitchSection />
                <SdkPreviewSection />
                <FooterSection />
            </div>
        </div>
    );
}
