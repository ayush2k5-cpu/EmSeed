import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen bg-lemon flex flex-col items-center justify-center px-6 pt-20 pb-20 overflow-hidden">
            {/* Organic background shapes */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-ember/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-80 h-80 bg-ember/10 rounded-full blur-3xl opacity-80" />
            <div className="absolute top-1/2 left-2/3 w-40 h-40 bg-teal/10 rounded-full blur-2xl" />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center mt-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-violet/20 rounded-full mb-10 text-violet text-sm">
                    <span className="text-violet">🌱</span> <span className="font-sans">Empathy Operationalised</span>
                </div>

                <h1 className="font-serif text-[60px] md:text-[100px] leading-[1.05] text-violet mb-8 animate-fade-up transition-all">
                    Same message.<br />Right soil.<br />Every time.
                </h1>

                <p className="font-sans text-[18px] md:text-[22px] text-violet/80 max-w-2xl mb-12 animate-fade-up font-light" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                    EmSeed transforms how leaders communicate. One message, personalised for every team member's motivation style — powered by AI, grounded in empathy.
                </p>

                <div className="flex flex-col sm:flex-row w-full max-w-lg gap-4 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 px-6 py-4 rounded-[12px] border border-violet/20 bg-white/70 focus:outline-none focus:border-violet text-violet font-sans text-lg"
                    />
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="bg-violet text-peach px-8 py-4 rounded-[12px] font-sans font-medium text-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                        Experience the Demo →
                    </button>
                </div>

                <p className="mt-8 text-violet/50 font-sans text-sm animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                    Join the waitlist for exclusive early access
                </p>
            </div>
        </section>
    );
}
