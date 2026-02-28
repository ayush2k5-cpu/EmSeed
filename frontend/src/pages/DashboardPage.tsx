import React, { useEffect } from 'react';
import { useDashboardState } from '../hooks/useDashboardState';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ComposePanel from '../components/ComposePanel';
import OutputPanel from '../components/OutputPanel';
import RewriteModal from '../components/RewriteModal';
import KillSwitch from '../components/KillSwitch';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const {
        currentState,
        isGenerating,
        approvedCards,
        activeTab,
        language,
        selectedRecipients,
        message,
        handleGenerate,
        handleApproveCard,
        handleSendAll,
        handleKillSwitch,
        handleReset,
        handleCloseModal,
        handleTabChange,
        handleLanguageToggle,
        handleRecipientToggle,
        setMessage,
        rewrites,
        setCurrentState,
        killSwitchRecipient
    } = useDashboardState();

    useEffect(() => {
        if (searchParams.get('tab') === 'pulse') {
            handleTabChange('vitals');
            setCurrentState('vitals');
            // Slight delay lets layout render before state swap
            setTimeout(() => {
                handleTabChange('vitals');
                // The mock data usually relies on 'alert' state directly or tab 'vitals'
            }, 50);
        }
    }, [searchParams]);

    return (
        <div className="h-screen flex flex-col bg-peach overflow-hidden">
            <Header />

            <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

                {/* Left column */}
                <div className="w-1/2 border-r border-teal/20 overflow-y-auto">
                    <ComposePanel
                        message={message}
                        onMessageChange={setMessage}
                        selectedRecipients={selectedRecipients}
                        onRecipientToggle={handleRecipientToggle}
                        language={language}
                        onLanguageToggle={handleLanguageToggle}
                        isGenerating={isGenerating}
                        onGenerate={handleGenerate}
                    />
                </div>

                {/* Right column */}
                <div className="w-1/2 overflow-y-auto">
                    <OutputPanel
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        currentState={currentState}
                        onKillSwitch={handleKillSwitch}
                    />
                </div>
            </div>

            {/* Rewrite Modal */}
            {currentState === 'modal' && rewrites.length > 0 && (
                <RewriteModal
                    rewrites={rewrites}
                    approvedCards={approvedCards}
                    onApprove={handleApproveCard}
                    onSendAll={() => handleSendAll(navigate)}
                    onClose={handleCloseModal}
                />
            )}

            {/* Kill-Switch */}
            {currentState === 'killswitch' && (
                <KillSwitch onExit={handleReset} employeeName={killSwitchRecipient} />
            )}
        </div>
    );
}
