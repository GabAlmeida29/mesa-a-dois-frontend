import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './globals.css';
import { APP } from '@/constants/texts';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { THEME_COLORS, themeInitScript } from '@/lib/theme';
import { ToastProvider } from '@/contexts/ToastContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

export const metadata: Metadata = {
  title: { default: APP.name, template: `%s · ${APP.name}` },
  description: APP.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
  ],
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <AnalyticsTracker />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
