import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const levelUpMessages = {
    friendly: [
        "Incredible! You've ascended to Level {level}! Your dedication is truly legendary. ✨",
        "Level Up! Level {level} looks good on you, hero! Keep inspiring us! 🚀",
        "Victory! You're now Level {level}. Your growth is absolutely stunning! 💎",
        "New Power Unlocked! Welcome to Level {level}. You're becoming unstoppable! 🔥",
        "Ascension complete! Level {level} reached. Your journey is a masterpiece! 🌟"
    ],
    neutral: [
        "Level {level} achieved. Statistical growth remains consistent.",
        "Ascension to Level {level} recorded. Performance optimization successful.",
        "User status updated: Level {level}. Maintaining optimal productivity levels.",
        "New milestone reached: Level {level}. Data indicates continued progression.",
        "Level up detected. Level {level} clearance granted. Continue your tasks."
    ],
    rude: [
        "Level {level}? I guess even you can manage that if you try hard enough. 🙄",
        "You reached Level {level}. Don't expect a parade. Get back to work. 🤡",
        "Level {level} unlocked. Try not to mess it up like you mess up everything else.",
        "Oh, look! You're Level {level} now. Still behind everyone else, but keep going. 🗑️",
        "You levelled up to {level}. Is that supposed to impress me? Do more. 🤡"
    ]
};

const LevelUpModal = ({ level, tone, theme, onClose }) => {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const toneMessages = levelUpMessages[tone] || levelUpMessages.neutral;
        const randomMsg = toneMessages[Math.floor(Math.random() * toneMessages.length)];
        setMessage(randomMsg.replace("{level}", level));
    }, [level, tone]);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    className={`relative z-10 w-full max-w-sm rounded-[3rem] p-8 text-center border overflow-hidden ${theme === 'dark'
                            ? 'bg-slate-900 border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.2)]'
                            : 'bg-white border-orange-200 shadow-[0_20px_60px_rgba(249,115,22,0.15)]'
                        }`}
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />

                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-orange-500/40 border-4 border-white/20"
                    >
                        {level}
                    </motion.div>

                    <h2 className={`text-4xl font-black italic tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        LEVEL <span className="text-orange-500">UP!</span>
                    </h2>

                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="h-0.5 w-8 bg-orange-500/30 rounded-full" />
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>New Milestone Achieved</span>
                        <span className="h-0.5 w-8 bg-orange-500/30 rounded-full" />
                    </div>

                    <p className={`text-lg font-bold leading-relaxed mb-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                    >
                        Continue Quest
                    </button>

                    {/* Confetti-like bits */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                y: [-20, -100 - Math.random() * 50],
                                x: [-20 + Math.random() * 40],
                                rotate: [0, Math.random() * 360]
                            }}
                            transition={{
                                duration: 2 + Math.random(),
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-sm bg-orange-500 pointer-events-none"
                        />
                    ))}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LevelUpModal;
