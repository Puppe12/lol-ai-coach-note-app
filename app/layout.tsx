import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import Header from "@/app/components/Header";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { auth } from "@/auth";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { MantineThemeProvider } from "@/app/components/MantineThemeProvider";
import { ToastNotificationProvider } from "@/app/contexts/ToastNotificationContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoL AI Note app",
  description: "Note app for tracking improvement process",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <MantineThemeProvider>
            <AuthProvider session={session}>
              <ToastNotificationProvider>
                <Header />
                <main>{children}</main>
              </ToastNotificationProvider>
            </AuthProvider>
          </MantineThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
