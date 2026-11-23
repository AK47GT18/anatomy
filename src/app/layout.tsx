import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Human Anatomy Atlas — 3D Medical Reference',
  description: 'Interactive 3D human anatomy atlas with real medical meshes — skeletal, muscular, vascular, and visceral systems.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="w-screen h-screen overflow-hidden bg-[#f8fafc] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
