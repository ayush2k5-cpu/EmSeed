export type DISCType = 'D' | 'I' | 'S' | 'C';

export type EnergyLevel =
    'energised' | 'strong' | 'good' | 'neutral' | 'depleted';

export type SignalValue = 1 | 2 | 3 | 4 | 5;

export type DashboardState =
    'default' | 'modal' | 'vitals' | 'alert' | 'killswitch';

export interface TeamMember {
    id: string;
    name: string;
    discType: DISCType;
    discLabel: string;
    energyLevel: EnergyLevel;
    energyScore: number;
    communicationPref: string;
    recentSignals: SignalValue[];
}

export interface RewriteCard {
    memberId: string;
    memberName: string;
    discType: DISCType;
    discLabel: string;
    energyLevel: EnergyLevel;
    rewrittenMessage: string;
    approved: boolean;
}

export interface VitalBar {
    memberId: string;
    name: string;
    score: number;
    energyLevel: EnergyLevel;
    emoji: string;
    isAlert: boolean;
}

export interface SurveyQuestion {
    q: string;
    options: string[];
}

export interface HistoryEntry {
    id: string;
    timestamp: string;
    memberName: string;
    discType: DISCType;
    discLabel: string;
    message: string;
    status: 'delivered' | 'seen' | 'responded';
}
