import { Request, Response } from 'express';

export const getAuthors = async (req: Request, res: Response) => {
  res.json({ message: 'Get all authors' });
};

export const getAuthorById = async (req: Request, res: Response) => {
  res.json({ message: `Get author with ID: ${req.params.id}` });
};
