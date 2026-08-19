import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'Carrom Tournament Championship 2026 | Inter-College Management System',
  description: 'Official collegiate Carrom Tournament Management Platform with dynamic knockout bracket draws, live scoring, and results.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0B0D0E] text-[#F5F1E8] flex flex-col min-h-screen antialiased selection:bg-[#F2C94C] selection:text-[#0B0D0E]">
        <AuthProvider>
          <ToastProvider>
            <AppShell>
              {children}
            </AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
