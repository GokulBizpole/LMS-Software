// components/customers/CustomerViewModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  ViewModalShell,
  ViewModalSummary,
  ViewModalTabs,
  ViewModalSection,
  ViewModalField,
  ViewModalFooterStrip,
} from "@/components/ui/ViewModal";
import { deleteCustomer, getCustomerById } from "@/services/customer.service";
import { getLoans } from "@/services/loan.service";
import { getPayments } from "@/services/payment.service";
import CustomerFormModal from "@/components/customers/CustomerFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoanTable from "@/components/tables/LoanTable";
import PaymentTable from "@/components/tables/PaymentTable";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { Customer } from "@/types/customer";
import type { Loan } from "@/types/loan";
import type { Payment } from "@/types/payment";
import { formatDate } from "@/utils/formatDate";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "loans", label: "Loans" },
  { key: "payments", label: "Payments" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function StatusBadge({ status }: { status: Customer["status"] }) {
  const map: Record<Customer["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    BLOCKED: { bg: "#FAEEDA", text: "#854F0B" },
    CLOSED: { bg: "#ECE9DF", text: "#45443E" },
  };
  const c = map[status] ?? map.CLOSED;
  return (
    <span className="text-xs font-medium px-2 py-1 rounded-md" style={{ backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

export default function CustomerViewModal({
  open,
  customerId,
  onClose,
  onChanged,
  onDeleted,
}: {
  open: boolean;
  customerId: string | null;
  onClose: () => void;
  onChanged?: () => void;
  onDeleted?: (id: string) => void;
}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  const [loans, setLoans] = useState<Loan[] | null>(null);
  const [loansLoading, setLoansLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open || !customerId) return;

    const load = () => {
      setTab("overview");
      setLoans(null);
      setPayments(null);
      setLoading(true);
      setError(null);
      setDeleting(false);
      setShowDeleteConfirm(false);
      getCustomerById(customerId)
        .then(setCustomer)
        .catch((err) => {
          console.error(err);
          setError("Could not load customer.");
        })
        .finally(() => setLoading(false));
    };
    load();
  }, [open, customerId]);

  useEffect(() => {
    if (!open || !customerId) return;

    const loadTabData = () => {
      if (tab === "loans" && loans === null) {
        setLoansLoading(true);
        getLoans({ customerId, limit: 50 })
          .then((res) => setLoans(res.loans))
          .catch(() => setLoans([]))
          .finally(() => setLoansLoading(false));
      }
      if (tab === "payments" && payments === null) {
        setPaymentsLoading(true);
        getPayments({ customerId, limit: 50 })
          .then((res) => setPayments(res.payments))
          .catch(() => setPayments([]))
          .finally(() => setPaymentsLoading(false));
      }
    };
    loadTabData();
  }, [open, customerId, tab, loans, payments]);

  const handleDelete = async () => {
    if (!customer) return;
    const deletedId = customer.id;
    setDeleting(true);
    try {
      const { message } = await deleteCustomer(deletedId);
      toast.success(message);
      setShowDeleteConfirm(false);
      onDeleted?.(deletedId);
      onChanged?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete customer. Please try again."));
    } finally {
      setDeleting(false);
    }
  };

  const initials = customer?.name
    ? customer.name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      <ViewModalShell
        open={open}
        onClose={onClose}
        title="View Customer"
        maxWidth="max-w-3xl"
        actions={
          customer && (
            <>
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="text-sm font-medium px-3 py-1.5 rounded-lg border border-[#9C9A8D] text-[#45443E] hover:bg-[#ECE9DF]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-[#993C1D] text-[#993C1D] hover:bg-[#FAECE7]"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </>
          )
        }
      >
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-16 bg-[#ECE9DF] rounded-xl" />
            <div className="h-32 bg-[#ECE9DF] rounded-xl" />
          </div>
        ) : error || !customer ? (
          <div className="p-6 text-center text-sm text-[#993C1D]">{error ?? "Customer not found."}</div>
        ) : (
          <>
            <ViewModalSummary
              initials={initials}
              avatarBg="#FAECE7"
              avatarColor="#993C1D"
              name={customer.name}
              badge={<StatusBadge status={customer.status} />}
              subtitle={`${customer.customerCode} · ${customer.phone}`}
            />

            <ViewModalTabs tabs={[...TABS]} active={tab} onChange={(k) => setTab(k as TabKey)} />

            <div className="p-6 space-y-4">
              {tab === "overview" && (
                <>
                  <ViewModalSection title="Personal Details">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <ViewModalField label="Phone" value={customer.phone} />
                      <ViewModalField label="Alternate phone" value={customer.alternatePhone} />
                      <ViewModalField label="Aadhaar number" value={customer.aadhaarNumber} />
                      <ViewModalField label="PAN number" value={customer.panNumber} />
                      <ViewModalField label="Address" value={customer.address} />
                      <ViewModalField label="City" value={customer.city} />
                      <ViewModalField label="State" value={customer.state} />
                      <ViewModalField label="Pincode" value={customer.pincode} />
                    </div>
                  </ViewModalSection>

                  <ViewModalSection title="Guarantor">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <ViewModalField label="Guarantor name" value={customer.guarantorName} />
                      <ViewModalField label="Guarantor phone" value={customer.guarantorPhone} />
                    </div>
                  </ViewModalSection>
                </>
              )}

              {tab === "loans" &&
                (loansLoading ? (
                  <div className="h-24 bg-[#ECE9DF] rounded-xl animate-pulse" />
                ) : (
                  <LoanTable loans={loans ?? []} />
                ))}

              {tab === "payments" &&
                (paymentsLoading ? (
                  <div className="h-24 bg-[#ECE9DF] rounded-xl animate-pulse" />
                ) : (
                  <PaymentTable payments={payments ?? []} />
                ))}
            </div>

            {tab === "overview" && (
              <ViewModalFooterStrip
                registered={formatDate(customer.createdAt)}
                updated={formatDate(customer.updatedAt)}
              />
            )}
          </>
        )}
      </ViewModalShell>

      {customer && (
        <CustomerFormModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          customer={customer}
          onSaved={(updated) => {
            setCustomer(updated);
            setShowEdit(false);
            onChanged?.();
          }}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete customer"
        message="Delete this customer? This cannot be undone."
        confirming={deleting}
      />
    </>
  );
}
