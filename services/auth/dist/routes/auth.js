"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.authRouter = router;
router.post('/register', async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { email, password, roles = ['user'] } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await client.query('BEGIN');
        const userResult = await client.query('INSERT INTO users (email, password_hash, roles) VALUES ($1, $2, $3) RETURNING id, email, roles', [email, hashedPassword, roles]);
        const user = userResult.rows[0];
        const userId = user.id;
        const accountNumber = `ACC${String(userId).padStart(3, '0')}${Math.floor(Math.random() * 1000)}`;
        const accountResult = await client.query(`INSERT INTO accounts (user_id, account_number, account_type, balance, currency) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, account_number, account_type, balance, currency, status, created_at`, [userId, accountNumber, 'checking', 0.00, 'USD']);
        const account = accountResult.rows[0];
        await client.query('COMMIT');
        return res.status(201).json({
            user,
            account
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        client.release();
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const result = await database_1.pool.query('SELECT id, email, password_hash, roles FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
        const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN ?
            parseInt(process.env.JWT_EXPIRES_IN) : 3600;
        const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN ?
            parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) : 86400;
        const accessToken = jwt.sign({ userId: user.id, email: user.email, roles: user.roles }, jwtSecret, { expiresIn: accessTokenExpiresIn });
        const refreshToken = jwt.sign({ userId: user.id, email: user.email }, refreshTokenSecret, { expiresIn: refreshTokenExpiresIn });
        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                roles: user.roles
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/refresh', (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
        const decoded = jwt.verify(refreshToken, refreshTokenSecret);
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const newAccessTokenExpiresIn = process.env.JWT_EXPIRES_IN ?
            parseInt(process.env.JWT_EXPIRES_IN) : 3600;
        const newAccessToken = jwt.sign({ userId: decoded.userId, email: decoded.email }, jwtSecret, { expiresIn: newAccessTokenExpiresIn });
        return res.json({ accessToken: newAccessToken });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
});
//# sourceMappingURL=auth.js.map