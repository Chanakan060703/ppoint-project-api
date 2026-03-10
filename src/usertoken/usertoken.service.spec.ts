import { Test, TestingModule } from '@nestjs/testing';
import { UsertokenService } from './usertoken.service';

describe('UsertokenService', () => {
  let service: UsertokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsertokenService],
    }).compile();

    service = module.get<UsertokenService>(UsertokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
