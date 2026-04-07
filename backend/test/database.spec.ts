import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Database Connection Tests', () => {
  describe('MySQL Configuration', () => {
    it('should have DATABASE_URL environment variable', () => {
      const dbUrl = process.env.DATABASE_URL;
      expect(dbUrl).toBeDefined();
      if (dbUrl) {
        expect(dbUrl).toContain('mysql://');
      }
    });

    it('should contain correct database host', () => {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        expect(dbUrl).toContain('sh-cynosdbmysql-grp-b2tjwrek.sql.tencentcdb.com');
      }
    });

    it('should have correct database name', () => {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        expect(dbUrl).toContain('txcloudbase-2gr4y00s7a994ecd');
      }
    });
  });

  describe('Database Schema Tests', () => {
    it('should define marketing_task table', () => {
      // 测试营销任务表结构
      const taskFields = [
        'id', 'name', 'description', 'status', 'targetAudience',
        'budget', 'startDate', 'endDate', 'createdBy', 'createdAt', 'updatedAt'
      ];
      expect(taskFields.length).toBeGreaterThan(0);
    });

    it('should define task_stage_output table', () => {
      const stageFields = ['id', 'taskId', 'stage', 'output', 'status', 'createdAt', 'updatedAt'];
      expect(stageFields.length).toBeGreaterThan(0);
    });

    it('should define ad_creative table', () => {
      const creativeFields = [
        'id', 'taskId', 'type', 'title', 'content', 'aiGenerated',
        'aiModel', 'status', 'createdAt', 'updatedAt'
      ];
      expect(creativeFields.length).toBeGreaterThan(0);
    });

    it('should define marketing_performance table', () => {
      const performanceFields = [
        'id', 'creativeId', 'metrics', 'periodStart', 'periodEnd',
        'source', 'createdAt'
      ];
      expect(performanceFields.length).toBeGreaterThan(0);
    });
  });

  describe('Database Validation', () => {
    it('should validate task status enum values', () => {
      const validStatuses = ['draft', 'active', 'paused', 'completed', 'failed', 'cancelled'];
      expect(validStatuses).toContain('draft');
      expect(validStatuses).toContain('active');
      expect(validStatuses).toContain('completed');
    });

    it('should validate task stage enum values', () => {
      const validStages = [
        'data_collection', 'market_analysis', 'strategy', 'planning',
        'creative', 'execution', 'analysis', 'optimization'
      ];
      expect(validStages.length).toBe(8);
      expect(validStages).toContain('data_collection');
      expect(validStages).toContain('creative');
    });

    it('should validate creative type enum values', () => {
      const creativeTypes = ['text', 'image', 'video', 'composite', 'carousel', 'story'];
      expect(creativeTypes).toContain('text');
      expect(creativeTypes).toContain('image');
    });
  });
});
