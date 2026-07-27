const prisma = require('../db');
const { getIO } = require('../utils/socket');

const getClients = async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(clients);
    } catch (error) {
        console.error('--- GET CLIENTS ERROR ---');
        console.error(error);
        res.status(500).json({ message: 'Error retrieving clients' });
    }
};

const createClient = async (req, res) => {
    const { name, documentId, phone, email, address, isActive } = req.body;
    console.log('--- CREATE CLIENT ATTEMPT ---');
    console.log('Payload:', req.body);
    try {
        const newClient = await prisma.client.create({
            data: {
                name,
                documentId: documentId || null,
                phone: phone || null,
                email: email || null,
                address: address || null,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        console.log('--- CREATE CLIENT SUCCESS ---');
        if (getIO()) getIO().emit('CLIENT_CREATED', newClient);
        res.status(201).json({ message: 'Client created successfully', data: newClient });
    } catch (error) {
        console.error('--- CREATE CLIENT ERROR ---');
        console.error(error);
        res.status(500).json({ message: 'Error creating client', error: error.message });
    }
};

const updateClient = async (req, res) => {
    const { id } = req.params;
    const { name, documentId, phone, email, address, isActive } = req.body;
    try {
        const updatedClient = await prisma.client.update({
            where: { id: parseInt(id) },
            data: {
                name,
                documentId: documentId || null,
                phone: phone || null,
                email: email || null,
                address: address || null,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        if (getIO()) getIO().emit('CLIENT_UPDATED', updatedClient);
        res.json({ message: 'Client updated successfully', data: updatedClient });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Error updating client', error: error.message });
    }
};

const getClientStatement = async (req, res) => {
    const { id } = req.params;
    try {
        const clientId = parseInt(id);

        const client = await prisma.client.findUnique({
            where: { id: clientId }
        });

        if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

        const sales = await prisma.saleH.findMany({
            where: { clientId: clientId },
            include: {
                branch: { select: { name: true } },
                details: { include: { product: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const payments = await prisma.clientPayment.findMany({
            where: { clientId: clientId },
            include: {
                user: { select: { name: true } },
                applications: {
                    include: { sale: { select: { id: true, createdAt: true, total: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const totalDebt = sales.reduce((sum, sale) => sum + Number(sale.balance), 0);
        const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const totalHistoricallySold = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

        res.json({
            client,
            summary: {
                totalDebt,
                totalPaid,
                totalHistoricallySold,
                pendingInvoices: sales.filter(s => Number(s.balance) > 0).length
            },
            history: {
                sales,
                payments
            }
        });

    } catch (error) {
        console.error('Error fetching client statement:', error);
        res.status(500).json({ message: 'Error al obtener estado de cuenta' });
    }
};

module.exports = {
    getClients,
    createClient,
    updateClient,
    getClientStatement
};
