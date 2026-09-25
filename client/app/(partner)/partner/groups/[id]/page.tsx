// app/(partner)/partner/groups/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import GroupDetailPage from "@/components/groups/GroupDetailPage";

export default function PartnerGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <GroupDetailPage groupId={id} />;
}
