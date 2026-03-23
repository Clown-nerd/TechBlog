import { Request, Response } from 'express';

export const uploadMedia = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(201).json({ 
    message: 'Media uploaded successfully',
    url: `/uploads/${req.file.filename}` 
  });
};

export const getMedia = async (req: Request, res: Response) => {
  res.json({ message: 'Get media library' });
};
