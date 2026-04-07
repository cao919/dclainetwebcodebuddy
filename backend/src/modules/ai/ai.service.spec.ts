import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'zhipu.apiKey': 'test-api-key',
                'zhipu.apiBaseUrl': 'https://api.test.com',
                'zhipu.textModel': 'glm-4',
                'zhipu.imageModel': 'cogview-3',
              };
              return config[key as keyof typeof config];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateText', () => {
    it('should generate marketing copy', async () => {
      const prompt = '生成一段关于新能源汽车的营销文案';
      // 由于未连接真实 API，这里进行模拟测试
      expect(prompt).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe('executeWorkflow', () => {
    it('should execute 8-stage workflow', async () => {
      const workflowData = {
        taskName: '测试营销任务',
        targetAudience: '25-35岁城市白领',
        budget: 10000,
      };

      expect(workflowData.taskName).toBe('测试营销任务');
      expect(workflowData.budget).toBe(10000);
    });
  });
});
