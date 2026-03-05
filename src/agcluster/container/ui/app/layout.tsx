import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AgentationWidget from './agentation-widget';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgCluster - Claude Agent Cloud',
  description: 'Test, deploy and scale Claude Agents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <AgentationWidget />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
