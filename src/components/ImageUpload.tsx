
'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    currentImage?: string;
    label?: string;
}

export function ImageUpload({ onUpload, currentImage, label = "Imagem do Produto" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("O arquivo deve ter no máximo 5MB");
            return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            setError("Apenas arquivos de imagem são permitidos");
            return;
        }

        setError(null);
        setUploading(true);

        // Preview imediato
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Falha no upload');
            }

            const data = await res.json();
            onUpload(data.url);

            // Atualizar preview com a URL final (opcional, mas garante que funcionou)
            // setPreview(data.url); 

        } catch (err) {
            console.error(err);
            setError("Erro ao enviar imagem. Tente novamente.");
            setPreview(currentImage || null); // Reverte preview
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload(''); // Limpa no pai
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            <div className={`
                relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all
                ${preview ? 'border-pink-300 bg-pink-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                ${error ? 'border-red-300 bg-red-50' : ''}
            `}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="flex flex-col items-center py-6 text-pink-600">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-sm font-bold">Enviando para Oracle Cloud...</span>
                    </div>
                ) : preview ? (
                    <div className="relative w-full aspect-video md:aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation(); // Evita abrir o seletor de arquivos de novo
                                handleRemove();
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 z-20 transition-transform hover:scale-110"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-6 text-gray-400">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6 text-pink-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">Clique para fazer upload</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1">
                    <X size={12} /> {error}
                </p>
            )}
        </div>
    );
}
