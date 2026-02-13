import React, { useMemo } from 'react';

const messages = {
    friendly: {
        high: [
            "You're absolutely crushing it! Your focus is inspiring. ✨",
            "Incredible work today! You're a productivity machine! 🚀",
            "Wow, look at you go! Keep that momentum building! 💎",
            "You're on fire! Nothing can stop you now! 🔥",
            "Pure excellence! Your hard work is paying off perfectly. 🌟"
        ],
        mid: [
            "Good job getting halfway! You can push a bit more for that final stretch. 💪",
            "Decent progress! You're doing great, keep moving forward! 🏃",
            "You've got this! Just a few more tasks to reach the top! 🌈",
            "Steady and strong! Keep up the good work! 👍",
            "Halfway there! Take a breath and finish strong! ⚡"
        ],
        low: [
            "Tough day? It's okay, every master was once a beginner. Let's aim higher tomorrow! 🌱",
            "Don't worry about it. Tomorrow is a fresh start to win! ✨",
            "Rest up and recharge. You'll bounce back stronger! 🔋",
            "Small steps still count. Let's try to do one more task! 🐾",
            "Keep your head up! Consistency is key, and you'll get there! 🎯"
        ]
    },
    neutral: {
        high: [
            "Excellent discipline. Keep it up.",
            "Efficiency levels are optimal. Continue as planned.",
            "High productivity achieved. Moving to the next phase.",
            "Target reached. Statistical performance is superior.",
            "Objectives completed. Maintain this trajectory."
        ],
        mid: [
            "Decent work. You can push harder.",
            "Moderate progress detected. Efficiency could be improved.",
            "Half of the daily quota met. Continue working.",
            "Steady pace maintained. Ensure all tasks are finalized.",
            "Performance is average. Aim for higher output tomorrow."
        ],
        low: [
            "You wasted today. Fix it tomorrow.",
            "Output is below threshold. Re-evaluate your schedule.",
            "Goals not met. Increased focus required for next cycle.",
            "Minimal progress. This level of activity is insufficient.",
            "Productivity low. Plan for a better execution tomorrow."
        ]
    },
    rude: {
        high: [
            "Finally, you did something useful. Don't let it go to your head.",
            "Even a broken clock is right twice a day. Good job, I guess.",
            "Miracles do happen. You actually finished your work. 🙄",
            "Look who finally decided to be productive. Cute.",
            "Not bad. For a human, this is almost impressive."
        ],
        mid: [
            "Mediocre at best. Is half-baked your signature style?",
            "Doing the bare minimum again? Classic you.",
            "50% effort? That's what your parents said about your potential.",
            "You're halfway there, which is twice as far as I expected you'd get.",
            "Slightly better than zero. Not by much, though."
        ],
        low: [
            "You wasted today. Your couch must be proud of you. 🤡",
            "Go ahead, procrastinate more. I'm sure it'll end well. 🗑️",
            "If laziness was an Olympic sport, you'd have the gold medal.",
            "Is your goal to be as useless as possible? Because you're winning.",
            "Go take a nap. It's not like you were doing anything anyway."
        ]
    }
};

const FeedbackSection = ({ score, target, tone, theme }) => {
    const percentage = target > 0 ? (score / target) * 100 : 0;

    const feedback = useMemo(() => {
        let category = 'low';
        if (percentage >= 90) category = 'high';
        else if (percentage >= 50) category = 'mid';

        const toneMessages = messages[tone] || messages.neutral;
        const list = toneMessages[category];
        return list[Math.floor(Math.random() * list.length)];
    }, [percentage, tone]);

    const getColors = () => {
        if (percentage >= 90) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
        if (percentage >= 50) return 'bg-orange-500/10 border-orange-500/20 text-orange-500';
        return 'bg-red-500/10 border-red-500/20 text-red-500';
    };

    const getLightColors = () => {
        if (percentage >= 90) return 'bg-emerald-50 border-emerald-100 text-emerald-600';
        if (percentage >= 50) return 'bg-orange-50 border-orange-100 text-orange-600';
        return 'bg-red-50 border-red-100 text-red-600';
    };

    return (
        <div className={`mt-6 p-4 rounded-xl border transition-all duration-500 animate-float ${theme === 'dark' ? getColors() : getLightColors()}`}>
            <div className={`text-[13px] uppercase tracking-widest font-black mb-1 opacity-60`}>
                Coach Review — {tone}
            </div>
            <p className="font-bold text-base tracking-tight leading-relaxed">{feedback}</p>
        </div>
    );
};

export default FeedbackSection;
