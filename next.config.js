/** @type {import('next').NextConfig} */

const ALLOWED_ORIGINS = [
  'https://maxfarma.com.ar',
  'https://www.maxfarma.com.ar',
  // Agregá tu dominio de Vercel si difiere, ej: 'https://maxfarma-next.vercel.app'
];

const securityHeaders = [
  // Previene clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Previene sniffing de tipo MIME
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Fuerza HTTPS por 1 año (solo activar en producción con HTTPS confirmado)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  // Controla información de referrer
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Deshabilita features de browser innecesarias
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Habilita protección XSS en navegadores legacy
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      // Solo recursos de origen propio + dominios explícitamente permitidos
      "default-src 'self'",
      // Scripts: self + GTM + Google Sign-In + Clarity
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://accounts.google.com https://www.clarity.ms",
      // Estilos: self + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fuentes
      "font-src 'self' https://fonts.gstatic.com",
      // Imágenes: self + cualquier HTTPS (para imágenes de productos externas)
      "img-src 'self' data: https:",
      // Conexiones: self + Firebase + WhatsApp API + GTM + Clarity
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com https://www.google-analytics.com https://www.clarity.ms",
      // Frames: solo Google Sign-In
      "frame-src https://accounts.google.com https://www.googletagmanager.com",
      // Sin objetos embebidos (Flash, etc.)
      "object-src 'none'",
      // Base URI restringida
      "base-uri 'self'",
      // Solo HTTPS para forms
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      // Permite cargar imágenes de cualquier HTTPS
      // Para mayor seguridad, reemplazá con dominios específicos:
      // { protocol: 'https', hostname: 'mitienda.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },

  async headers() {
    return [
      {
        // Aplica security headers a todas las rutas
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // CORS para la API de Next.js (si se agrega en el futuro)
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            // En producción, reemplazá '*' por tu dominio:
            // value: ALLOWED_ORIGINS.join(', ')
            value: process.env.NODE_ENV === 'production'
              ? (process.env.ALLOWED_ORIGIN || 'https://maxfarma.com.ar')
              : '*',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },

  // Redirige HTTP → HTTPS en producción (Vercel lo hace automáticamente, esto es para self-hosting)
  async redirects() {
    return process.env.NODE_ENV === 'production'
      ? [
          {
            source: '/(.*)',
            has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
            destination: 'https://maxfarma.com.ar/:path*',
            permanent: true,
          },
        ]
      : [];
  },
};

module.exports = nextConfig;

/*
  ═══════════════════════════════════════════════════════════
  FIREBASE ROW-LEVEL SECURITY (Firestore Rules)
  ═══════════════════════════════════════════════════════════
  Copiá estas reglas en Firebase Console → Firestore → Rules:

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {

      // Pedidos: solo se pueden crear (clientes), no leer/editar desde el cliente
      // La lectura real-time del panel usa Admin SDK en el servidor (recomendado)
      match /pedidos/{pedidoId} {
        // Permite crear pedidos (checkout público)
        allow create: if
          request.resource.data.keys().hasAll(['cliente','telefono','items','total','fecha']) &&
          request.resource.data.total is number &&
          request.resource.data.total > 0;

        // NO permite leer lista de pedidos desde el cliente sin autenticación
        // Para producción: mover el panel admin a Firebase Auth o Admin SDK
        allow read, update: if false;
        // Si querés habilitar el panel sin Auth por ahora, usá:
        // allow read, update: if true;
      }

      // Bloquear todo lo demás por defecto
      match /{document=**} {
        allow read, write: if false;
      }
    }
  }

  ═══════════════════════════════════════════════════════════
  NOTA: Para producción se recomienda migrar el panel admin
  a Firebase Authentication (Google Sign-In ya está integrado
  en el Header). Así las reglas de Firestore pueden validar
  request.auth.uid en lugar de permitir acceso libre.
  ═══════════════════════════════════════════════════════════
*/
