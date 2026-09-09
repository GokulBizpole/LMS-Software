// components/dashboard/QuickActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, FilePlus, Wallet, Receipt } from "lucide-react";
import CustomerFormModal from "@/components/customers/CustomerFormModal";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";

const ACTIONS = [
  { key: "customer", label: "Add new customer", icon: UserPlus },
  { key: "loan", label: "Create new loan", icon: FilePlus },
  { key: "payment", label: "Record a payment", icon: Wallet },
  { key: "expense", label: "Log an expense", icon: Receipt },
] as const;

export default function QuickActions() {
  const router = useRouter();
  const [showCustomer, setShowCustomer] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  const handleClick = (key: (typeof ACTIONS)[number]["key"]) => {
    if (key === "customer") setShowCustomer(true);
    else if (key === "expense") setShowExpense(true);
    else if (key === "loan") router.push("/loans/create");
    else if (key === "payment") router.push("/payments/collect");
  };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <h3 className="text-sm font-semibold text-[#1A1A18] mb-4">Quick actions</h3>

      <div className="space-y-2">
        {ACTIONS.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => handleClick(a.key)}
            className="w-full flex items-center gap-2 text-sm font-medium text-[#1A1A18] rounded-lg border border-[#E5E7EB] px-4 py-3 hover:bg-[#F8FAFC] transition-colors"
          >
            <a.icon size={16} className="text-[#45443E]" />
            {a.label}
          </button>
        ))}
      </div>

      <CustomerFormModal
        open={showCustomer}
        onClose={() => setShowCustomer(false)}
        onSaved={() => setShowCustomer(false)}
      />

      <ExpenseFormModal
        open={showExpense}
        onClose={() => setShowExpense(false)}
        onSaved={() => setShowExpense(false)}
      />
    </div>
  );
}
