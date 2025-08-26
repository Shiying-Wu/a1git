import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HamburgerMenu from './Components/HamburgerMenu';
import ModeChange from './Components/modeChange';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowForge",
  description: "A purpose-built platform for automated development workflows",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="myId">
          Student No.22088587
        </div>

        <div className="title">
          FlowCode
        </div>

        <div className="header">
          <a href="/">Home</a>
          <a href="/theme">Theme</a>
          <a href="/docker">Docker</a>
          <a href="/prima">Prima</a>
          <a href="/test">Test</a>
          <a href="/about">About</a>
          <HamburgerMenu />
          <ModeChange/>
        </div>

        {/* main contain-children */}
        <main className="main-content">
          {children}
        </main>

        {/* footer */}
        <footer className="footer">
          <div className="footer-content">
            <span>© 2025/08/20. All rights reserved.</span>
            <span>22088587</span>
            <span>Shiying Wu</span>
          </div>
        </footer>
      </body>
    </html>
  );
}