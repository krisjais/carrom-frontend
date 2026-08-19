'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bell, Pin } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.getAnnouncements();
        if (res.success) setAnnouncements(res.announcements || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#0B0D0E]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="eyebrow-label">
          Official Notice Board
        </span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
          Tournament Notices
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-mono">
          Official communications, board schedule updates, and tournament directives.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#F5F1E8]/60 text-xs font-mono">Loading notices...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center arena-card rounded-3xl">
          <Bell className="w-8 h-8 text-[#F2C94C] mx-auto mb-2 opacity-70" />
          <p className="text-xs text-[#F5F1E8]/70 font-mono">No announcements published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann._id} className="arena-card p-6 space-y-3 rounded-3xl">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] text-[#F2C94C] font-bold bg-[#F2C94C]/15 px-2.5 py-0.5 rounded-full border border-[#F2C94C]/30">
                      <Pin className="w-3 h-3" /> PINNED
                    </span>
                  )}
                  {ann.priority === 'urgent' && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                      Urgent
                    </span>
                  )}
                </div>
                <span className="text-[#F5F1E8]/60">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="font-black text-white text-lg font-display uppercase tracking-wide">{ann.title}</h3>
              <p className="text-xs text-[#F5F1E8]/75 leading-relaxed whitespace-pre-line">{ann.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
