import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { getModelToken } from '@nestjs/mongoose';
import { Team } from './schema/teams.schema';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import * as mongoose from 'mongoose';

// Mock de isValidObjectId para pruebas
// Modificado para aceptar también nuestros IDs de prueba
jest.spyOn(mongoose, 'isValidObjectId').mockImplementation((id) => {
  // Para los tests aceptamos los IDs específicos que estamos usando
  if (id === 'teamId123' || id === 'newTeamId') {
    return true;
  }
  // Mantener la validación para otros formatos de ID
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
});

// Crear mock para un equipo
const mockTeam = {
  _id: 'teamId123',
  name: 'Test Team',
  category: 'Senior',
  user_id: 'userId123',
  wins: 5,
  losses: 3,
  gamesPlayed: 8,
  team_photo: 'photo_url',
  save: jest.fn().mockResolvedValue({}),
};

describe('TeamsService', () => {
  let service: TeamsService;
  let model: Model<Team>;

  // Mock del modelo
  const mockTeamModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: getModelToken(Team.name),
          useValue: {
            ...mockTeamModel,
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockTeam]),
            }),
            findById: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockTeam),
            }),
            findByIdAndUpdate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockTeam),
            }),
            findByIdAndDelete: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockTeam),
            }),
            // Mock correcto para el constructor del modelo
            new: jest.fn().mockImplementation((dto) => ({
              ...dto,
              _id: 'newTeamId',
              save: jest.fn().mockResolvedValue({ _id: 'newTeamId', ...dto }),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    model = module.get<Model<Team>>(getModelToken(Team.name));

    // Limpiar todos los mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUserId', () => {
    it('should return teams for a user ID', async () => {
      const userId = 'userId123';
      const mockTeams = [mockTeam];
      
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTeams),
      } as any);

      const result = await service.findByUserId(userId);
      
      expect(model.find).toHaveBeenCalledWith({ user_id: userId });
      expect(result).toEqual(mockTeams);
    });
  });

  describe('findById', () => {
    it('should return a team by ID', async () => {
      const teamId = 'teamId123';
      
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTeam),
      } as any);

      const result = await service.findById(teamId);
      
      expect(model.findById).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(mockTeam);
    });

    it('should return null if team not found', async () => {
      const teamId = 'nonExistentId';
      
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.findById(teamId);
      
      expect(model.findById).toHaveBeenCalledWith(teamId);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new team', async () => {
      const createTeamDto = {
        name: 'New Team',
        category: 'Junior',
        user_id: 'userId123',
      };
      
      // Crear un mock para el nuevo equipo
      const savedTeam = {
        _id: 'newTeamId',
        ...createTeamDto,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
      };
      
      // Configurar el comportamiento del constructor
      const mockTeamInstance = {
        ...createTeamDto,
        save: jest.fn().mockResolvedValue(savedTeam),
      };
      
      // Mock alternativo utilizando prototype
      Object.defineProperty(service, 'teamModel', { 
        value: jest.fn().mockImplementation(() => mockTeamInstance)
      });

      const result = await service.create(createTeamDto);

      expect(result).toEqual(savedTeam);
      expect(mockTeamInstance.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a team', async () => {
      const teamId = 'teamId123';
      const updateTeamDto = { name: 'Updated Team' };
      const updatedTeam = { ...mockTeam, ...updateTeamDto };
      
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedTeam),
      } as any);

      const result = await service.update(teamId, updateTeamDto);
      
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        teamId,
        updateTeamDto,
        { new: true }
      );
      expect(result).toEqual(updatedTeam);
    });
  });

  describe('findAll', () => {
    it('should return all teams', async () => {
      const mockTeams = [mockTeam];
      
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTeams),
      } as any);

      const result = await service.findAll();
      
      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual(mockTeams);
    });
  });

  describe('updateStats', () => {
    it('should update team stats with incrementWins', async () => {
      const teamId = 'teamId123';
      const statsUpdate = { incrementWins: 1 };
      const teamBeforeUpdate = { 
        ...mockTeam, 
        wins: 5,
        gamesPlayed: 8,
        save: jest.fn().mockResolvedValue({
          ...mockTeam,
          wins: 6,
          gamesPlayed: 9,
        }),
      };
      
      jest.spyOn(model, 'findById').mockResolvedValue(teamBeforeUpdate);

      const result = await service.updateStats(teamId, statsUpdate);
      
      expect(teamBeforeUpdate.wins).toBe(6);
      expect(teamBeforeUpdate.gamesPlayed).toBe(9);
      expect(teamBeforeUpdate.save).toHaveBeenCalled();
    });

    it('should update team stats with incrementLosses', async () => {
      const teamId = 'teamId123';
      const statsUpdate = { incrementLosses: 1 };
      const teamBeforeUpdate = { 
        ...mockTeam, 
        losses: 3,
        gamesPlayed: 8,
        save: jest.fn().mockResolvedValue({
          ...mockTeam,
          losses: 4,
          gamesPlayed: 9,
        }),
      };
      
      jest.spyOn(model, 'findById').mockResolvedValue(teamBeforeUpdate);

      await service.updateStats(teamId, statsUpdate);
      
      expect(teamBeforeUpdate.losses).toBe(4);
      expect(teamBeforeUpdate.gamesPlayed).toBe(9);
      expect(teamBeforeUpdate.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if team not found', async () => {
      const teamId = 'teamId123';
      const statsUpdate = { incrementWins: 1 };
      
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(service.updateStats(teamId, statsUpdate)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if ID is invalid', async () => {
      const invalidId = 'invalid';
      const statsUpdate = { incrementWins: 1 };

      await expect(service.updateStats(invalidId, statsUpdate)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a team', async () => {
      const teamId = 'teamId123';
      
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTeam),
      } as any);

      const result = await service.remove(teamId);
      
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(mockTeam);
    });

    it('should throw NotFoundException if team not found', async () => {
      const teamId = 'nonExistentId';
      
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.remove(teamId)).rejects.toThrow(NotFoundException);
    });
  });
});