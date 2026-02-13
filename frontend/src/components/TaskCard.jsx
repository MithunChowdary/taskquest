import React, { useState } from 'react';

const TaskCard = ({ task, onToggle, theme, showDate }) => {
    const [isRising, setIsRising] = useState(false);

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const difficultyColors = {
        easy: theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border-emerald-100',
        medium: theme === 'dark' ? 'bg-orange-500/20 text-orange-500' : 'bg-orange-50 text-orange-600 border-orange-100',
        hard: theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600 border-red-100'
    };

    const handleToggleInternal = () => {
        if (!task.isCompleted) {
            setIsRising(true);
            setTimeout(() => setIsRising(false), 1000);
        }
        onToggle(task._id);
    };

    const cardBaseSet = theme === 'dark'
        ? (task.isCompleted ? 'bg-slate-900/20 border-white/5 opacity-60 backdrop-blur-sm' : 'bg-slate-900/60 border-white/10 hover:border-orange-500/50 hover:bg-slate-900/80 backdrop-blur-md group shadow-lg shadow-black/20')
        : (task.isCompleted ? 'bg-orange-50/20 border-orange-100 opacity-60' : 'bg-white/80 border-orange-100 hover:border-orange-300 hover:bg-orange-50/50 backdrop-blur-md group shadow-sm shadow-orange-900/5');

    return (
        <div className={`relative flex items-center justify-between p-5 mb-3 rounded-2xl border transition-all duration-300 ${cardBaseSet}`}>

            {/* XP Floating Effect */}
            {isRising && (
                <div className={`absolute left-6 top-0 font-black text-xl animate-xp-rise pointer-events-none z-50 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                    +{task.scoreValue} XP
                </div>
            )}

            <div className="flex items-center gap-5">
                <button
                    onClick={handleToggleInternal}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${task.isCompleted
                        ? 'bg-orange-500 border-orange-500 rotate-12 scale-110'
                        : (theme === 'dark' ? 'border-slate-700 hover:border-orange-500 group-hover:scale-110' : 'border-orange-200 hover:border-orange-400 group-hover:scale-110')
                        }`}
                >
                    {task.isCompleted ? (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <div className={`w-2 h-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-slate-700 group-hover:bg-orange-500' : 'bg-orange-100 group-hover:bg-orange-400'}`}></div>
                    )}
                </button>

                <div>
                    <h3 className={`font-bold text-xl tracking-tight ${task.isCompleted
                        ? (theme === 'dark' ? 'line-through text-slate-600' : 'line-through text-orange-200')
                        : (theme === 'dark' ? 'text-slate-200' : 'text-slate-900')}`}>
                        {task.text}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[12px] uppercase font-black px-2 py-0.5 rounded-md border ${difficultyColors[task.difficulty]}`}>
                            {task.difficulty}
                        </span>
                        <div className="flex items-center gap-3 opacity-60">
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                                <span className={`text-[13px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-orange-400'}`}>
                                    {task.scoreValue} XP
                                </span>
                            </div>
                            {showDate && (
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                                    <span className={`text-[13px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-orange-500'}`}>
                                        {formatDate(task.createdAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`transition-opacity duration-300 ${task.isCompleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                    onClick={() => onToggle(task._id, true)}
                    className={`p-2 transition-colors ${theme === 'dark' ? 'text-slate-600 hover:text-red-400' : 'text-orange-200 hover:text-red-500'}`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    );
};

export default TaskCard;
