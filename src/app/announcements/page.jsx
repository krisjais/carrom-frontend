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
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Notice Board
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Official announcements, schedule updates, and notifications.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#94A3B8] text-xs">Loading notices...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center sport-card">
          <Bell className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
          <p className="text-xs text-[#94A3B8]">No announcements published yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann._id} className="sport-card p-5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] text-[#D4AF37] font-bold bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                      <Pin className="w-3 h-3" /> PINNED
                    </span>
                  )}
                  {ann.priority === 'urgent' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                      Urgent
                    </span>
                  )}
                </div>
                <span className="text-[#64748B] font-mono">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="font-bold text-white text-sm">{ann.title}</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-line">{ann.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
