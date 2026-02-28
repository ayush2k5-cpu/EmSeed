import React from 'react';

export default function KillSwitchSection() {
    return (
        <section className="bg-violet text-lemon py-32 px-6 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-void/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-5xl mx-auto align-center flex flex-col items-center">

                <div className="inline-flex items-center gap-2 px-4 py-2 border border-lemon/20 rounded-full mb-8 text-lemon text-sm animate-fade-up">
                    <span className="text-lemon">🤍</span> <span className="font-sans">HumAIn First®</span>
                </div>

                <h2 className="font-serif text-[48px] md:text-[64px] text-center mb-16 leading-[1.1] animate-fade-up transition-all" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                    Not as a principle.<br />As a product decision.
                </h2>

                {/* Kill Switch Main Card */}
                <div className="w-full bg-lemon rounded-[32px] p-8 md:p-12 text-violet animate-fade-up shadow-2xl shadow-void/20 mb-10" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-violet rounded-[14px] flex items-center justify-center text-lemon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h3 className="font-serif text-[32px]">The Kill-Switch</h3>
                    </div>

                    <p className="font-sans text-[20px] font-light leading-relaxed mb-10">
                        When someone hits critical disengagement levels, EmSeed doesn't send another message. It shuts itself off completely.
                    </p>

                    <div className="bg-violet rounded-[20px] border-l-[6px] border-peach p-8 md:p-10">
                        <p className="font-serif text-[28px] md:text-[34px] text-lemon/90 leading-snug">
                            "This person doesn't need a better message. They need you."
                        </p>
                    </div>
                </div>

                {/* Secondary Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {/* Contagion Alerts */}
                    <div className="bg-void/10 backdrop-blur-md border border-lemon/10 rounded-[24px] p-10 animate-fade-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                        <div className="w-12 h-12 bg-lemon/10 rounded-[14px] flex items-center justify-center text-lemon mb-6">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h4 className="font-serif text-[26px] text-lemon mb-3">Contagion Alerts</h4>
                        <p className="font-sans text-[16px] text-lemon/70 leading-relaxed font-light">
                            Disengagement spreads. EmSeed detects multi-signal drops in team energy and alerts you before it compounds.
                        </p>
                    </div>

                    {/* Live Dashboard */}
                    <div className="bg-void/10 backdrop-blur-md border border-lemon/10 rounded-[24px] p-10 animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                        <div className="w-12 h-12 bg-lemon/10 rounded-[14px] flex items-center justify-center text-lemon mb-6">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                        </div>
                        <h4 className="font-serif text-[26px] text-lemon mb-3">Live Energy Dashboard</h4>
                        <p className="font-sans text-[16px] text-lemon/70 leading-relaxed font-light">
                            Stop guessing. Know exactly who is energized, who is depleted, and who needs acknowledgement before direction.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}
