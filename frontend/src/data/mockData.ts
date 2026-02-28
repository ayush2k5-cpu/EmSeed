import type { TeamMember, RewriteCard, VitalBar, SurveyQuestion, HistoryEntry } from '../types'

export const teamMembers: TeamMember[] = [
    {
        id: 'priyanshu',
        name: 'Priyanshu',
        discType: 'D',
        discLabel: 'Challenger',
        energyLevel: 'energised',
        energyScore: 88,
        communicationPref: 'Direct, challenge-driven, autonomous',
        recentSignals: [5, 5, 4],
    },
    {
        id: 'granth',
        name: 'Granth',
        discType: 'S',
        discLabel: 'Steady Anchor',
        energyLevel: 'depleted',
        energyScore: 28,
        communicationPref: 'Needs reassurance and stability, not urgency',
        recentSignals: [2, 1, 1],
    },
    {
        id: 'anika',
        name: 'Anika',
        discType: 'C',
        discLabel: 'Careful Thinker',
        energyLevel: 'neutral',
        energyScore: 55,
        communicationPref: 'Needs data, structure and clear process steps',
        recentSignals: [3, 3, 2],
    },
    {
        id: 'rahul',
        name: 'Rahul',
        discType: 'I',
        discLabel: 'Motivator',
        energyLevel: 'depleted',
        energyScore: 18,
        communicationPref: 'Social, optimistic, relationship-first',
        recentSignals: [2, 1, 1],
    },
]

export const mockRewrites: RewriteCard[] = [
    {
        memberId: 'priyanshu',
        memberName: 'Priyanshu',
        discType: 'D',
        discLabel: 'Challenger',
        energyLevel: 'energised',
        rewrittenMessage:
            "This sprint is our proving ground. I know you're built for exactly this. Take the lead on the client module — your call on how.",
        approved: false,
    },
    {
        memberId: 'granth',
        memberName: 'Granth',
        discType: 'S',
        discLabel: 'Steady Anchor',
        energyLevel: 'depleted',
        rewrittenMessage:
            "Granth, just checking in — hope you're doing okay. We're in the final stretch and I want to make sure you have everything you need. You're not in this alone.",
        approved: false,
    },
    {
        memberId: 'anika',
        memberName: 'Anika',
        discType: 'C',
        discLabel: 'Careful Thinker',
        energyLevel: 'neutral',
        rewrittenMessage:
            "Anika — deliverable due Friday EOD. Current scope: API layer review → QA signoff → submit. Flag any blockers by EOD today so we can unblock quickly.",
        approved: false,
    },
    {
        memberId: 'rahul',
        memberName: 'Rahul',
        discType: 'I',
        discLabel: 'Motivator',
        energyLevel: 'depleted',
        rewrittenMessage:
            "Rahul, it's been a tough week. Letting you know we're fully behind you.",
        approved: false,
    },
]

export const mockVitals: VitalBar[] = [
    { memberId: 'priyanshu', name: 'Priyanshu', score: 88, energyLevel: 'energised', emoji: '🔥', isAlert: false },
    { memberId: 'anika', name: 'Anika', score: 55, energyLevel: 'neutral', emoji: '🤔', isAlert: false },
    { memberId: 'granth', name: 'Granth', score: 65, energyLevel: 'neutral', emoji: '🫂', isAlert: false },
    { memberId: 'rahul', name: 'Rahul', score: 18, energyLevel: 'depleted', emoji: '😶', isAlert: true },
]

export const mockHistory: HistoryEntry[] = [
    {
        id: 'h1',
        timestamp: '2 days ago',
        memberName: 'Priyanshu',
        discType: 'D',
        discLabel: 'Challenger',
        message: 'Last sprint was strong. Take ownership of the deployment decision — your call entirely.',
        status: 'responded',
    },
    {
        id: 'h2',
        timestamp: '4 days ago',
        memberName: 'Granth',
        discType: 'S',
        discLabel: 'Steady Anchor',
        message: "Just checking in — hope you're doing okay. You're not behind. Take the time you need this week.",
        status: 'seen',
    },
    {
        id: 'h3',
        timestamp: '6 days ago',
        memberName: 'Anika',
        discType: 'C',
        discLabel: 'Careful Thinker',
        message: 'Your role this sprint: QA lead on the payment flow. Detailed brief coming. You will have what you need.',
        status: 'delivered',
    },
    {
        id: 'h4',
        timestamp: '1 week ago',
        memberName: 'Rahul',
        discType: 'I',
        discLabel: 'Motivator',
        message: 'Missed you at the social catching up!',
        status: 'seen',
    },
]

export const surveyQuestions: SurveyQuestion[] = [
    {
        q: 'When your team faces a crisis, you...',
        options: [
            'Take charge immediately and make the call',
            'Rally the team and keep spirits up',
            "Support whoever is leading and ensure everyone's okay",
            'Gather all information before acting',
        ],
    },
    {
        q: 'When giving feedback to a colleague, you tend to...',
        options: [
            'Be direct — tell them exactly what needs to change',
            "Start with what's going well to keep them motivated",
            'Frame it as a conversation, checking how they feel first',
            'Prepare specific examples and a structured improvement plan',
        ],
    },
    {
        q: 'Your ideal work environment is...',
        options: [
            'Fast-paced, high-stakes, with clear ownership',
            'Collaborative, social, with room for creativity',
            'Stable, predictable, with a strong team culture',
            'Organised, quality-driven, with defined processes',
        ],
    },
    {
        q: 'When a project changes direction last-minute, you...',
        options: [
            'Immediately replan and drive the new direction',
            "Keep the team's morale up and focus on the opportunity",
            'Feel unsettled but adapt once the team aligns',
            'Want to understand the reasoning and new requirements fully',
        ],
    },
    {
        q: 'When you achieve something significant at work, you prefer...',
        options: [
            'Being recognised for the result and impact',
            'Celebrating with the team and sharing the credit',
            'Knowing that everyone around you is doing well too',
            'Seeing the quality of the work speak for itself',
        ],
    },
    {
        q: 'In a team meeting with disagreement, you...',
        options: [
            'State your position clearly and push for a decision',
            'Try to find common ground and keep the energy positive',
            'Listen carefully and avoid escalating tension',
            'Present the facts and logical arguments for your view',
        ],
    },
    {
        q: 'When you receive a message from your manager, you most notice...',
        options: [
            'Whether it gets to the point quickly',
            'The tone — whether it feels warm or cold',
            'Whether it feels supportive or pressured',
            "Whether it's accurate, complete, and makes sense",
        ],
    },
]
