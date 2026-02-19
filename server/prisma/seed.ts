
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockProducts = [
    {
        id: '1',
        name: 'Biquíni Tropical Verão',
        description: 'Conjunto de biquíni com estampa tropical vibrante, perfeito para realçar o bronzeado.',
        price: 149.99,
        images: [
            '/imgs/img_2_1767392974963.jpg',
            '/imgs/img_4_1767392983484.jpg',
        ],
        category: 'Biquínis',
        stock: { 'P-Tropical': 5, 'M-Tropical': 3, 'G-Azul Mar': 2 },
        rating: 4.8,
        reviewCount: 120,
    },
    {
        id: '2',
        name: 'Maiô Elegance Preto',
        description: 'Maiô clássico com recortes modernos que valorizam a silhueta com elegância.',
        price: 189.99,
        images: [
            '/imgs/img_5_1767392994092.jpg',
            '/imgs/img_6_1767393009197.jpg',
        ],
        category: 'Maiôs',
        stock: { 'M-Preto': 10, 'G-Preto': 8 },
        rating: 4.9,
        reviewCount: 85,
    },
    {
        id: '3',
        name: 'Saída de Praia Longa',
        description: 'Saída de praia leve e fluida, ideal para compor looks sofisticados pós-praia.',
        price: 129.99,
        images: [
            '/imgs/img_7_1767393013112.jpg',
            '/imgs/img_8_1767393018233.jpg',
        ],
        category: 'Saídas de Praia',
        stock: { 'U-Branco': 15, 'U-Bege': 10 },
        rating: 4.7,
        reviewCount: 64,
    },
    {
        id: '4',
        name: 'Biquíni Cortininha Clássico',
        description: 'O modelo clássico que nunca sai de moda, com ajuste perfeito e conforto.',
        price: 99.99,
        images: [
            '/imgs/img_9_1767393021618.jpg',
            '/imgs/img_10_1767393024963.jpg',
        ],
        category: 'Biquínis',
        stock: { 'P-Vermelho': 8, 'M-Verde': 12 },
        rating: 4.5,
        reviewCount: 210,
    },
    {
        id: '5',
        name: 'Maiô Decote Profundo',
        description: 'Maiô ousado com decote profundo, para quem quer arrasar no verão.',
        price: 199.99,
        images: [
            '/imgs/img_11_1767393031738.jpg',
            '/imgs/img_12_1767393035293.jpg',
        ],
        category: 'Maiôs',
        stock: { 'M-Vinho': 5, 'G-Vinho': 3 },
        rating: 4.6,
        reviewCount: 42,
    },
    {
        id: '6',
        name: 'Canga Estampada Rio',
        description: 'Canga versátil com estampa inspirada nas praias do Rio de Janeiro.',
        price: 79.99,
        images: [
            '/imgs/img_13_1767393038841.jpg',
            '/imgs/IMG_20260102_175800.jpg',
        ],
        category: 'Acessórios',
        stock: { 'U-Estampado': 25 },
        rating: 4.9,
        reviewCount: 150,
    },
];

async function main() {
    console.log('Starting seed...');

    for (const product of mockProducts) {
        // Create stock entries
        const stockEntries = Object.entries(product.stock).map(([key, quantity]) => {
            const [size, ...colorParts] = key.split('-');
            const color = colorParts.join('-'); // handle names with hyphens if any
            return {
                size,
                color,
                quantity: quantity as number,
            };
        });

        await prisma.product.upsert({
            where: { id: product.id },
            update: {
                name: product.name,
                description: product.description,
                price: product.price,
                // Clean up old images and stock
                images: {
                    deleteMany: {},
                    create: product.images.map(url => ({ url })),
                },
                stock: {
                    deleteMany: {},
                    create: stockEntries,
                }
            },
            create: {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                images: {
                    create: product.images.map(url => ({ url })),
                },
                category: product.category,
                rating: product.rating,
                reviewCount: product.reviewCount,
                stock: {
                    create: stockEntries,
                },
            },
        });
        console.log(`Upserted product: ${product.name}`);
    }

    console.log('Seed finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
