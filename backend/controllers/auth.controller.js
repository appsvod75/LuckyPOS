const prisma = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../utils/audit');
const { getIO } = require('../utils/socket');

const getUsers = async (req, res) => {
    try {
        const isSuperAdmin = req.user.role === 'Super Admin';
        const users = await prisma.user.findMany({
            where: isSuperAdmin ? {} : {
                role: {
                    name: { not: 'Super Admin' }
                }
            },
            include: { role: true, branch: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, pin, roleId, branchId } = req.body;
        const pinHash = await bcrypt.hash(pin, 10);
        const user = await prisma.user.create({
            data: { name, pinHash, roleId: parseInt(roleId), branchId: parseInt(branchId) },
            include: { role: true }
        });

        await logAudit(req.user.id, 'CREATE_USER', { 
            createdUserId: user.id, 
            createdUserName: user.name,
            role: user.role.name 
        }, req.user.branch_id);

        if (getIO()) getIO().emit('USER_CREATED', { userId: user.id, name: user.name });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, pin, roleId, branchId, isActive } = req.body;
        
        // Block non-SuperAdmin from updating SuperAdmin
        if (req.user.role !== 'Super Admin') {
            const targetUser = await prisma.user.findUnique({
                where: { id: parseInt(id) },
                include: { role: true }
            });
            if (targetUser && targetUser.role.name === 'Super Admin') {
                return res.status(403).json({ message: 'No tienes permiso para modificar a este usuario' });
            }
        }

        const data = { name, roleId: parseInt(roleId), branchId: parseInt(branchId), isActive: !!isActive };
        if (pin) {
            data.pinHash = await bcrypt.hash(pin, 10);
        }
        
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data,
            include: { role: true }
        });

        await logAudit(req.user.id, 'UPDATE_USER', { 
            updatedUserId: user.id, 
            updatedUserName: user.name,
            isActive: user.isActive,
            role: user.role.name
        }, req.user.branch_id);

        if (getIO()) getIO().emit('USER_UPDATED', { userId: user.id, name: user.name });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

const login = async (req, res) => {
    const { pin } = req.body;
    const ip = req.ip;

    if (!/^\d{6}$/.test(pin)) {
        return res.status(400).json({ message: 'El PIN debe ser de 6 dígitos numéricos' });
    }

    try {
        const oneMinAgo = new Date(Date.now() - 60000);
        const failedOnIpCount = await prisma.auditLog.count({
            where: {
                ipAddress: ip,
                action: 'LOGIN_FAILURE',
                timestamp: { gte: oneMinAgo }
            }
        });

        if (failedOnIpCount >= 3) {
            return res.status(423).json({ message: 'Demasiados intentos. Bloqueado por 1 minuto.' });
        }

        const users = await prisma.user.findMany({
            where: {
                isActive: true
            },
            include: { role: true, branch: true }
        });

        let authenticatedUser = null;
        for (const user of users) {
            if (await bcrypt.compare(pin, user.pinHash)) {
                authenticatedUser = user;
                break;
            }
        }

        if (!authenticatedUser) {
            await logAudit(null, 'LOGIN_FAILURE', { note: 'PIN incorrecto' }, null, ip);
            return res.status(401).json({ message: 'PIN incorrecto o usuario inactivo' });
        }

        const token = jwt.sign(
            {
                id: authenticatedUser.id,
                role: authenticatedUser.role.name,
                branch_id: authenticatedUser.branchId
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await logAudit(
            authenticatedUser.id,
            'LOGIN_SUCCESS',
            { name: authenticatedUser.name, role: authenticatedUser.role.name },
            authenticatedUser.branchId,
            ip
        );

        if (getIO()) getIO().emit('LOGIN_SUCCESS', { userId: authenticatedUser.id, name: authenticatedUser.name });

        const permissions = authenticatedUser.role?.permissions
            ? (() => {
                const parsed = typeof authenticatedUser.role.permissions === 'string'
                    ? JSON.parse(authenticatedUser.role.permissions)
                    : authenticatedUser.role.permissions;
                return Array.isArray(parsed) ? parsed : [];
            })()
            : [];

        res.json({
            token,
            user: {
                id: authenticatedUser.id,
                name: authenticatedUser.name,
                role: authenticatedUser.role.name,
                branch_id: authenticatedUser.branchId,
                branch_name: authenticatedUser.branch?.name,
                color_hex: authenticatedUser.branch?.colorHex,
                permissions
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const verifyPin = async (req, res) => {
    const { pin } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { role: true }
        });

        if (!user || !(await bcrypt.compare(pin, user.pinHash))) {
            return res.status(401).json({ message: 'PIN de confirmación incorrecto' });
        }

        // Restrict to Admin or Super Admin
        if (user.role.name !== 'Admin' && user.role.name !== 'Super Admin') {
            return res.status(403).json({ message: 'No tienes permisos de administrador' });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar PIN' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== 'Super Admin') {
        return res.status(403).json({ message: 'Solo Super Admin puede eliminar usuarios' });
    }
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
    }
    try {
        await prisma.$transaction(async (tx) => {
            await tx.auditLog.updateMany({ where: { userId: parseInt(id) }, data: { userId: null } });
            await tx.clientPayment.updateMany({ where: { userId: parseInt(id) }, data: { userId: 1 } });
            await tx.saleH.updateMany({ where: { userId: parseInt(id) }, data: { userId: 1 } });
            await tx.purchaseH.updateMany({ where: { userId: parseInt(id) }, data: { userId: 1 } });
            await tx.expense.updateMany({ where: { userId: parseInt(id) }, data: { userId: 1 } });
            await tx.transfer.updateMany({ where: { userId: parseInt(id) }, data: { userId: 1 } });
            await tx.user.delete({ where: { id: parseInt(id) } });
        });
        if (getIO()) getIO().emit('USER_DELETED', { userId: parseInt(id) });
        res.json({ message: 'Usuario eliminado permanentemente' });
    } catch (error) {
        if (error.code === 'P2003') {
            await prisma.user.update({
                where: { id: parseInt(id) },
                data: { isActive: false }
            });
            return res.json({ message: 'El usuario tiene registros asociados. Se ha desactivado en lugar de eliminar.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

module.exports = { login, getUsers, createUser, updateUser, verifyPin, deleteUser };
