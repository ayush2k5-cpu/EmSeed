import { useState, useRef, useEffect } from 'react';
import type { DashboardState, RewriteCard as RewriteCardType } from '../types';

export function useDashboardState() {
    const [currentState, setCurrentState] = useState<DashboardState>('default');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [approvedCards, setApprovedCards] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'vitals' | 'history'>('vitals');
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>(['priyanshu', 'granth', 'anika', 'rahul']);
    const [message, setMessage] = useState<string>('');

    const [rewrites, setRewrites] = useState<RewriteCardType[]>([]);
    const [killSwitchRecipient, setKillSwitchRecipient] = useState<string>('');

    const generateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        };
    }, []);

    const handleGenerate = async () => {
        if (message.trim() === '' || selectedRecipients.length === 0) return;
        setIsGenerating(true);
        setRewrites([]);

        try {
            const fetchedRewrites: RewriteCardType[] = [];
            let killSwitchTriggered = false;
            let triggerName = '';

            const promises = selectedRecipients.map(async (recipientId) => {
                const response = await fetch('http://localhost:8000/api/rewrite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipient_id: recipientId,
                        original_draft: message,
                        sender_id: 'leader_01'
                    })
                });

                const json = await response.json();

                // Kill-switch: backend detected sustained low resonance for this recipient
                if (json.success && json.data?.kill_switch_engaged) {
                    killSwitchTriggered = true;
                    triggerName = recipientId.charAt(0).toUpperCase() + recipientId.slice(1);
                    return; // skip adding a rewrite card for this recipient
                }

                if (json.success && json.data?.rewrites && json.data.rewrites.length > 0) {
                    const rewriteVariant = json.data.rewrites[0];

                    // Resolve discLabel from DISC type
                    const discLabelMap: Record<string, string> = {
                        D: 'Challenger',
                        I: 'Motivator',
                        S: 'Steady Anchor',
                        C: 'Careful Thinker',
                    };
                    const discType = (rewriteVariant.variant || 'D').charAt(0) as 'D' | 'I' | 'S' | 'C';
                    const discLabel = discLabelMap[discType] || 'Mapped Context';

                    fetchedRewrites.push({
                        memberId: recipientId,
                        memberName: recipientId.charAt(0).toUpperCase() + recipientId.slice(1),
                        discType,
                        discLabel,
                        energyLevel: 'neutral',
                        rewrittenMessage: rewriteVariant.text,
                        approved: false
                    });
                }
            });

            await Promise.all(promises);

            // Kill-switch takes priority over modal — fire it immediately
            if (killSwitchTriggered) {
                setKillSwitchRecipient(triggerName);
                setCurrentState('killswitch');
                return;
            }

            if (fetchedRewrites.length > 0) {
                setRewrites(fetchedRewrites);
                setCurrentState('modal');
            } else {
                alert("Could not generate rewrites from the backend. Make sure the backend is running on port 8000.");
                setCurrentState('default');
            }
        } catch (error) {
            console.error("API Error: ", error);
            alert("Connection error: Could not reach backend API at localhost:8000.");
            setCurrentState('default');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApproveCard = (memberId: string) => {
        setApprovedCards((prev) => [...prev, memberId]);
    };

    // Note: useNavigate is normally called inside components,
    // so we will accept navigate as an argument to handleSendAll
    const handleSendAll = (navigate: (path: string, options?: any) => void) => {
        if (approvedCards.length === 0) return;

        // Try to find the first approved rewrite to display dynamically on the Tap screen
        const firstApprovedId = approvedCards[0];
        const approvedRewrite = rewrites.find(r => r.memberId === firstApprovedId);

        const tapState = approvedRewrite ? {
            name: approvedRewrite.memberName,
            message: approvedRewrite.rewrittenMessage
        } : undefined;

        // When sending, instantly transition to the Employee Tap Screen with state
        navigate('/tap', { state: tapState });

        // We'll reset state when we come back
        setCurrentState('default');
    };

    const handleKillSwitch = () => {
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        setCurrentState('killswitch');
    };

    const handleReset = () => {
        if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        setCurrentState('default');
        setIsGenerating(false);
        setApprovedCards([]);
        setActiveTab('vitals');
        setMessage('');
        setRewrites([]);
        setKillSwitchRecipient('');
    };

    const handleCloseModal = () => {
        setCurrentState('default');
    };

    const handleTabChange = (tab: 'vitals' | 'history') => {
        setActiveTab(tab);
    };

    const handleLanguageToggle = () => {
        setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
    };

    const handleRecipientToggle = (memberId: string) => {
        setSelectedRecipients((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    return {
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
    };
}
