import "@/styles/globals.css";
import { type Metadata } from "next";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
// font
import { Outfit } from "next/font/google";
// providers
import AuthProvider from "@/providers/auth-provider";
import ReduxProvider from "@/providers/redux-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import TokenProvider from "@/providers/token-provider";
// components
import { env } from "@/env";
import { Toaster } from "sonner";
import ComingSoon from "./coming-soon";

const font = Outfit({
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
  assets: ["/favicon.ico"],
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
  // manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-background font-sans transition-colors ${font.variable}`}
      >
        <AuthProvider>
          <ReduxProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <TokenProvider>
                {env.NEXT_PUBLIC_ENVIRONMENT === "production" ? (
                  <ComingSoon />
                ) : (
                  children
                )}
                <Toaster richColors closeButton />
              </TokenProvider>
            </ThemeProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
