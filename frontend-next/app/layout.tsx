import type { Metadata } from "next";
import SignupPopup from "@/components/SignupPopup";
import SiteTakeover from "@/components/SiteTakeover";
import { getAdByPlacement } from "@/lib/wordpress";
import { parseTakeoverConfig } from "@/lib/takeover";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://homeandschool.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Home&School",
    template: "%s | Home&School",
  },
  description:
    "Practical education, parenting, development, partner, and magazine resources for South African homeschooling families.",
  openGraph: {
    type: "website",
    siteName: "Home&School",
    title: "Home&School",
    description:
      "Practical education, parenting, development, partner, and magazine resources for South African homeschooling families.",
    url: siteUrl,
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ad = await getAdByPlacement("home-top");
  const takeover = parseTakeoverConfig(process.env.SITE_TAKEOVER_CONFIG) ?? ad.takeover;

  return (
    <html lang="en">
      <body>
        <SiteTakeover ad={{ ...ad, takeover }}>{children}</SiteTakeover>
        <SignupPopup />
      </body>
    </html>
  );
}

