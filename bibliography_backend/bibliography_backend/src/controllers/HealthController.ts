import { Request, Response } from 'express';
import { injectable } from 'inversify';
import mongoose from 'mongoose';

@injectable()
export class HealthController {
  async check(req: Request, res: Response): Promise<void> {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'bibliography-service',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };

    const statusCode = health.mongodb === 'connected' ? 200 : 503;

    res.status(statusCode).json(health);
  }
}
