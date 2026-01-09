# Approval System

## Overview
The approval system handles various requests (Leave, Overtime, etc.) through a defined workflow.

## Tables

### `approval_history`
Tracks the history of actions taken on a request.

```sql
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
```

### `request_workflows`
Defines the steps required for different types of requests.

```sql
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
```

## Logic
1.  When a request is created, the system checks `request_workflows` for the first step.
2.  An entry is created in `approval_history` with status `pending`.
3.  The designated approver (Role or Division Head) reviews the request.
4.  Upon approval, the system checks for the next step.
5.  If no more steps, the request is fully approved.
