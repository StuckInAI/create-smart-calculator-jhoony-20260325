import type { NextApiRequest, NextApiResponse } from 'next';
import { evaluate } from 'mathjs';
import { AppDataSource } from '@/lib/database';
import { Calculation } from '@/entities/Calculation';

type ResponseData = {
  result?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { expression } = req.body;

  if (!expression || typeof expression !== 'string') {
    return res.status(400).json({ error: 'Expression is required' });
  }

  try {
    // Safe evaluation using math.js
    const result = evaluate(expression);
    const resultString = result.toString();

    // Store in database
    await AppDataSource.initialize();
    const calculation = new Calculation();
    calculation.expression = expression;
    calculation.result = resultString;
    calculation.timestamp = new Date();
    await AppDataSource.manager.save(calculation);
    await AppDataSource.destroy();

    res.status(200).json({ result: resultString });
  } catch (error: any) {
    console.error('Calculation error:', error);
    res.status(400).json({ 
      error: error.message || 'Invalid mathematical expression' 
    });
  }
}
