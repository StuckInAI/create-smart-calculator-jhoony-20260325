import type { NextApiRequest, NextApiResponse } from 'next';
import { AppDataSource } from '@/lib/database';
import { Calculation } from '@/entities/Calculation';

type HistoryItem = {
  id: number;
  expression: string;
  result: string;
  timestamp: string;
};

type ResponseData = HistoryItem[] | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    try {
      await AppDataSource.initialize();
      const calculationRepository = AppDataSource.getRepository(Calculation);
      const calculations = await calculationRepository.find({
        order: { timestamp: 'DESC' },
        take: 50,
      });
      await AppDataSource.destroy();

      const history = calculations.map(calc => ({
        id: calc.id,
        expression: calc.expression,
        result: calc.result,
        timestamp: calc.timestamp.toISOString(),
      }));

      res.status(200).json(history);
    } catch (error) {
      console.error('Error fetching history:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await AppDataSource.initialize();
      const calculationRepository = AppDataSource.getRepository(Calculation);
      await calculationRepository.clear();
      await AppDataSource.destroy();
      res.status(200).json([]);
    } catch (error) {
      console.error('Error clearing history:', error);
      res.status(500).json({ error: 'Failed to clear history' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
