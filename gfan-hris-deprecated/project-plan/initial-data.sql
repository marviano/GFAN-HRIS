-- ============================================================
-- GFAN HRIS - Initial Data Setup
-- ============================================================
-- This script creates the initial required data to break circular dependencies
-- Execute this AFTER creating all tables
-- ============================================================

-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Insert default organization (without owner for now)
INSERT INTO organizations (id, name, slug, owner_user_id, subscription_status, subscription_plan)
VALUES (1, 'Default Organization', 'default', 1, 'active', 'basic')
ON DUPLICATE KEY UPDATE name = 'Default Organization';

-- Insert default role
INSERT INTO roles (id, name, description, organization_id)
VALUES (1, 'User', 'Default user role', 1)
ON DUPLICATE KEY UPDATE name = 'User';

-- Insert admin role
INSERT INTO roles (id, name, description, organization_id)
VALUES (2, 'Admin', 'Administrator role', 1)
ON DUPLICATE KEY UPDATE name = 'Admin';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Verification
-- ============================================================
-- Check that the data was inserted
SELECT 'Organizations:' as 'Table';
SELECT * FROM organizations;

SELECT 'Roles:' as 'Table';
SELECT * FROM roles;

-- ============================================================
-- END OF INITIAL DATA SETUP
-- ============================================================
