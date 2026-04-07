import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let app: TestingModule;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture;
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should load configuration', () => {
    expect(app).toBeDefined();
  });
});

