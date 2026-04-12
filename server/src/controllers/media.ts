import { Request, Response } from 'express';

export const uploadMedia = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // multer-s3 attaches 'location' to the file object containing the S3 URL
  const file = req.file as any;

  res.status(201).json({ 
    message: 'Media uploaded successfully',
    url: file.location 
  });
};

export const getMedia = async (req: Request, res: Response) => {
  res.json({ message: 'Get media library' });
};
