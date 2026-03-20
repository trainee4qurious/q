import type { Metadata } from "next"

import { Geist, Geist_Mono } from "next/font/google";
import "./f-globals.css";
import { FormSync } from "@/components/form-submission/FormSync"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Formify - Submission",
    description: "Form submission powered by Formify",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
            <FormSync />
            {children}
        </div>
    )
}
