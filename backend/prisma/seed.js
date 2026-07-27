require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Start seeding...');

    // Create Branches
    const branch1 = await prisma.branch.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Sucursal Principal',
            address: 'Calle Mayor 123',
            phone: '2222-3333',
            colorHex: '#3b82f6'
        }
    });

    const branch2 = await prisma.branch.upsert({
        where: { id: 2 },
        update: {},
        create: {
            id: 2,
            name: 'Sucursal Norte',
            address: 'Avenida Norte 45',
            phone: '2222-4444',
            colorHex: '#f59e0b'
        }
    });

    // Create Roles
    const superAdminRole = await prisma.role.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Super Admin',
            permissions: JSON.stringify(["pos","summary","inventory","transfers","products","categories","suppliers","clients","receivable","payable","expenses","history","closings","reports","projections","admin","users","branches","settings"])
        }
    });

    const adminRole = await prisma.role.upsert({
        where: { id: 2 },
        update: {},
        create: {
            id: 2,
            name: 'Admin',
            permissions: JSON.stringify(["pos","summary","inventory","transfers","products","categories","suppliers","clients","receivable","payable","expenses","history","closings","reports","projections","admin","users","branches"])
        }
    });

    const vendorRole = await prisma.role.upsert({
        where: { id: 3 },
        update: {},
        create: {
            id: 3,
            name: 'Vendedor',
            permissions: JSON.stringify(["pos","summary","inventory","transfer","products","clients","expenses","history"])
        }
    });

    // Create User (PIN: 020518) - Super Admin
    const pinHash = await bcrypt.hash('020518', 10);
    await prisma.user.upsert({
        where: { id: 1 },
        update: { pinHash: pinHash, roleId: 1 },
        create: {
            id: 1,
            name: 'Admin Lucky',
            pinHash: pinHash,
            roleId: 1,
            branchId: 1
        }
    });

    // Create a regular Admin for testing (PIN: 111111)
    const adminPinHash = await bcrypt.hash('111111', 10);
    await prisma.user.upsert({
        where: { id: 2 },
        update: { pinHash: adminPinHash, roleId: 2 },
        create: {
            id: 2,
            name: 'Admin Sucursal',
            pinHash: adminPinHash,
            roleId: 2,
            branchId: 1
        }
    });

    // Create Default Client (Clientes Varios)
    await prisma.client.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Clientes Varios',
            phone: '',
            isActive: true
        }
    });

    // Create Categories
    const catFarmacia = await prisma.category.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1, name: 'Farmacia', icon: 'Pill' }
    });

    const catAseo = await prisma.category.upsert({
        where: { id: 2 },
        update: {},
        create: { id: 2, name: 'Aseo Personal', icon: 'Shower' }
    });

    const catLibreria = await prisma.category.upsert({
        where: { id: 3 },
        update: {},
        create: { id: 3, name: 'Librería', icon: 'Book' }
    });

    // Create More Categories
    const catBebidas = await prisma.category.upsert({
        where: { id: 4 },
        update: {},
        create: { id: 4, name: 'Bebidas y Snacks', icon: 'Cup' }
    });

    // Create Some Products
    const productsToSeed = [
        {
            id: 1,
            name: 'Amoxicilina 500mg (Caja 50)',
            sku: 'AMX-500',
            basePrice: 15.00,
            isMedicine: true,
            categoryId: 1,
            stock: 20,
            variants: [
                { quantity: 1, price: 0.35 }, // Individual pill
                { quantity: 10, price: 3.25 }  // Blister
            ]
        },
        {
            id: 2,
            name: 'Shampoo Herbal Essences 400ml',
            sku: 'SHM-HE',
            basePrice: 6.50,
            categoryId: 2,
            stock: 15
        },
        {
            id: 3,
            name: 'Cuaderno Scribe 100 Hojas',
            sku: 'CUA-SC',
            basePrice: 2.25,
            categoryId: 3,
            stock: 40,
            variants: [
                { quantity: 12, price: 24.00 }
            ]
        },
        {
            id: 4,
            name: 'Panadol Extra Fuerte',
            sku: 'PAN-EX',
            basePrice: 0.25,
            isMedicine: true,
            categoryId: 1,
            stock: 100,
            variants: [
                { quantity: 48, price: 10.00 }
            ]
        },
        {
            id: 5,
            name: 'Jabón Protex Avena 110g',
            sku: 'JAB-PX',
            basePrice: 1.10,
            categoryId: 2,
            stock: 50
        },
        {
            id: 6,
            name: 'Vitamina C 1000mg (Efervescente)',
            sku: 'VIT-C',
            basePrice: 0.60,
            isMedicine: true,
            categoryId: 1,
            stock: 80,
            variants: [
                { quantity: 10, price: 5.00 }
            ]
        },
        {
            id: 7,
            name: 'Coca Cola 600ml',
            sku: 'COC-600',
            basePrice: 1.25,
            categoryId: 4,
            stock: 24
        },
        {
            id: 8,
            name: 'Electrolit Suero 625ml',
            sku: 'ELE-SU',
            basePrice: 2.50,
            isMedicine: false,
            categoryId: 1,
            stock: 30
        }
    ];

    for (const p of productsToSeed) {
        await prisma.product.upsert({
            where: { id: p.id },
            update: {
                name: p.name,
                sku: p.sku,
                basePrice: p.basePrice,
                isMedicine: p.isMedicine || false,
                categoryId: p.categoryId
            },
            create: {
                id: p.id,
                name: p.name,
                sku: p.sku,
                basePrice: p.basePrice,
                isMedicine: p.isMedicine || false,
                categoryId: p.categoryId,
                inventory: {
                    create: { branchId: 1, stockLevel: p.stock }
                },
                variants: p.variants ? {
                    create: p.variants
                } : undefined
            }
        });
    }

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
