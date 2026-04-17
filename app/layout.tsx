import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/app/components/SessionProvider";
import StoreProvider from "@/app/components/StoreProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MyExpense — Personal Finance Tracker",
    template: "%s | MyExpense",
  },
  description:
    "Track your income, expenses, and savings goals in one place. Get smart insights, category breakdowns, and monthly trends to take control of your finances.",
  keywords: [
    "expense tracker",
    "personal finance",
    "budget planner",
    "savings goals",
    "income tracker",
    "money management",
    "financial dashboard",
  ],
  authors: [{ name: "Hemanathan A S" }],
  creator: "Hemanathan A S",
  metadataBase: new URL("https://expense.hemanathan.space"),
  openGraph: {
    title: "MyExpense — Personal Finance Tracker",
    description:
      "Track income, expenses, and savings goals with smart monthly insights.",
    url: "https://expense.hemanathan.space",
    siteName: "MyExpense",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyExpense — Personal Finance Tracker",
    description:
      "Track income, expenses, and savings goals with smart monthly insights.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-950 text-white`}>
        <StoreProvider>
          <SessionProvider>{children}</SessionProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
