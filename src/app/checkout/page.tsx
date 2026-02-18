'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useCart } from '@/contexts/CartContext';

type PaymentMethod = 'pix' | 'credit_card' | 'boleto';
type CheckoutStep = 'form' | 'processing' | 'payment' | 'success' | 'error';

interface CheckoutResult {
    orderId: string;
    status: string;
    paymentUrl?: string;
    pixQrCode?: string;
    pixCopyPaste?: string;
    boletoUrl?: string;
    boletoBarcode?: string;
    expiresAt?: string;
    duplicate?: boolean;
}

interface OrderStatus {
    orderId: string;
    status: string;
    paymentMethod: string;
    totalFormatted: string;
    paidAt?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items: cartItems, subtotal, shipping, total, clearCart, totalItems } = useCart();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
    const [step, setStep] = useState<CheckoutStep>('form');
    const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
    const [error, setError] = useState<string>('');
    const [pixCopied, setPixCopied] = useState(false);
    const [pollingActive, setPollingActive] = useState(false);
    const [idempotencyKey] = useState(() => generateIdempotencyKey());

    // Informações do formulário
    const [cep, setCep] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [email, setEmail] = useState('');

    // Redirecionar se carrinho vazio
    useEffect(() => {
        if (totalItems === 0 && step === 'form') {
            router.push('/carrinho');
        }
    }, [totalItems, step, router]);

    // Preparar itens para enviar ao backend
    const checkoutItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.product.images[0],
    }));

    // ─── Polling para verificar status do pagamento ────────────
    const pollOrderStatus = useCallback(async (orderId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/payment/order/${orderId}`);
            if (!res.ok) return;
            const data: OrderStatus = await res.json();
            setOrderStatus(data);

            if (data.status === 'paid') {
                setStep('success');
                setPollingActive(false);
                clearCart();
            } else if (data.status === 'failed') {
                setStep('error');
                setError('Pagamento não aprovado. Tente novamente.');
                setPollingActive(false);
            }
        } catch {
            // Silenciar erros de polling
        }
    }, []);

    useEffect(() => {
        if (!pollingActive || !checkoutResult?.orderId) return;

        const interval = setInterval(() => {
            pollOrderStatus(checkoutResult.orderId);
        }, 3000);

        return () => clearInterval(interval);
    }, [pollingActive, checkoutResult, pollOrderStatus]);

    // ─── Handler principal de pagamento ────────────────────────
    const handlePayment = async () => {
        // Validações
        if (!cep || !street || !city || !state) {
            setError('Preencha todos os campos do endereço.');
            return;
        }

        setError('');
        setStep('processing');

        try {
            const response = await fetch(`${API_URL}/api/payment/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': idempotencyKey,
                },
                body: JSON.stringify({
                    items: checkoutItems,
                    shipping: { cep, street, city, state },
                    paymentMethod,
                    customerEmail: email || undefined,
                    idempotencyKey,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao processar pagamento');
            }

            const result: CheckoutResult = await response.json();
            setCheckoutResult(result);

            // Para cartão de crédito com URL de pagamento, enviamos para a tela de etapa 'payment'
            // O usuário poderá escolher entre clicar no link real ou simular (modo dev)
            if (result.paymentUrl && paymentMethod === 'credit_card') {
                setStep('payment');
                setPollingActive(true);
                return;
            }

            // Para PIX e Boleto, mostrar tela de pagamento
            setStep('payment');
            setPollingActive(true);
        } catch (err) {
            setStep('error');
            setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
        }
    };

    // ─── Simular pagamento aprovado (modo dev) ─────────────────
    const handleSimulateSuccess = async () => {
        if (!checkoutResult?.orderId) return;

        try {
            const res = await fetch(`${API_URL}/api/payment/simulate-success/${checkoutResult.orderId}`, {
                method: 'POST',
            });

            if (res.ok) {
                setStep('success');
                setPollingActive(false);
                clearCart();
            }
        } catch {
            // Silenciar
        }
    };

    // ─── Copiar código PIX ─────────────────────────────────────
    const handleCopyPix = async () => {
        if (!checkoutResult?.pixCopyPaste) return;
        try {
            await navigator.clipboard.writeText(checkoutResult.pixCopyPaste);
            setPixCopied(true);
            setTimeout(() => setPixCopied(false), 3000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = checkoutResult.pixCopyPaste;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setPixCopied(true);
            setTimeout(() => setPixCopied(false), 3000);
        }
    };

    // ════════════════════════════════════════════════════════════
    // TELA DE SUCESSO
    // ════════════════════════════════════════════════════════════
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
                {/* Animação de check */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200 animate-check-appear">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="white" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                        </svg>
                    </div>
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-400 animate-ping opacity-20" />
                </div>

                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Pagamento Confirmado! 🎉
                </h1>
                <p className="text-[var(--text-secondary)] mb-2">
                    Seu pedido foi realizado com sucesso.
                </p>
                {checkoutResult && (
                    <div className="bg-white px-6 py-3 rounded-xl border border-[var(--border-light)] mb-6 inline-block">
                        <p className="text-sm text-[var(--text-secondary)]">Pedido</p>
                        <p className="text-lg font-bold text-[var(--text-primary)] font-mono">{checkoutResult.orderId}</p>
                    </div>
                )}

                <div className="space-y-3 w-full max-w-sm">
                    <a
                        href="/"
                        className="block w-full py-3 bg-[var(--accent-pink)] text-white font-bold rounded-lg text-center transition-all hover:opacity-90"
                    >
                        Voltar à Loja
                    </a>
                    {checkoutResult && (
                        <button
                            onClick={() => window.open(`${API_URL}/api/payment/order/${checkoutResult.orderId}`, '_blank')}
                            className="w-full py-3 border-2 border-[var(--border-light)] text-[var(--text-primary)] font-bold rounded-lg transition-all hover:bg-[var(--bg-secondary)]"
                        >
                            Ver Detalhes do Pedido
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // TELA DE PAGAMENTO (PIX / BOLETO)
    // ════════════════════════════════════════════════════════════
    if (step === 'payment' && checkoutResult) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)]">
                <Header title="Pagamento" showBackButton backHref="/checkout" />

                <main className="px-4 pb-32 pt-2">
                    {/* Status badge */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-sm font-medium text-amber-700">Aguardando Pagamento</span>
                        </div>
                    </div>

                    {/* PIX */}
                    {paymentMethod === 'pix' && (
                        <div className="space-y-4">
                            {/* QR Code */}
                            {checkoutResult.pixQrCode && (
                                <div className="bg-white p-6 rounded-2xl border border-[var(--border-light)] text-center">
                                    <h3 className="text-[var(--text-primary)] font-bold text-lg mb-4">
                                        Escaneie o QR Code
                                    </h3>
                                    <div className="inline-block p-4 bg-white rounded-xl border-2 border-[var(--border-light)] mb-4">
                                        <img
                                            src={checkoutResult.pixQrCode}
                                            alt="QR Code PIX"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Valor: <span className="font-bold text-[var(--text-primary)]">R$ {total.toFixed(2).replace('.', ',')}</span>
                                    </p>
                                </div>
                            )}

                            {/* Copia e Cola */}
                            {checkoutResult.pixCopyPaste && (
                                <div className="bg-white p-4 rounded-2xl border border-[var(--border-light)]">
                                    <h3 className="text-[var(--text-primary)] font-bold text-sm mb-3">
                                        Ou copie o código PIX
                                    </h3>
                                    <div className="bg-[var(--bg-secondary)] p-3 rounded-lg mb-3">
                                        <p className="text-xs font-mono text-[var(--text-primary)] break-all leading-relaxed">
                                            {checkoutResult.pixCopyPaste}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCopyPix}
                                        className={`w-full py-3 rounded-lg font-bold transition-all ${pixCopied
                                            ? 'bg-green-500 text-white'
                                            : 'bg-[var(--accent-pink)] text-white hover:opacity-90'
                                            }`}
                                    >
                                        {pixCopied ? '✓ Copiado!' : 'Copiar Código PIX'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Boleto */}
                    {paymentMethod === 'boleto' && (
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-[var(--border-light)] text-center">
                                <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--accent-pink)]">
                                        <path d="M232,48V208a8,8,0,0,1-16,0V48a8,8,0,0,1,16,0ZM56,40a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,56,40Zm40,0a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,96,40Zm80,0a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,176,40Zm-40,0a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,136,40ZM16,40a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,16,40Z" />
                                    </svg>
                                </div>
                                <h3 className="text-[var(--text-primary)] font-bold text-lg mb-2">
                                    Boleto Gerado
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    Vencimento em 3 dias úteis
                                </p>

                                {checkoutResult.boletoBarcode && (
                                    <div className="bg-[var(--bg-secondary)] p-3 rounded-lg mb-4">
                                        <p className="text-xs font-mono text-[var(--text-primary)] break-all">
                                            {checkoutResult.boletoBarcode}
                                        </p>
                                    </div>
                                )}

                                {checkoutResult.boletoUrl && (
                                    <a
                                        href={checkoutResult.boletoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-3 bg-[var(--accent-pink)] text-white font-bold rounded-lg text-center transition-all hover:opacity-90"
                                    >
                                        Abrir Boleto
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cartão de Crédito - Ação Manual para Dev */}
                    {paymentMethod === 'credit_card' && (
                        <div className="bg-white p-6 rounded-2xl border border-[var(--border-light)] text-center space-y-4">
                            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--accent-pink)]">
                                    <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64ZM32,192V104H224v88Z" />
                                </svg>
                            </div>

                            <h3 className="text-[var(--text-primary)] font-bold text-lg">
                                Pagamento via Cartão
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                Escolha como prosseguir com o pagamento.
                            </p>

                            <div className="space-y-3 pt-2">
                                {checkoutResult.paymentUrl && (
                                    <a
                                        href={checkoutResult.paymentUrl}
                                        className="block w-full py-3 bg-[var(--text-primary)] text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg text-center"
                                    >
                                        Ir para Pagamento Real (Stripe)
                                    </a>
                                )}

                                <div className="relative py-2 hidden md:block">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-[var(--border-light)]" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-[var(--text-secondary)]">Ou (Modo Dev)</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSimulateSuccess}
                                    className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M104,192a8.5,8.5,0,0,1-5.7-2.3l-56-56a8.1,8.1,0,0,1,11.4-11.4L104,172.7,202.3,74.3a8.1,8.1,0,0,1,11.4,11.4l-104,104A8.5,8.5,0,0,1,104,192Z" />
                                    </svg>
                                    Simular Pagamento Aprovado
                                </button>
                                <p className="text-[10px] text-[var(--text-secondary)]">
                                    Isso simula o webhook de sucesso do Stripe instantaneamente e aprova o pedido.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Pedido info */}
                    <div className="mt-6 bg-white p-4 rounded-xl border border-[var(--border-light)]">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--text-secondary)]">Pedido</span>
                            <span className="text-[var(--text-primary)] font-mono text-xs">{checkoutResult.orderId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">Total</span>
                            <span className="text-[var(--accent-pink)] font-bold">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>

                    {/* Botão de simulação (apenas dev) */}
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-700 mb-3 font-medium">
                            🧪 Modo Desenvolvimento — Simular pagamento
                        </p>
                        <button
                            onClick={handleSimulateSuccess}
                            className="w-full py-3 bg-green-500 text-white font-bold rounded-lg transition-all hover:bg-green-600"
                        >
                            ✓ Simular Pagamento Aprovado
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // TELA DE ERRO
    // ════════════════════════════════════════════════════════════
    if (step === 'error') {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Ops! Algo deu errado
                </h1>
                <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
                    {error || 'Ocorreu um erro ao processar o pagamento.'}
                </p>
                <div className="space-y-3 w-full max-w-sm">
                    <button
                        onClick={() => { setStep('form'); setError(''); }}
                        className="block w-full py-3 bg-[var(--accent-pink)] text-white font-bold rounded-lg text-center"
                    >
                        Tentar Novamente
                    </button>
                    <a
                        href="/carrinho"
                        className="block w-full py-3 border-2 border-[var(--border-light)] text-[var(--text-primary)] font-bold rounded-lg text-center"
                    >
                        Voltar ao Carrinho
                    </a>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // FORMULÁRIO DE CHECKOUT (PRINCIPAL)
    // ════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Header title="Checkout" showBackButton backHref="/carrinho" />

            <main className="px-4 pb-32 pt-2">
                {/* Erro inline */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Endereço de Entrega */}
                <section className="mb-6">
                    <h2 className="text-[var(--text-primary)] font-bold text-lg mb-3">
                        Endereço de Entrega
                    </h2>
                    <div className="bg-white p-4 rounded-xl border border-[var(--border-light)]">
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="CEP"
                                value={cep}
                                onChange={(e) => setCep(e.target.value)}
                                className="w-full h-12 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                            />
                            <input
                                type="text"
                                placeholder="Rua, número"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                className="w-full h-12 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                            />
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Cidade"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="flex-1 h-12 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                                />
                                <input
                                    type="text"
                                    placeholder="UF"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className="w-20 h-12 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="E-mail (opcional)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                            />
                        </div>
                    </div>
                </section>

                {/* Forma de Pagamento */}
                <section className="mb-6">
                    <h2 className="text-[var(--text-primary)] font-bold text-lg mb-3">
                        Forma de Pagamento
                    </h2>
                    <div className="space-y-3">
                        {/* PIX */}
                        <button
                            onClick={() => setPaymentMethod('pix')}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'pix'
                                ? 'border-[var(--accent-pink)] bg-pink-50'
                                : 'border-[var(--border-light)] bg-white'
                                }`}
                        >
                            <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--accent-pink)]">
                                    <path d="M235.33,116.72,139.28,20.66a16,16,0,0,0-22.57,0l-96,96.06a16,16,0,0,0,0,22.56l96.05,96.06h0a16,16,0,0,0,22.56,0l96.05-96.06A16,16,0,0,0,235.33,116.72ZM128,224,32,128,128,32l96,96Z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-bold text-[var(--text-primary)]">PIX</p>
                                <p className="text-sm text-[var(--text-secondary)]">Aprovação instantânea</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 ${paymentMethod === 'pix'
                                ? 'border-[var(--accent-pink)] bg-[var(--accent-pink)]'
                                : 'border-[var(--border-light)]'
                                } flex items-center justify-center`}>
                                {paymentMethod === 'pix' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 256 256">
                                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                                    </svg>
                                )}
                            </div>
                        </button>

                        {/* Cartão de Crédito */}
                        <button
                            onClick={() => setPaymentMethod('credit_card')}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'credit_card'
                                ? 'border-[var(--accent-pink)] bg-pink-50'
                                : 'border-[var(--border-light)] bg-white'
                                }`}
                        >
                            <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--accent-pink)]">
                                    <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64ZM32,192V104H224v88Z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-bold text-[var(--text-primary)]">Cartão de Crédito</p>
                                <p className="text-sm text-[var(--text-secondary)]">Até 12x sem juros</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 ${paymentMethod === 'credit_card'
                                ? 'border-[var(--accent-pink)] bg-[var(--accent-pink)]'
                                : 'border-[var(--border-light)]'
                                } flex items-center justify-center`}>
                                {paymentMethod === 'credit_card' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 256 256">
                                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                                    </svg>
                                )}
                            </div>
                        </button>

                        {/* Boleto */}
                        <button
                            onClick={() => setPaymentMethod('boleto')}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'boleto'
                                ? 'border-[var(--accent-pink)] bg-pink-50'
                                : 'border-[var(--border-light)] bg-white'
                                }`}
                        >
                            <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--accent-pink)]">
                                    <path d="M232,48V208a8,8,0,0,1-16,0V48a8,8,0,0,1,16,0ZM56,40a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,56,40Zm40,0a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,96,40Zm80,0a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,176,40Zm-40,0a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,136,40ZM16,40a8,8,0,0,0-8,8V208a8,8,0,0,0,16,0V48A8,8,0,0,0,16,40Z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-bold text-[var(--text-primary)]">Boleto</p>
                                <p className="text-sm text-[var(--text-secondary)]">Vencimento em 3 dias</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 ${paymentMethod === 'boleto'
                                ? 'border-[var(--accent-pink)] bg-[var(--accent-pink)]'
                                : 'border-[var(--border-light)]'
                                } flex items-center justify-center`}>
                                {paymentMethod === 'boleto' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 256 256">
                                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    </div>
                </section>

                {/* Resumo do Pedido */}
                <section>
                    <h2 className="text-[var(--text-primary)] font-bold text-lg mb-3">
                        Resumo do Pedido
                    </h2>
                    <div className="bg-white p-4 rounded-xl border border-[var(--border-light)] space-y-2">
                        {cartItems.map((item) => (
                            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">{item.quantity}x {item.product.name}</span>
                                <span className="text-[var(--text-primary)]">
                                    R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        ))}
                        <div className="flex justify-between text-sm pt-2 border-t border-[var(--border-light)]">
                            <span className="text-[var(--text-secondary)]">Frete</span>
                            <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-[var(--text-primary)]'}>
                                {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--border-light)]">
                            <span className="text-[var(--text-primary)]">Total</span>
                            <span className="text-[var(--accent-pink)]">
                                R$ {total.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Badges de segurança */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,160H48V56H208Z" />
                        </svg>
                        <span>Pagamento Seguro</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,160H48V56H208Z" />
                        </svg>
                        <span>Dados Criptografados</span>
                    </div>
                </div>
            </main>

            {/* Botão fixo */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] p-4">
                <button
                    onClick={handlePayment}
                    disabled={step === 'processing'}
                    className="w-full h-14 bg-[var(--accent-pink)] text-white font-bold rounded-lg text-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {step === 'processing' ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processando...
                        </>
                    ) : (
                        `Pagar R$ ${total.toFixed(2).replace('.', ',')}`
                    )}
                </button>
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
        </div>
    );
}
