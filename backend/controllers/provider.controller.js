const prisma = require('../db');

const getAllProviders = async (req, res) => {
    try {
        const providers = await prisma.provider.findMany({
            where: { isActive: true }
        });
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedores' });
    }
};

const createProvider = async (req, res) => {
    const { name, vendor, phone, email, address } = req.body;
    try {
        const provider = await prisma.provider.create({
            data: { name, vendor, phone, email, address }
        });
        res.json(provider);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear proveedor' });
    }
};

module.exports = { getAllProviders, createProvider };
