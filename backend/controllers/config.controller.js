const prisma = require('../db');
const { getIO } = require('../utils/socket');

const getConfig = async (req, res) => {
    try {
        let config = await prisma.masterConfig.findFirst();
        if (!config) {
            config = await prisma.masterConfig.create({
                data: { id: 1 }
            });
        }
        res.json(config);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener configuración' });
    }
};

const updateConfig = async (req, res) => {
    try {
        if (req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'Acceso denegado: Solo el Super Admin puede modificar la configuración.' });
        }

        let { 
            businessName, address, phone, logoUrl, geminiApiKey, 
            ticketHeader, ticketFooter, isAutoClosingEnabled, 
            autoClosingTime, sidebarConfig, adminPin,
            emailWebhookUrl, enableEmailTickets, ticketWidth, enableQrCode
        } = req.body;

        if (isAutoClosingEnabled === false) {
            autoClosingTime = ''; // Empty string means disabled
        }

        const dataToUpdate = { 
            businessName, address, phone, logoUrl, geminiApiKey, 
            ticketHeader, ticketFooter, autoClosingTime, sidebarConfig,
            adminPin, emailWebhookUrl, enableEmailTickets, ticketWidth, enableQrCode
        };

        const config = await prisma.masterConfig.upsert({
            where: { id: 1 },
            update: dataToUpdate,
            create: { id: 1, ...dataToUpdate }
        });

        // Whenever config is saved, try to reschedule the cron job
        const cronService = require('../services/cron.service');
        if (cronService && cronService.scheduleClosingJob) {
            cronService.scheduleClosingJob();
        }

        if (getIO()) getIO().emit('CONFIG_UPDATED', config);
        res.json(config);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar configuración' });
    }
};

module.exports = { getConfig, updateConfig };
