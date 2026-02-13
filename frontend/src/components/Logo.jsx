import React from 'react';

const Logo = ({ theme, className }) => {
    return (
        <div className={`relative ${className}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <filter id="completionGlow">
                        <feGaussianBlur stdDeviation="3" result="glow" />
                        <feComposite in="SourceGraphic" in2="glow" operator="over" />
                    </filter>
                </defs>

                {/* Shield Border */}
                <path
                    d="M50 10 L85 25 V55 C85 75 50 90 50 90 C50 90 15 75 15 55 V25 L50 10Z"
                    fill="url(#shieldGradient)"
                    filter="url(#completionGlow)"
                />

                {/* Inner Shield */}
                <path
                    d="M50 18 L77 30 V52 C77 68 50 81 50 81 C50 81 23 68 23 52 V30 L50 18Z"
                    fill={theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
                />

                {/* The Completion Checkmark */}
                <path
                    d="M35 50 L45 60 L65 40"
                    fill="none"
                    stroke="url(#shieldGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#completionGlow)"
                    className="animate-in fade-in zoom-in duration-1000"
                />

                {/* Victory Sparkle */}
                <circle cx="65" cy="40" r="4" fill="white">
                    <animate
                        attributeName="opacity"
                        values="0;1;0"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        </div>
    );
};

export default Logo;
