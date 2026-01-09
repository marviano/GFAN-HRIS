# Leave Management

## Overview
Manages employee leave requests, balances, and approvals.

## Tables

### `leave_requests`
Stores the details of a leave request.

```sql
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
```

### `absent_permissions`
For short-term absences or specific permissions.

```sql
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
```

## Logic
1.  Employee submits a `leave_request`.
2.  System checks leave balance (logic to be implemented).
3.  Request goes through the **Approval Workflow**.
4.  Upon approval, the days are deducted from the balance.
