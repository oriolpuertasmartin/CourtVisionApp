import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-psw.dto';
import * as mongoose from 'mongoose';

// Mock de mongoose.isValidObjectId
jest.mock('mongoose', () => ({
  isValidObjectId: jest.fn(),
  // Añadir un mock para Schema
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    index: jest.fn().mockReturnThis()
  }))
}));

jest.mock('./schema/user.schema', () => ({
  Users: class Users {},
  UsersSchema: {},
  UserDocument: {}
}));

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // Mock del servicio de usuarios
  const mockUsersService = {
    create: jest.fn(),
    validateUser: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    // Reiniciar los mocks de mongoose
    (mongoose.isValidObjectId as jest.Mock).mockImplementation((id) => {
      return id === 'validid123' || /^[0-9a-fA-F]{24}$/.test(id);
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should create a user and return it', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };
      const expectedResult = { 
        _id: 'user123', 
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser'
      };
      
      mockUsersService.create.mockResolvedValue(expectedResult);
      
      // Act
      const result = await controller.register(createUserDto);
      
      // Assert
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException if service throws error', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };
      
      mockUsersService.create.mockRejectedValue(new Error('Email already exists'));
      
      // Act & Assert
      await expect(controller.register(createUserDto))
        .rejects
        .toThrow(UnauthorizedException);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should return user if credentials are valid', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123'
      };
      const expectedUser = { 
        _id: 'user123', 
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser'
      };
      
      mockUsersService.validateUser.mockResolvedValue(expectedUser);
      
      // Act
      const result = await controller.login(loginUserDto);
      
      // Assert
      expect(service.validateUser).toHaveBeenCalledWith(loginUserDto.email, loginUserDto.password);
      expect(result).toEqual(expectedUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      mockUsersService.validateUser.mockResolvedValue(null);
      
      // Act & Assert
      await expect(controller.login(loginUserDto))
        .rejects
        .toThrow(UnauthorizedException);
      expect(service.validateUser).toHaveBeenCalledWith(loginUserDto.email, loginUserDto.password);
    });
  });

  describe('getUserById', () => {
    it('should return user if ID is valid and user exists', async () => {
      // Arrange
      const id = 'validid123';
      const expectedUser = { 
        _id: id, 
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser'
      };
      
      mockUsersService.findById.mockResolvedValue(expectedUser);
      
      // Act
      const result = await controller.getUserById(id);
      
      // Assert
      expect(mongoose.isValidObjectId).toHaveBeenCalledWith(id);
      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedUser);
    });

    it('should throw BadRequestException if ID format is invalid', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      (mongoose.isValidObjectId as jest.Mock).mockReturnValueOnce(false);
      
      // Act & Assert
      await expect(controller.getUserById(invalidId))
        .rejects
        .toThrow(BadRequestException);
      expect(mongoose.isValidObjectId).toHaveBeenCalledWith(invalidId);
      expect(service.findById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const id = 'validid123';
      mockUsersService.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(controller.getUserById(id))
        .rejects
        .toThrow(UnauthorizedException);
      expect(mongoose.isValidObjectId).toHaveBeenCalledWith(id);
      expect(service.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('updateUser', () => {
    it('should update and return user if ID is valid', async () => {
      // Arrange
      const id = 'validid123';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com'
      };
      const expectedResult = {
        _id: id,
        name: 'Updated User',
        email: 'updated@example.com',
        username: 'testuser'
      };
      
      mockUsersService.update.mockResolvedValue(expectedResult);
      
      // Act
      const result = await controller.updateUser(id, updateUserDto);
      
      // Assert
      expect(mongoose.isValidObjectId).toHaveBeenCalledWith(id);
      expect(service.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException if ID format is invalid', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      
      (mongoose.isValidObjectId as jest.Mock).mockReturnValueOnce(false);
      
      // Act & Assert
      await expect(controller.updateUser(invalidId, updateUserDto))
        .rejects
        .toThrow(BadRequestException);
      expect(mongoose.isValidObjectId).toHaveBeenCalledWith(invalidId);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from service', async () => {
      // Arrange
      const id = 'validid123';
      const updateUserDto: UpdateUserDto = { email: 'existing@example.com' };
      const errorMessage = 'Email already in use';
      
      mockUsersService.update.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(controller.updateUser(id, updateUserDto))
        .rejects
        .toThrow(Error);
      expect(mongoose.isValidObjectId).toHaveBeenCalledWith(id);
      expect(service.update).toHaveBeenCalledWith(id, updateUserDto);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const id = 'validid123';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPass',
        newPassword: 'newPass123'
      };
      const expectedResult = { success: true, message: 'Password changed successfully' };
      
      mockUsersService.changePassword.mockResolvedValue(expectedResult);
      
      // Act
      const result = await controller.changePassword(id, changePasswordDto);
      
      // Assert
      expect(service.changePassword).toHaveBeenCalledWith(
        id, 
        changePasswordDto.currentPassword, 
        changePasswordDto.newPassword
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException if service throws UnauthorizedException', async () => {
      // Arrange
      const id = 'validid123';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongPass',
        newPassword: 'newPass123'
      };
      
      mockUsersService.changePassword.mockRejectedValue(new UnauthorizedException('Incorrect password'));
      
      // Act & Assert
      await expect(controller.changePassword(id, changePasswordDto))
        .rejects
        .toThrow(UnauthorizedException);
      expect(service.changePassword).toHaveBeenCalledWith(
        id, 
        changePasswordDto.currentPassword, 
        changePasswordDto.newPassword
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      // Arrange
      const id = 'validid123';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPass',
        newPassword: 'currentPass' // Same as current (might be invalid)
      };
      
      mockUsersService.changePassword.mockRejectedValue(
        new Error('New password must be different from current password')
      );
      
      // Act & Assert
      await expect(controller.changePassword(id, changePasswordDto))
        .rejects
        .toThrow(BadRequestException);
      expect(service.changePassword).toHaveBeenCalledWith(
        id, 
        changePasswordDto.currentPassword, 
        changePasswordDto.newPassword
      );
    });
  });
});