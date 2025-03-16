import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UserDocument } from './schema/user.schema';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private userModel: Model<UserDocument>) {}

  // Crear un nuevo usuario
  async create(createUserDto: any): Promise<Users> {
    const hashedPassword = await bcryptjs.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  // Buscar un usuario por su ID
  async findById(id: string): Promise<Users | undefined> {
    const user = await this.userModel.findById(id).exec();
    return user ? user : undefined;
  }

  // Validar las credenciales de un usuario
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && (await bcryptjs.compare(pass, user.password))) {
      const { password, ...result } = (user as any).toObject();
      return result;
    }
    return null;
  }
}