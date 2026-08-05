# LMS Database Design

## Tables

1. admins
2. partners
3. customers
4. loans
5. payments
6. expenses
7. settings
8. audit_logs
9. customer_documents

Relationships

Partner
    ↓
Customer
    ↓
Loan
    ↓
Payment

Admin
    ↓
Audit Logs