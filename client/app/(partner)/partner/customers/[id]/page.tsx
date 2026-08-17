// app/(partner)/partner/customers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getMyCustomerById,
  getMyCustomerLoans,
  getMyCustomerPayments,
} from "@/services/partnerCustomer.service";
import {
  getMyCustomerDocuments,
  uploadMyCustomerDocument,
  deleteMyCustomerDocument,
  documentFileUrl,
} from "@/services/partnerDocument.service";
import LoanTable from "@/components/tables/LoanTable";
import PaymentTable from "@/components/tables/PaymentTable";
import { downloadMyReceipt } from "@/services/partnerPayment.service";
import type { Customer } from "@/types/customer";
import type { Loan } from "@/types/loan";
import type { Payment } from "@/types/payment";
import type { CustomerDocument } from "@/types/document";
import { formatDate } from "@/utils/formatDate";

function StatusBadge({ status }: { status: Customer["status"] }) {
  const map: Record<Customer["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    BLOCKED: { bg: "#FAEEDA", text: "#854F0B" },
    CLOSED: { bg: "#ECE9DF", text: "#45443E" },
  };
  const c = map[status] ?? map.CLOSED;
  return (
    <span
      className="text-xs font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-[#6B6A62] mb-1">{label}</p>
      <p className="text-sm text-[#1A1A18] wrap-break-word">{value || "—"}</p>
    </div>
  );
}

const TABS = ["Overview", "Loans", "Payments", "Documents"] as const;
type Tab = (typeof TABS)[number];

export default function PartnerCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");

  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [documentType, setDocumentType] = useState("ID_PROOF");
  const [uploading, setUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getMyCustomerById(id)
      .then(setCustomer)
      .catch((err) => {
        console.error(err);
        setError("Could not load customer.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (tab === "Loans") {
      getMyCustomerLoans(id).then(setLoans).catch(() => setLoans([]));
    } else if (tab === "Payments") {
      getMyCustomerPayments(id).then(setPayments).catch(() => setPayments([]));
    } else if (tab === "Documents") {
      getMyCustomerDocuments(id).then(setDocuments).catch(() => setDocuments([]));
    }
  }, [tab, id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setDocError(null);
    setUploading(true);
    try {
      const doc = await uploadMyCustomerDocument(id, file, documentType);
      setDocuments((prev) => [doc, ...prev]);
    } catch (err: any) {
      setDocError(err?.response?.data?.message || err.message || "Could not upload document.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteMyCustomerDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      setDocError(err?.response?.data?.message || err.message || "Could not delete document.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-[#ECE9DF] rounded" />
        <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6 h-24" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link href="/partner/customers" className="text-sm text-[#185FA5]">
          ← Back to customers
        </Link>
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
          <p className="mb-3">{error ?? "Customer not found."}</p>
          <button onClick={load} className="text-sm font-semibold underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const initials = customer.name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/partner/customers")}
        className="text-sm text-[#185FA5] hover:underline"
      >
        ← Back to customers
      </button>

      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 rounded-full bg-[#FAECE7] flex items-center justify-center text-[#993C1D] text-lg font-semibold">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-[#1A1A18]">{customer.name}</h1>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-[#45443E] flex items-center gap-1 flex-wrap">
              <span>{customer.customerCode}</span>
              <span>·</span>
              <a href={`tel:${customer.phone}`} className="hover:text-[#1A1A18] hover:underline">
                {customer.phone}
              </a>
            </p>
          </div>
        </div>
        <Link
          href={`/partner/loans?customerId=${customer.id}`}
          className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg text-center"
        >
          + New loan
        </Link>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
              tab === t ? "bg-[#FAEEDA] text-[#854F0B] font-medium" : "text-[#45443E] hover:bg-[#ECE9DF]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
            <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">Personal details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Phone" value={customer.phone} />
              <Field label="Alternate phone" value={customer.alternatePhone} />
              <Field label="Aadhaar number" value={customer.aadhaarNumber} />
              <Field label="PAN number" value={customer.panNumber} />
              <Field label="Address" value={customer.address} />
              <Field label="City" value={customer.city} />
              <Field label="State" value={customer.state} />
              <Field label="Pincode" value={customer.pincode} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
            <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">Guarantor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Guarantor name" value={customer.guarantorName} />
              <Field label="Guarantor phone" value={customer.guarantorPhone} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#DAD7CA] bg-[#ECE9DF] p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Registered" value={formatDate(customer.createdAt)} />
              <Field label="Last updated" value={formatDate(customer.updatedAt)} />
            </div>
          </div>
        </div>
      )}

      {tab === "Loans" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <LoanTable loans={loans} linkPrefix="/partner/loans" />
        </div>
      )}

      {tab === "Payments" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <PaymentTable payments={payments} onDownloadReceipt={downloadMyReceipt} />
        </div>
      )}

      {tab === "Documents" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-4">
          {docError && (
            <div className="rounded-lg border border-[#FAECE7] bg-[#FAECE7] p-3 text-sm text-[#993C1D]">
              {docError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
            >
              <option value="ID_PROOF">ID proof</option>
              <option value="ADDRESS_PROOF">Address proof</option>
              <option value="INCOME_PROOF">Income proof</option>
              <option value="PHOTO">Photo</option>
              <option value="OTHER">Other</option>
            </select>
            <label className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50">
              {uploading ? "Uploading..." : "+ Upload document"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
          </div>

          {documents.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-[#6B6A62]">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <th className="py-2 px-4 font-medium">Type</th>
                    <th className="py-2 px-4 font-medium">File</th>
                    <th className="py-2 px-4 font-medium">Uploaded</th>
                    <th className="py-2 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {documents.map((d) => (
                    <tr key={d.id} className="border-b border-[#E5E7EB] last:border-0">
                      <td className="py-3 px-4 text-[#1A1A18]">{d.documentType.replace("_", " ")}</td>
                      <td className="py-3 px-4">
                        <a
                          href={documentFileUrl(d.filePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#185FA5] hover:underline"
                        >
                          {d.fileName}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-[#45443E]">{formatDate(d.uploadedAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteDocument(d.id)}
                          className="text-[#993C1D] font-medium hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
