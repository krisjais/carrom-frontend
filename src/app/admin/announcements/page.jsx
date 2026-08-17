'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bell, Pin, Trash2, Plus, Send } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.getAnnouncements();
      if (res.success) setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        priority,
        isPinned
      });
      if (res.success) {
        setTitle('');
        setContent('');
        setIsPinned(false);
        fetchAnnouncements();
      }
    } catch (err) {
      alert(err.message || 'Failed to post announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to delete.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <span className="text-xs font-mono text-gold-400 font-bold uppercase tracking-widest">
            Tournament Communications
          </span>
          <h1 className="text-3xl font-black font-display text-white mt-1">Announcements & Notices</h1>
          <p className="text-xs text-slate-400">
            Publish urgent alerts, board schedules, and official rulings to all participants and viewers.
          </p>
        </div>
      </div>

      {/* Create New Announcement Form */}
      <form onSubmit={handleCreate} className="glass-card rounded-3xl p-6 border border-navy-800 space-y-4">
        <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Publish New Notice</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Update for Quarterfinals"
              className="w-full h-11 bg-navy-950 px-3.5 text-xs text-slate-200 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-11 bg-navy-950 px-3.5 text-xs text-slate-200 rounded-xl border border-navy-700"
            >
              <option value="normal">Normal Announcement</option>
              <option value="urgent">Urgent Alert</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Notice Message *
            </label>
            <textarea
              rows="3"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full announcement text here..."
              className="w-full bg-navy-950 p-3 text-xs text-slate-200 rounded-xl border border-navy-700 focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded text-gold-500"
            />
            <span>Pin this notice to top of public board</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs shadow-md hover:bg-gold-400 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Publishing...' : 'Publish Announcement'}</span>
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-base font-display">Published Announcements ({announcements.length})</h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading notices...</div>
        ) : announcements.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">No announcements published yet.</div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann._id}
              className="glass-card rounded-2xl p-5 border border-navy-800 flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] text-gold-400 font-bold bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                      <Pin className="w-3 h-3" /> PINNED
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      ann.priority === 'urgent'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-navy-800 text-slate-400'
                    }`}
                  >
                    {ann.priority}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{ann.title}</h4>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{ann.content}</p>
              </div>

              <button
                onClick={() => handleDelete(ann._id)}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
