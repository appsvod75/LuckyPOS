const prisma = require('../db');
const { getIO } = require('../utils/socket');

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
        if (getIO()) getIO().emit('PROVIDER_CREATED', provider);
        res.json(provider);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear proveedor' });
    }
};

const updateProvider = async (req, res) => {
    const { id } = req.params;
    const { name, vendor, phone, email, address } = req.body;
    try {
        const provider = await prisma.provider.findUnique({ where: { id: parseInt(id) } });
        if (!provider) return res.status(404).json({ message: 'Proveedor no encontrado' });

        const updated = await prisma.provider.update({
            where: { id: parseInt(id) },
            data: {
                name: name ?? provider.name,
                vendor: vendor ?? provider.vendor,
                phone: phone ?? provider.phone,
                email: email ?? provider.email,
                address: address ?? provider.address
            }
        });
        if (getIO()) getIO().emit('PROVIDER_UPDATED', updated);
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar proveedor' });
    }
};

const deleteProvider = async (req, res) => {
    const { id } = req.params;
    try {
        const provider = await prisma.provider.findUnique({ where: { id: parseInt(id) } });
        if (!provider) return res.status(404).json({ message: 'Proveedor no encontrado' });

        await prisma.provider.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
        if (getIO()) getIO().emit('PROVIDER_DELETED', { id: parseInt(id) });
        res.json({ message: 'Proveedor desactivado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al desactivar proveedor' });
    }
};

module.exports = { getAllProviders, createProvider, updateProvider, deleteProvider };
