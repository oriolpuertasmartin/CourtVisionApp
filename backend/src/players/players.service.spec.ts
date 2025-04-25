import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from './schema/players.schema';
import { NotFoundException } from '@nestjs/common';

describe('PlayersService', () => {
  let service: PlayersService;
  let model: Model<PlayerDocument>;

  // Mock player data
  const mockPlayer = {
    _id: 'player123',
    name: 'John Doe',
    number: 23,
    position: 'SF',
    team_id: 'team123',
  };

  // Mock array of players
  const mockPlayers = [
    mockPlayer,
    {
      _id: 'player456',
      name: 'Jane Smith',
      number: 10,
      position: 'PG',
      team_id: 'team123',
    },
    {
      _id: 'player789',
      name: 'Mike Johnson',
      number: 32,
      position: 'C',
      team_id: 'team456',
    }
  ];

  // Setup for each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getModelToken(Player.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            new: jest.fn(),
            constructor: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    model = module.get<Model<PlayerDocument>>(getModelToken(Player.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByTeamId', () => {
    it('should return players for a valid team ID', async () => {
      // Arrange
      const teamId = 'team123';
      const teamPlayers = mockPlayers.filter(player => player.team_id === teamId);
      const findMock = {
        exec: jest.fn().mockResolvedValue(teamPlayers),
      };
      jest.spyOn(model, 'find').mockReturnValue(findMock as any);

      // Act
      const result = await service.findByTeamId(teamId);

      // Assert
      expect(model.find).toHaveBeenCalledWith({ team_id: teamId });
      expect(findMock.exec).toHaveBeenCalled();
      expect(result).toEqual(teamPlayers);
    });

    it('should return empty array if no players found for team ID', async () => {
      // Arrange
      const teamId = 'nonexistent';
      const findMock = {
        exec: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(model, 'find').mockReturnValue(findMock as any);

      // Act
      const result = await service.findByTeamId(teamId);

      // Assert
      expect(model.find).toHaveBeenCalledWith({ team_id: teamId });
      expect(findMock.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findByIds', () => {
    it('should return players matching the provided IDs', async () => {
      // Arrange
      const ids = ['player123', 'player456'];
      const matchingPlayers = mockPlayers.filter(player => ids.includes(player._id));
      const findMock = {
        exec: jest.fn().mockResolvedValue(matchingPlayers),
      };
      jest.spyOn(model, 'find').mockReturnValue(findMock as any);

      // Act
      const result = await service.findByIds(ids);

      // Assert
      expect(model.find).toHaveBeenCalledWith({ _id: { $in: ids } });
      expect(findMock.exec).toHaveBeenCalled();
      expect(result).toEqual(matchingPlayers);
    });

    it('should return empty array if no players match the IDs', async () => {
      // Arrange
      const ids = ['nonexistent1', 'nonexistent2'];
      const findMock = {
        exec: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(model, 'find').mockReturnValue(findMock as any);

      // Act
      const result = await service.findByIds(ids);

      // Assert
      expect(model.find).toHaveBeenCalledWith({ _id: { $in: ids } });
      expect(findMock.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all players', async () => {
      // Arrange
      const findMock = {
        exec: jest.fn().mockResolvedValue(mockPlayers),
      };
      jest.spyOn(model, 'find').mockReturnValue(findMock as any);

      // Act
      const result = await service.findAll();

      // Assert
      expect(model.find).toHaveBeenCalled();
      expect(findMock.exec).toHaveBeenCalled();
      expect(result).toEqual(mockPlayers);
    });
  });

  describe('create', () => {
    it('should create and return a new player', async () => {
      // Arrange
      const playerData = {
        name: 'New Player',
        number: 42,
        position: 'PF',
        team_id: 'team123',
      };
      
      const expectedResult = {
        _id: 'newplayer123',
        ...playerData,
        height: null,     // Changed from undefined to null
        weight: null,     // Changed from undefined to null
        nationality: null, // Changed from undefined to null
        age: null,        // Changed from undefined to null
        player_photo: null, // Changed from undefined to null
      };
      
      // Mock with proper type assertion
      jest.spyOn(service, 'create').mockResolvedValueOnce(expectedResult as unknown as Player);
      
      // Act
      const result = await service.create(playerData);
  
      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
  
  describe('delete', () => {
    it('should delete and return the player with the given ID', async () => {
      // Arrange
      const playerId = 'player123';
      jest.spyOn(model, 'findById').mockResolvedValue(mockPlayer as any);
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockPlayer as any);

      // Act
      const result = await service.delete(playerId);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(playerId);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(playerId);
      expect(result).toEqual(mockPlayer);
    });

    it('should throw NotFoundException if player not found', async () => {
      // Arrange
      const playerId = 'nonexistent';
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(playerId)).rejects.toThrow(NotFoundException);
      expect(model.findById).toHaveBeenCalledWith(playerId);
      expect(model.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the player with the given ID', async () => {
      // Arrange
      const playerId = 'player123';
      const updateData = {
        name: 'Updated Name',
        number: 99,
      };
      const updatedPlayer = { ...mockPlayer, ...updateData };
      
      jest.spyOn(model, 'findById').mockResolvedValue(mockPlayer as any);
      
      const findByIdAndUpdateMock = {
        exec: jest.fn().mockResolvedValue(updatedPlayer),
      };
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue(findByIdAndUpdateMock as any);

      // Act
      const result = await service.update(playerId, updateData);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(playerId);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        playerId,
        { $set: updateData },
        { new: true }
      );
      expect(findByIdAndUpdateMock.exec).toHaveBeenCalled();
      expect(result).toEqual(updatedPlayer);
    });

    it('should throw NotFoundException if player not found', async () => {
      // Arrange
      const playerId = 'nonexistent';
      const updateData = {
        name: 'Updated Name',
      };
      
        jest.spyOn(model, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(playerId, updateData)).rejects.toThrow(NotFoundException);
      expect(model.findById).toHaveBeenCalledWith(playerId);
      expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});