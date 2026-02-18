'use client';

import { CartProvider } from '@/contexts/CartContext';
import { ReactNode } from 'react';

// Wrapper necessário porque o RootLayout é um Server Component
// e o CartProvider usa hooks (Client Component).

export function CartProviderWrapper({ children }: { children: ReactNode }) {
    return <CartProvider>{children}</CartProvider>;
}
