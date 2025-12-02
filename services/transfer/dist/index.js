"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const transfers_1 = require("./routes/transfers");
const health_1 = require("./routes/health");
const webhook_1 = require("./routes/webhook");
const external_1 = require("./routes/external");
const documents_1 = require("./routes/documents");
const transactions_1 = require("./routes/transactions");
const admin_1 = require("./routes/admin");
const redis_1 = require("./config/redis");
const kafka_1 = require("./config/kafka");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
redis_1.redisClient.connect().catch(console.error);
kafka_1.producer.connect().catch(console.error);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/transfer', transfers_1.transfersRouter);
app.use('/health', health_1.healthRouter);
app.use('/webhook', webhook_1.webhookRouter);
app.use('/external', external_1.externalRouter);
app.use('/documents', documents_1.documentsRouter);
app.use('/transactions', transactions_1.transactionsRouter);
app.use('/admin', admin_1.adminRouter);
app.get('/', (req, res) => {
    res.json({ message: 'Transfer Service is running' });
});
app.listen(PORT, () => {
    console.log(`Transfer service running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map