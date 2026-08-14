import PartnerLayout from "@/components/layout/PartnerLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PartnerLayout>{children}</PartnerLayout>;
}
