import "@/styles/globals.css";
import { type Metadata } from "next";
// font
import { DM_Sans } from "next/font/google";
// providers
import ReduxProvider from "@/providers/redux-provider";
import AuthProvider from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import UserProvider from "@/providers/token-provider";
// components
import { Toaster } from "sonner";
// import ComingSoon from "./coming-soon";

const rubik = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Postlyy: Your Content, Planned, Analyzed & Supercharged.",
  metadataBase: new URL("https://postlyy.com"),
  twitter: {
    card: "summary_large_image",
    site: "@postlyy",
    creator: "@postlyy",
  },
  assets: [
    "/favicon.ico",
    "/favicon-16x16.png",
    "/favicon-32x32.png",
    "/apple-touch-icon.png",
    "/android-chrome-192x192.png",
    "/android-chrome-512x512.png",
    "/site.webmanifest",
    "/safari-pinned-tab.svg",
  ],
  description: "Your Content, Planned, Analyzed & Supercharged.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: [
    "postlyy",
    "post",
    "content",
    "planned",
    "analyzed",
    "supercharged",
    "social",
    "media",
    "marketing",
    "instagram",
    "facebook",
    "twitter",
    "linkedin",
  ],
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children, // children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-background font-sans transition-colors ${rubik.variable}`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ReduxProvider>
              <UserProvider>
                {/* <ComingSoon /> */}
                {children}
              </UserProvider>
            </ReduxProvider>
            <Toaster richColors closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
