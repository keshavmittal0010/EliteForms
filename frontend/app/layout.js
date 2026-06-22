import { Inter } from 'next/font/google';
import { AuthProvider } from '../hooks/useAuth';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'EliteForms | Dynamic Form Builder & Analytics',
  description: 'Design interactive, customizable forms in seconds. Collect answers, search responses, and analyze metrics with our modern SaaS builder dashboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
