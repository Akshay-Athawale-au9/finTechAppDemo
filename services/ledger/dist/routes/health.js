"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.healthRouter = router;
router.get('/', async (req, res) => {
    try {
        const dbResult = await database_1.pool.query('SELECT 1');
        const dbStatus = dbResult.rowCount !== null ? 'OK' : 'ERROR';
        res.json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus
            }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'DOWN',
            timestamp: new Date().toISOString(),
            services: {
                database: 'ERROR'
            },
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=health.js.map