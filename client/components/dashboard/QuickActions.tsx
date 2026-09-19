// components/dashboard/QuickActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, FilePlus, Wallet, Receipt } from "lucide-react";
import CustomerFormModal from "@/components/customers/CustomerFormModal";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";

const ACTIONS = [
  { key: "customer", label: "Add new customer", icon: UserPlus, bg: "#FCE4E4", color: "#E31E24" },
  { key: "loan", label: "Create new loan", icon: FilePlus, bg: "#FCE4E4", color: "#E31E24" },
  { key: "payment", label: "Record a payment", icon: Wallet, bg: "#FCE4E4", color: "#E31E24" },
  { key: "expense", label: "Log an expense", icon: Receipt, bg: "#FCE4E4", color: "#E31E24" },
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
            className="w-full flex items-center gap-3 text-sm font-medium text-[#1A1A18] rounded-lg border border-[#E5E7EB] px-3 py-2.5 hover:bg-[#F8FAFC] transition-colors"
          >
            <span
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: a.bg, color: a.color }}
            >
              <a.icon size={15} />
            </span>
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
