import { Test, TestingModule } from '@nestjs/testing';
import { PlayerstatsController } from './playerstats.controller';

describe('PlayerstatsController', () => {
  let controller: PlayerstatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerstatsController],
    }).compile();

    controller = module.get<PlayerstatsController>(PlayerstatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
