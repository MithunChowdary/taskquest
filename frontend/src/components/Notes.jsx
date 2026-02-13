import React, { useState, useEffect } from 'react';

const Notes = ({ userId, theme, API_BASE }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: '', content: '', category: 'General' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, [userId]);

    const fetchNotes = async () => {
        try {
            const response = await fetch(`${API_BASE}/notes/${userId}`);
            const data = await response.json();
            setNotes(data);
        } catch (err) {
            console.error(err);
        }
    };

    const addNote = async (e) => {
        e.preventDefault();
        if (!newNote.content) return;

        try {
            const response = await fetch(`${API_BASE}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newNote, userId }),
            });
            const data = await response.json();
            setNotes([data, ...notes]);
            setNewNote({ title: '', content: '', category: 'General' });
            setIsAdding(false);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNote = async (id) => {
        try {
            await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
            setNotes(notes.filter(n => n._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${isAdding
                        ? 'bg-slate-500 text-white'
                        : 'bg-orange-600 text-white hover:bg-orange-500 shadow-orange-500/20'
                        }`}
                >
                    {isAdding ? 'Cancel' : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            New Note
                        </>
                    )}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={addNote} className={`p-8 rounded-[2rem] border animate-in fade-in slide-in-from-top-4 duration-500 ${theme === 'dark' ? 'bg-slate-900/60 border-white/5' : 'bg-white border-orange-100 shadow-xl'}`}>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Note Title (Optional)"
                            value={newNote.title}
                            onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                            className={`w-full px-6 py-4 rounded-xl border focus:outline-none font-bold text-lg transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-white focus:border-orange-500' : 'bg-orange-50 border-orange-100 text-slate-900 focus:border-orange-400'}`}
                        />
                        <textarea
                            placeholder="Record your wisdom here..."
                            value={newNote.content}
                            onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                            className={`w-full px-6 py-4 rounded-xl border focus:outline-none font-medium min-h-[150px] transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-white focus:border-orange-500' : 'bg-orange-50 border-orange-100 text-slate-900 focus:border-orange-400'}`}
                        />
                        <button type="submit" className="w-full py-4 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                            Secure Knowledge
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.length > 0 ? (
                    notes.map(note => (
                        <div
                            key={note._id}
                            className={`group p-6 rounded-[2rem] border backdrop-blur-md transition-all hover:scale-[1.02] hover:-rotate-1 relative overflow-hidden ${theme === 'dark'
                                ? 'bg-slate-900/40 border-white/10 hover:bg-slate-800/60 shadow-black/20'
                                : 'bg-white/80 border-orange-100 hover:shadow-2xl shadow-orange-900/5'
                                }`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => deleteNote(note._id)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>

                            {note.title && (
                                <h3 className={`text-xl font-black mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    {note.title}
                                </h3>
                            )}
                            <p className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                                {note.content}
                            </p>
                            <div className="mt-6 flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                                    {note.category}
                                </span>
                                <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {new Date(note.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
                        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        <p className="text-2xl font-black uppercase italic tracking-widest">No Knowledge Stored</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
