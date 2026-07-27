const prisma = require('../db');
const { getIO } = require('../utils/socket');

const getAllRoles = async (req, res) => {
    try {
        if (req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'Solo Super Admin puede gestionar roles' });
        }
        const roles = await prisma.role.findMany({
            include: { _count: { select: { users: true } } }
        });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener roles' });
    }
};

const updateRole = async (req, res) => {
    try {
        if (req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'Solo Super Admin puede modificar roles' });
        }
        const { id } = req.params;
        const { name, permissions } = req.body;

        const role = await prisma.role.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(permissions !== undefined && { permissions: JSON.stringify(permissions) })
            }
        });

        if (getIO()) getIO().emit('ROLE_UPDATED', { roleId: role.id, name: role.name });

        res.json({
            ...role,
            permissions: role.permissions ? JSON.parse(role.permissions) : []
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar rol' });
    }
};

module.exports = { getAllRoles, updateRole };