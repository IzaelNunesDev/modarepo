'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { listOrders, OrderListItem } from '@/services/payment.service';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'CANCELLED'>('ALL');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await listOrders();
            setOrders(data);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            toast.error('Erro ao carregar lista de pedidos');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'ALL') return true;
        return o.status === filter;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Toaster position="top-center" />
            <Header title="Gestão de Pedidos" showBackButton backHref="/admin" />

            <main className="px-4 pt-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <span className="text-xl font-black text-slate-900">{orders.length}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <span className="text-xl font-black text-green-600">{orders.filter(o => o.status === 'PAID').length}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pagos</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <span className="text-xl font-black text-yellow-600">{orders.filter(o => o.status === 'PENDING').length}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pendente</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 -mx-4 px-4 pb-2">
                    {(['ALL', 'PAID', 'PENDING', 'CANCELLED'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap border ${filter === f
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {f === 'ALL' ? 'Todos' : f === 'PAID' ? 'Pagos' : f === 'PENDING' ? 'Pendentes' : 'Cancelados'}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 relative overflow-hidden group">
                                {/* Side Bar Indicator */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'PAID' ? 'bg-green-500' :
                                        order.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />

                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.id}</span>
                                        <h3 className="font-bold text-slate-900">{order.customerName || 'Cliente sem nome'}</h3>
                                        <span className="text-xs text-slate-500">{order.customerEmail}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black border uppercase tracking-tighter ${getStatusStyle(order.status)}`}>
                                        {order.status === 'PAID' ? 'Pago' : order.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end pt-2 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Data</span>
                                        <span className="text-xs font-medium text-slate-600">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{order.items} {order.items === 1 ? 'item' : 'itens'}</span>
                                        <span className="text-lg font-black text-slate-900">{order.totalFormatted}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#cbd5e1" viewBox="0 0 256 256">
                                    <path d="M200,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H56V48H200V208ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-slate-900">Nenhum pedido encontrado</h3>
                            <p className="text-sm text-slate-500">Não existem pedidos com este status.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
