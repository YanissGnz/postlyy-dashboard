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
// import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

const rubik = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Postlyy: Your Content, Planned, Analyzed & Supercharged.",
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
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-background font-sans transition-colors ${rubik.variable}`}
      >
        {/* <NextTopLoader color="#1DA1F2" showSpinner={false}  /> */}
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ReduxProvider>
              <UserProvider>{children}</UserProvider>
            </ReduxProvider>
            <Toaster richColors closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
