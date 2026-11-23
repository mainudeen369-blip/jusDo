import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "jusDo — walk, remind, rival",
  description:
    "Vijay & Ajith doodle companion for water reminders, alarms, and fan-club movie quizzes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-[family-name:var(--font-body)]">
        <AppNav />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-white/5 px-4 py-4 text-center text-xs text-slate-500">
          jusDo · companion + fan quiz · deploy on Vercel
        </footer>
      </body>
    </html>
  );
}
