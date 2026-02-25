'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { Lock, CreditCard, Barcode, CheckCircle2, Copy, ExternalLink, QrCode } from 'lucide-react';

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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL.replace(/\/$/, '')}/api`;

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
            const res = await fetch(`${API_URL}/payment/order/${orderId}`);
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
            const response = await fetch(`${API_URL}/payment/checkout`, {
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
            const res = await fetch(`${API_URL}/payment/simulate-success/${checkoutResult.orderId}`, {
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
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 max-w-md w-full animate-in fade-in zoom-in duration-500">
                    <div className="relative mb-8 flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-inner animate-check-appear text-green-600">
                            <CheckCircle2 size={48} strokeWidth={3} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                        Pagamento Confirmado!
                    </h1>
                    <p className="text-slate-500 mb-6">
                        Seu pedido foi processado e já está sendo preparado com carinho.
                    </p>

                    {checkoutResult && (
                        <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 mb-8 inline-block w-full">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Número do Pedido</p>
                            <p className="text-xl font-mono font-bold text-slate-800 tracking-wider">#{checkoutResult.orderId.slice(0, 8)}</p>
                        </div>
                    )}

                    <div className="space-y-3 w-full">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl transition-all hover:bg-slate-800 shadow-xl shadow-slate-900/10 active:scale-95"
                        >
                            Continuar Comprando
                        </button>
                        {checkoutResult && (
                            <button
                                onClick={() => window.open(`${API_URL}/payment/order/${checkoutResult.orderId}`, '_blank')}
                                className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl transition-all hover:bg-slate-50 active:scale-95"
                            >
                                Ver Detalhes
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // TELA DE PAGAMENTO (PIX / BOLETO / CARD)
    // ════════════════════════════════════════════════════════════
    if (step === 'payment' && checkoutResult) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] text-slate-800">
                <Header title="Realizar Pagamento" showBackButton backHref="/checkout" />

                <main className="px-4 pb-32 pt-6 max-w-lg mx-auto">
                    {/* Status badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wide text-yellow-700">Aguardando Pagamento</span>
                        </div>
                    </div>

                    {/* PIX */}
                    {paymentMethod === 'pix' && (
                        <div className="space-y-6">
                            {checkoutResult.pixQrCode && (
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                                    <h3 className="text-slate-900 font-bold text-lg mb-6">
                                        Escaneie o QR Code
                                    </h3>
                                    <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-100 mb-6 shadow-inner">
                                        <img
                                            src={checkoutResult.pixQrCode}
                                            alt="QR Code PIX"
                                            className="w-48 h-48 mix-blend-multiply"
                                        />
                                    </div>
                                    <div className="bg-slate-50 py-3 px-4 rounded-xl inline-block">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Valor Total</p>
                                        <span className="text-2xl font-black text-slate-900">R$ {total.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>
                            )}

                            {checkoutResult.pixCopyPaste && (
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="text-slate-900 font-bold text-sm mb-4">
                                        Ou copie o código PIX
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100 font-mono text-xs text-slate-600 break-all leading-relaxed">
                                        {checkoutResult.pixCopyPaste}
                                    </div>
                                    <button
                                        onClick={handleCopyPix}
                                        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${pixCopied
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'
                                            }`}
                                    >
                                        {pixCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                        {pixCopied ? 'Copiado!' : 'Copiar Código'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Boleto */}
                    {paymentMethod === 'boleto' && (
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <Barcode className="text-slate-700 w-8 h-8" />
                            </div>
                            <h3 className="text-slate-900 font-bold text-xl mb-2">
                                Boleto Gerado
                            </h3>
                            <p className="text-sm text-slate-500 mb-8 font-medium">
                                Vencimento em 3 dias úteis
                            </p>

                            {checkoutResult.boletoBarcode && (
                                <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                                    <p className="text-xs font-mono text-slate-600 break-all tracking-wider">
                                        {checkoutResult.boletoBarcode}
                                    </p>
                                </div>
                            )}

                            {checkoutResult.boletoUrl && (
                                <a
                                    href={checkoutResult.boletoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-4 bg-slate-900 text-white font-bold rounded-xl text-center transition-all hover:bg-slate-800 shadow-lg shadow-slate-900/10"
                                >
                                    Visualizar Boleto
                                </a>
                            )}
                        </div>
                    )}

                    {/* Cartão (Dev Mode) */}
                    {paymentMethod === 'credit_card' && (
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-6">
                            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-2 transform -rotate-3">
                                <CreditCard className="text-pink-500 w-8 h-8" />
                            </div>

                            <div>
                                <h3 className="text-slate-900 font-bold text-xl">Pagamento via Cartão</h3>
                                <p className="text-sm text-slate-500 mt-2">Escolha como prosseguir (Ambiente de Teste)</p>
                            </div>

                            <div className="space-y-4 pt-4">
                                {checkoutResult.paymentUrl && (
                                    <a
                                        href={checkoutResult.paymentUrl}
                                        className="flex w-full items-center justify-center gap-2 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                                    >
                                        <span>Ir para Pagamento Real (Stripe)</span>
                                        <ExternalLink size={16} />
                                    </a>
                                )}

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-100" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                                        <span className="bg-white px-2 text-slate-400">Desenvolvimento</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSimulateSuccess}
                                    className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                >
                                    <CheckCircle2 size={18} />
                                    Simular Aprovação Instantânea
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Botão de simulação (apenas dev) - Visible for all methods */}
                    <div className="mt-8 p-5 bg-yellow-50/50 border border-yellow-100 rounded-2xl text-center">
                        <p className="text-xs text-yellow-700 mb-4 font-bold uppercase tracking-wider">
                            Ambiente de Desenvolvimento
                        </p>
                        <button
                            onClick={handleSimulateSuccess}
                            className="w-full py-3 bg-white border border-yellow-200 text-yellow-700 font-bold rounded-xl transition-all hover:bg-yellow-50 text-sm"
                        >
                            Simular Webhook de Sucesso
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
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">
                    Ops! Algo deu errado
                </h1>
                <p className="text-slate-500 mb-8 max-w-sm">
                    {error || 'Ocorreu um erro ao processar o pagamento.'}
                </p>
                <div className="space-y-3 w-full max-w-xs">
                    <button
                        onClick={() => { setStep('form'); setError(''); }}
                        className="block w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                        Tentar Novamente
                    </button>
                    <a
                        href="/carrinho"
                        className="block w-full py-3.5 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
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
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <Header title="Finalizar Pedido" showBackButton backHref="/carrinho" />
            </div>

            <main className="max-w-6xl mx-auto px-4 lg:px-6 py-8 pb-32 lg:pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Forms */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Erro inline */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-shake">
                                <span className="text-red-500 mt-0.5">⚠️</span>
                                <p className="text-sm font-medium text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Endereço */}
                        <section className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">1</span>
                                Endereço de Entrega
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Rua e Número</label>
                                    <input
                                        type="text"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
                                        placeholder="Ex: Av. Paulista, 1000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">CEP</label>
                                    <input
                                        type="text"
                                        value={cep}
                                        onChange={(e) => setCep(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Cidade</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
                                        placeholder="São Paulo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Estado</label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
                                        placeholder="SP"
                                    />
                                </div>
                                <div className="md:col-span-2 mt-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">E-mail para contao (opcional)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Pagamento */}
                        <section className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">2</span>
                                Pagamento
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 h-32 hover:border-slate-300 ${paymentMethod === 'pix'
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'border-slate-100 bg-slate-50 text-slate-500'
                                        }`}
                                >
                                    <QrCode size={24} />
                                    <span className="font-bold text-sm">PIX</span>
                                    {paymentMethod === 'pix' && <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('credit_card')}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 h-32 hover:border-slate-300 ${paymentMethod === 'credit_card'
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'border-slate-100 bg-slate-50 text-slate-500'
                                        }`}
                                >
                                    <CreditCard size={24} />
                                    <span className="font-bold text-sm">Cartão</span>
                                    {paymentMethod === 'credit_card' && <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('boleto')}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 h-32 hover:border-slate-300 ${paymentMethod === 'boleto'
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'border-slate-100 bg-slate-50 text-slate-500'
                                        }`}
                                >
                                    <Barcode size={24} />
                                    <span className="font-bold text-sm">Boleto</span>
                                    {paymentMethod === 'boleto' && <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                                </button>
                            </div>

                            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                <Lock size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Seus dados de pagamento são processados de forma segura e criptografada. Não armazenamos informações sensíveis do seu cartão.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24">
                        <section className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Resumo do Pedido</h2>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                                {cartItems.map((item) => (
                                    <div key={`${item.productId}-${item.size}`} className="flex gap-4 items-center">
                                        <div className="w-16 h-20 bg-slate-100 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${item.product.images[0]}")` }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 truncate">{item.product.name}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.quantity}x {item.size} • {item.color}</p>
                                        </div>
                                        <div className="font-bold text-sm text-slate-900">
                                            R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-100">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Entrega</span>
                                    <span className={shipping === 0 ? 'text-green-600 font-bold' : ''}>
                                        {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline pt-4">
                                    <span className="text-base font-bold text-slate-900">Total</span>
                                    <span className="text-3xl font-black text-slate-900">
                                        R$ {total.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={step === 'processing'}
                                className="w-full mt-8 h-14 bg-slate-900 text-white font-bold rounded-xl text-lg transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                            >
                                {step === 'processing' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                        Processando...
                                    </>
                                ) : (
                                    `Pagar R$ ${total.toFixed(2).replace('.', ',')}`
                                )}
                            </button>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
