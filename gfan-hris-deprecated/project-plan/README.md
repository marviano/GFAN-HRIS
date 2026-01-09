# GFAN HRIS System Documentation

This folder contains the instructions and specifications for the GFAN HRIS (Human Resource Information System).

## Structure

- **[Database Schema](database-table.md)**: The complete database schema for the application.
- **[Approval Workflow](Approval.md)**: Details on the approval process, workflows, and history.
- **[Attendance System](Attendance.md)**: Specifications for attendance tracking, clock-in/out, and daily summaries.
- **[Leave Management](Leave%20Request.md)**: Instructions for leave requests, types, and balances.

## Core Concepts

### Users & Roles
The system uses a Role-Based Access Control (RBAC) system defined in `users`, `roles`, and `permissions`.

### Organizations
Multi-tenancy is supported via the `organizations` table.

### Employees
Employees are linked to Users and belong to Divisions.
