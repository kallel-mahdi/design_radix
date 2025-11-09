import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/bibliography',
  uploadPath: process.env.UPLOAD_PATH || './data/uploads',
  crossrefApiUrl: process.env.CROSSREF_API_URL || 'https://api.crossref.org',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  trustGatewayAuth: process.env.TRUST_GATEWAY_AUTH === 'true',
};
