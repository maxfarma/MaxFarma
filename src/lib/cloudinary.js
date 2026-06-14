// src/lib/cloudinary.js
// Sube una imagen a Cloudinary y devuelve la URL pública
// Cloud Name y Upload Preset se leen desde variables de entorno

const CLOUD_NAME   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME   || 'dximjpxq7';
const UPLOAD_PRESET= process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'maxfarma_uploads';

/**
 * uploadToCloudinary(file: File) → Promise<string>
 * Devuelve la URL segura (https) de la imagen subida.
 */
export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'maxfarma');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al subir imagen a Cloudinary');
  }

  const data = await res.json();
  return data.secure_url; // URL pública permanente
}
