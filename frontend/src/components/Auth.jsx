import React, { useState } from 'react';
import Logo from './Logo';
import config from '../config';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await fetch(`${config.API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error('Expected JSON but got:', text.substring(0, 100));
                throw new Error(`Server returned non-JSON response. Check if API URL is correct: ${config.API_BASE}`);
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Something went wrong');

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            onLogin(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-orange-50 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.1)_0%,#fff7ed_100%)]">
            <div className="bg-white/80 backdrop-blur-xl border border-orange-100 p-8 rounded-[2rem] shadow-2xl w-full max-w-md animate-float relative overflow-hidden">
                <div className="flex flex-col items-center mb-10 justify-center">
                    <h1 className="text-[3.5rem] font-black bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent italic tracking-tighter text-center pr-2">
                        TASKQUEST
                    </h1>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
                    {isLogin ? 'Welcome Back, Hero' : 'Create Your Legend'}
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-4 text-sm font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-black uppercase text-orange-400 mb-1 ml-1 tracking-widest">Hero Name</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full bg-white border-2 border-orange-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-lg text-slate-900 placeholder:text-slate-300"
                            placeholder="Enter your name..."
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-black uppercase text-orange-400 mb-1 ml-1 tracking-widest">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-white border-2 border-orange-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-lg text-slate-900 placeholder:text-slate-300"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-xl font-black uppercase tracking-widest text-base bg-orange-600 hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 text-white"
                    >
                        {loading ? 'Authenticating...' : (isLogin ? 'Enter Quest' : 'Join the Guild')}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-500 text-sm font-bold">
                    {isLogin ? "New to the Guild?" : "Already part of the Guild?"}{' '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-orange-600 hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;
