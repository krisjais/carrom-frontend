'use client';

import React from 'react';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { RegistrationForm } from '@/components/chess/RegistrationForm';
import { ChessFooter } from '@/components/chess/ChessFooter';

export default function ChessRegisterPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#09090B] flex flex-col font-sans text-[#111111] dark:text-[#F4F4F5] antialiased transition-colors">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
        <div className="w-full max-w-2xl py-6">
          <RegistrationForm />
        </div>
      </main>

      <ChessFooter />
    </div>
  );
}
