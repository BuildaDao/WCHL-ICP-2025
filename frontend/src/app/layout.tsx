import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BAD_DAO - Milestone Vault Engine",
  description: "Decentralized milestone vault system built on Internet Computer Protocol (ICP)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">BAD_DAO</h1>
                  <span className="ml-2 text-sm text-gray-500">Milestone Vault Engine</span>
                </div>
                <nav className="flex space-x-8">
                  <a href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="/vault" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Vault
                  </a>
                  <a href="/splitter" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Revenue
                  </a>
                  <a href="/governance" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Governance
                  </a>
                  <a href="/fallback" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Fallback
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-sm text-gray-500">
                Built on Internet Computer Protocol (ICP) • Powered by Motoko
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
