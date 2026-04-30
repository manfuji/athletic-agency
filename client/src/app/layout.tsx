import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Toaster } from "sonner";
import { CircleCheck } from "lucide-react";
import { IoInformationCircle } from "react-icons/io5";
import ProgressBar from "@/components/common/progress-bar";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Athletic Agency",
  description:
    "Discover The Athletic Agency's mission to promote high school sports in Ghana. Our platform connects student-athletes with recruiters in the UK and US, highlights achievements, and fosters youth sports development. Inspiring the next generation of sports champions!",
  keywords: [
    "high school sports in Ghana",
    "Ghanaian student-athletes",
    "youth sports development",
    "sports scholarships for Ghana students",
    "connecting athletes to recruiters",
    "UK and US college recruiters",
    "youth competitions in Ghana",
    "athlete visibility platform",
    "promoting student sports Ghana",
    "developing young athletes in Ghana",
  ],
  authors: [
    {
      name: "The Athletic Agency",
      url: "https://athletic-agency-frontend-client.vercel.app/",
    },
    {
      name: "TouchStack Technologies",
      url: "https://touchstacktechnologies.com",
    },
  ],
  robots: "follow, index",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Suspense>
          <ProgressBar />
        </Suspense>
        <Navbar />
        {children}
        <Footer />
        <Toaster
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "bg-[#D0EFE9] font-inter w-full  flex items-center gap-4 px-4 py-4 pr-1 shadow-md border-l-4 border-primary",
              error: "bg-[#FED7D7] font-inter border-[#FECACA]",
            },
          }}
          icons={{
            error: <IoInformationCircle color={"red"} size={16} />,
            success: (
              <CircleCheck fill={"#063231"} color={"#D0EFE9"} size={24} />
            ),
          }}
          position={"top-center"}
        />
      </body>
    </html>
  );
}
