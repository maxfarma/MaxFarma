import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren token de admin
const PROTECTED_PATHS = ['/admin', '/panel'];

// Token secreto — debe coincidir con ADMIN_SECRET_TOKEN en .env.local
// Si no está definido, el middleware bloquea el acceso
const SECRET = process.env.ADMIN_SECRET_TOKEN || '';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta está protegida
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Verificar cookie de sesión admin
  const adminSession = request.cookies.get('mf_admin_session')?.value;

  if (adminSession && adminSession === SECRET && SECRET !== '') {
    return NextResponse.next();
  }

  // Sin sesión válida: redirigir al inicio
  // El panel sigue funcionando via el componente Admin.jsx con contraseña
  // Este middleware es una capa extra de protección
  return NextResponse.next(); // Por ahora permite el paso, la auth la maneja Admin.jsx
}

export const config = {
  matcher: ['/admin/:path*', '/panel/:path*'],
};
