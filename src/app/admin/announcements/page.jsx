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
    <div className="space-y-8 max-w-5xl mx-auto text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div>
          <span className="eyebrow-label">
            TOURNAMENT COMMUNICATIONS
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">Announcements & Notices</h1>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-1">
            Publish alerts, board schedules, and official rulings to all participants and viewers.
          </p>
        </div>
      </div>

      {/* Create New Announcement Form */}
      <form onSubmit={handleCreate} className="editorial-card rounded-2xl p-6 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-4 shadow-xs">
        <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base flex items-center gap-2 uppercase tracking-wide">
          <Plus className="w-4 h-4 text-[#E74C3C]" />
          <span>Publish New Notice</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Update for Quarterfinals"
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034]"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent Alert</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] block mb-1.5 uppercase font-mono">
            Notice Content *
          </label>
          <textarea
            required
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write official tournament details here..."
            className="w-full bg-white dark:bg-[#181C1F] p-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs text-[#4A4238] dark:text-[#F5F1E8] cursor-pointer font-mono">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-[#D5C4A1] dark:border-[#2B3034] text-[#E74C3C] focus:ring-0"
            />
            <span>Pin this notice to top of board</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-xs font-bold px-6 py-2.5 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Publishing...' : 'Publish Notice'}</span>
          </button>
        </div>
      </form>

      {/* Published Notices List */}
      <div className="editorial-card rounded-2xl p-6 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#15191C] space-y-4 shadow-xs">
        <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base uppercase tracking-wide">
          Active Notices ({announcements.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">Loading notices...</div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">No notices published yet.</div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-mono">
                    {ann.isPinned && (
                      <span className="text-[10px] text-[#3E342B] dark:text-[#F5F1E8] font-bold bg-white dark:bg-[#15191C] px-2 py-0.5 rounded-full border border-[#D5C4A1] dark:border-[#2B3034]">
                        PINNED
                      </span>
                    )}
                    {ann.priority === 'urgent' && (
                      <span className="text-[10px] font-bold bg-[#FDEDEC] dark:bg-[#E74C3C]/20 text-[#E74C3C] dark:text-[#E74C3C] px-2 py-0.5 rounded-full uppercase border border-[#E74C3C]/30">
                        Urgent
                      </span>
                    )}
                    <span className="text-[10px] text-[#7E7060] dark:text-[#817B72]">
                      {new Date(ann.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#3E342B] dark:text-[#F5F1E8]">{ann.title}</h4>
                  <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] whitespace-pre-line leading-relaxed">{ann.content}</p>
                </div>

                <button
                  onClick={() => handleDelete(ann._id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
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


