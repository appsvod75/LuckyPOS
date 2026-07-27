const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

const ensureBackupDir = () => {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
};

const createBackup = async () => {
    return new Promise((resolve, reject) => {
        ensureBackupDir();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `luckypos_backup_${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);

        const host = process.env.DB_HOST || 'localhost';
        const user = process.env.DB_USER || 'root';
        const pass = process.env.DB_PASS || '';
        const database = process.env.DB_NAME || 'luckypos';

        const cmd = `mysqldump -h ${host} -u ${user}${pass ? ' -p' + pass : ''} ${database} > ${filepath}`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error('Backup error:', error);
                reject(new Error('Error al crear backup: ' + error.message));
                return;
            }

            const stats = fs.statSync(filepath);
            console.log(`Backup creado: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

            resolve({
                filename,
                filepath,
                size: stats.size,
                createdAt: new Date().toISOString()
            });
        });
    });
};

const listBackups = async () => {
    ensureBackupDir();
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.sql'))
        .map(f => {
            const filepath = path.join(BACKUP_DIR, f);
            const stats = fs.statSync(filepath);
            return {
                filename: f,
                size: stats.size,
                createdAt: stats.birthtime.toISOString()
            };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return files;
};

const deleteBackup = async (filename) => {
    const filepath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filepath)) {
        throw new Error('Backup no encontrado');
    }
    fs.unlinkSync(filepath);
    return { message: 'Backup eliminado' };
};

module.exports = { createBackup, listBackups, deleteBackup };