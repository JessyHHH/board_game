import { Test, TestingModule } from '@nestjs/testing';
import { GomokuController } from './gomoku.controller';

describe('GomokuController', () => {
  let controller: GomokuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GomokuController],
    }).compile();

    controller = module.get<GomokuController>(GomokuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
