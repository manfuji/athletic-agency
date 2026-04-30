// import type { Metadata } from 'next';
// import localFont from 'next/font/local';
// import { Inter, Amaranth } from 'next/font/google';
// import './globals.css';
// import { Toaster } from '@/components/ui/sonner';
// import SessionWrapper from '@/providers/session-provider';
// import QueryProvider from '@/providers/query-provider';
// const inter = Inter({
//   variable: '--font-inter',
//   subsets: ['latin'],
// });

// const amaranth = Amaranth({
//   variable: '--font-amaranth',
//   subsets: ['latin'],
//   weight: '400',
// });

// const evogria = localFont({
//   src: [
//     {
//       path: './fonts/evogria/Evogria.otf',
//       weight: '700',
//       style: 'normal',
//     },
//   ],
//   variable: '--font-evogria',
//   display: 'swap',
// });

// const sofiaPro = localFont({
//   src: [
//     {
//       path: './fonts/sofia-pro/Sofia Pro Bold Az.otf',
//       weight: '700',
//       style: 'normal',
//     },
//   ],
//   variable: '--font-sofia-pro',
//   display: 'swap',
// });

// export const metadata: Metadata = {
//   title: 'Athletic Agency - Admin',
//   description:
//     'Connecting Ghana’s high school athletes with global recruiters and scholarship opportunities.',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html
//       lang="en"
//       className={`${evogria.variable} ${inter.variable} ${amaranth.variable} ${sofiaPro.variable} antialiased`}
//     >
//       <body>
//         <SessionWrapper>
//           <QueryProvider>
//             {children}
//             <Toaster />
//           </QueryProvider>
//         </SessionWrapper>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Inter, Amaranth } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import QueryProvider from '@/providers/query-provider';
import SessionWrapper from '@/providers/session-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const amaranth = Amaranth({
  variable: '--font-amaranth',
  subsets: ['latin'],
  weight: '400',
});

const evogria = localFont({
  src: [
    {
      path: './fonts/evogria/Evogria.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-evogria',
  display: 'swap',
});

const sofiaPro = localFont({
  src: [
    {
      path: './fonts/sofia-pro/Sofia Pro Bold Az.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sofia-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Athletic Agency - Admin',
  description:
    'Connecting Ghana’s high school athletes with global recruiters and scholarship opportunities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${evogria.variable} ${inter.variable} ${amaranth.variable} ${sofiaPro.variable} antialiased`}
    >
      <body>
        <SessionWrapper>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
