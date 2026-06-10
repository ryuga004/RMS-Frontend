import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-display"
});
const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-body"
});

export const metadata: Metadata = {
    title: "AssertRenting - Premium Asset Renting",
    description: "Rent premium assets with ease",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${playfair.variable} ${dmSans.variable} font-body antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
