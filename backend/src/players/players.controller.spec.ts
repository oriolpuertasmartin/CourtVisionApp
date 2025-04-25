import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock the players schema module to avoid Schema errors
jest.mock('./schema/players.schema', () => ({
  Player: class Player {},
  PlayerSchema: {},
}));

// Mock mongoose's isValidObjectId
jest.mock('mongoose', () => ({
  isValidObjectId: jest.fn((id) => id !== 'invalid-id'),
}));

describe('PlayersController', () => {
  let controller: PlayersController;
  let service: PlayersService;

  // Mock player service implementation
  const mockPlayersService = {
    findByTeamId: jest.fn(),
    findByIds: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  // Mock player data
  const mockPlayer = {
    _id: 'player123',
    name: 'John Doe',
    number: 23,
    position: 'SF',
    team_id: 'team123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        {
          provide: PlayersService,
          useValue: mockPlayersService,
        },
      ],
    }).compile();

    controller = module.get<PlayersController>(PlayersController);
    service = module.get<PlayersService>(PlayersService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPlayersByTeam', () => {
    it('should return players for a valid team ID', async () => {
      // Arrange
      const teamId = 'team123';
      const mockPlayers = [mockPlayer];
      mockPlayersService.findByTeamId.mockResolvedValue(mockPlayers);

      // Act
      const result = await controller.getPlayersByTeam(teamId);

      // Assert
      expect(service.findByTeamId).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(mockPlayers);
    });

    it('should return empty array when no players found for team', async () => {
      // Arrange
      const teamId = 'team-no-players';
      mockPlayersService.findByTeamId.mockResolvedValue(null);

      // Act
      const result = await controller.getPlayersByTeam(teamId);

      // Assert
      expect(service.findByTeamId).toHaveBeenCalledWith(teamId);
      expect(result).toEqual([]);
    });
  });

  describe('getPlayers', () => {
    it('should return players when valid IDs are provided', async () => {
      // Arrange
      const ids = 'player123,player456';
      const mockPlayers = [mockPlayer];
      mockPlayersService.findByIds.mockResolvedValue(mockPlayers);

      // Act
      const result = await controller.getPlayers(ids);

      // Assert
      expect(service.findByIds).toHaveBeenCalledWith(['player123', 'player456']);
      expect(result).toEqual(mockPlayers);
    });

    it('should throw NotFoundException when no players found for IDs', async () => {
      // Arrange
      const ids = 'nonexistent1,nonexistent2';
      mockPlayersService.findByIds.mockResolvedValue([]);

      // Act & Assert
      await expect(controller.getPlayers(ids)).rejects.toThrow(NotFoundException);
      expect(service.findByIds).toHaveBeenCalledWith(['nonexistent1', 'nonexistent2']);
    });

    it('should return all players when no IDs provided', async () => {
      // Arrange
      const mockAllPlayers = [mockPlayer, { ...mockPlayer, _id: 'player456' }];
      mockPlayersService.findAll.mockResolvedValue(mockAllPlayers);

      // Act
      const result = await controller.getPlayers();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAllPlayers);
    });
  });

  describe('createPlayer', () => {
    it('should create a player with valid data', async () => {
      // Arrange
      const createPlayerDto = {
        name: 'New Player',
        number: 42,
        position: 'PG',
        team_id: 'team123',
      };
      const createdPlayer = { _id: 'newplayer123', ...createPlayerDto };
      mockPlayersService.create.mockResolvedValue(createdPlayer);

      // Act
      const result = await controller.createPlayer(createPlayerDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createPlayerDto);
      expect(result).toEqual(createdPlayer);
    });

    it('should throw BadRequestException when missing required fields', async () => {
      // Arrange - missing position field
      const invalidDto = {
        name: 'Invalid Player',
        number: 7,
        team_id: 'team123',
      };

      // Act & Assert
      await expect(controller.createPlayer(invalidDto)).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('deletePlayer', () => {
    it('should delete a player with valid ID', async () => {
      // Arrange
      const id = 'player123';
      const deletedPlayer = { ...mockPlayer, _id: id };
      mockPlayersService.delete.mockResolvedValue(deletedPlayer);

      // Act
      const result = await controller.deletePlayer(id);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(deletedPlayer);
    });

    it('should throw BadRequestException when ID is invalid', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act & Assert
      await expect(controller.deletePlayer(invalidId)).rejects.toThrow(BadRequestException);
      expect(service.delete).not.toHaveBeenCalled();
    });
  });

  describe('updatePlayer', () => {
    it('should update a player with valid data', async () => {
      // Arrange
      const id = 'player123';
      const updatePlayerDto = {
        name: 'Updated Name',
        number: 99,
      };
      const updatedPlayer = { ...mockPlayer, ...updatePlayerDto };
      mockPlayersService.update.mockResolvedValue(updatedPlayer);

      // Act
      const result = await controller.updatePlayer(id, updatePlayerDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(id, updatePlayerDto);
      expect(result).toEqual(updatedPlayer);
    });

    it('should throw BadRequestException when ID is invalid', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const updatePlayerDto = { name: 'Updated Name' };

      // Act & Assert
      await expect(controller.updatePlayer(invalidId, updatePlayerDto)).rejects.toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to set required fields to empty', async () => {
      // Arrange
      const id = 'player123';
      const invalidUpdateDto = {
        name: '',  // Empty name
        position: 'PG',
      };

      // Act & Assert
      await expect(controller.updatePlayer(id, invalidUpdateDto)).rejects.toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });
});