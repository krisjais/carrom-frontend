import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ChessThemeProvider } from '@/context/ChessThemeContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'Carrom & Chess Championship 2026 | Inter-College Management System',
  description: 'Official Collegiate Championship platform for Carrom and Chess tournaments with live scoring, pairings, and standings.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  const themeInitScript = `
    (function() {
      try {
        var saved = localStorage.getItem('chess-portal-theme') || localStorage.getItem('carrompro-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.classList.add(theme);
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600;1,700&family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] font-sans flex flex-col min-h-screen antialiased selection:bg-[#E74C3C] selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <ChessThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <AppShell>
                  {children}
                </AppShell>
              </ToastProvider>
            </AuthProvider>
          </ChessThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


