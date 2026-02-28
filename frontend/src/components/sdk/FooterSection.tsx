import React from 'react';

export default function FooterSection() {
    return (
        <footer className="bg-violet text-lemon py-20 px-6 relative overflow-hidden">
            <div className="max-w-6xl mx-auto flex flex-col items-center">

                <h2 className="font-serif text-[40px] md:text-[56px] text-center mb-4 leading-tight animate-fade-up">
                    Ready to transform how you lead?
                </h2>

                <p className="font-sans text-[16px] md:text-[20px] text-lemon/80 font-light text-center mb-12 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                    Join the waitlist and be among the first to experience empathy at scale.
                </p>

                <div className="flex flex-col sm:flex-row w-full max-w-lg gap-4 mb-24 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 px-6 py-4 rounded-[12px] border border-lemon/30 bg-transparent focus:outline-none focus:border-lemon text-lemon font-sans placeholder-lemon/50"
                    />
                    <button className="bg-lemon text-violet px-8 py-4 rounded-[12px] font-sans font-medium hover:bg-white transition-colors whitespace-nowrap">
                        Get Early Access →
                    </button>
                </div>

                {/* Footer Links Area */}
                <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-t border-lemon/20 pt-16 mt-10 animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[24px]">🌱</span>
                            <span className="font-serif text-[28px]">EmSeed</span>
                        </div>
                        <p className="font-sans text-[14px] text-lemon/60 mb-2">Same message. Right soil. Every time.</p>
                        <p className="font-sans text-[14px] text-lemon/60">HumAIn First® Technology</p>
                    </div>

                    <div className="flex gap-16 md:gap-24">
                        <div>
                            <h4 className="font-serif text-[18px] mb-4">Product</h4>
                            <ul className="flex flex-col gap-3 font-sans text-[14px] text-lemon/70">
                                <li><a href="#" className="hover:text-lemon transition-colors">How It Works</a></li>
                                <li><a href="#" className="hover:text-lemon transition-colors">Developer SDK</a></li>
                                <li><a href="#" className="hover:text-lemon transition-colors">HumAIn First®</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-serif text-[18px] mb-4">Connect</h4>
                            <div className="flex gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-lemon/10 flex items-center justify-center hover:bg-lemon/20 cursor-pointer transition-colors text-[18px]">✉️</div>
                                <div className="w-10 h-10 rounded-full bg-lemon/10 flex items-center justify-center hover:bg-lemon/20 cursor-pointer transition-colors text-[18px]">🐙</div>
                                <div className="w-10 h-10 rounded-full bg-lemon/10 flex items-center justify-center hover:bg-lemon/20 cursor-pointer transition-colors text-[18px]">🔗</div>
                            </div>
                            <p className="font-sans text-[12px] text-lemon/50">Building the future of empathetic leadership</p>
                        </div>
                    </div>
                </div>

                <div className="w-full text-center mt-16 pt-8 border-t border-lemon/10 font-sans text-[12px] text-lemon/40">
                    © 2026 EmSeed. All rights reserved. HumAIn First® is a registered trademark.
                </div>
            </div>
        </footer>
    );
}
