"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const auth_1 = require("./routes/auth");
const health_1 = require("./routes/health");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(helmet.default());
app.use(cors());
app.use(express.json());
app.use('/auth', auth_1.authRouter);
app.use('/health', health_1.healthRouter);
app.get('/', (req, res) => {
    res.json({ message: 'Auth Service is running' });
});
app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map