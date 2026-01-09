# Attendance System

## Overview
Tracks employee attendance, including clock-in/out events, lateness, and daily summaries.

## Tables

### `clock_events`
Raw scan data from the attendance machine or app.

```sql
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
```

### `daily_attendance_summary`
Aggregated daily record for reporting.

```sql
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
```

### `late_proofs`
If an employee is late, they must submit a proof.

```sql
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
```

## Logic
- **Clock In/Out**: Employees scan to clock in/out. The system records `clock_events`.
- **Daily Processing**: A background job aggregates `clock_events` into `daily_attendance_summary`.
- **Lateness**: If `clock_in_time` > Shift Start, `is_late` is set to TRUE.
