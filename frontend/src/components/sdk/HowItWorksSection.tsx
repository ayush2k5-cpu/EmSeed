import React from 'react';

export default function HowItWorksSection() {
    return (
        <section className="bg-lemon py-32 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-20 animate-fade-up">
                    <h2 className="font-serif text-[48px] md:text-[64px] text-violet mb-6 leading-tight">
                        From one message<br />to perfect resonance
                    </h2>
                    <p className="font-sans text-[18px] md:text-[20px] text-violet/80 font-light max-w-2xl mx-auto">
                        Personalised communication boosts engagement scores by 40% and makes employees 56% less likely to leave.
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-[2px] bg-violet/10 md:-ml-[1px]" />

                    {/* Step 1 */}
                    <div className="relative mb-24 md:flex items-center justify-between w-full animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                        <div className="hidden md:block w-[45%]"></div>

                        <div className="absolute left-0 md:left-1/2 w-20 h-20 bg-violet rounded-[20px] flex items-center justify-center -ml-[10px] md:-ml-10 z-10 shadow-lg shadow-violet/20">
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-lemon rounded-full border border-violet/10 flex items-center justify-center font-serif text-[14px] text-violet font-bold">
                                01
                            </div>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FEFACD" strokeWidth="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>

                        <div className="w-full md:w-[45%] ml-[100px] md:ml-0 bg-white/60 backdrop-blur-sm p-8 rounded-[24px] border border-violet/10">
                            <h3 className="font-serif text-[28px] text-violet mb-3">Leader Types One Message</h3>
                            <p className="font-sans text-[16px] text-violet/70 leading-relaxed font-light">
                                Write your message once. No templates, no complexity. Just your authentic voice.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative mb-24 md:flex items-center justify-between w-full animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                        <div className="w-full md:w-[45%] ml-[100px] md:ml-0 bg-white/60 backdrop-blur-sm p-8 rounded-[24px] border border-violet/10 md:text-right order-2 md:order-1">
                            <h3 className="font-serif text-[28px] text-violet mb-3">RAG Pulls Context</h3>
                            <p className="font-sans text-[16px] text-violet/70 leading-relaxed font-light">
                                Our Model Context Protocol engine retrieves context from HR documents, 1-on-1 notes, working styles. Stored locally. Nothing leaves your machine.
                            </p>
                        </div>

                        <div className="absolute left-0 md:left-1/2 w-20 h-20 bg-violet rounded-[20px] flex items-center justify-center -ml-[10px] md:-ml-10 z-10 shadow-lg shadow-violet/20 order-1 md:order-2">
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-lemon rounded-full border border-violet/10 flex items-center justify-center font-serif text-[14px] text-violet font-bold">
                                02
                            </div>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FEFACD" strokeWidth="1.5">
                                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                            </svg>
                        </div>

                        <div className="hidden md:block w-[45%] order-3"></div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative md:flex items-center justify-between w-full animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                        <div className="hidden md:block w-[45%]"></div>

                        <div className="absolute left-0 md:left-1/2 w-20 h-20 bg-violet rounded-[20px] flex items-center justify-center -ml-[10px] md:-ml-10 z-10 shadow-lg shadow-violet/20">
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-lemon rounded-full border border-violet/10 flex items-center justify-center font-serif text-[14px] text-violet font-bold">
                                03
                            </div>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FEFACD" strokeWidth="1.5">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9z" strokeOpacity="0.2"></path>
                                <circle cx="12" cy="12" r="3" fill="#FEFACD"></circle>
                            </svg>
                        </div>

                        <div className="w-full md:w-[45%] ml-[100px] md:ml-0 bg-white/60 backdrop-blur-sm p-8 rounded-[24px] border border-violet/10">
                            <h3 className="font-serif text-[28px] text-violet mb-3">AI Personalises × 5</h3>
                            <p className="font-sans text-[16px] text-violet/70 leading-relaxed font-light">
                                LLM rewrites your message five ways — matched to motivation type, processing style, and energy level for each team member.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
