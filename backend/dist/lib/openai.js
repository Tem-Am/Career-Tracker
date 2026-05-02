"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
exports.generateEmbedding = generateEmbedding;
require("./env");
const openai_1 = __importDefault(require("openai"));
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
}
exports.openai = new openai_1.default({ apiKey });
async function generateEmbedding(text) {
    const res = await exports.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
    });
    return res.data[0].embedding;
}
