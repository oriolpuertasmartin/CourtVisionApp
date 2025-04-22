import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { BadRequestException } from '@nestjs/common';
import { UpdateTeamDto } from './dto/update-team.dto';
import * as mongoose from 'mongoose';

// Mock solo para isValidObjectId sin afectar al resto del módulo mongoose
const originalIsValidObjectId = mongoose.isValidObjectId;
jest.spyOn(mongoose, 'isValidObjectId').mockImplementation((id) => {
  // Simular validación - consideramos válidos IDs de 24 caracteres hexadecimales
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
});

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  // Mock del servicio
  const mockTeamsService = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateStats: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: mockTeamsService,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
    
    // Resetear los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restaurar la implementación original después de todas las pruebas
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTeamsByUser', () => {
    it('should call teamsService.findByUserId with the userId', async () => {
      const userId = '61a3b143639e8f001f1d53cb';
      const expectedTeams = [{ id: '1', name: 'Team 1', userId }];
      
      mockTeamsService.findByUserId.mockResolvedValue(expectedTeams);
      
      const result = await controller.getTeamsByUser(userId);
      
      expect(service.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedTeams);
    });
  });

  describe('getTeamById', () => {
    it('should return a team when given a valid ID', async () => {
      const teamId = '61a3b143639e8f001f1d53cb';
      const expectedTeam = { id: teamId, name: 'Team X' };
      
      mockTeamsService.findById.mockResolvedValue(expectedTeam);
      
      const result = await controller.getTeamById(teamId);
      
      expect(service.findById).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(expectedTeam);
    });
  });

  describe('createTeam', () => {
    it('should create a team and return the result', async () => {
      const createTeamDto = { name: 'New Team', userId: '61a3b143639e8f001f1d53cb' };
      const expectedResult = { id: '61a3b143639e8f001f1d53cd', ...createTeamDto };
      
      mockTeamsService.create.mockResolvedValue(expectedResult);
      
      const result = await controller.createTeam(createTeamDto);
      
      expect(service.create).toHaveBeenCalledWith(createTeamDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateTeamStats', () => {
    it('should update team stats with valid ID', async () => {
      const teamId = '61a3b143639e8f001f1d53cb';
      const statsUpdate = { incrementWins: 1 };
      const expectedResult = { id: teamId, wins: 5, losses: 2, draws: 1 };
      
      mockTeamsService.updateStats.mockResolvedValue(expectedResult);
      
      const result = await controller.updateTeamStats(teamId, statsUpdate);
      
      expect(service.updateStats).toHaveBeenCalledWith(teamId, statsUpdate);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException with invalid team ID', async () => {
      const invalidId = 'invalid-id';
      const statsUpdate = { incrementWins: 1 };
      
      await expect(controller.updateTeamStats(invalidId, statsUpdate))
        .rejects
        .toThrow(BadRequestException);
        
      expect(service.updateStats).not.toHaveBeenCalled();
    });
  });

  describe('deleteTeam', () => {
    it('should delete a team with valid ID', async () => {
      const teamId = '61a3b143639e8f001f1d53cb';
      const expectedResult = { id: teamId, deleted: true };
      
      mockTeamsService.remove.mockResolvedValue(expectedResult);
      
      const result = await controller.deleteTeam(teamId);
      
      expect(service.remove).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException with invalid team ID', async () => {
      const invalidId = 'invalid-id';
      
      await expect(controller.deleteTeam(invalidId))
        .rejects
        .toThrow(BadRequestException);
        
      expect(service.remove).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a team with valid ID', async () => {
      const teamId = '61a3b143639e8f001f1d53cb';
      const updateTeamDto: UpdateTeamDto = { name: 'Updated Team' };
      const expectedResult = { id: teamId, name: 'Updated Team' };
      
      mockTeamsService.update.mockResolvedValue(expectedResult);
      
      const result = await controller.update(teamId, updateTeamDto);
      
      expect(service.update).toHaveBeenCalledWith(teamId, updateTeamDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException with invalid team ID', async () => {
      const invalidId = 'invalid-id';
      const updateTeamDto: UpdateTeamDto = { name: 'Updated Team' };
      
      await expect(controller.update(invalidId, updateTeamDto))
        .rejects
        .toThrow(BadRequestException);
        
      expect(service.update).not.toHaveBeenCalled();
    });
  });
});