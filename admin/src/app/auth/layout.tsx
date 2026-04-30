import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const evogria = localFont({
  src: [
    {
      path: '../fonts/evogria/Evogria.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-evogria',
  display: 'swap',
});

export const metadata = {
  title: 'Athletic Agency - Login',
  description: 'Login to your Athletic Agency account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${evogria.variable} ${inter.variable} antialiased`}>
      {children}
    </div>
  );
}
