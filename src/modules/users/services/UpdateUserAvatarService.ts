import path from 'path';
import fs from 'fs';
import uploadConfig from '@config/upload';
import AppError from '@shared/errors/AppError';
import { injectable, inject } from 'tsyringe';
import IStorageProvider from '@shared/container/providers/StorageProvider/models/IStorageProvider';
import User from '../infra/typeorm/entities/User';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  user_id: string;
  avatarFilename: string;
}

@injectable()
class UpdateUserAvatarService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StorageProvider')
    private storageProvider: IStorageProvider,
  ) {}

  public async execute({ user_id, avatarFilename }: IRequest): Promise<User> {
    // Busca o User pelo ID na base, para validar se existe
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar.', 401);
    }

    // Verifica se o usuário já tem um avatar
    if (user.avatar) {
      // // Deletar o avatar anterior do usuário para não ficar lixo no disco
      // const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar);
      // const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);

      // // Se o arquivo existe em disco, deve ser deletado
      // if (userAvatarFileExists) {
      //   // O unlink deleta o arquivo
      //   await fs.promises.unlink(userAvatarFilePath);
      // }

      // Mudança de lógica aqui, usando os providers isolados

      // Deleta o avatar
      await this.storageProvider.deleteFile(user.avatar);
    }

    // Chama o metodo genérico do provider para fazer o upload do arquivo
    const filename = await this.storageProvider.saveFile(avatarFilename);

    // Altera o valor da prop avatar do meu objeto user já carregado
    user.avatar = filename;

    // Chama o save, que irá fazer a alteração do registro no banco
    // Se houver ID (PK), atualiza o registro
    // Se não houver ID (PK), cria um novo registro
    await this.usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;
