import { Request, Response } from 'express';
import AuthenticateUserService from '@modules/users/services/AuthentitcateUserService';
import { container } from 'tsyringe';

export default class SessionsController {
  async create(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;

    const authenticateUser = container.resolve(AuthenticateUserService);

    const { user, token } = await authenticateUser.execute({ email, password });

    delete user.password;

    return response.json({ user, token });
  }
}
