import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Users, UserDocument } from './schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
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

  async findOne(id: string) {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID format');
      }
      throw error;
    }
  }
  
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // Primero verificamos si el email o username ya existen (excepto para el mismo usuario)
      if (updateUserDto.email) {
        const emailExists = await this.userModel.findOne({ 
          email: updateUserDto.email,
          _id: { $ne: id }
        }).exec();
        
        if (emailExists) {
          throw new ConflictException('Email already in use');
        }
      }
      
      if (updateUserDto.username) {
        const usernameExists = await this.userModel.findOne({ 
          username: updateUserDto.username,
          _id: { $ne: id }
        }).exec();
        
        if (usernameExists) {
          throw new ConflictException('Username already in use');
        }
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();
      
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return updatedUser;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID format');
      }
      throw error;
    }
  }
}