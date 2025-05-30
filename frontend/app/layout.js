import "./globals.css";

export const metadata = {
  title: "P2P Eval..",
  description: "Haksham",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
