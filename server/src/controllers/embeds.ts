import { Request, Response } from 'express';

export const getEmbeds = async (req: Request, res: Response) => {
  res.json({ message: 'Get embeds data' });
};

export const createEmbed = async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Create embed snippet' });
};
