'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function SucessoContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        // Se veio do Stripe Checkout, verificar o status
        if (sessionId) {
            // Em produção, verificar com o backend
            setStatus('success');
        } else {
            setStatus('success');
        }
    }, [sessionId]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[var(--accent-pink)] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="white" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Pagamento Confirmado! 🎉
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
                Obrigado pela sua compra! Você receberá um e-mail com os detalhes.
            </p>

            <a
                href="/"
                className="px-8 py-3 bg-[var(--accent-pink)] text-white font-bold rounded-lg transition-all hover:opacity-90"
            >
                Voltar à Loja
            </a>
        </div>
    );
}

export default function CheckoutSucessoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[var(--accent-pink)] border-t-transparent rounded-full" />
            </div>
        }>
            <SucessoContent />
        </Suspense>
    );
}
