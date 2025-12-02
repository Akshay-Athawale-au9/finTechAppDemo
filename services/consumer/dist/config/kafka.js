"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumer = exports.kafka = void 0;
const kafkajs_1 = require("kafkajs");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const kafka = new kafkajs_1.Kafka({
    clientId: 'consumer-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});
exports.kafka = kafka;
const consumer = kafka.consumer({ groupId: 'ledger-events-group' });
exports.consumer = consumer;
//# sourceMappingURL=kafka.js.map