import { Test, TestingModule } from '@nestjs/testing';
import { PlayerstatsService } from './playerstats.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayerStats, PlayerStatsDocument } from './schema/playerstats.schema';
import { NotFoundException } from '@nestjs/common';

describe('PlayerstatsService', () => {
  let service: PlayerstatsService;
  let playerStatsModel: Model<PlayerStatsDocument>;

  // Mock para el modelo
  const mockPlayerStatsModel = {
    insertMany: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerstatsService,
        {
          // Proporcionar correctamente el token del modelo
          provide: getModelToken(PlayerStats.name),
          useValue: mockPlayerStatsModel,
        },
      ],
    }).compile();

    service = module.get<PlayerstatsService>(PlayerstatsService);
    playerStatsModel = module.get<Model<PlayerStatsDocument>>(getModelToken(PlayerStats.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeStats', () => {
    it('should initialize stats for multiple players', async () => {
      // Arrange
      const matchId = 'match123';
      const playerIds = ['player1', 'player2'];
      const expectedStats = [
        {
          matchId,
          playerId: 'player1',
          points: 0,
          rebounds: 0,
          assists: 0,
          blocks: 0,
          steals: 0,
          turnovers: 0,
          fieldGoalsMade: 0,
          fieldGoalsAttempted: 0,
          freeThrowsMade: 0,
          freeThrowsAttempted: 0,
        },
        {
          matchId,
          playerId: 'player2',
          points: 0,
          rebounds: 0,
          assists: 0,
          blocks: 0,
          steals: 0,
          turnovers: 0,
          fieldGoalsMade: 0,
          fieldGoalsAttempted: 0,
          freeThrowsMade: 0,
          freeThrowsAttempted: 0,
        },
      ];
      
      mockPlayerStatsModel.insertMany.mockResolvedValue(expectedStats);

      // Act
      const result = await service.initializeStats(matchId, playerIds);

      // Assert
      expect(mockPlayerStatsModel.insertMany).toHaveBeenCalled();
      expect(result).toEqual(expectedStats);
    });
  });

  describe('initializeOpponentStats', () => {
    it('should initialize stats for opponent', async () => {
      // Arrange
      const matchId = 'match123';
      const expectedStats = {
        matchId,
        playerId: 'opponent',
        points: 0,
        rebounds: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        turnovers: 0,
        fieldGoalsMade: 0,
        fieldGoalsAttempted: 0,
        freeThrowsMade: 0,
        freeThrowsAttempted: 0,
      };
      
      mockPlayerStatsModel.create.mockResolvedValue(expectedStats);

      // Act
      const result = await service.initializeOpponentStats(matchId);

      // Assert
      expect(mockPlayerStatsModel.create).toHaveBeenCalledWith(expectedStats);
      expect(result).toEqual(expectedStats);
    });
  });

  describe('updateStats', () => {
    it('should update player stats by ID', async () => {
      // Arrange
      const playerStatsId = 'stats123';
      const statsUpdate = { 
        points: 2, 
        assists: 1 
      };
      const mockUpdatedStats = {
        _id: playerStatsId,
        matchId: 'match123',
        playerId: 'player1',
        points: 2,
        assists: 1,
      };
      
      mockPlayerStatsModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedStats)
      });

      // Act
      const result = await service.updateStats(playerStatsId, statsUpdate);

      // Assert
      expect(mockPlayerStatsModel.findByIdAndUpdate).toHaveBeenCalledWith(
        playerStatsId,
        { $inc: { points: 2, assists: 1 } },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedStats);
    });

    it('should throw NotFoundException if player stats not found', async () => {
      // Arrange
      const playerStatsId = 'nonexistent';
      const statsUpdate = { points: 2 };
      
      mockPlayerStatsModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      // Act & Assert
      await expect(service.updateStats(playerStatsId, statsUpdate))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should convert string values to numbers', async () => {
      // Arrange
      const playerStatsId = 'stats123';
      const statsUpdate = { 
        points: '2', 
        assists: '1' 
      } as any;
      
      const mockUpdatedStats = {
        _id: playerStatsId,
        matchId: 'match123',
        playerId: 'player1',
        points: 2,
        assists: 1,
      };
      
      mockPlayerStatsModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedStats)
      });

      // Act
      await service.updateStats(playerStatsId, statsUpdate);

      // Assert
      expect(mockPlayerStatsModel.findByIdAndUpdate).toHaveBeenCalledWith(
        playerStatsId,
        { $inc: { points: 2, assists: 1 } },
        { new: true }
      );
    });
  });

  describe('getStats', () => {
    it('should get stats for specific match and players', async () => {
      // Arrange
      const matchId = 'match123';
      const playerIds = ['player1', 'player2'];
      const mockStats = [
        { matchId, playerId: 'player1', points: 10 },
        { matchId, playerId: 'player2', points: 8 },
      ];
      
      mockPlayerStatsModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStats)
      });

      // Act
      const result = await service.getStats(matchId, playerIds);

      // Assert
      expect(mockPlayerStatsModel.find).toHaveBeenCalledWith({ 
        matchId, 
        playerId: { $in: playerIds } 
      });
      expect(result).toEqual(mockStats);
    });

    it('should throw NotFoundException if no stats found', async () => {
      // Arrange
      const matchId = 'match123';
      const playerIds = ['player1', 'player2'];
      
      mockPlayerStatsModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      });

      // Act & Assert
      await expect(service.getStats(matchId, playerIds))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});