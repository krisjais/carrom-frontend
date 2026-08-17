import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { LiveTicker } from '@/components/layout/LiveTicker';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Carrom Tournament Championship 2026 | Inter-College Management System',
  description: 'Official collegiate Carrom Tournament Management Platform with dynamic knockout bracket draws, live scoring, and results.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-navy-950 text-slate-100 flex flex-col min-h-screen antialiased selection:bg-gold-500 selection:text-navy-950">
        <AuthProvider>
          <Navbar />
          <LiveTicker />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
