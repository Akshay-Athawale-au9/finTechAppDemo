"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const ledger_1 = require("./routes/ledger");
const health_1 = require("./routes/health");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3004;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/ledger', ledger_1.ledgerRouter);
app.use('/health', health_1.healthRouter);
app.get('/', (req, res) => {
    res.json({ message: 'Ledger Service is running' });
});
app.listen(PORT, () => {
    console.log(`Ledger service running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map