import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'NaijaPrep AI - SSCE/BECE Companion',
  description: 'AI-powered study platform for Nigerian curriculum (WAEC, NECO, JAMB, BECE)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans bg-[#F7F8FA] text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

