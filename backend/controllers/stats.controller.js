const prisma = require('../db');
const { localDateStr, startOfLocalDay, endOfLocalDay, localDate } = require('../utils/timezone');

const getDashboardStats = async (req, res) => {
    try {
        const { branchId, date } = req.query;
        const targetDateStr = date || localDateStr();
        const start = startOfLocalDay(targetDateStr);
        const end = endOfLocalDay(targetDateStr);

        const whereClause = {
            createdAt: {
                gte: start,
                lte: end
            }
        };

        if (req.user.role === 'Vendedor') {
            whereClause.branchId = req.user.branch_id;
        } else if (branchId) {
            whereClause.branchId = parseInt(branchId);
        }

        // 1. Get Sales
        const sales = await prisma.saleH.findMany({
            where: whereClause,
            include: {
                branch: { select: { name: true } }
            }
        });

        const totalAmount = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
        const totalCount = sales.length;

        // Group by branch for cards details
        const branchesStats = {};
        sales.forEach(s => {
            const bName = s.branch?.name || 'Desconocida';
            if (!branchesStats[bName]) {
                branchesStats[bName] = { amount: 0, count: 0 };
            }
            branchesStats[bName].amount += Number(s.total || 0);
            branchesStats[bName].count += 1;
        });

        // 2. Low Stock Products (Global)
        const lowStockCount = await prisma.inventory.count({
            where: {
                stockLevel: { lte: prisma.inventory.fields.minStock }
            }
        });

        const lowStockItems = await prisma.inventory.findMany({
            where: {
                stockLevel: { lte: prisma.inventory.fields.minStock },
                product: { isActive: true, isService: false }
            },
            include: {
                product: { select: { name: true } },
                branch: { select: { name: true } }
            },
            orderBy: { stockLevel: 'asc' },
            take: 10
        });

        // 3. New Clients Today
        const newClientsCount = await prisma.client.count({
            where: {
                createdAt: { gte: start, lte: end }
            }
        });

        // 4. Total Expenses Today
        const expenses = await prisma.expense.findMany({
            where: whereClause,
            select: { amount: true }
        });
        const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

        res.json({
            sales: {
                totalAmount,
                totalCount,
                branches: branchesStats
            },
            totalExpenses,
            lowStockCount,
            newClientsCount,
            lowStockItems: lowStockItems.map(i => ({
                productId: i.productId,
                productName: i.product.name,
                branchName: i.branch.name,
                stockLevel: i.stockLevel,
                minStock: i.minStock
            }))
        });

    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' });
    }
};

const getReports = async (req, res) => {
    try {
        const { startDate, endDate, branchId } = req.query;
        
        const start = startDate ? startOfLocalDay(startDate) : startOfLocalDay();
        const end = endDate ? endOfLocalDay(endDate) : endOfLocalDay();
        
        const user_role = req.user.role;
        const user_branch_id = req.user.branch_id;

        const whereClause = {
            createdAt: {
                gte: start,
                lte: end
            }
        };

        if (user_role === 'Vendedor') {
            whereClause.branchId = user_branch_id;
        } else if (branchId) {
            whereClause.branchId = parseInt(branchId);
        }

        // 1. Sales & Expenses Totals
        const sales = await prisma.saleH.findMany({
            where: whereClause,
            select: { total: true, discount: true, paymentMethod: true, balance: true, createdAt: true }
        });

        const expenses = await prisma.expense.findMany({
            where: whereClause,
            select: { amount: true }
        });

        const totalSales = sales.reduce((acc, s) => acc + Number(s.total), 0);
        const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

        // 2. Top Clients Logic (Multi-metric)
        // We aggregate sales by clientId, excluding ID 1 (Clientes Varios)
        const clientStats = await prisma.saleH.groupBy({
            by: ['clientId'],
            where: {
                ...whereClause,
                clientId: { not: 1 }
            },
            _sum: {
                total: true,
                balance: true
            },
            _count: {
                id: true
            },
            orderBy: {
                _sum: {
                    total: 'desc'
                }
            },
            take: 20
        });

        // Get client names and current total debt (not just period debt)
        const topClients = await Promise.all(clientStats.map(async (stat) => {
            const client = await prisma.client.findUnique({
                where: { id: stat.clientId },
                select: { name: true }
            });

            // Calculate current TOTAL debt (all time)
            const allTimeSales = await prisma.saleH.findMany({
                where: { clientId: stat.clientId },
                select: { balance: true }
            });
            const totalCurrentDebt = allTimeSales.reduce((acc, s) => acc + Number(s.balance), 0);

            return {
                id: stat.clientId,
                name: client?.name || 'Cliente ELIMINADO',
                consumption: stat._sum.total || 0,
                visits: stat._count.id || 0,
                periodDebt: stat._sum.balance || 0,
                totalCurrentDebt: totalCurrentDebt
            };
        }));

        // 3. Top Products
        const saleDetails = await prisma.saleD.findMany({
            where: {
                saleH: whereClause
            },
            include: {
                product: { select: { name: true } }
            }
        });

        const productMap = {};
        saleDetails.forEach(d => {
            const pid = d.productId;
            if (!productMap[pid]) {
                productMap[pid] = { name: d.product.name, quantity: 0, revenue: 0 };
            }
            productMap[pid].quantity += d.quantity;
            productMap[pid].revenue += Number(d.subtotal);
        });

        const topProducts = Object.values(productMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 15);

        // 4. Payment Methods Breakdown
        const paymentMethods = sales.reduce((acc, s) => {
            acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + Number(s.total);
            return acc;
        }, {});

        // 5. Sales Trend (by day)
        const trend = sales.reduce((acc, s) => {
            const date = s.createdAt.toISOString().split('T')[0];
            if (!acc[date]) acc[date] = 0;
            acc[date] += Number(s.total);
            return acc;
        }, {});

        const salesTrend = Object.entries(trend).map(([date, amount]) => ({ date, amount }));

        // 6. Sales by User
        const userStats = await prisma.saleH.groupBy({
            by: ['userId'],
            where: whereClause,
            _sum: { total: true },
            _count: { id: true },
            orderBy: { _sum: { total: 'desc' } }
        });

        const salesByUser = await Promise.all(userStats.map(async (stat) => {
            try {
                if (!stat.userId) {
                    return {
                        id: 'system',
                        name: 'Sistema / Varios',
                        role: '-',
                        total: Number(stat._sum.total || 0),
                        count: stat._count.id || 0
                    };
                }
                const user = await prisma.user.findUnique({
                    where: { id: stat.userId },
                    select: { name: true, role: true }
                });
                return {
                    id: stat.userId,
                    name: user?.name || 'Usuario ELIMINADO',
                    role: user?.role || '-',
                    total: Number(stat._sum.total || 0),
                    count: stat._count.id || 0
                };
            } catch (uErr) {
                console.error(`Error fetching user ${stat.userId} for report:`, uErr);
                return {
                    id: stat.userId || `err-${Math.random()}`,
                    name: 'Error de Datos',
                    role: '-',
                    total: Number(stat._sum.total || 0),
                    count: stat._count.id || 0
                };
            }
        }));

        // 7. Branch Performance
        const branchStats = await prisma.saleH.groupBy({
            by: ['branchId'],
            where: whereClause,
            _sum: { total: true },
            _count: { id: true },
            orderBy: { _sum: { total: 'desc' } }
        });

        const branchPerformance = await Promise.all(branchStats.map(async (stat) => {
            const branch = await prisma.branch.findUnique({
                where: { id: stat.branchId },
                select: { name: true }
            });
            return {
                id: stat.branchId,
                name: branch?.name || 'Sucursal ELIMINADA',
                total: Number(stat._sum.total || 0),
                count: stat._count.id || 0
            };
        }));

        res.json({
            summary: {
                totalSales,
                totalExpenses,
                netAmount: totalSales - totalExpenses,
                salesCount: sales.length
            },
            topClients,
            topProducts,
            paymentMethods,
            salesTrend,
            salesByUser,
            branchPerformance
        });

    } catch (error) {
        console.error('CRITICAL REPORT ERROR:', error);
        res.status(500).json({ 
            message: 'Error al generar reportes', 
            details: error.message,
            stack: error.stack
        });
    }
};

const getProfits = async (req, res) => {
    try {
        const { startDate, endDate, branchId } = req.query;

        const start = startDate ? startOfLocalDay(startDate) : startOfLocalDay();
        start.setDate(start.getDate() - 30);
        const end = endDate ? endOfLocalDay(endDate) : endOfLocalDay();

        const whereClause = {
            createdAt: { gte: start, lte: end }
        };
        if (req.user.role === 'Vendedor') {
            whereClause.branchId = req.user.branch_id;
        } else if (branchId) {
            whereClause.branchId = parseInt(branchId);
        }

        const sales = await prisma.saleH.findMany({
            where: whereClause,
            include: {
                details: {
                    include: { product: { select: { name: true, averageCost: true } } }
                },
                branch: { select: { name: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        let totalRevenue = 0;
        let totalCost = 0;
        const productMap = {};
        const dayMap = {};

        for (const sale of sales) {
            const day = sale.createdAt.toISOString().split('T')[0];
            if (!dayMap[day]) dayMap[day] = { revenue: 0, cost: 0, count: 0 };

            for (const detail of sale.details) {
                const revenue = Number(detail.subtotal);
                const cost = Number(detail.product?.averageCost || 0) * detail.quantity;
                const profit = revenue - cost;

                totalRevenue += revenue;
                totalCost += cost;
                dayMap[day].revenue += revenue;
                dayMap[day].cost += cost;
                dayMap[day].count += 1;

                const pid = detail.productId;
                if (!productMap[pid]) {
                    productMap[pid] = {
                        productId: pid,
                        name: detail.product?.name || 'Producto eliminado',
                        quantity: 0,
                        revenue: 0,
                        cost: 0
                    };
                }
                productMap[pid].quantity += detail.quantity;
                productMap[pid].revenue += revenue;
                productMap[pid].cost += cost;
            }
        }

        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        const byProduct = Object.values(productMap)
            .map(p => ({ ...p, profit: p.revenue - p.cost, margin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue) * 100 : 0 }))
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 30);

        const byDay = Object.entries(dayMap)
            .map(([date, data]) => ({ date, ...data, profit: data.revenue - data.cost }))
            .sort((a, b) => a.date.localeCompare(b.date));

        res.json({
            summary: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalCost: Math.round(totalCost * 100) / 100,
                totalProfit: Math.round(totalProfit * 100) / 100,
                profitMargin: Math.round(profitMargin * 100) / 100,
                salesCount: sales.length
            },
            byProduct,
            byDay
        });
    } catch (error) {
        console.error('Error in getProfits:', error);
        res.status(500).json({ message: 'Error al calcular ganancias', details: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getReports,
    getProfits
};
