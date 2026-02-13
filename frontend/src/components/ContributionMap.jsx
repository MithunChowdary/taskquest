import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContributionMap = ({ tasks, theme, compact = false }) => {
    const [hoveredDay, setHoveredDay] = useState(null);
    const scrollContainerRef = useRef(null);

    // Auto-scroll to end on mount or when tasks change
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [tasks, compact]);

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Generate last 365 days
        const days = [];
        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }

        return days.map(date => {
            const dateStr = date.toDateString();
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const completedOnDay = tasks.filter(t => {
                if (!t.completedAt) return false;
                const d = new Date(t.completedAt);
                return d >= startOfDay && d <= endOfDay;
            }).length;

            const activeOnDay = tasks.filter(t => {
                const createdDate = new Date(t.createdAt);
                // Task existed if it was created on or before this day
                if (createdDate > endOfDay) return false;

                // And it was either not completed yet, or completed on/after this day
                if (!t.isCompleted) return true;
                const completedDate = new Date(t.completedAt);
                return completedDate >= startOfDay;
            }).length;

            const percentage = activeOnDay > 0 ? (completedOnDay / activeOnDay) * 100 : 0;

            return {
                date,
                dateStr,
                completed: completedOnDay,
                active: activeOnDay,
                percentage: Math.round(percentage),
            };
        });
    }, [tasks]);

    // Group into weeks for the grid
    const weeks = useMemo(() => {
        const result = [];
        let currentWeek = [];

        // Start from the first day and pad if it's not Sunday
        const firstDay = stats[0].date;
        const dayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)

        for (let i = 0; i < dayOfWeek; i++) {
            currentWeek.push(null);
        }

        stats.forEach(day => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                result.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            result.push(currentWeek);
        }

        return result;
    }, [stats]);

    const getColor = (percentage, completed) => {
        if (completed === 0) return theme === 'dark' ? 'bg-slate-800/30' : 'bg-orange-100/30';
        if (percentage === 0) return theme === 'dark' ? 'bg-slate-700/50' : 'bg-orange-200/50';
        if (percentage < 25) return theme === 'dark' ? 'bg-emerald-900' : 'bg-emerald-100';
        if (percentage < 50) return theme === 'dark' ? 'bg-emerald-700' : 'bg-emerald-300';
        if (percentage < 75) return theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-500';
        return theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-600';
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Find month labels - Lock to the week containing the 1st of the month
    const monthLabels = useMemo(() => {
        const labels = [];
        weeks.forEach((week, i) => {
            const firstOfMonth = week.find(d => d && d.date.getDate() === 1);
            if (firstOfMonth) {
                const month = firstOfMonth.date.getMonth();
                labels.push({ label: months[month], index: i });
            }
        });
        return labels;
    }, [weeks]);

    return (
        <div className={`${compact ? 'mt-4 p-4 rounded-3xl' : 'mt-8 p-6 rounded-[2rem]'} border backdrop-blur-xl transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-orange-100/50 shadow-xl shadow-orange-900/5'}`}>
            <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-6'}`}>
                <div>
                    <h2 className={`${compact ? 'text-sm' : 'text-xl'} font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} italic tracking-tighter flex items-center gap-2`}>
                        <div className={`w-1.5 ${compact ? 'h-4' : 'h-6'} bg-emerald-500 rounded-full`}></div>
                        Quest Legend
                    </h2>
                    {!compact && <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-orange-400'}`}>Your journey through time</p>}
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-tighter opacity-40">
                    <span>Less</span>
                    {[0, 25, 50, 75, 100].map(p => (
                        <div key={p} className={`${compact ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-sm ${getColor(p, p > 0 ? 1 : 0)}`}></div>
                    ))}
                    <span>More</span>
                </div>
            </div>

            <div className="relative">
                <div ref={scrollContainerRef} className="overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-1 min-w-max justify-center">
                        {/* Day labels */}
                        <div className={`flex flex-col gap-1 pr-1.5 ${compact ? 'pt-[24px]' : 'pt-[28px]'} text-[7px] font-black uppercase tracking-tighter opacity-20 select-none flex-none`}>
                            <div className="h-2.5 leading-none flex items-center"></div>
                            <div className="h-2.5 leading-none flex items-center">M</div>
                            <div className="h-2.5 leading-none flex items-center"></div>
                            <div className="h-2.5 leading-none flex items-center">W</div>
                            <div className="h-2.5 leading-none flex items-center"></div>
                            <div className="h-2.5 leading-none flex items-center">F</div>
                            <div className="h-2.5 leading-none flex items-center"></div>
                        </div>

                        {/* Main Column (Months + Grid) */}
                        <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'} w-fit`}>
                            {/* Month labels */}
                            <div className="relative h-4 w-full">
                                {monthLabels.map((m, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-[7px] font-black uppercase tracking-widest opacity-40 whitespace-nowrap"
                                        style={{ left: `${m.index * (compact ? 12 : 14)}px` }}
                                    >
                                        {m.label}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-1">
                                {weeks.map((week, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-1">
                                        {week.map((day, dayIndex) => (
                                            <div
                                                key={dayIndex}
                                                className={`${compact ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-[2px] transition-all duration-200 relative ${day ? 'cursor-pointer hover:ring-1 hover:ring-orange-500/50' : 'bg-slate-800/5 opacity-0'}`}
                                            >
                                                {day && (
                                                    <div
                                                        className={`w-full h-full rounded-[2px] ${getColor(day.percentage, day.completed)}`}
                                                        onMouseEnter={() => setHoveredDay(day)}
                                                        onMouseLeave={() => setHoveredDay(null)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simplified Tooltip */}
                <AnimatePresence>
                    {hoveredDay && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                        >
                            <div className={`px-2 py-1.5 rounded-lg shadow-2xl border backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white/95 border-orange-100 text-slate-900'}`}>
                                <p className="text-[9px] font-bold whitespace-nowrap">
                                    <span className="text-emerald-500 font-black">{hoveredDay.completed} quests</span> on {hoveredDay.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className={`w-1.5 h-1.5 rotate-45 mx-auto -mt-1 border-r border-b ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-orange-100'}`}></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            {!compact && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Active Days', value: stats.filter(d => d.completed > 0).length, icon: '📅' },
                        { label: 'Avg Efficiency', value: `${Math.round(stats.reduce((acc, d) => acc + d.percentage, 0) / stats.filter(d => d.active > 0).length || 0)}%`, icon: '📈' },
                        { label: 'Max Daily Quests', value: Math.max(...stats.map(d => d.completed)), icon: '🏆' }
                    ].map((s, i) => (
                        <div key={i} className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-orange-50/50 border-orange-100'}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{s.icon}</span>
                                <div>
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-600' : 'text-orange-300'}`}>{s.label}</p>
                                    <p className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContributionMap;

