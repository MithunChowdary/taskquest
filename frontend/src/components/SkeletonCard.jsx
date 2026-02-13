import React from 'react';

const SkeletonCard = ({ theme }) => {
    return (
        <div className={`p-5 mb-3 rounded-2xl border animate-pulse flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-orange-50/40 border-orange-100'}`}>
            <div className="flex items-center gap-5 w-full">
                {/* Checkbox Placeholder */}
                <div className={`w-7 h-7 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-orange-100'}`}></div>

                <div className="space-y-3 w-2/3">
                    {/* Title Placeholder */}
                    <div className={`h-5 w-full rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-orange-100'}`}></div>
                    <div className="flex gap-2">
                        {/* Difficulty Badge Placeholder */}
                        <div className={`h-4 w-16 rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-orange-100'}`}></div>
                        {/* XP Placeholder */}
                        <div className={`h-4 w-12 rounded-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-orange-100'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
