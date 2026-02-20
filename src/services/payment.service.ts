
const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL.replace(/\/$/, '')}/api`;

export interface OrderListItem {
    id: string;
    status: string;
    paymentMethod: string;
    total: number;
    totalFormatted: string;
    items: number;
    createdAt: string;
    paidAt?: string;
    customerName?: string;
    customerEmail?: string;
}

export async function listOrders(): Promise<OrderListItem[]> {
    try {
        const res = await fetch(`${API_URL}/payment/orders`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error('Failed to fetch orders');
        }

        const data = await res.json();
        return data.orders || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

export async function getOrderStatus(orderId: string) {
    try {
        const res = await fetch(`${API_URL}/payment/order/${orderId}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error('Failed to fetch order status');
        }

        return await res.json();
    } catch (error) {
        console.error('Error fetching order status:', error);
        return null;
    }
}
