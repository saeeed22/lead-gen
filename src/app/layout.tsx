import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
    title: "LeadFinder - Find Local Business Leads Instantly",
    description: "Discover qualified local business leads in any city and niche. Build your prospect list in seconds with LeadFinder.",
    authors: [{ name: "LeadFinder" }],
    icons: {
        icon: "/seo.png",
        apple: "/seo.png",
    },
    openGraph: {
        title: "LeadFinder - Find Local Business Leads Instantly",
        description: "Discover qualified local business leads in any city and niche. Build your prospect list in seconds.",
        type: "website",
        images: ["/seo.png"],
    },
    twitter: {
        card: "summary_large_image",
        site: "@LeadFinder",
        images: ["/seo.png"],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
