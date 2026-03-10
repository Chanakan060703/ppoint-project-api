import { Test, TestingModule } from '@nestjs/testing';
import { UsertokenController } from './usertoken.controller';
import { UsertokenService } from './usertoken.service';

describe('UsertokenController', () => {
  let controller: UsertokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsertokenController],
      providers: [UsertokenService],
    }).compile();

    controller = module.get<UsertokenController>(UsertokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
