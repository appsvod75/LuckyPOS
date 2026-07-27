require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { initSocket } = require('./utils/socket');
const { scheduleClosingJob } = require('./services/cron.service');

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:4000', 'http://localhost:5173'];

initSocket(server);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS not allowed'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/products', require('./routes/product.routes.js'));
app.use('/api/inventory', require('./routes/inventory.routes.js'));
app.use('/api/sales', require('./routes/sale.routes.js'));
app.use('/api/ai', require('./routes/ai.routes.js'));
app.use('/api/branches', require('./routes/branch.routes.js'));
app.use('/api/clients', require('./routes/client.routes.js'));
app.use('/api/providers', require('./routes/provider.routes.js'));
app.use('/api/purchases', require('./routes/purchase.routes.js'));
app.use('/api/audit', require('./routes/audit.routes.js'));
app.use('/api/config', require('./routes/config.routes.js'));
app.use('/api/stats', require('./routes/stats.routes.js'));
app.use('/api/expenses', require('./routes/expense.routes.js'));
app.use('/api/closings', require('./routes/closing.routes.js'));
app.use('/api/projections', require('./routes/projection.routes.js'));
app.use('/api/backups', require('./routes/backup.routes.js'));
app.use('/api/roles', require('./routes/role.routes.js'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const { seedDefaultClient } = require('./services/dbSeed.service');

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`LuckyPOS Backend running on http://0.0.0.0:${PORT}`);
    // Start seeds and jobs
    await seedDefaultClient();
    await scheduleClosingJob();
});


