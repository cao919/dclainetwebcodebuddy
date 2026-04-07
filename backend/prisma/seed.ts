import { PrismaClient, TaskStatus, TaskStage, StageStatus, CreativeType, CreativeStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始添加测试数据...');

  // 获取或创建测试用户
  let user = await prisma.user.findFirst({
    where: { email: 'admin@example.com' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: '管理员',
        role: 'admin',
        auth0Id: `local_${Date.now()}_admin`,
      }
    });
    console.log('创建测试用户:', user.email);
  }

  // 创建营销任务
  const tasks = [
    {
      name: '春季新品推广活动',
      description: '针对春季新品的全渠道营销推广活动',
      status: TaskStatus.active,
      budget: 50000.00,
      targetAudience: {
        ageRange: '25-40',
        gender: 'all',
        interests: ['科技', '生活方式'],
        location: ['一线城市']
      },
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-04-30'),
    },
    {
      name: '618大促预热',
      description: '618购物节预热营销活动',
      status: TaskStatus.draft,
      budget: 100000.00,
      targetAudience: {
        ageRange: '18-45',
        gender: 'all',
        interests: ['购物', '优惠'],
        location: ['全国']
      },
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-06-20'),
    },
    {
      name: '品牌认知度提升',
      description: '提升品牌在目标用户中的认知度',
      status: TaskStatus.completed,
      budget: 30000.00,
      targetAudience: {
        ageRange: '20-35',
        gender: 'all',
        interests: ['品牌', '品质生活'],
        location: ['一线城市', '二线城市']
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-02-28'),
    },
    {
      name: '暑期学生优惠',
      description: '针对学生群体的暑期优惠活动',
      status: TaskStatus.draft,
      budget: 20000.00,
      targetAudience: {
        ageRange: '16-25',
        gender: 'all',
        interests: ['学习', '娱乐'],
        location: ['全国']
      },
      startDate: new Date('2025-06-15'),
      endDate: new Date('2025-08-31'),
    },
    {
      name: '双十一预售',
      description: '双十一预售活动营销',
      status: TaskStatus.active,
      budget: 150000.00,
      targetAudience: {
        ageRange: '18-50',
        gender: 'all',
        interests: ['购物', '折扣'],
        location: ['全国']
      },
      startDate: new Date('2025-10-20'),
      endDate: new Date('2025-11-11'),
    }
  ];

  for (const taskData of tasks) {
    const existingTask = await prisma.marketingTask.findFirst({
      where: { name: taskData.name }
    });

    if (!existingTask) {
      const task = await prisma.marketingTask.create({
        data: {
          ...taskData,
          createdBy: user.email,
          userId: user.id,
        }
      });
      console.log('创建营销任务:', task.name);

      // 为每个任务创建阶段输出
      const stages = [
        {
          stage: TaskStage.data_collection,
          status: StageStatus.completed,
          output: {
            marketSize: '目标市场规模约500万用户',
            competitorAnalysis: '主要竞争对手3家，市场份额分别为30%、25%、20%',
            userInsights: '用户最关注产品功能和价格',
            dataSources: ['社交媒体', '问卷调查', '行业报告']
          }
        },
        {
          stage: TaskStage.market_analysis,
          status: StageStatus.completed,
          output: {
            swotAnalysis: {
              strengths: ['产品技术领先', '品牌知名度高'],
              weaknesses: ['价格偏高', '渠道覆盖不足'],
              opportunities: ['市场需求增长', '政策支持'],
              threats: ['竞争加剧', '经济下行']
            },
            trends: ['个性化定制', '绿色环保', '智能化'],
            recommendations: ['加强渠道建设', '优化定价策略']
          }
        },
        {
          stage: TaskStage.strategy,
          status: taskData.status === TaskStatus.draft ? StageStatus.pending : StageStatus.completed,
          output: {
            positioning: '高端智能生活品牌',
            messaging: '科技让生活更美好',
            channels: ['社交媒体', '搜索引擎', '线下活动'],
            kpis: {
              reach: 1000000,
              engagement: 50000,
              conversion: 5000
            }
          }
        }
      ];

      for (const stageData of stages) {
        await prisma.taskStageOutput.create({
          data: {
            ...stageData,
            taskId: task.id,
          }
        });
      }
      console.log(`  - 创建 ${stages.length} 个阶段输出`);

      // 为进行中和已完成的任务创建创意
      if (taskData.status !== TaskStatus.draft) {
        const creatives = [
          {
            type: CreativeType.text,
            title: '主标题文案',
            content: {
              headline: '发现更好的自己',
              subheadline: '科技赋能，品质生活',
              cta: '立即体验'
            },
            aiModel: 'GPT-4',
            status: CreativeStatus.approved,
          },
          {
            type: CreativeType.image,
            title: '主视觉图片',
            content: {
              description: '现代都市生活场景，展示产品使用情境',
              style: '写实风格，暖色调',
              dimensions: '1200x628'
            },
            aiModel: 'DALL-E 3',
            status: CreativeStatus.approved,
          },
          {
            type: CreativeType.video,
            title: '15秒短视频',
            content: {
              duration: '15s',
              script: '开场3秒吸引注意，中间展示产品功能，结尾CTA',
              scenes: 3
            },
            aiModel: 'Sora',
            status: CreativeStatus.pending,
          }
        ];

        for (const creativeData of creatives) {
          await prisma.adCreative.create({
            data: {
              ...creativeData,
              taskId: task.id,
            }
          });
        }
        console.log(`  - 创建 ${creatives.length} 个创意`);
      }
    }
  }

  console.log('\n测试数据添加完成！');
}

main()
  .catch((e) => {
    console.error('添加测试数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
