import './globals.css';

export const metadata = {
  title: 'Multi-Tenant Agency',
  description: 'Secure project management for agencies and their clients',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
