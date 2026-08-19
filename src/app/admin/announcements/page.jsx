'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bell, Pin, Trash2, Plus, Send } from 'lucide-react';
import { useToast, useConfirm } from '@/context/ToastContext';

export default function AdminAnnouncementsPage() {
  const toast = useToast();
  const confirm = useConfirm();

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
        toast.success('Announcement published successfully!');
        setTitle('');
        setContent('');
        setIsPinned(false);
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to post announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Announcement',
      message: 'Are you sure you want to permanently delete this announcement?',
      confirmText: 'Delete Notice',
      type: 'danger'
    });
    if (!isConfirmed) return;

    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) {
        toast.success('Announcement deleted.');
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete announcement.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#35538C]">
        <div>
          <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest">
            Tournament Communications
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-1">Announcements & Notices</h1>
          <p className="text-xs text-[#D4DEEE]">
            Publish alerts, board schedules, and official rulings to all participants and viewers.
          </p>
        </div>
      </div>

      {/* Create New Announcement Form */}
      <form onSubmit={handleCreate} className="sport-card rounded-3xl p-6 border border-[#35538C] space-y-4">
        <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#FFD691]" />
          <span>Publish New Notice</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Update for Quarterfinals"
              className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C]"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent Alert</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#D4DEEE] block mb-1.5">
            Notice Content *
          </label>
          <textarea
            required
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write official tournament details here..."
            className="w-full bg-[#152442] p-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs text-[#D4DEEE] cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded bg-[#152442] border-[#35538C] text-[#FFD691] focus:ring-0"
            />
            <span>Pin this notice to top of board</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl btn-cream text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Publishing...' : 'Publish Notice'}</span>
          </button>
        </div>
      </form>

      {/* Published Notices List */}
      <div className="sport-card rounded-3xl p-6 border border-[#35538C] space-y-4">
        <h3 className="font-bold text-white text-base font-display">
          Active Notices ({announcements.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#D4DEEE]">Loading notices...</div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#D4DEEE]">No notices published yet.</div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className="p-4 rounded-2xl bg-[#152442] border border-[#35538C] flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {ann.isPinned && (
                      <span className="text-[10px] text-[#FFD691] font-bold bg-[#FFD691]/15 px-2 py-0.5 rounded-full border border-[#FFD691]/30">
                        PINNED
                      </span>
                    )}
                    {ann.priority === 'urgent' && (
                      <span className="text-[10px] font-bold bg-[#FF6E80]/20 text-[#FF96A4] px-2 py-0.5 rounded-full uppercase border border-[#FF6E80]/30 font-mono">
                        Urgent
                      </span>
                    )}
                    <span className="text-[10px] text-[#D4DEEE] font-mono">
                      {new Date(ann.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{ann.title}</h4>
                  <p className="text-xs text-[#D4DEEE] whitespace-pre-line leading-relaxed">{ann.content}</p>
                </div>

                <button
                  onClick={() => handleDelete(ann._id)}
                  className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
