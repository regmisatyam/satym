import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Satyam Regmi | Portfolio",
  description: "Personal portfolio website of Satyam Regmi showcasing projects and skills",
  icons: {
    icon: "/image.png",
    shortcut: "/image.png",
    },
  twitter: {
    card: "summary_large_image",
    title: "Satyam Regmi | Portfolio",
    description: "Personal portfolio website of Satyam Regmi showcasing projects and skills",
    images: ["/image.png"],
  },
  openGraph: {
    title: "Satyam Regmi | Portfolio",
    description: "Personal portfolio website of Satyam Regmi showcasing projects and skills",
    images: ["/image.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="shortcut icon" href="/image.png" type="image/x-icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark-primary text-dark-text`}
      >
        {children}
      </body>
    </html>
  );
}
