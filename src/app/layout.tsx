import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secure AirSpace Dashboard",
  description: "Live weather telemetry and active flight tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
