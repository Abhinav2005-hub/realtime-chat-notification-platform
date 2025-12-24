import "./globals.css";

export const metadata = {
  title: "Realtime Chat App",
  description: "Realtime chat application"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}