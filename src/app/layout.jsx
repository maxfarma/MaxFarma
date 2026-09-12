import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets:['latin'], variable:'--font-outfit', display:'swap' });

export const metadata = {
  title: 'MaxFarma — Farmacia Online',
  description: 'Tu farmacia de confianza en Ruta Nacional 6 Km 22,5. Medicamentos oncológicos, diabéticos, dermocosmética y más.',
  keywords: 'farmacia, medicamentos, dermocosmética, oncológicos, diabéticos, Chaco',
  openGraph: {
    title: 'MaxFarma — Farmacia Online',
    description: 'Tu farmacia de confianza. Medicamentos y productos de salud con envío a domicilio.',
    type: 'website',
  },
  icons: {
    icon:  [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={outfit.variable}>
      <body>{children}</body>
    </html>
  );
}
