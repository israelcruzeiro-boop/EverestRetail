import React from 'react';
import { useAuth } from '@/context/AuthContext';
import MissionStreakModal from './MissionStreakModal';

export default function MissionStreakLoader() {
    const { missionStreak, setMissionStreak } = useAuth();

    if (!missionStreak) return null;

    return (
        <MissionStreakModal
            isOpen={!!missionStreak}
            onClose={() => setMissionStreak(null)}
            amount={missionStreak.amount}
            streak={missionStreak.streak}
        />
    );
}
