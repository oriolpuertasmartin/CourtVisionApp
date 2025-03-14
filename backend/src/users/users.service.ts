import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Crear un nuevo usuario
  async create(createUserDto: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  // Buscar un usuario por su nombre de usuario
  async findOne(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username }).exec();
    return user ? user : undefined;
  }

  // Validar las credenciales de un usuario
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Hace un cast a any para asegurar que toObject es reconocido
      const { password, ...result } = (user as any).toObject();
      return result;
    }
    return null;
  }
}