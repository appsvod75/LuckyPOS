const prisma = require('../db');

const SUPER_ADMIN_PIN = "020518";

const resetSales = async (req, res) => {
    const { pin } = req.body;

    if (req.user.id !== 1 || pin !== SUPER_ADMIN_PIN) {
        return res.status(403).json({ message: 'Acceso denegado: Requiere privilegios de Super Admin (ID 1) y PIN correcto.' });
    }

    try {
        await prisma.$transaction([
            prisma.paymentApplication.deleteMany(),
            prisma.clientPayment.deleteMany(),
            prisma.saleD.deleteMany(),
            prisma.saleH.deleteMany(),
            prisma.cashClosing.deleteMany(),
            prisma.expense.deleteMany()
        ]);

        res.json({ message: 'Datos de ventas y financieros eliminados correctamente' });
    } catch (error) {
        console.error('Error in resetSales:', error);
        res.status(500).json({ message: 'Error al eliminar datos de ventas' });
    }
};

const resetInventory = async (req, res) => {
    const { pin } = req.body;

    if (req.user.id !== 1 || pin !== SUPER_ADMIN_PIN) {
        return res.status(403).json({ message: 'Acceso denegado: Requiere privilegios de Super Admin (ID 1) y PIN correcto.' });
    }

    try {
        await prisma.$transaction([
            prisma.inventory.updateMany({
                data: { stockLevel: 0 }
            }),
            prisma.inventoryLot.deleteMany()
        ]);

        res.json({ message: 'Stock de inventario reiniciado a cero' });
    } catch (error) {
        console.error('Error in resetInventory:', error);
        res.status(500).json({ message: 'Error al reiniciar inventario' });
    }
};

const resetProducts = async (req, res) => {
    const { pin } = req.body;

    if (req.user.id !== 1 || pin !== SUPER_ADMIN_PIN) {
        return res.status(403).json({ message: 'Acceso denegado: Requiere privilegios de Super Admin (ID 1) y PIN correcto.' });
    }

    try {
        await prisma.$transaction([
            // Order is important to avoid FK constraints
            prisma.aiCache.deleteMany(),
            prisma.productVariant.deleteMany(),
            prisma.productProvider.deleteMany(),
            prisma.inventoryLot.deleteMany(),
            prisma.inventory.deleteMany(),
            prisma.saleD.deleteMany(),
            prisma.purchaseD.deleteMany(),
            prisma.transferDetail.deleteMany(),
            prisma.product.deleteMany()
            // Category table is preserved as requested
        ]);

        res.json({ message: 'Todos los productos y sus datos asociados han sido eliminados correctamente' });
    } catch (error) {
        console.error('Error in resetProducts:', error);
        res.status(500).json({ message: 'Error al eliminar productos' });
    }
};

module.exports = {
    resetSales,
    resetInventory,
    resetProducts
};
