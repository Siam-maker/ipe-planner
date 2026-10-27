import React from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
        <SpeedInsights />
      </body>
    </html>
  );
}
