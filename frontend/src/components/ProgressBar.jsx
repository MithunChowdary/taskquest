import React from 'react';

const ProgressBar = ({ current, target, completedCount, totalCount, theme, totalXP }) => {
    const percentage = totalCount > 0 ? Math.min(Math.round((completedCount / totalCount) * 100), 100) : 0;

    // Calculate level based on progressive XP curve
    const level = (() => {
        let xp = totalXP || 0;
        if (xp < 100) return 1;
        if (xp < 250) return 2;
        if (xp < 500) return 3;
        let lvl = 3;
        let requirement = 250;
        let step = 250;
        while (xp >= (requirement + step)) {
            requirement += step;
            lvl++;
            step = Math.floor(step * 1.5);
        }
        return lvl;
    })();

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-2xl text-white level-badge-glow border ${theme === 'dark' ? 'border-white/20' : 'border-orange-200'} shadow-lg shadow-orange-500/20`}>
                        {level}
                    </div>
                    <div>
                        <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-1 ${theme === 'dark' ? 'text-orange-400/70' : 'text-orange-500'}`}>Current level</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} leading-none`}>{completedCount}</span>
                            <span className={`text-[15px] font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-orange-300'}`}>/ {totalCount} Quests</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-black leading-none mb-1 transition-all duration-500 ${percentage >= 100 && totalCount > 0 ? 'text-emerald-500 scale-110' : (theme === 'dark' ? 'text-orange-400' : 'text-orange-600')}`}>
                        {percentage}%
                    </div>
                    <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-orange-300'}`}>Success Rate</p>
                </div>
            </div>

            <div className={`relative w-full h-5 rounded-full border p-1 overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-950 border-white/10' : 'bg-orange-50 border-orange-100/50'} shadow-inner`}>
                <div className="absolute inset-x-1 inset-y-1 flex gap-[3px] opacity-10">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={`h-full flex-1 rounded-[2px] ${theme === 'dark' ? 'bg-slate-400' : 'bg-orange-300'}`}></div>
                    ))}
                </div>

                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative z-10 xp-bar-glow ${percentage >= 100 && totalCount > 0 ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500' :
                        'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600'
                        }`}
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[pulse_2s_linear_infinite] opacity-30"></div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-orange-50/50 border-orange-100/50'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-orange-300'}`}>Total Experience</p>
                    <p className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{current} <span className="text-sm opacity-40">/ {target} XP</span></p>
                </div>
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-orange-50/50 border-orange-100/50'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-orange-300'}`}>Quest Mode</p>
                    <p className={`text-lg font-black ${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'}`}>Self-Compet.</p>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
