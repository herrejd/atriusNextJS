export const metadata = {
  title: 'Atrius Maps POI Viewer',
  description: 'View Points of Interest using Atrius Maps SDK',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}