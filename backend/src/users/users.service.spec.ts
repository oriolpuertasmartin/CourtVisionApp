import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Users, UserDocument } from './schema/user.schema';
import * as bcryptjs from 'bcryptjs';

// Mock de bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockImplementation(() => 'hashedPassword'),
  compare: jest.fn()
}));

// Mock completo de mongoose con Schema
jest.mock('mongoose', () => ({
  isValidObjectId: jest.fn(),
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    index: jest.fn().mockReturnThis(),
    virtual: jest.fn().mockReturnThis()
  }))
}));

// Mock del esquema de usuario
jest.mock('./schema/user.schema', () => ({
  Users: class Users {},
  UsersSchema: {},
  UserDocument: {}
}));

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  // Mock de un usuario para las pruebas
  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    toObject: jest.fn().mockReturnValue({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedPassword',
    }),
    save: jest.fn(),
  };

  const mockUserModel = {
    new: jest.fn().mockResolvedValue(mockUser),
    constructor: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(Users.name),
          useValue: {
            ...mockUserModel,
            new: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(Users.name));
    
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and hash the password', async () => {
      // Arrange
      const createUserDto = {
        name: 'New User',
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123'
      };
  
      // Asegurarnos que bcryptjs.hash es llamado
      (bcryptjs.hash as jest.Mock).mockImplementation(() => 'hashedPassword');
  
      // Crear un mock para el nuevo usuario con método save
      const mockNewUser = {
        ...createUserDto,
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue({
          ...createUserDto,
          _id: 'newuser123',
          password: 'hashedPassword'
        })
      };
  
      // Mock del constructor del modelo de usuario
      jest.spyOn(model, 'constructor' as any).mockImplementation(() => mockNewUser);
      
      // Mejor aproximación: mockear directamente this.userModel
      Object.defineProperty(service, 'userModel', {
        value: jest.fn().mockImplementation(() => mockNewUser),
        configurable: true
      });
  
      // Act
      const result = await service.create(createUserDto);
  
      // Assert
      expect(bcryptjs.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toEqual({
        ...createUserDto,
        _id: 'newuser123',
        password: 'hashedPassword'
      });
    });
  });

  describe('findById', () => {
    it('should return a user if found by id', async () => {
      // Arrange
      const userId = 'user123';
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });
  });

  describe('validateUser', () => {
    it('should validate user and return user data without password if credentials are valid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'correctPassword';
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);
      
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(model.findOne).toHaveBeenCalledWith({ email });
      expect(bcryptjs.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toEqual(expect.objectContaining({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        username: mockUser.username,
      }));
      expect(result.password).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password';
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(model.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongPassword';
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);
      
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(model.findOne).toHaveBeenCalledWith({ email });
      expect(bcryptjs.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should find a user by ID', async () => {
      // Arrange
      const userId = 'user123';
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(model.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      // Arrange
      const userId = 'invalid';
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue({ name: 'CastError' }),
      } as any);

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow(BadRequestException);
      expect(model.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user123';
      const updateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      } as any);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateUserDto, { new: true });
      expect(result).toEqual(updatedUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const userId = 'user123';
      const updateUserDto = { email: 'existing@example.com' };
      const existingUser = { ...mockUser, email: 'existing@example.com' };
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      } as any);

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(ConflictException);
      expect(model.findOne).toHaveBeenCalledWith({ 
        email: updateUserDto.email,
        _id: { $ne: userId }
      });
    });

    it('should throw ConflictException if username already exists', async () => {
      // Arrange
      const userId = 'user123';
      const updateUserDto = { username: 'existinguser' };
      const existingUser = { ...mockUser, username: 'existinguser' };
      
      // Mock para email check (debe retornar null para que pase)
      jest.spyOn(model, 'findOne').mockImplementation((query: any) => {
        if (query.username) {
          return { exec: jest.fn().mockResolvedValue(existingUser) } as any;
        }
        return { exec: jest.fn().mockResolvedValue(null) } as any;
      });

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      const updateUserDto = { name: 'Updated Name' };
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      // Arrange
      const userId = 'invalid';
      const updateUserDto = { name: 'Updated Name' };
      
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue({ name: 'CastError' }),
      } as any);

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'oldPassword';
      const newPassword = 'newPassword123';
      const userWithSave = {
        ...mockUser,
        save: jest.fn().mockResolvedValue({ message: 'Password changed successfully' }),
      };
      
      (require('mongoose') as any).isValidObjectId.mockReturnValue(true);
      jest.spyOn(model, 'findById').mockResolvedValue(userWithSave as any);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      // Act
      const result = await service.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(userId);
      expect(bcryptjs.compare).toHaveBeenCalledWith(currentPassword, mockUser.password);
      expect(bcryptjs.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(userWithSave.save).toHaveBeenCalled();
      expect(userWithSave.password).toBe('newHashedPassword');
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw BadRequestException if user ID is invalid', async () => {
      // Arrange
      const userId = 'invalid';
      const currentPassword = 'oldPassword';
      const newPassword = 'newPassword';
      
      (require('mongoose') as any).isValidObjectId.mockReturnValue(false);

      // Act & Assert
      await expect(service.changePassword(userId, currentPassword, newPassword))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      const currentPassword = 'oldPassword';
      const newPassword = 'newPassword';
      
      (require('mongoose') as any).isValidObjectId.mockReturnValue(true);
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(service.changePassword(userId, currentPassword, newPassword))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'wrongPassword';
      const newPassword = 'newPassword';
      
      (require('mongoose') as any).isValidObjectId.mockReturnValue(true);
      jest.spyOn(model, 'findById').mockResolvedValue(mockUser as any);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.changePassword(userId, currentPassword, newPassword))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if new password is same as current', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'samePassword';
      const newPassword = 'samePassword';
      
      (require('mongoose') as any).isValidObjectId.mockReturnValue(true);
      jest.spyOn(model, 'findById').mockResolvedValue(mockUser as any);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(service.changePassword(userId, currentPassword, newPassword))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});