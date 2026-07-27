const backupService = require('../services/backup.service');
const { getIO } = require('../utils/socket');

const runBackup = async (req, res) => {
    try {
        if (req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'Solo Super Admin puede ejecutar backups' });
        }

        const result = await backupService.createBackup();
        if (getIO()) getIO().emit('BACKUP_CREATED', { filename: result.filename });
        res.json({ message: 'Backup creado exitosamente', backup: result });
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ message: error.message || 'Error al crear backup' });
    }
};

const getBackups = async (req, res) => {
    try {
        const backups = await backupService.listBackups();
        res.json(backups);
    } catch (error) {
        res.status(500).json({ message: 'Error al listar backups' });
    }
};

const deleteBackup = async (req, res) => {
    try {
        if (req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'Solo Super Admin puede eliminar backups' });
        }
        const { filename } = req.params;
        await backupService.deleteBackup(filename);
        if (getIO()) getIO().emit('BACKUP_DELETED', { filename });
        res.json({ message: 'Backup eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error al eliminar backup' });
    }
};

const downloadBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = require('path').join(__dirname, '..', 'backups', filename);
        if (!require('fs').existsSync(filepath)) {
            return res.status(404).json({ message: 'Backup no encontrado' });
        }
        res.download(filepath);
    } catch (error) {
        res.status(500).json({ message: 'Error al descargar backup' });
    }
};

module.exports = { runBackup, getBackups, deleteBackup, downloadBackup };