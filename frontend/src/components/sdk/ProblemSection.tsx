import React from 'react';

export default function ProblemSection() {
    return (
        <section className="bg-violet text-lemon py-32 px-6 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 relative z-10">
                    {/* Riya Card */}
                    <div className="bg-lemon rounded-[24px] p-10 text-violet animate-fade-up shadow-xl shadow-void/10">
                        <div className="text-4xl mb-4">💪</div>
                        <h3 className="font-serif text-[32px] mb-1">Riya</h3>
                        <p className="font-sans text-[14px] text-violet/60 mb-8 font-medium">Senior Developer</p>
                        <p className="font-sans text-[17px] leading-relaxed mb-10">
                            Hears it as a challenge. Opens her laptop before the call even ends.
                        </p>
                        <div className="inline-block px-5 py-2 rounded-full bg-teal/10 border border-teal/20 text-teal text-[13px] font-semibold tracking-wide">
                            Energized
                        </div>
                    </div>

                    {/* Karan Card */}
                    <div className="bg-lemon rounded-[24px] p-10 text-violet animate-fade-up shadow-xl shadow-void/10" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                        <div className="text-4xl mb-4">😔</div>
                        <h3 className="font-serif text-[32px] mb-1">Karan</h3>
                        <p className="font-sans text-[14px] text-violet/60 mb-8 font-medium">QA Engineer</p>
                        <p className="font-sans text-[17px] leading-relaxed mb-10">
                            Hears it as blame. He was already working weekends. Logs off feeling unseen.
                        </p>
                        <div className="inline-block px-5 py-2 rounded-full bg-[#E8736A]/10 border border-[#E8736A]/20 text-[#E8736A] text-[13px] font-semibold tracking-wide">
                            Discouraged
                        </div>
                    </div>

                    {/* Priya Card */}
                    <div className="bg-lemon rounded-[24px] p-10 text-violet animate-fade-up shadow-xl shadow-void/10" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                        <div className="text-4xl mb-4">🙄</div>
                        <h3 className="font-serif text-[32px] mb-1">Priya</h3>
                        <p className="font-sans text-[14px] text-violet/60 mb-8 font-medium">Product Designer</p>
                        <p className="font-sans text-[17px] leading-relaxed mb-10">
                            Hears nothing at all. Waiting for someone to tell her what 'step it up' means.
                        </p>
                        <div className="inline-block px-5 py-2 rounded-full bg-violet/10 border border-violet/20 text-violet text-[13px] font-semibold tracking-wide">
                            Confused
                        </div>
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="bg-void/10 backdrop-blur-md rounded-[32px] p-16 mb-20 animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                    <div className="text-center mb-16">
                        <h4 className="font-serif text-[28px] italic text-lemon">
                            <span className="mr-3 not-italic inline-block -rotate-12 translate-y-1">↘</span> The Cost of Miscommunication
                        </h4>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between text-center gap-12">
                        <div className="flex-1">
                            <div className="font-serif text-[72px] mb-3 leading-none">66%</div>
                            <div className="font-sans text-[16px] opacity-80 max-w-[220px] mx-auto">of leaders face daily miscommunication</div>
                        </div>
                        <div className="flex-1">
                            <div className="font-serif text-[72px] mb-3 leading-none text-peach">$438B</div>
                            <div className="font-sans text-[16px] opacity-80 max-w-[220px] mx-auto">lost to disengagement globally in 2024</div>
                        </div>
                        <div className="flex-1">
                            <div className="font-serif text-[72px] mb-3 leading-none">23%</div>
                            <div className="font-sans text-[16px] opacity-80 max-w-[220px] mx-auto">of employees feel engaged at work</div>
                        </div>
                    </div>
                </div>

                {/* Conclusion Text */}
                <div className="max-w-4xl mx-auto text-center animate-fade-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
                    <p className="font-sans text-[22px] leading-relaxed font-light text-lemon/90">
                        This is not a leadership failure. This is an <span className="font-medium text-peach border-b border-peach pb-1">influence failure</span>. Every existing tool tracks what people do. Not one ensures what a leader means actually arrives intact.
                    </p>
                </div>
            </div>
        </section>
    );
}
