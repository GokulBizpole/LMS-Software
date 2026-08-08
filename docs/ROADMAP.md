client/
│
├── app/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   │
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │
│   │   ├── partners/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │
│   │   ├── loans/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   ├── pending/
│   │   │   │   └── page.tsx
│   │   │   ├── approved/
│   │   │   │   └── page.tsx
│   │   │   ├── rejected/
│   │   │   │   └── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── schedule/
│   │   │   │       └── page.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── page.tsx
│   │   │   ├── collect/
│   │   │   │   └── page.tsx
│   │   │   └── receipt/
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── expenses/
│   │   │   ├── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   ├── collections/
│   │   │   │   └── page.tsx
│   │   │   ├── loans/
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/
│   │   │   │   └── page.tsx
│   │   │   ├── partners/
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   └── page.tsx
│   │   │   └── profit-loss/
│   │   │       └── page.tsx
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   │
│   │   └── layout.tsx
│   │
│   ├── api/
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── DashboardLayout.tsx
│   │
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Badge.tsx
│   │   ├── Loader.tsx
│   │   ├── Pagination.tsx
│   │   ├── Search.tsx
│   │   └── ConfirmDialog.tsx
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── CollectionChart.tsx
│   │   ├── LoanChart.tsx
│   │   └── RecentPayments.tsx
│   │
│   ├── forms/
│   │   ├── CustomerForm.tsx
│   │   ├── PartnerForm.tsx
│   │   ├── LoanForm.tsx
│   │   ├── PaymentForm.tsx
│   │   └── ExpenseForm.tsx
│   │
│   └── tables/
│       ├── CustomerTable.tsx
│       ├── PartnerTable.tsx
│       ├── LoanTable.tsx
│       ├── PaymentTable.tsx
│       └── ExpenseTable.tsx
│
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── dashboard.service.ts
│   ├── customer.service.ts
│   ├── partner.service.ts
│   ├── loan.service.ts
│   ├── payment.service.ts
│   ├── expense.service.ts
│   ├── report.service.ts
│   └── setting.service.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useCustomers.ts
│   ├── usePartners.ts
│   ├── useLoans.ts
│   ├── usePayments.ts
│   └── useDashboard.ts
│
├── contexts/
│   └── AuthContext.tsx
│
├── lib/
│   ├── axios.ts
│   └── auth.ts
│
├── utils/
│   ├── constants.ts
│   ├── formatCurrency.ts
│   ├── formatDate.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── types/
│   ├── auth.ts
│   ├── customer.ts
│   ├── partner.ts
│   ├── loan.ts
│   ├── payment.ts
│   ├── report.ts
│   └── dashboard.ts
│
├── public/
│   ├── logo.png
│   ├── favicon.ico
│   └── images/
│
├── middleware.ts
├── next.config.ts
├── package.json
└── tsconfig.json




Sprint 1 (Foundation)
Project setup
Theme
Sidebar
Header
Reusable UI components (Button, Input, Card, Table, Modal, Badge)
Sprint 2
Authentication
Dashboard
Sprint 3
Customers
Partners
Sprint 4
Loans (core module)
Sprint 5
Payments
Expenses
Sprint 6
Reports
Settings
Final polish