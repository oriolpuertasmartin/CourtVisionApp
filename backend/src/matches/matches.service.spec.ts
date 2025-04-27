import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MatchesService } from './matches.service';
import { Match, MatchDocument } from './schema/matches.schema';
import { PlayerstatsService } from '../playerstats/playerstats.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

// Mock de datos para las pruebas
const mockMatch = {
  _id: 'match123',
  teamId: 'team123',
  userId: 'user123',
  opponentTeam: {
    name: 'Opponent Team',
    category: 'Senior',
    photo: 'photo_url',
    stats: {
      points: 0,
      rebounds: 0,
      assists: 0,
      fieldGoalPercentage: 0,
    },
  },
  date: new Date(),
  location: 'Stadium',
  startingPlayers: [],
  teamAScore: 0,
  teamBScore: 0,
  teamAFouls: 0,
  teamBFouls: 0,
  currentPeriod: 'H1',
  periodsHistory: [],
  status: 'in_progress',
};

// Mock para el servicio de playerStats
const mockPlayerstatsService = {
  initializeOpponentStats: jest
    .fn()
    .mockResolvedValue({ _id: 'opponentStats123' }),
};

describe('MatchesService', () => {
  let service: MatchesService;
  let model: Model<MatchDocument>;
  let playerstatsService: PlayerstatsService;

  beforeEach(async () => {
    // Mock para create
    // Este será el objeto que se devuelve en la primera llamada a save()
    const firstSaveReturn = {
      ...mockMatch,
      id: 'match123',
      save: jest.fn().mockResolvedValue({
        ...mockMatch,
        id: 'match123',
        opponentTeam: {
          ...mockMatch.opponentTeam,
          playerStatsId: 'opponentStats123',
        },
        save: jest.fn().mockResolvedValue({
          ...mockMatch,
          id: 'match123',
          opponentTeam: {
            ...mockMatch.opponentTeam,
            playerStatsId: 'opponentStats123',
          }
        })
      })
    };

    const mockCreatedMatch = {
      ...mockMatch,
      id: 'match123',
      opponentTeam: { ...mockMatch.opponentTeam },
      save: jest.fn().mockResolvedValue(firstSaveReturn)
    };

    // Crear el mock del modelo con tipos correctos
    const mockModelFunctions = {
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockMatch]),
        }),
      }),
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMatch),
        }),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMatch),
      }),
    };

    // Constructor mock que devuelve el mockCreatedMatch
    const MockMatchModel = jest.fn(() => mockCreatedMatch) as unknown as any;
    
    // Asignar los métodos estáticos al constructor
    Object.assign(MockMatchModel, mockModelFunctions);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: getModelToken(Match.name),
          useValue: MockMatchModel,
        },
        {
          provide: PlayerstatsService,
          useValue: mockPlayerstatsService,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    model = module.get<Model<MatchDocument>>(getModelToken(Match.name));
    playerstatsService = module.get<PlayerstatsService>(PlayerstatsService);

    // Resetear todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new match with opponent stats', async () => {
      // Arrange
      const createMatchDto: CreateMatchDto = {
        teamId: 'team123',
        userId: 'user123',
        date: new Date(),
        location: 'Stadium',
      };

      // Act
      const result = await service.create(createMatchDto);

      // Assert
      expect(mockPlayerstatsService.initializeOpponentStats).toHaveBeenCalled();
      // Usar corección de tipo aquí para acceder a la función save
      expect((result as any).save).toBeDefined();
      expect(result.opponentTeam).toBeDefined();
      expect((result.opponentTeam as any).playerStatsId).toEqual(
        'opponentStats123',
      );
    });
  });

  describe('update', () => {
    it('should update a match with valid data', async () => {
      // Arrange
      const id = 'match123';
      const updateDto: UpdateMatchDto = {
        status: 'completed',
        teamAScore: 80,
        teamBScore: 75,
      };

      const updatedMatch = {
        ...mockMatch,
        ...updateDto,
      };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedMatch),
      } as any);

      // Act
      const result = await service.update(id, updateDto);

      // Assert
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(id, updateDto, {
        new: true,
      });
      expect(result).toEqual(updatedMatch);
    });

    it('should return null when match not found', async () => {
      // Arrange
      const id = 'nonexistent';
      const updateDto: UpdateMatchDto = { status: 'completed' };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act
      const result = await service.update(id, updateDto);

      // Assert
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(id, updateDto, {
        new: true,
      });
      expect(result).toBeNull();
    });
  });

  describe('updatePeriodStats', () => {
    it('should add a new period to periodsHistory', async () => {
      // Arrange
      const id = 'match123';
      const periodStats = {
        period: 'H1',
        teamAScore: 20,
        teamBScore: 18,
        teamAFouls: 3,
        teamBFouls: 2,
      };

      const matchWithoutHistory = {
        ...mockMatch,
        periodsHistory: [],
        save: jest.fn().mockImplementation(function () {
          this.periodsHistory = [periodStats];
          this.teamAScore = periodStats.teamAScore;
          this.teamBScore = periodStats.teamBScore;
          this.teamAFouls = periodStats.teamAFouls;
          this.teamBFouls = periodStats.teamBFouls;
          return Promise.resolve(this);
        }),
      };

      jest
        .spyOn(model, 'findById')
        .mockResolvedValue(matchWithoutHistory as any);

      // Act
      const result = await service.updatePeriodStats(id, periodStats);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(id);
      expect(matchWithoutHistory.save).toHaveBeenCalled();
      expect(result!.periodsHistory).toContainEqual(periodStats);
      expect(result!.teamAScore).toBe(periodStats.teamAScore);
      expect(result!.teamBScore).toBe(periodStats.teamBScore);
    });

    it('should update an existing period in periodsHistory', async () => {
      // Arrange
      const id = 'match123';
      const initialPeriod = {
        period: 'H1',
        teamAScore: 10,
        teamBScore: 12,
        teamAFouls: 1,
        teamBFouls: 2,
      };

      const updatedPeriod = {
        period: 'H1',
        teamAScore: 20,
        teamBScore: 18,
        teamAFouls: 3,
        teamBFouls: 2,
      };

      const matchWithHistory = {
        ...mockMatch,
        periodsHistory: [initialPeriod],
        save: jest.fn().mockImplementation(function () {
          this.periodsHistory = [updatedPeriod];
          this.teamAScore = updatedPeriod.teamAScore;
          this.teamBScore = updatedPeriod.teamBScore;
          this.teamAFouls = updatedPeriod.teamAFouls;
          this.teamBFouls = updatedPeriod.teamBFouls;
          return Promise.resolve(this);
        }),
      };

      jest.spyOn(model, 'findById').mockResolvedValue(matchWithHistory as any);

      // Act
      const result = await service.updatePeriodStats(id, updatedPeriod);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(id);
      expect(matchWithHistory.save).toHaveBeenCalled();
      expect(result!.periodsHistory[0]).toEqual(updatedPeriod);
      expect(result!.teamAScore).toBe(updatedPeriod.teamAScore);
    });

    it('should return null when match not found', async () => {
      // Arrange
      const id = 'nonexistent';
      const periodStats = {
        period: 'H1',
        teamAScore: 20,
        teamBScore: 18,
        teamAFouls: 3,
        teamBFouls: 2,
      };

      jest.spyOn(model, 'findById').mockResolvedValue(null);

      // Act
      const result = await service.updatePeriodStats(id, periodStats);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });

    it('should handle errors during save operation', async () => {
      // Arrange
      const id = 'match123';
      const periodStats = {
        period: 'H1',
        teamAScore: 20,
        teamBScore: 18,
        teamAFouls: 3,
        teamBFouls: 2,
      };

      const matchWithError = {
        ...mockMatch,
        periodsHistory: [],
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      jest.spyOn(model, 'findById').mockResolvedValue(matchWithError as any);

      // Act & Assert
      await expect(service.updatePeriodStats(id, periodStats)).rejects.toThrow(
        'Database error',
      );
      expect(model.findById).toHaveBeenCalledWith(id);
      expect(matchWithError.save).toHaveBeenCalled();
    });
  });

  describe('getPeriodHistory', () => {
    it('should return period history for a match', async () => {
      // Arrange
      const id = 'match123';
      const periodsHistory = [
        {
          period: 'H1',
          teamAScore: 20,
          teamBScore: 18,
          teamAFouls: 3,
          teamBFouls: 2,
        },
        {
          period: 'H2',
          teamAScore: 42,
          teamBScore: 40,
          teamAFouls: 5,
          teamBFouls: 4,
        },
      ];

      const matchWithHistory = {
        ...mockMatch,
        periodsHistory,
      };

      jest.spyOn(model, 'findById').mockResolvedValue(matchWithHistory as any);

      // Act
      const result = await service.getPeriodHistory(id);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(periodsHistory);
    });

    it('should return null when match not found', async () => {
      // Arrange
      const id = 'nonexistent';
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      // Act
      const result = await service.getPeriodHistory(id);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return an array of matches', async () => {
      // Arrange
      const matches = [mockMatch, { ...mockMatch, _id: 'match456' }];

      const mockPopulateReturn = {
        exec: jest.fn().mockResolvedValue(matches),
      };

      const mockFindReturn = {
        populate: jest.fn().mockReturnValue(mockPopulateReturn),
      };

      jest.spyOn(model, 'find').mockReturnValue(mockFindReturn as any);

      // Act
      const result = await service.findAll();

      // Assert
      expect(model.find).toHaveBeenCalled();
      expect(mockFindReturn.populate).toHaveBeenCalledWith('opponentTeam');
      expect(mockPopulateReturn.exec).toHaveBeenCalled();
      expect(result).toEqual(matches);
    });
  });

  describe('findById', () => {
    it('should return a match by ID', async () => {
      // Arrange
      const id = 'match123';

      const mockPopulateReturn = {
        exec: jest.fn().mockResolvedValue(mockMatch),
      };

      const mockFindByIdReturn = {
        populate: jest.fn().mockReturnValue(mockPopulateReturn),
      };

      jest.spyOn(model, 'findById').mockReturnValue(mockFindByIdReturn as any);

      // Act
      const result = await service.findById(id);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(id);
      expect(mockFindByIdReturn.populate).toHaveBeenCalledWith('opponentTeam');
      expect(result).toEqual(mockMatch);
    });

    it('should return null when match not found', async () => {
      // Arrange
      const id = 'nonexistent';

      const mockPopulateReturn = {
        exec: jest.fn().mockResolvedValue(null),
      };

      const mockFindByIdReturn = {
        populate: jest.fn().mockReturnValue(mockPopulateReturn),
      };

      jest.spyOn(model, 'findById').mockReturnValue(mockFindByIdReturn as any);

      // Act
      const result = await service.findById(id);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('findByTeam', () => {
    it('should return matches for a team ID', async () => {
      // Arrange
      const teamId = 'team123';
      const matches = [mockMatch];

      const mockPopulateReturn = {
        exec: jest.fn().mockResolvedValue(matches),
      };

      const mockFindReturn = {
        populate: jest.fn().mockReturnValue(mockPopulateReturn),
      };

      jest.spyOn(model, 'find').mockReturnValue(mockFindReturn as any);

      // Act
      const result = await service.findByTeam(teamId);

      // Assert
      expect(model.find).toHaveBeenCalledWith({
        $or: [
          { teamId },
          {
            opponentTeam: { $exists: true, $ne: null },
            'opponentTeam._id': teamId,
          },
        ],
      });
      expect(mockFindReturn.populate).toHaveBeenCalledWith('opponentTeam');
      expect(result).toEqual(matches);
    });
  });

  describe('findByUser', () => {
    it('should return matches for a user ID', async () => {
      // Arrange
      const userId = 'user123';
      const matches = [mockMatch];

      const mockPopulateReturn = {
        exec: jest.fn().mockResolvedValue(matches),
      };

      const mockFindReturn = {
        populate: jest.fn().mockReturnValue(mockPopulateReturn),
      };

      jest.spyOn(model, 'find').mockReturnValue(mockFindReturn as any);

      // Act
      const result = await service.findByUser(userId);

      // Assert
      expect(model.find).toHaveBeenCalledWith({ userId });
      expect(mockFindReturn.populate).toHaveBeenCalledWith('opponentTeam');
      expect(result).toEqual(matches);
    });
  });

  describe('findByTeamAndUser', () => {
    it('should return matches for both team ID and user ID', async () => {
      // Arrange
      const teamId = 'team123';
      const userId = 'user123';
      const matches = [mockMatch];

      const mockPopulateReturn = {
        exec: jest.fn().mockResolvedValue(matches),
      };

      const mockFindReturn = {
        populate: jest.fn().mockReturnValue(mockPopulateReturn),
      };

      jest.spyOn(model, 'find').mockReturnValue(mockFindReturn as any);

      // Act
      const result = await service.findByTeamAndUser(teamId, userId);

      // Assert
      expect(model.find).toHaveBeenCalledWith({
        userId,
        $or: [
          { teamId },
          {
            opponentTeam: { $exists: true, $ne: null },
            'opponentTeam._id': teamId,
          },
        ],
      });
      expect(mockFindReturn.populate).toHaveBeenCalledWith('opponentTeam');
      expect(result).toEqual(matches);
    });
  });
});