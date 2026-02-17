import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './components/ProgressBar';
import TaskCard from './components/TaskCard';
import FeedbackSection from './components/FeedbackSection';
import Auth from './components/Auth';
import Logo from './components/Logo';
import Notes from './components/Notes';
import SkeletonCard from './components/SkeletonCard';
import ContributionMap from './components/ContributionMap';
import LevelUpModal from './components/LevelUpModal';
import config from './config';

const API_BASE = config.API_BASE;

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({ username: '', dailyTarget: 50 });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelToDisplay, setLevelToDisplay] = useState(1);
  const [lastLeveledXP, setLastLeveledXP] = useState(null);

  const calculateLevel = (xp) => {
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    let level = 3;
    let requirement = 250;
    let step = 250;
    while (xp >= (requirement + step)) {
      requirement += step;
      level++;
      step = Math.floor(step * 1.5);
    }
    return level;
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const todayTasks = tasks.filter(t => isToday(t.createdAt) || isToday(t.completedAt));
  const completedCount = tasks.filter(t => isToday(t.completedAt)).length;
  const totalCount = tasks.filter(t => (isToday(t.createdAt) || isToday(t.completedAt)) && (!t.isCompleted || isToday(t.completedAt))).length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getGlowColor = () => {
    if (theme === 'light') return 'from-orange-100/40';
    if (percentage >= 100 && totalCount > 0) return 'from-emerald-950/40';
    if (percentage >= 50) return 'from-orange-950/40';
    if (percentage > 0) return 'from-amber-950/40';
    return 'from-slate-900/40';
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (token && userId) {
        setLoading(true);
        await fetchUser(userId);
        await fetchTasks(userId);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Track Level Ups
  useEffect(() => {
    if (user && user.totalScore !== undefined) {
      const currentLevel = calculateLevel(user.totalScore);

      if (lastLeveledXP === null) {
        setLastLeveledXP(user.totalScore);
        return;
      }

      const prevLevel = calculateLevel(lastLeveledXP);

      if (currentLevel > prevLevel) {
        setLevelToDisplay(currentLevel);
        setShowLevelUp(true);
      }

      setLastLeveledXP(user.totalScore);
    }
  }, [user?.totalScore]);

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const fetchTasks = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/todos/${userId}`);
      const data = await response.json();
      setTasks(data);

      const totalScore = data
        .filter(t => t.isCompleted)
        .reduce((acc, t) => acc + (t.scoreValue || 0), 0);

      const todayScore = data
        .filter(t => t.isCompleted && isToday(t.completedAt))
        .reduce((acc, t) => acc + (t.scoreValue || 0), 0);

      setUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          todayScore,
          totalScore
        };
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    const normalizedUser = {
      ...userData,
      id: userData.id || userData._id,
      todayScore: userData.todayScore || 0,
      totalScore: userData.totalScore || 0,
      dailyTarget: userData.dailyTarget || 50,
      currentStreak: userData.currentStreak || 0,
      preferredTone: userData.preferredTone || 'neutral'
    };
    setUser(normalizedUser);
    setActiveTab('today');
    fetchTasks(normalizedUser.id);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  const handleToggle = async (id, isDelete = false) => {
    try {
      if (isDelete) {
        await fetch(`${API_BASE}/todos/${id}`, { method: 'DELETE' });
        setTasks(tasks.filter(t => t._id !== id));
        return;
      }

      const response = await fetch(`${API_BASE}/todos/${id}/toggle`, { method: 'PATCH' });
      const data = await response.json();
      const updatedTodo = data.todo || data;

      setTasks(tasks.map(t => t._id === id ? updatedTodo : t));

      if (data.user) {
        setUser(prev => ({
          ...prev,
          ...data.user
        }));
      } else {
        const scoreDiff = updatedTodo.isCompleted ? updatedTodo.scoreValue : -updatedTodo.scoreValue;
        setUser(prev => ({
          ...prev,
          todayScore: prev.todayScore + scoreDiff,
          totalScore: prev.totalScore + scoreDiff
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id || user._id,
          username: editData.username,
          dailyTarget: editData.dailyTarget
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setUser(prev => ({ ...prev, username: data.username, dailyTarget: data.dailyTarget }));
      localStorage.setItem('username', data.username);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Update profile error:', err);
      alert(err.message);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const userId = user.id || user._id;
      if (!userId) {
        console.error('User ID missing, cannot add task');
        return;
      }

      const response = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          text: newTaskText.trim(),
          difficulty: newDifficulty
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setTasks([data, ...tasks]);
      setNewTaskText('');
      setActiveTab('today');
    } catch (err) {
      console.error('Add task error:', err);
    }
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className={`min-h-screen transition-[background-color,color] duration-700 ease-in-out ${theme === 'dark' ? 'bg-slate-950 text-slate-200 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from)_0%,#020617_100%)]' : 'bg-orange-50 text-slate-900 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from)_0%,#fff7ed_100%)]'} ${getGlowColor()}`}>
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 backdrop-blur-xl border-b ${theme === 'dark' ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-orange-100/50'}`}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center">
            <div>
              <h1 className={`text-2xl sm:text-5xl font-black bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent italic tracking-tighter`}>
                TASKQUEST
              </h1>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="h-0.5 w-3 sm:w-6 bg-orange-500 rounded-full"></span>
                <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-orange-500'} font-black text-[7px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-80`}>The Productivity RPG</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-white/5 text-orange-400 hover:bg-slate-800' : 'bg-white border-orange-100 text-orange-600 hover:bg-orange-50 shadow-sm'}`}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`group flex items-center gap-2 sm:gap-4 border transition-all backdrop-blur-md px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-2xl ${theme === 'dark' ? 'bg-slate-900/50 border-white/5 hover:bg-slate-800/50' : 'bg-white border-orange-100 hover:bg-orange-50 shadow-sm'}`}
            >
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className={`text-[8px] sm:text-[10px] ${theme === 'dark' ? 'text-orange-400/60' : 'text-orange-400'} font-black uppercase tracking-widest leading-none`}>
                    LVL {calculateLevel(user.totalScore || 0)}
                  </span>
                  <div className="flex items-center gap-1 bg-orange-500/10 px-1 sm:px-1.5 py-0.5 rounded-md border border-orange-500/20">
                    <span className="text-orange-500 text-[8px] sm:text-[10px] font-black italic">⚡ {user.currentStreak || 0}D</span>
                  </div>
                </div>
                <p className={`text-[10px] sm:text-[16px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} leading-none`}>{user.username}</p>
              </div>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xs sm:text-xl font-black shadow-lg shadow-orange-500/20 text-white group-hover:scale-105 transition-transform flex-none">
                {user.username[0]}
              </div>
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className={`p-2 sm:p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'bg-white border-orange-100 text-orange-300 hover:text-red-500 hover:bg-red-50 shadow-sm'}`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 w-full max-w-5xl mx-auto pt-32 md:pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Column - Mobile: 2nd, Desktop: Left (2/3) */}
          <div className="order-2 lg:order-1 lg:flex-1 space-y-6 min-w-0">
            <section className={`backdrop-blur-3xl border p-8 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] min-h-[500px] transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/10' : 'bg-white/80 border-orange-100'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className={`text-3xl sm:text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} italic tracking-tighter flex items-center gap-3`}>
                  <div className={`w-2 h-10 bg-orange-500 rounded-full shrink-0`}></div>
                  <span className="leading-none">
                    {activeTab === 'today' ? 'Current Quests' : activeTab === 'backlog' ? 'Quest Backlog' : activeTab === 'notes' ? 'Notes' : 'Hero Logbook'}
                  </span>
                </h2>
                <div className={`flex flex-wrap sm:flex-nowrap gap-1 p-1 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-orange-50/50 border-orange-100'}`}>
                  <button
                    onClick={() => setActiveTab('today')}
                    className={`flex-1 px-3 py-2 text-[10px] sm:text-[13px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'today' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : (theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-orange-400 hover:text-orange-600')}`}
                  >
                    Today
                    {tasks.filter(t => !t.isCompleted && isToday(t.createdAt)).length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-white/20 text-[9px] flex items-center justify-center">
                        {tasks.filter(t => !t.isCompleted && isToday(t.createdAt)).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('backlog')}
                    className={`flex-1 px-3 py-2 text-[10px] sm:text-[13px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'backlog' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : (theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-orange-400 hover:text-orange-600')}`}
                  >
                    Backlog
                    {tasks.filter(t => !t.isCompleted && !isToday(t.createdAt)).length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-white/20 text-[9px] flex items-center justify-center">
                        {tasks.filter(t => !t.isCompleted && !isToday(t.createdAt)).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('logbook')}
                    className={`flex-1 px-3 py-2 text-[10px] sm:text-[13px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'logbook' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : (theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-orange-400 hover:text-orange-600')}`}
                  >
                    Logbook
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 px-3 py-2 text-[10px] sm:text-[13px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'notes' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : (theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-orange-400 hover:text-orange-600')}`}
                  >
                    Notes
                  </button>
                </div>
              </div>

              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'today' && (
                    <motion.div
                      key="today"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {loading ? (
                        [1, 2, 3].map(i => <SkeletonCard key={i} theme={theme} />)
                      ) : todayTasks.length > 0 ? (
                        todayTasks.map(task => (
                          <TaskCard key={task._id} task={task} onToggle={handleToggle} theme={theme} />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-700">
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-slate-800/20' : 'bg-orange-100/50'}`}>
                            <svg className={`w-10 h-10 opacity-20 ${theme === 'dark' ? 'text-white' : 'text-orange-500'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                          </div>
                          <p className={`font-black text-2xl italic uppercase tracking-widest opacity-20 ${theme === 'dark' ? 'text-white' : 'text-orange-900'}`}>No Quests Today</p>
                          <p className={`text-base font-bold opacity-40 mt-2 ${theme === 'dark' ? 'text-white' : 'text-orange-950'}`}>Write your legend for today</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'backlog' && (
                    <motion.div
                      key="backlog"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className={`p-8 rounded-2xl border backdrop-blur-md text-center ${theme === 'dark' ? 'bg-slate-950/30 border-white/5' : 'bg-orange-50/50 border-orange-100 shadow-sm'}`}>
                        <p className={`font-bold italic ${theme === 'dark' ? 'text-slate-500' : 'text-orange-400'}`}>
                          Unfinished business from the past. Complete these to clear your conscience.
                        </p>
                      </div>
                      {loading ? (
                        [1, 2].map(i => <SkeletonCard key={i} theme={theme} />)
                      ) : tasks.filter(t => !t.isCompleted && !isToday(t.createdAt)).length > 0 ? (
                        tasks.filter(t => !t.isCompleted && !isToday(t.createdAt)).map(task => (
                          <TaskCard key={task._id} task={task} onToggle={handleToggle} theme={theme} showDate />
                        ))
                      ) : (
                        <p className="text-center py-10 opacity-30 font-black uppercase tracking-widest">No Backlog</p>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'logbook' && (
                    <motion.div
                      key="logbook"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className={`p-8 rounded-2xl border backdrop-blur-md text-center ${theme === 'dark' ? 'bg-slate-950/30 border-white/5' : 'bg-orange-50/50 border-orange-100 shadow-sm'}`}>
                        <p className={`font-bold italic ${theme === 'dark' ? 'text-slate-500' : 'text-orange-400'}`}>The Logbook stores all your legends. You've completed {tasks.filter(t => t.isCompleted).length} quests in total.</p>
                      </div>
                      {loading ? (
                        [1, 2].map(i => <SkeletonCard key={i} theme={theme} />)
                      ) : tasks.filter(t => t.isCompleted).map(task => (
                        <TaskCard key={task._id} task={task} onToggle={handleToggle} theme={theme} showDate />
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'notes' && (
                    <motion.div
                      key="notes"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Notes userId={user.id} theme={theme} API_BASE={API_BASE} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Coach Personality Settings */}
            <section className={`backdrop-blur-2xl border p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/10' : 'bg-white/80 border-orange-100 shadow-orange-900/5'}`}>
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <div>
                  <span className={`text-[12px] sm:text-[16px] font-black uppercase tracking-widest block leading-none mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-orange-500'}`}>Coach Personality</span>
                  <div className="flex gap-2">
                    {['friendly', 'neutral', 'rude'].map(t => (
                      <button
                        key={t}
                        onClick={() => setUser({ ...user, preferredTone: t })}
                        className={`px-4 sm:px-5 py-2.5 rounded-xl text-[12px] sm:text-[15px] font-black uppercase transition-all ${user.preferredTone === t ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : (theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-orange-400 hover:text-orange-600')}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className={`text-[10px] sm:text-[15px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-600' : 'text-orange-400'}`}>
                Account Status: <span className="text-emerald-500">Online & Synced</span>
              </div>
            </section>

            {/* Statistics Section - Moved below Quests */}
            <section className={`backdrop-blur-xl border p-6 rounded-[2.5rem] shadow-2xl transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-orange-100 shadow-orange-900/5'}`}>
              <h2 className={`text-[14px] sm:text-[16px] font-black mb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-orange-500'} uppercase tracking-[0.2em] text-center`}>Hero Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Completed', value: tasks.filter(t => t.isCompleted).length },
                  { label: 'XP Earned', value: (user.totalScore || 0) },
                  { label: 'Streak', value: `${user.currentStreak || 0}d` },
                  { label: 'Backlog', value: tasks.filter(t => !t.isCompleted && !isToday(t.createdAt)).length }
                ].map(stat => (
                  <div key={stat.label} className={`text-center p-3 sm:p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-orange-50/50 border-orange-100'}`}>
                    <p className={`text-[9px] sm:text-[11px] ${theme === 'dark' ? 'text-slate-600' : 'text-orange-300'} font-black uppercase mb-1`}>{stat.label}</p>
                    <p className={`text-lg sm:text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} tracking-tighter`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Side Column - Mobile: 1st, Desktop: Right (1/3) */}
          <div className="order-1 lg:order-2 lg:w-[360px] flex-none space-y-6">
            <section className={`backdrop-blur-xl border p-8 rounded-[2.5rem] shadow-2xl transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-orange-100 shadow-orange-900/5'}`}>
              <ProgressBar
                current={user.todayScore}
                target={user.dailyTarget}
                completedCount={completedCount}
                totalCount={totalCount}
                theme={theme}
                totalXP={user.totalScore}
              />
              {todayTasks.length > 0 && (
                <FeedbackSection score={completedCount} target={totalCount} tone={user.preferredTone} theme={theme} />
              )}
            </section>

            <section className={`backdrop-blur-2xl border p-8 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/10' : 'bg-white/80 border-orange-100'}`}>
              <h2 className="text-2xl sm:text-3xl font-black mb-6 text-orange-600 italic">Add New Quest</h2>
              <form onSubmit={addTask} className="space-y-4">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="What is your mission?"
                  className={`w-full border rounded-2xl px-5 sm:px-6 py-4 sm:py-5 focus:outline-none transition-all font-bold shadow-inner sm:text-lg ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-orange-500' : 'bg-orange-50/50 border-orange-100 text-slate-900 placeholder:text-orange-200 focus:border-orange-400'}`}
                />
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setNewDifficulty(diff)}
                      className={`flex-1 py-3 sm:py-4 text-[13px] sm:text-[16px] font-black uppercase rounded-xl border transition-all ${newDifficulty === diff ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20 border-orange-500' : (theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-600 hover:border-slate-700' : 'bg-white border-orange-100 text-orange-200 hover:border-orange-200')}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
                <button type="submit" className="w-full py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest sm:text-lg bg-orange-600 text-white hover:bg-orange-500 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  Accept Quest
                </button>
              </form>
            </section>
          </div>
        </div>

        <ContributionMap tasks={tasks} theme={theme} />

        {/* Footer */}
        <footer className="mt-32 pb-16">
          <div className="flex flex-col items-center">
            <div className={`w-full max-w-xs h-px mb-12 opacity-20 ${theme === 'dark' ? 'bg-gradient-to-r from-transparent via-white to-transparent' : 'bg-gradient-to-r from-transparent via-orange-500 to-transparent'}`}></div>
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-[16px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-slate-300' : 'text-orange-600'}`}>TaskQuest</span>
            </div>
            <p className={`text-[13px] font-black uppercase tracking-[0.3em] mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-orange-500'}`}>
              Quest without limits • Stay legendary
            </p>
            <div className={`flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-[12px] font-bold tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-orange-400'}`}>
              <span>© 2026</span>
              <span className="hidden sm:block text-orange-500/20">•</span>
              <span>QUEST WITHOUT LIMITS</span>
              <span className="hidden sm:block text-orange-500/20">•</span>
              <span>STAY LEGENDARY</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex justify-center sm:items-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => { setShowProfile(false); setIsEditingProfile(false); }}></div>
          <div className={`border p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-2xl max-w-lg w-full relative z-10 my-auto transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-orange-100 shadow-orange-900/10'}`}>
            <button
              onClick={() => { setShowProfile(false); setIsEditingProfile(false); }}
              className={`absolute top-6 right-6 p-2 transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-orange-300 hover:text-orange-600'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-2xl shadow-orange-500/40 text-white mb-4">
                {user.username[0]}
              </div>

              {isEditingProfile ? (
                <div className="w-full space-y-3">
                  <div>
                    <label className={`text-[11px] font-black uppercase tracking-widest block mb-1.5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`}>Change Hero Name</label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className={`w-full border rounded-xl px-5 py-3 focus:outline-none font-bold transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white focus:border-orange-500' : 'bg-orange-50 border-orange-100 text-slate-900 focus:border-orange-400'}`}
                      placeholder="New Hero Name"
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest block mb-1.5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'}`}>Daily XP Target</label>
                    <input
                      type="number"
                      value={editData.dailyTarget}
                      onChange={(e) => setEditData({ ...editData, dailyTarget: parseInt(e.target.value) || 0 })}
                      className={`w-full border rounded-xl px-5 py-3 focus:outline-none font-bold transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-white/10 text-white focus:border-orange-500' : 'bg-orange-50 border-orange-100 text-slate-900 focus:border-orange-400'}`}
                      placeholder="Target XP"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-orange-500/20"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className={`px-6 py-3 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-orange-100 hover:bg-orange-200 text-orange-600'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className={`text-2xl sm:text-3xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.username}</h2>
                  <p className={`font-black text-[9px] uppercase tracking-[0.3em] mt-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`}>Legendary Hero</p>

                  <button
                    onClick={() => { setIsEditingProfile(true); setEditData({ username: user.username, dailyTarget: user.dailyTarget }); }}
                    className={`mt-3 px-4 py-1.5 border rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'border-white/10 text-slate-500 hover:text-orange-400 hover:border-orange-400/30' : 'border-orange-100 text-orange-400 hover:bg-orange-50 hover:border-orange-200'}`}
                  >
                    Edit Legend Details
                  </button>
                </>
              )}
            </div>

            {!isEditingProfile && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  { label: 'Total XP', value: user.totalScore, color: theme === 'dark' ? 'text-orange-400' : 'text-orange-600' },
                  { label: 'Streak', value: `${user.currentStreak || 0} Days`, color: 'text-amber-500' },
                  { label: 'Today XP', value: user.todayScore, color: 'text-emerald-500' },
                  { label: 'T. Goal', value: user.dailyTarget, color: theme === 'dark' ? 'text-orange-400' : 'text-orange-600' }
                ].map(stat => (
                  <div key={stat.label} className={`border p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-orange-50 border-orange-100'}`}>
                    <p className={`text-[9px] font-black uppercase mb-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-orange-300'}`}>{stat.label}</p>
                    <p className={`text-base sm:text-xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {!isEditingProfile && (
              <div className="mt-4">
                <ContributionMap tasks={tasks} theme={theme} compact />
              </div>
            )}

            {!isEditingProfile && (
              <button
                onClick={handleLogout}
                className="w-full mt-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
              >
                Logout Session
              </button>
            )}
          </div>
        </div>
      )}
      {/* Level Up Notification */}
      {showLevelUp && (
        <LevelUpModal
          level={levelToDisplay}
          tone={user.preferredTone}
          theme={theme}
          onClose={() => setShowLevelUp(false)}
        />
      )}
    </div>
  );
}

export default App;
