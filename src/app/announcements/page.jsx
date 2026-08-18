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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest block">
          Official Notice Board
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Tournament Notices
        </h1>
        <p className="text-xs sm:text-sm text-[#D4DEEE]">
          Official announcements, schedule updates, and tournament alerts.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#D4DEEE] text-xs">Loading notices...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center sport-card rounded-3xl">
          <Bell className="w-8 h-8 text-[#FFD691] mx-auto mb-2 opacity-70" />
          <p className="text-xs text-[#D4DEEE]">No announcements published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann._id} className="sport-card p-6 space-y-3 rounded-3xl border border-[#35538C]">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] text-[#FFD691] font-bold bg-[#FFD691]/15 px-2.5 py-0.5 rounded-full border border-[#FFD691]/30">
                      <Pin className="w-3 h-3" /> PINNED
                    </span>
                  )}
                  {ann.priority === 'urgent' && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF6E80]/20 text-[#FF96A4] border border-[#FF6E80]/30 uppercase font-mono">
                      Urgent
                    </span>
                  )}
                </div>
                <span className="text-[#D4DEEE] font-mono">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="font-bold text-white text-base">{ann.title}</h3>
              <p className="text-xs text-[#D4DEEE] leading-relaxed whitespace-pre-line">{ann.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
