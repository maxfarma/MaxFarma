'use client';
// Componente que oculta el email de los bots de spam
// Los bots leen el HTML estático — esto solo se arma en el browser
import { useState } from 'react';

export default function ObfuscatedEmail({ className = '' }) {
  const [revealed, setReveal] = useState(false);

  // Email partido en piezas — los bots no lo leen así
  const parts = ['ventamaxfarma', '@', 'gmail', '.', 'com'];
  const email = parts.join('');

  if (!revealed) {
    return (
      <button
        onClick={() => setReveal(true)}
        className={`hover:text-white transition-colors ${className}`}
        title="Clic para ver el email"
      >
        ventamaxfarma [at] gmail.com
      </button>
    );
  }

  return (
    <a href={`mailto:${email}`} className={`hover:text-white transition-colors ${className}`}>
      {email}
    </a>
  );
}
