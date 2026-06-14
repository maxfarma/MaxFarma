'use client';
// src/components/ImageField.jsx
// Componente reutilizable para subir imágenes — URL externa O subida a Cloudinary
// Uso: <ImageField value={url} onChange={setUrl} label="Imagen" />

import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function ImageField({ value, onChange, label='Imagen', placeholder='https://...', previewClass='w-16 h-16' }) {
  const fileRef  = useRef();
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError]   = useState(false);
  const [progress, setProgress]   = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Seleccioná un archivo de imagen.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('La imagen debe pesar menos de 5 MB.'); return; }

    setUploading(true);
    setProgress('Subiendo a Cloudinary...');
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
      setImgError(false);
      setProgress('');
    } catch (err) {
      alert('Error al subir la imagen: ' + err.message);
      setProgress('');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>}

      <div className="flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
          value={value || ''}
          onChange={e => { onChange(e.target.value); setImgError(false); }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap border border-gray-200 disabled:opacity-60"
          title="Subir imagen desde tu ordenador — se sube a Cloudinary"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Subiendo...' : 'Subir'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {value && !uploading && (
          <button type="button" onClick={() => { onChange(''); setImgError(false); }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Quitar imagen">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {progress && <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />{progress}</p>}

      {value && !uploading && (
        <div className="mt-2 flex items-center gap-3">
          {!imgError ? (
            <img src={value} alt="preview" className={`${previewClass} object-contain border border-gray-100 rounded-lg bg-gray-50 p-1`}
              onError={() => setImgError(true)} />
          ) : (
            <div className={`${previewClass} border border-red-200 rounded-lg bg-red-50 flex items-center justify-center`}>
              <X className="w-4 h-4 text-red-400" />
            </div>
          )}
          <p className="text-xs text-gray-400">
            {imgError ? '⚠ URL no válida' : value.includes('cloudinary.com') ? '✓ Imagen en Cloudinary (visible en todos los dispositivos)' : '✓ Vista previa'}
          </p>
        </div>
      )}
    </div>
  );
}
