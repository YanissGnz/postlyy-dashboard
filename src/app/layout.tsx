import "@/styles/globals.css";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import { type Metadata } from "next";
// font
import { Outfit } from "next/font/google";
// providers
import ReduxProvider from "@/providers/redux-provider";
import AuthProvider from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import UserProvider from "@/providers/token-provider";
// components
import { Toaster } from "sonner";
// import ComingSoon from "./coming-soon";

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
        className={`bg-background font-sans transition-colors ${font.variable}`}
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
