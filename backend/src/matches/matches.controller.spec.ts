import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock del servicio de matches
const mockMatchesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByTeam: jest.fn(),
  findByUser: jest.fn(),
  findByTeamAndUser: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  updatePeriodStats: jest.fn(),
  getPeriodHistory: jest.fn(),
};

// Mock completo para mongoose con Schema
jest.mock('mongoose', () => ({
  isValidObjectId: jest.fn((id) => id !== 'invalid-id'),
  Types: {
    ObjectId: String  // Mock para Types.ObjectId
  },
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    index: jest.fn().mockReturnThis()
  }))
}));

// Mock para evitar que se cargue el esquema real
jest.mock('./schema/matches.schema', () => ({
  Match: class Match {},
  MatchSchema: {},
  MatchDocument: {}
}));

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockMatchesService,
        },
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);
    
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMatch', () => {
    it('should create a match with valid data', async () => {
      // Arrange
      const createMatchDto = { teamId: 'team123', userId: 'user123' };
      const mockResult = { _id: 'match1', ...createMatchDto };
      mockMatchesService.create.mockResolvedValue(mockResult);

      // Act
      const result = await controller.createMatch(createMatchDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createMatchDto);
      expect(result).toEqual(mockResult);
    });

    it('should throw BadRequestException if teamId is missing', async () => {
      // Arrange
      const createMatchDto = { userId: 'user123' } as any;

      // Act & Assert
      await expect(controller.createMatch(createMatchDto))
        .rejects
        .toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if userId is missing', async () => {
      // Arrange
      const createMatchDto = { teamId: 'team123' } as any;

      // Act & Assert
      await expect(controller.createMatch(createMatchDto))
        .rejects
        .toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('getMatches', () => {
    it('should get all matches when no filters provided', async () => {
      // Arrange
      const mockMatches = [{ _id: 'match1' }, { _id: 'match2' }];
      mockMatchesService.findAll.mockResolvedValue(mockMatches);

      // Act
      const result = await controller.getMatches();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockMatches);
    });

    it('should get matches by teamId', async () => {
      // Arrange
      const teamId = 'team123';
      const mockMatches = [{ _id: 'match1', teamId }];
      mockMatchesService.findByTeam.mockResolvedValue(mockMatches);

      // Act
      const result = await controller.getMatches(teamId);

      // Assert
      expect(service.findByTeam).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(mockMatches);
    });

    it('should get matches by userId', async () => {
      // Arrange
      const userId = 'user123';
      const mockMatches = [{ _id: 'match1', userId }];
      mockMatchesService.findByUser.mockResolvedValue(mockMatches);

      // Act
      const result = await controller.getMatches(undefined, userId);

      // Assert
      expect(service.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockMatches);
    });

    it('should get matches by both teamId and userId', async () => {
      // Arrange
      const teamId = 'team123';
      const userId = 'user123';
      const mockMatches = [{ _id: 'match1', teamId, userId }];
      mockMatchesService.findByTeamAndUser.mockResolvedValue(mockMatches);

      // Act
      const result = await controller.getMatches(teamId, userId);

      // Assert
      expect(service.findByTeamAndUser).toHaveBeenCalledWith(teamId, userId);
      expect(result).toEqual(mockMatches);
    });
  });

  describe('getMatchById', () => {
    it('should get a match by valid ID', async () => {
      // Arrange
      const id = 'match123';
      const mockMatch = { _id: id, teamId: 'team1' };
      mockMatchesService.findById.mockResolvedValue(mockMatch);

      // Act
      const result = await controller.getMatchById(id);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockMatch);
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act & Assert
      await expect(controller.getMatchById(invalidId))
        .rejects
        .toThrow(BadRequestException);
      expect(service.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when match not found', async () => {
      // Arrange
      const id = 'nonexistent-match';
      mockMatchesService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getMatchById(id))
        .rejects
        .toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('updateMatch', () => {
    it('should update match with valid data', async () => {
      // Arrange
      const id = 'match123';
      const updateDto = { teamAScore: 10 };
      const mockUpdated = { _id: id, teamAScore: 10 };
      mockMatchesService.update.mockResolvedValue(mockUpdated);

      // Act
      const result = await controller.updateMatch(id, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(mockUpdated);
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const updateDto = { teamAScore: 10 };

      // Act & Assert
      await expect(controller.updateMatch(invalidId, updateDto))
        .rejects
        .toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('updatePeriodStats', () => {
    it('should update period stats with valid data', async () => {
      // Arrange
      const id = 'match123';
      const periodStats = {
        period: 'H1',
        teamAScore: 10,
        teamBScore: 8,
        teamAFouls: 2,
        teamBFouls: 3
      };
      const mockUpdated = { 
        _id: id, 
        teamAScore: 10,
        teamBScore: 8,
        periodsHistory: [periodStats]
      };
      mockMatchesService.updatePeriodStats.mockResolvedValue(mockUpdated);

      // Act
      const result = await controller.updatePeriodStats(id, periodStats);

      // Assert
      expect(service.updatePeriodStats).toHaveBeenCalledWith(id, periodStats);
      expect(result).toEqual(mockUpdated);
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const periodStats = {
        period: 'H1',
        teamAScore: 10,
        teamBScore: 8,
        teamAFouls: 2,
        teamBFouls: 3
      };

      // Act & Assert
      await expect(controller.updatePeriodStats(invalidId, periodStats))
        .rejects
        .toThrow(BadRequestException);
      expect(service.updatePeriodStats).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when match not found', async () => {
      // Arrange
      const id = 'nonexistent-match';
      const periodStats = {
        period: 'H1',
        teamAScore: 10,
        teamBScore: 8,
        teamAFouls: 2,
        teamBFouls: 3
      };
      mockMatchesService.updatePeriodStats.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.updatePeriodStats(id, periodStats))
        .rejects
        .toThrow(NotFoundException);
      expect(service.updatePeriodStats).toHaveBeenCalledWith(id, periodStats);
    });
  });

  describe('getPeriodHistory', () => {
    it('should get period history with valid ID', async () => {
      // Arrange
      const id = 'match123';
      const mockHistory = [
        { period: 'H1', teamAScore: 10, teamBScore: 8 }
      ];
      mockMatchesService.getPeriodHistory.mockResolvedValue(mockHistory);

      // Act
      const result = await controller.getPeriodHistory(id);

      // Assert
      expect(service.getPeriodHistory).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockHistory);
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act & Assert
      await expect(controller.getPeriodHistory(invalidId))
        .rejects
        .toThrow(BadRequestException);
      expect(service.getPeriodHistory).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when match not found', async () => {
      // Arrange
      const id = 'nonexistent-match';
      mockMatchesService.getPeriodHistory.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getPeriodHistory(id))
        .rejects
        .toThrow(NotFoundException);
      expect(service.getPeriodHistory).toHaveBeenCalledWith(id);
    });
  });
});