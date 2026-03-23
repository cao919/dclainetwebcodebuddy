-- 营销AI智能体系统数据库初始化脚本
-- 创建时间: $(date)
-- 版本: 1.0.0

-- ========================================
-- 1. 创建扩展
-- ========================================

-- UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 文本相似度扩展
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 全文搜索扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 2. 创建自定义类型和函数
-- ========================================

-- 创建任务状态类型
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM (
            'draft',      -- 草稿
            'active',     -- 进行中
            'paused',     -- 已暂停
            'completed',  -- 已完成
            'failed',     -- 已失败
            'cancelled'   -- 已取消
        );
    END IF;
END $$;

-- 创建任务阶段类型
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_stage') THEN
        CREATE TYPE task_stage AS ENUM (
            'data_collection',   -- 1. 数据收集
            'market_analysis',   -- 2. 市场分析
            'strategy',          -- 3. 策略制定
            'planning',          -- 4. 计划编排
            'creative',          -- 5. 创意生成
            'execution',         -- 6. 执行部署
            'analysis',          -- 7. 效果分析
            'optimization'       -- 8. 优化迭代
        );
    END IF;
END $$;

-- 创建阶段状态类型
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stage_status') THEN
        CREATE TYPE stage_status AS ENUM (
            'pending',     -- 等待中
            'processing',  -- 处理中
            'completed',   -- 已完成
            'failed',      -- 已失败
            'skipped'      -- 已跳过
        );
    END IF;
END $$;

-- 创建创意类型
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creative_type') THEN
        CREATE TYPE creative_type AS ENUM (
            'text',       -- 文本创意
            'image',      -- 图片创意
            'video',      -- 视频创意
            'composite',  -- 复合创意
            'carousel',   -- 轮播创意
            'story'       -- 故事创意
        );
    END IF;
END $$;

-- 创建创意状态类型
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creative_status') THEN
        CREATE TYPE creative_status AS ENUM (
            'draft',      -- 草稿
            'pending',    -- 待审核
            'approved',   -- 已批准
            'rejected',   -- 已拒绝
            'published',  -- 已发布
            'archived'    -- 已归档
        );
    END IF;
END $$;

-- 创建用户角色类型
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'admin',      -- 管理员
            'manager',    -- 经理
            'marketer',   -- 营销专员
            'analyst',    -- 分析师
            'user',       -- 普通用户
            'guest'       -- 访客
        );
    END IF;
END $$;

-- ========================================
-- 3. 创建辅助函数
-- ========================================

-- 生成随机字符串函数
CREATE OR REPLACE FUNCTION generate_random_string(length INTEGER)
RETURNS TEXT AS $$
DECLARE
    chars TEXT[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..length LOOP
        result := result || chars[1+random()*(array_length(chars, 1)-1)];
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 计算任务进度函数
CREATE OR REPLACE FUNCTION calculate_task_progress(task_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completed_stages INTEGER;
    total_stages CONSTANT INTEGER := 8;
BEGIN
    SELECT COUNT(*)
    INTO completed_stages
    FROM task_stage_output
    WHERE task_stage_output.task_id = task_id
      AND task_stage_output.status = 'completed';
    
    RETURN (completed_stages * 100) / total_stages;
END;
$$ LANGUAGE plpgsql;

-- 计算创意ROI函数
CREATE OR REPLACE FUNCTION calculate_creative_roi(creative_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_spend NUMERIC;
    total_revenue NUMERIC;
BEGIN
    -- 获取总花费
    SELECT COALESCE(SUM((metrics->>'spend')::NUMERIC), 0)
    INTO total_spend
    FROM marketing_performance
    WHERE marketing_performance.creative_id = creative_id;
    
    -- 获取总收入（假设每个转化价值100元）
    SELECT COALESCE(SUM((metrics->>'conversions')::NUMERIC * 100), 0)
    INTO total_revenue
    FROM marketing_performance
    WHERE marketing_performance.creative_id = creative_id;
    
    -- 计算ROI: (收入 - 花费) / 花费 * 100%
    IF total_spend > 0 THEN
        RETURN ((total_revenue - total_spend) / total_spend) * 100;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. 创建视图
-- ========================================

-- 任务概览视图
CREATE OR REPLACE VIEW task_overview AS
SELECT 
    mt.id AS task_id,
    mt.name AS task_name,
    mt.status AS task_status,
    mt.created_at AS task_created_at,
    COUNT(DISTINCT tso.id) FILTER (WHERE tso.status = 'completed') AS stages_completed,
    8 AS total_stages,
    COUNT(DISTINCT ac.id) AS creatives_count,
    MAX(tso.updated_at) AS last_stage_update
FROM marketing_task mt
LEFT JOIN task_stage_output tso ON mt.id = tso.task_id
LEFT JOIN ad_creative ac ON mt.id = ac.task_id
GROUP BY mt.id, mt.name, mt.status, mt.created_at;

-- 创意效果视图
CREATE OR REPLACE VIEW creative_performance_view AS
SELECT 
    ac.id AS creative_id,
    ac.title AS creative_title,
    ac.type AS creative_type,
    mt.id AS task_id,
    mt.name AS task_name,
    SUM((mp.metrics->>'impressions')::INTEGER) AS impressions,
    SUM((mp.metrics->>'clicks')::INTEGER) AS clicks,
    SUM((mp.metrics->>'conversions')::INTEGER) AS conversions,
    CASE 
        WHEN SUM((mp.metrics->>'impressions')::INTEGER) > 0 
        THEN (SUM((mp.metrics->>'clicks')::INTEGER)::NUMERIC / SUM((mp.metrics->>'impressions')::INTEGER)::NUMERIC) * 100
        ELSE 0 
    END AS ctr,
    CASE 
        WHEN SUM((mp.metrics->>'clicks')::INTEGER) > 0 
        THEN (SUM((mp.metrics->>'conversions')::INTEGER)::NUMERIC / SUM((mp.metrics->>'clicks')::INTEGER)::NUMERIC) * 100
        ELSE 0 
    END AS conversion_rate,
    SUM((mp.metrics->>'spend')::NUMERIC) AS spend,
    calculate_creative_roi(ac.id) AS roi,
    MIN(mp.period_start) AS period_start,
    MAX(mp.period_end) AS period_end
FROM ad_creative ac
JOIN marketing_task mt ON ac.task_id = mt.id
LEFT JOIN marketing_performance mp ON ac.id = mp.creative_id
GROUP BY ac.id, ac.title, ac.type, mt.id, mt.name;

-- ========================================
-- 5. 创建索引（Prisma会自动创建，这里只创建额外索引）
-- ========================================

-- 全文搜索索引（如果需要）
-- CREATE INDEX idx_marketing_task_name_gin ON marketing_task USING gin(to_tsvector('english', name));
-- CREATE INDEX idx_ad_creative_title_gin ON ad_creative USING gin(to_tsvector('english', title));

-- ========================================
-- 6. 插入初始数据
-- ========================================

-- 插入系统配置
INSERT INTO system_config (key, value, description, is_public) VALUES
('system.version', '"1.0.0"', '系统版本', true),
('ai.enabled', 'true', '是否启用AI功能', true),
('file.upload.max_size', '10485760', '最大文件上传大小（字节）', true),
('task.default_stages', '["data_collection","market_analysis","strategy","planning","creative","execution","analysis","optimization"]', '默认任务阶段', false),
('creative.default_types', '["text","image","video","composite"]', '默认创意类型', true),
('analytics.retention_days', '365', '数据分析保留天数', false)
ON CONFLICT (key) DO NOTHING;

-- 插入默认管理员用户（实际用户从Auth0同步）
INSERT INTO users (auth0_id, email, name, role) VALUES
('auth0|admin', 'admin@marketing-ai.com', '系统管理员', 'admin'),
('auth0|manager', 'manager@marketing-ai.com', '项目经理', 'manager'),
('auth0|marketer', 'marketer@marketing-ai.com', '营销专员', 'marketer')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 7. 创建审计触发器
-- ========================================

-- 创建审计日志函数
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_data)
        VALUES (NEW.created_by, 'CREATE', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_data, new_data)
        VALUES (NEW.updated_by, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_data)
        VALUES (OLD.updated_by, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 为关键表创建审计触发器
CREATE TRIGGER audit_marketing_task
    AFTER INSERT OR UPDATE OR DELETE ON marketing_task
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_ad_creative
    AFTER INSERT OR UPDATE OR DELETE ON ad_creative
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ========================================
-- 8. 权限配置
-- ========================================

-- 为应用用户授予权限
GRANT USAGE ON SCHEMA public TO marketing_ai_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO marketing_ai_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO marketing_ai_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO marketing_ai_user;

-- 授予视图访问权限
GRANT SELECT ON task_overview TO marketing_ai_user;
GRANT SELECT ON creative_performance_view TO marketing_ai_user;

-- ========================================
-- 9. 完成消息
-- ========================================

DO $$ 
BEGIN
    RAISE NOTICE '营销AI智能体系统数据库初始化完成';
    RAISE NOTICE '创建的表: marketing_task, task_stage_output, ad_creative, marketing_performance, users, system_config, audit_log';
    RAISE NOTICE '创建的视图: task_overview, creative_performance_view';
    RAISE NOTICE '创建的函数: calculate_task_progress, calculate_creative_roi, generate_random_string';
    RAISE NOTICE '创建的触发器: audit_marketing_task, audit_ad_creative';
END $$;