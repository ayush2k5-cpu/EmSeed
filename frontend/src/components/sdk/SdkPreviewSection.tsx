import React, { useState } from 'react';

export default function SdkPreviewSection() {
    const [activeTab, setActiveTab] = useState<'sdk' | 'mcp'>('mcp');
    const [copied, setCopied] = useState(false);

    const sdkCode = `import { EmSeed } from '@emseed/sdk';

// Initialize with your org context
const emseed = new EmSeed({
  contextSource: './hr-docs',
  model: 'gpt-4',
  localOnly: true
});

// One message, personalized for everyone
const message = await emseed.personalise({
  text: "We need to accelerate this sprint",
  team: ['riya', 'karan', 'priya']
});

// Returns 3 versions matched to motivation styles
console.log(message.variants);`;

    const mcpCode = `{
  "mcpServers": {
    "emseed": {
      "command": "python",
      "args": [
        "-m",
        "backend.mcp.server"
      ],
      "cwd": "/path/to/EmSeed" // Change this to your local EmSeed repo path
    }
  }
}`;

    const handleCopy = () => {
        const textToCopy = activeTab === 'sdk' ? sdkCode : mcpCode;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="bg-lemon py-32 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-violet/20 rounded-full mb-8 text-violet text-sm">
                    <span className="text-violet font-mono text-xs">{'</>'}</span> <span className="font-sans">Developer Tools</span>
                </div>
                <h2 className="font-serif text-[48px] md:text-[64px] text-violet mb-6 leading-tight">
                    Build with EmSeed
                </h2>
                <p className="font-sans text-[18px] md:text-[20px] text-violet/80 font-light max-w-2xl mx-auto">
                    Integrate empathy-driven communication directly into your IDE or product using our SDK and FastMCP server.
                </p>
            </div>

            {/* Code Editor Mockup */}
            <div className="max-w-5xl mx-auto bg-[#1A1A24] rounded-[24px] shadow-2xl shadow-violet/20 overflow-hidden animate-fade-up border border-white/5" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                {/* Editor Header */}
                <div className="bg-[#232330] px-6 flex items-end justify-between border-b border-white/5 pt-4">
                    <div className="flex items-center gap-6 mb-3">
                        <div className="flex gap-2 mr-4">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                        </div>

                        <div className="flex gap-1 h-full items-end mt-2">
                            <button
                                onClick={() => setActiveTab('mcp')}
                                className={`px-4 pb-2 text-sm font-sans transition-all duration-200 border-b-2 ${activeTab === 'mcp' ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white/70'}`}
                            >
                                Claude MCP Install
                            </button>
                            <button
                                onClick={() => setActiveTab('sdk')}
                                className={`px-4 pb-2 text-sm font-sans transition-all duration-200 border-b-2 ${activeTab === 'sdk' ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white/70'}`}
                            >
                                Node.js SDK
                            </button>
                        </div>
                    </div>

                    <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 mb-3 rounded-md bg-white/5 text-white/80 font-sans text-xs cursor-pointer hover:bg-white/10 transition-colors">
                        {copied ? (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27C93F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span className="text-[#27C93F]">Copied</span>
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                Copy
                            </>
                        )}
                    </button>
                </div>

                {/* Editor Content */}
                <div className="p-8 md:p-12 overflow-x-auto text-left min-h-[350px]">
                    <pre className="font-mono text-[14px] md:text-[16px] leading-[1.8] text-[#E8E0FF]">
                        {activeTab === 'sdk' ? (
                            <code>
                                <span className="text-[#C8A96E]">import</span> {'{ EmSeed }'} <span className="text-[#C8A96E]">from</span> <span className="text-[#789A99]">'@emseed/sdk'</span>;{'\n\n'}
                                <span className="text-[#9E9E9E]">// Initialize with your org context</span>{'\n'}
                                <span className="text-[#C8A96E]">const</span> emseed = <span className="text-[#C8A96E]">new</span> EmSeed({'{'}{'\n'}
                                {'  '}contextSource: <span className="text-[#789A99]">'./hr-docs'</span>,{'\n'}
                                {'  '}model: <span className="text-[#789A99]">'gpt-4'</span>,{'\n'}
                                {'  '}localOnly: <span className="text-[#FFD2C2]">true</span>{'\n'}
                                {'}'});{'\n\n'}
                                <span className="text-[#9E9E9E]">// One message, personalized for everyone</span>{'\n'}
                                <span className="text-[#C8A96E]">const</span> message = <span className="text-[#C8A96E]">await</span> emseed.personalise({'{'}{'\n'}
                                {'  '}text: <span className="text-[#789A99]">"We need to accelerate this sprint"</span>,{'\n'}
                                {'  '}team: [<span className="text-[#789A99]">'riya'</span>, <span className="text-[#789A99]">'karan'</span>, <span className="text-[#789A99]">'priya'</span>]{'\n'}
                                {'}'});{'\n\n'}
                                <span className="text-[#9E9E9E]">// Returns 3 versions matched to motivation styles</span>{'\n'}
                                <span className="text-[#FFD2C2]">console</span>.log(message.variants);
                            </code>
                        ) : (
                            <code>
                                <span className="text-[#9E9E9E]">// Add this server config to your claude_desktop_config.json file</span>{'\n'}
                                <span className="text-[#9E9E9E]">// Mac: ~/Library/Application Support/Claude/claude_desktop_config.json</span>{'\n'}
                                <span className="text-[#9E9E9E]">// Windows: %APPDATA%\Claude\claude_desktop_config.json</span>{'\n\n'}
                                {'{'}{'\n'}
                                {'  '}<span className="text-[#C8A96E]">"mcpServers"</span>: {'{'}{'\n'}
                                {'    '}<span className="text-[#C8A96E]">"emseed"</span>: {'{'}{'\n'}
                                {'      '}<span className="text-[#C8A96E]">"command"</span>: <span className="text-[#789A99]">"python"</span>,{'\n'}
                                {'      '}<span className="text-[#C8A96E]">"args"</span>: [<span className="text-[#789A99]">"-m"</span>, <span className="text-[#789A99]">"backend.mcp.server"</span>],{'\n'}
                                {'      '}<span className="text-[#C8A96E]">"cwd"</span>: <span className="text-[#789A99]">"/absolute/path/to/EmSeed"</span> <span className="text-[#9E9E9E]">// Adjust me</span>{'\n'}
                                {'    }'}{'\n'}
                                {'  }'}{'\n'}
                                {'}'}
                            </code>
                        )}
                    </pre>
                </div>
            </div>
        </section>
    );
}
