'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';

type PaymentMethod = 'pix' | 'credit' | 'boleto';

export default function CheckoutPage() {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Mock order data
    const orderSummary = {
        subtotal: 309.97,
        shipping: 0,
        total: 309.97,
        items: 3,
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setIsComplete(true);
    };

    if (isComplete) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" className="text-green-600">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Pedido Confirmado!
                </h1>
                <p className="text-[var(--text-secondary)] mb-6">
                    Seu pedido #12345 foi realizado com sucesso.
                </p>
                <a
                    href="/"
                    className="px-8 py-3 bg-[var(--accent-pink)] text-white font-bold rounded-lg"
                >
                    Voltar à Loja
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Header title="Checkout" showBackButton backHref="/carrinho" />

            <main className="px-4 pb-32 pt-2">
                {/* Delivery Address */}
                <section className="mb-6">
                    <h2 className="text-[var(--text-primary)] font-bold text-lg mb-3">
                        Endereço de Entrega
                    </h2>
                    <div className="bg-white p-4 rounded-xl border border-[var(--border-light)]">
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="CEP"
                                className="w-full h-12 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                            />
                            <input
                                type="text"
                                placeholder="Rua, número"
                                className="w-full h-12 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                            />
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Cidade"
                                    className="flex-1 h-12 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                                />
                                <input
                                    type="text"
                                    placeholder="UF"
                                    className="w-20 h-12 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment Method */}
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

                        {/* Credit Card */}
                        <button
                            onClick={() => setPaymentMethod('credit')}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'credit'
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
                            <div className={`w-6 h-6 rounded-full border-2 ${paymentMethod === 'credit'
                                    ? 'border-[var(--accent-pink)] bg-[var(--accent-pink)]'
                                    : 'border-[var(--border-light)]'
                                } flex items-center justify-center`}>
                                {paymentMethod === 'credit' && (
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

                {/* Order Summary */}
                <section>
                    <h2 className="text-[var(--text-primary)] font-bold text-lg mb-3">
                        Resumo do Pedido
                    </h2>
                    <div className="bg-white p-4 rounded-xl border border-[var(--border-light)] space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">{orderSummary.items} itens</span>
                            <span className="text-[var(--text-primary)]">
                                R$ {orderSummary.subtotal.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">Frete</span>
                            <span className="text-green-600 font-medium">Grátis</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--border-light)]">
                            <span className="text-[var(--text-primary)]">Total</span>
                            <span className="text-[var(--accent-pink)]">
                                R$ {orderSummary.total.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] p-4">
                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-14 bg-[var(--accent-pink)] text-white font-bold rounded-lg text-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processando...
                        </>
                    ) : (
                        `Pagar R$ ${orderSummary.total.toFixed(2).replace('.', ',')}`
                    )}
                </button>
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
        </div>
    );
}
