
'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';

export default function UploadTestPage() {
    const [uploadedUrl, setUploadedUrl] = useState<string>("");

    const handleUpload = (url: string) => {
        setUploadedUrl(url);
        console.log("URL Recebida do Backend:", url);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Teste de Upload 🚀</h1>
                <p className="text-sm text-gray-500 mb-6">Envie uma imagem para testar a conexão com a Oracle Cloud.</p>

                <ImageUpload onUpload={handleUpload} />

                {uploadedUrl && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-green-700 font-bold text-sm mb-2">✅ Sucesso!</p>
                        <p className="text-xs text-green-600 break-all">{uploadedUrl}</p>
                        <a
                            href={uploadedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition"
                        >
                            Abrir Link
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
