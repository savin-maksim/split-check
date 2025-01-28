import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDTO, LoginDTO } from '../types/auth.types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RegisterDTO = req.body;
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: LoginDTO = req.body;
      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 