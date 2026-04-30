import './env'
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required');
}

export const openai = new OpenAI({ apiKey });

export async function generateEmbedding(text : string) : Promise<number[]>{
  const res = await openai.embeddings.create({
    model : 'text-embedding-3-small',
    input : text.slice(0, 8000),
  })

  return res.data[0].embedding
}