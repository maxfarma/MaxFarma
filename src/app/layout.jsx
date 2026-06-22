import { Outfit } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';
const outfit = Outfit({ subsets:['latin'], weight:['300','400','500','600','700','800','900'], variable:'--font-outfit' });
export const metadata = {
  title: 'MaxFarma — Farmacia Online',
  description: 'Tu farmacia de confianza en Ruta Nacional 6 Km 22,5.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="es" className={outfit.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html:`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-NTN35XXD');` }} />
        <script dangerouslySetInnerHTML={{ __html:`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","x419jequ7o");` }} />
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className="font-sans bg-white text-gray-800 antialiased">
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NTN35XXD" height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
