import React from 'react';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'IPE Study Planner · BUET',
  description:
    'Comprehensive study planner, syllabus topic tracker, GPA calculator, and attendance & CT marks analyzer for BUET Industrial & Production Engineering students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
