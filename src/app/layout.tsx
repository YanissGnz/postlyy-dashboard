import "@/styles/globals.css";
import { type Metadata } from "next";

import { DM_Sans } from "next/font/google";
import ReduxProvider from "./redux/provider";

const rubik = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Postlyy",
  description: " Your Content, Planned, Analyzed & Supercharged.",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-background font-sans ${rubik.variable}`}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
