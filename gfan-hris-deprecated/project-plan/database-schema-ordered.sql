-- ============================================================
-- GFAN HRIS Database Schema - Properly Ordered
-- ============================================================
-- Execute this script in order to avoid foreign key constraint errors
-- ============================================================

-- STEP 1: Create tables with NO foreign key dependencies first
-- ============================================================

CREATE TABLE `permission_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `organization_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `permission_categories_ibfk_1` (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `request_workflows` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `workflow_name` VARCHAR(100) NOT NULL COMMENT 'e.g., Leave Request Workflow',
  `step_order` INT NOT NULL COMMENT '1, 2, 3...',
  `step_name` VARCHAR(100) NOT NULL COMMENT 'e.g., Division Head Approval',
  `approver_role_id` INT DEFAULT NULL COMMENT 'If approval is based on role',
  `approver_division_head` BOOLEAN DEFAULT FALSE COMMENT 'If true, dynamic approval by division head',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ============================================================
-- STEP 2: Create core tables (organizations, users, roles)
-- Note: These have circular dependencies, so we'll create them
-- without foreign keys first, then add constraints later
-- ============================================================

CREATE TABLE `organizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `owner_user_id` int NOT NULL,
  `subscription_status` enum('trial','active','inactive','cancelled') DEFAULT 'trial',
  `subscription_plan` varchar(50) DEFAULT 'basic',
  `trial_ends_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `owner_user_id` (`owner_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `organization_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_roles_organization` (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role_id` int NOT NULL,
  `organization_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `googleId` (`googleId`),
  KEY `role_id` (`role_id`),
  KEY `idx_users_organization` (`organization_id`),
  KEY `idx_users_email_password` (`email`,`password`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb3;

-- ============================================================
-- STEP 3: Add foreign key constraints for core tables
-- ============================================================

ALTER TABLE `organizations`
  ADD CONSTRAINT `organizations_ibfk_1` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`);

ALTER TABLE `roles`
  ADD CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

ALTER TABLE `permission_categories`
  ADD CONSTRAINT `permission_categories_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

-- ============================================================
-- STEP 4: Create management groups and businesses
-- ============================================================

CREATE TABLE `management_groups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `organization_id` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mgmt_org` (`organization_id`),
  CONSTRAINT `fk_mgmt_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `businesses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `permission_name` varchar(255) NOT NULL,
  `organization_id` int NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `management_group_id` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permission_name` (`permission_name`),
  KEY `idx_businesses_organization` (`organization_id`),
  KEY `idx_businesses_management_group` (`management_group_id`),
  KEY `idx_businesses_status` (`status`),
  CONSTRAINT `businesses_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `businesses_ibfk_3` FOREIGN KEY (`management_group_id`) REFERENCES `management_groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3;

-- ============================================================
-- STEP 5: Create permissions
-- ============================================================

CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `category_id` int DEFAULT NULL,
  `organization_id` int DEFAULT NULL,
  `business_id` int DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `category_id` (`category_id`),
  KEY `idx_permissions_organization` (`organization_id`),
  KEY `idx_permissions_status` (`status`),
  KEY `idx_permissions_business` (`business_id`),
  CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `permission_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `permissions_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_ibfk_3` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=234 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `role_permissions` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ============================================================
-- STEP 6: Create employees and divisions
-- Note: These also have circular dependency, create without FK first
-- ============================================================

CREATE TABLE `divisions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `division_name` VARCHAR(100) NOT NULL,
  `head_employee_id` INT NOT NULL COMMENT 'FK to employees.id - The ID of the Division Head.',
  PRIMARY KEY (`id`),
  KEY `head_employee_id` (`head_employee_id`)
) ENGINE=InnoDB;

CREATE TABLE `employees` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL COMMENT 'FK to users.id - The login identity.',
    `name` VARCHAR(255) NOT NULL,
    `division_id` INT NOT NULL COMMENT 'FK to divisions.id - Crucial for routing approval to the Division Head.',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_employee_user` (`user_id`),
    KEY `division_id` (`division_id`)
) ENGINE=InnoDB;

-- Add foreign keys for employees and divisions
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employee_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employee_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON UPDATE CASCADE;

ALTER TABLE `divisions`
  ADD CONSTRAINT `fk_division_head_employee` FOREIGN KEY (`head_employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE;

-- ============================================================
-- STEP 7: Create employee-related request tables
-- ============================================================

CREATE TABLE `leave_requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL COMMENT 'FK to employees.id - The employee requesting the leave.',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `reason` TEXT NOT NULL,
  `leave_type` ENUM('annual', 'special', 'unpaid') NOT NULL COMMENT 'Maps to Cuti Tahunan/Khusus',
  `replacement_employee_id` INT DEFAULT NULL COMMENT 'FK to employees.id - The employee covering the duties.',
  `on_leave_contact_phone` VARCHAR(30) DEFAULT NULL COMMENT 'No Telp yang bisa dihubungi',
  `status` ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_leave_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_leave_replacement` FOREIGN KEY (`replacement_employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `late_proofs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL COMMENT 'FK to employees.id - The employee who was late.',
  `date_of_late` DATE NOT NULL,
  `proof_file_url` VARCHAR(255) DEFAULT NULL COMMENT 'Link to uploaded proof document/image.',
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_late_employee` (`employee_id`),
  CONSTRAINT `fk_late_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `early_exit_requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `date_of_exit` DATE NOT NULL,
  `requested_exit_time` TIME NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_exit_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `vehicle_loans` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `vehicle_type` VARCHAR(100) NOT NULL COMMENT 'e.g., Car, Motorcycle, Van.',
  `loan_start_datetime` DATETIME NOT NULL,
  `loan_end_datetime` DATETIME NOT NULL,
  `purpose` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_loan_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `overtime_orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `overtime_date` DATE NOT NULL,
  `estimated_hours` DECIMAL(4, 2) NOT NULL,
  `task_description` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_overtime_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `shift_swaps` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL COMMENT 'FK to employees.id - The employee initiating the swap.',
  `swap_with_id` INT NOT NULL COMMENT 'FK to employees.id - The employee agreeing to the swap.',
  `requester_shift_date` DATE NOT NULL,
  `swap_shift_date` DATE NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_swap_requester` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_swap_partner` FOREIGN KEY (`swap_with_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `absent_permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `absent_date` DATE NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_absent_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- STEP 8: Create attendance tracking tables
-- ============================================================

CREATE TABLE `clock_events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL COMMENT 'FK to employees.id',
  `scan_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `scan_type` ENUM('IN', 'OUT') NOT NULL COMMENT 'Calculated based on sequence',
  `raw_input_data` VARCHAR(255) DEFAULT NULL COMMENT 'Optional: Barcode/Scanner data for audit',
  PRIMARY KEY (`id`),
  KEY `idx_employee_time` (`employee_id`, `scan_time`),
  CONSTRAINT `fk_clock_event_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `daily_attendance_summary` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `attendance_date` DATE NOT NULL,
  `clock_in_time` TIME DEFAULT NULL,
  `clock_out_time` TIME DEFAULT NULL,
  `total_hours` DECIMAL(4, 2) DEFAULT 0.00,
  `is_late` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_early_exit` BOOLEAN NOT NULL DEFAULT FALSE,
  `exception_flag` VARCHAR(50) DEFAULT NULL COMMENT 'e.g., LATE, ABSENT, INCOMPLETE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_daily_record` (`employee_id`, `attendance_date`),
  CONSTRAINT `fk_summary_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- STEP 9: Create approval history
-- ============================================================

CREATE TABLE `approval_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `item_type` VARCHAR(50) NOT NULL,
  `item_id` INT NOT NULL COMMENT 'The PK of the specific request (e.g., leave_requests.id).',
  `workflow_step_id` INT NOT NULL COMMENT 'FK to request_workflows.id - Which defined step this record is for.',
  `approver_id` INT DEFAULT NULL COMMENT 'FK to users.id - The actual user who took action.',
  `status` ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `action_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `idx_item_workflow` (`item_type`, `item_id`),
  CONSTRAINT `fk_workflow_step` FOREIGN KEY (`workflow_step_id`) REFERENCES `request_workflows` (`id`)
) ENGINE=InnoDB;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
