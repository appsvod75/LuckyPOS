const prisma = require('../db');
const { getIO } = require('../utils/socket');
const { localDateStr, startOfLocalDay, endOfLocalDay, localDate } = require('../utils/timezone');

const registerExpense = async (req, res) => {
    try {
        let { branchId, description, amount, date } = req.body;
        const userId = req.user.id;
        
        // RBAC: Vendors are locked to their branch
        if (req.user.role === 'Vendedor') {
            branchId = req.user.branch_id;
        }

        if (!branchId || !description || !amount) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const expense = await prisma.expense.create({
            data: {
                branchId: parseInt(branchId),
                userId,
                description,
                amount: parseFloat(amount),
                createdAt: date ? localDate(date, '12') : undefined
            }
        });

        if (getIO()) getIO().emit('EXPENSE_CREATED', expense);
        res.status(201).json({ message: 'Gasto registrado con éxito', expense });
    } catch (error) {
        console.error('Error registering expense:', error);
        res.status(500).json({ message: 'Error al registrar el gasto' });
    }
};

const getDailyExpenses = async (req, res) => {
    try {
        let { branchId, date } = req.query;
        
        // RBAC: Vendors only see their branch
        if (req.user.role === 'Vendedor') {
            branchId = req.user.branch_id;
        }

        const targetDateStr = date || localDateStr();
        const start = startOfLocalDay(targetDateStr);
        const end = endOfLocalDay(targetDateStr);

        const expenses = await prisma.expense.findMany({
            where: {
                branchId: branchId ? parseInt(branchId) : undefined,
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                user: { select: { name: true } },
                branch: { select: { name: true } }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Error al obtener gastos del día' });
    }
};

const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount, date } = req.body;

        if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'No tienes permisos para editar gastos' });
        }

        const expense = await prisma.expense.findUnique({ where: { id: parseInt(id) } });
        if (!expense) return res.status(404).json({ message: 'Gasto no encontrado' });

        const updated = await prisma.expense.update({
            where: { id: parseInt(id) },
            data: {
                description: description ?? expense.description,
                amount: amount !== undefined ? parseFloat(amount) : expense.amount,
                createdAt: date ? localDate(date, '12') : expense.createdAt
            }
        });

        if (getIO()) getIO().emit('EXPENSE_UPDATED', updated);
        res.json({ message: 'Gasto actualizado con éxito', expense: updated });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Error al actualizar el gasto' });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'No tienes permisos para eliminar gastos' });
        }

        const expense = await prisma.expense.findUnique({ where: { id: parseInt(id) } });
        if (!expense) return res.status(404).json({ message: 'Gasto no encontrado' });

        await prisma.expense.delete({ where: { id: parseInt(id) } });

        if (getIO()) getIO().emit('EXPENSE_DELETED', { id: parseInt(id) });
        res.json({ message: 'Gasto eliminado con éxito' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Error al eliminar el gasto' });
    }
};

module.exports = {
    registerExpense,
    getDailyExpenses,
    updateExpense,
    deleteExpense
};
