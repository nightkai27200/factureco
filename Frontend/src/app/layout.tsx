
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {

  return (

    <html lang="fr">

      <body>

        <Sidebar />

        <main
          style={{
            marginLeft: "240px"
          }}
        >
          {children}
        </main>

        <Analytics />

      </body>

    </html>

  );

}

