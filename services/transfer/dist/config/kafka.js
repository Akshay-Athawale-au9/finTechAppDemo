"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.producer = exports.kafka = void 0;
const kafkajs_1 = require("kafkajs");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const kafka = new kafkajs_1.Kafka({
    clientId: 'transfer-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});
exports.kafka = kafka;
const producer = kafka.producer();
exports.producer = producer;
//# sourceMappingURL=kafka.js.map