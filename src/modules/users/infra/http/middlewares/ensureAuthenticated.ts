import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '@config/auth';
import AppError from '@shared/errors/AppError';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  // Validar o JWT Token
  const authHeader = request.headers.authorization;

  // Se não vier token no header, lança um erro
  if (!authHeader) {
    throw new AppError('JWT Token is missing!', 401);
  }

  // Splitar o token pois ele vem com a palavra Bearer e um espaço antes
  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret);

    const { sub } = decoded as TokenPayload;

    request.user = {
      id: sub,
    };

    return next();
  } catch {
    throw new AppError('Invalid JWT Token!', 401);
  }
}
