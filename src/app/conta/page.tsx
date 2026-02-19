'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { User, Package, Heart, MapPin, CreditCard, Bell, HelpCircle, Shield, LogOut, ChevronRight, Settings } from 'lucide-react';

export default function ContaPage() {
    const menuItems = [
        { icon: User, label: 'Meus Dados', href: '#' },
        { icon: Package, label: 'Meus Pedidos', href: '#', badgeCount: 2 },
        { icon: Heart, label: 'Favoritos', href: '#' },
        { icon: MapPin, label: 'Endereços', href: '#' },
        { icon: CreditCard, label: 'Formas de Pagamento', href: '#' },
        { icon: Bell, label: 'Notificações', href: '#', badgeNew: true },
        { icon: HelpCircle, label: 'Ajuda e Suporte', href: '#' },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <Header title="Minha Conta" showBackButton backHref="/" />
            </div>

            <main className="max-w-2xl mx-auto px-4 py-8 pb-32">

                {/* Profile Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-50">
                        <div className="w-32 h-32 bg-pink-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    </div>

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-3xl overflow-hidden shrink-0">
                            <img
                                src="https://ui-avatars.com/api/?name=Maria+Silva&background=fce7f3&color=db2777"
                                alt="Maria Silva"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Maria Silva</h2>
                            <p className="text-slate-500 font-medium">maria.silva@email.com</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700">
                                    Cliente VIP
                                </span>
                            </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                {/* Admin Access Banner */}
                <Link
                    href="/admin"
                    className="group relative flex items-center gap-5 bg-slate-900 text-white p-5 rounded-2xl mb-10 overflow-hidden shadow-xl shadow-slate-900/10 transition-transform active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 skew-x-12 -mr-8" />

                    <div className="relative z-10 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                        <Shield className="text-white w-6 h-6" />
                    </div>

                    <div className="relative z-10 flex-1">
                        <p className="font-bold text-lg leading-tight">Painel Administrativo</p>
                        <p className="text-slate-400 text-xs mt-1 font-medium">Gerenciar produtos e estoque</p>
                    </div>

                    <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white text-white group-hover:text-slate-900 transition-all">
                        <ChevronRight size={16} />
                    </div>
                </Link>

                {/* Menu Grid/List */}
                <h3 className="text-slate-900 font-bold text-lg mb-4 px-1">Configurações</h3>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                    {menuItems.map((item, index) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group relative ${index < menuItems.length - 1 ? 'border-b border-slate-50' : ''
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-pink-500 group-hover:shadow-sm transition-all">
                                <item.icon size={20} strokeWidth={2} />
                            </div>

                            <span className="flex-1 text-slate-700 font-bold group-hover:text-slate-900 transition-colors">
                                {item.label}
                            </span>

                            {item.badgeCount && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mr-2 bg-blue-50 text-blue-600">
                                    {item.badgeCount} novos
                                </span>
                            )}

                            {item.badgeNew && (
                                <span className="w-2 h-2 rounded-full bg-pink-500 mr-2 animate-pulse" />
                            )}

                            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                <button className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={18} />
                    <span>Sair da Conta</span>
                </button>

                <div className="text-center mt-8">
                    <p className="text-xs text-slate-300 font-medium tracking-widest uppercase">Moda Store v1.2.0</p>
                </div>
            </main>
        </div>
    );
}
