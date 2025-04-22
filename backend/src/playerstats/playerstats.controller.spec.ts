import { Test, TestingModule } from '@nestjs/testing';
import { PlayerstatsController } from './playerstats.controller';
import { PlayerstatsService } from './playerstats.service';
import { BadRequestException } from '@nestjs/common';
import { PlayerStats } from './schema/playerstats.schema';

// Mock del servicio
const mockPlayerstatsService = {
  initializeStats: jest.fn(),
  updateStats: jest.fn(),
  getStats: jest.fn(),
};

// Mock de la interfaz PlayerStats para tener los campos disponibles en las pruebas
// Asegúrate de que estos campos coincidan con tu esquema real
interface MockPlayerStats {
  playerId?: string;
  matchId?: string;
  // Añade aquí los campos que realmente tienes en tu modelo PlayerStats
  // Por ejemplo:
  assists?: number;
  points?: number;
  rebounds?: number;
  // ... otros campos
}

describe('PlayerstatsController', () => {
  let controller: PlayerstatsController;
  let service: PlayerstatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerstatsController],
      providers: [
        {
          provide: PlayerstatsService,
          useValue: mockPlayerstatsService,
        },
      ],
    }).compile();

    controller = module.get<PlayerstatsController>(PlayerstatsController);
    service = module.get<PlayerstatsService>(PlayerstatsService);
    
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initializePlayerStats', () => {
    it('should call service.initializeStats with correct parameters', async () => {
      // Arrange
      const body = { matchId: 'match123', playerIds: ['player1', 'player2'] };
      const mockResponse = [{ playerId: 'player1' }, { playerId: 'player2' }];
      mockPlayerstatsService.initializeStats.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.initializePlayerStats(body);

      // Assert
      expect(service.initializeStats).toHaveBeenCalledWith('match123', ['player1', 'player2']);
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException if matchId is missing', async () => {
      // Arrange
      const body = { playerIds: ['player1', 'player2'] } as any;

      // Act & Assert
      await expect(controller.initializePlayerStats(body)).rejects.toThrow(BadRequestException);
      expect(service.initializeStats).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if playerIds is missing', async () => {
      // Arrange
      const body = { matchId: 'match123' } as any;

      // Act & Assert
      await expect(controller.initializePlayerStats(body)).rejects.toThrow(BadRequestException);
      expect(service.initializeStats).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if playerIds is empty', async () => {
      // Arrange
      const body = { matchId: 'match123', playerIds: [] };

      // Act & Assert
      await expect(controller.initializePlayerStats(body)).rejects.toThrow(BadRequestException);
      expect(service.initializeStats).not.toHaveBeenCalled();
    });
  });

  describe('updatePlayerStats', () => {
    it('should call service.updateStats with correct parameters', async () => {
      // Arrange
      const id = 'stats123';
      // Usar el tipo correcto para statsUpdate según tu esquema
      const statsUpdate: Partial<MockPlayerStats> = { 
        // Usa campos que realmente existan en tu schema
        points: 2, 
        assists: 1 
      };
      const mockResponse = { id: 'stats123', points: 2, assists: 1 };
      mockPlayerstatsService.updateStats.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.updatePlayerStats(id, statsUpdate as any);

      // Assert
      expect(service.updateStats).toHaveBeenCalledWith(id, statsUpdate);
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException if id is empty', async () => {
      // Arrange
      const id = '';
      const statsUpdate = { points: 2 } as any;

      // Act & Assert
      await expect(controller.updatePlayerStats(id, statsUpdate)).rejects.toThrow(BadRequestException);
      expect(service.updateStats).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if statsUpdate is empty object', async () => {
      // Arrange
      const id = 'stats123';
      const statsUpdate = {};

      // Act & Assert
      await expect(controller.updatePlayerStats(id, statsUpdate)).rejects.toThrow(BadRequestException);
      expect(service.updateStats).not.toHaveBeenCalled();
    });
  });

  describe('getPlayerStats', () => {
    it('should call service.getStats with correct parameters', async () => {
      // Arrange
      const matchId = 'match123';
      const playerIdsString = 'player1,player2';
      const playerIdsArray = ['player1', 'player2'];
      const mockResponse = [{ playerId: 'player1' }, { playerId: 'player2' }];
      mockPlayerstatsService.getStats.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getPlayerStats(matchId, playerIdsString);

      // Assert
      expect(service.getStats).toHaveBeenCalledWith(matchId, playerIdsArray);
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException if matchId is missing', async () => {
      // Act & Assert
      await expect(controller.getPlayerStats(null as any, 'player1,player2')).rejects.toThrow(BadRequestException);
      expect(service.getStats).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if playerIds is missing', async () => {
      // Act & Assert
      await expect(controller.getPlayerStats('match123', null as any)).rejects.toThrow(BadRequestException);
      expect(service.getStats).not.toHaveBeenCalled();
    });
  });
});