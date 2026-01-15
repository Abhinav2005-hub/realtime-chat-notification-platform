import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import AuthGate from "@/components/AuthGate";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            <AuthGate>{children}</AuthGate>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
