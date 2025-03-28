import { Test, TestingModule } from '@nestjs/testing';
import { PlayerstatsService } from './playerstats.service';

describe('PlayerstatsService', () => {
  let service: PlayerstatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerstatsService],
    }).compile();

    service = module.get<PlayerstatsService>(PlayerstatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
