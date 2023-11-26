import "@/styles/globals.css";
import { type Metadata } from "next";
// font
import { DM_Sans } from "next/font/google";
// providers
import ReduxProvider from "../providers/redux-provider";
import AuthProvider from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
// components
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

const rubik = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Postlyy: Your Content, Planned, Analyzed & Supercharged.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-background font-sans ${rubik.variable}`}>
        <NextTopLoader color="#FF0000" showSpinner={false} />
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ReduxProvider>{children}</ReduxProvider>
            <Toaster richColors closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
