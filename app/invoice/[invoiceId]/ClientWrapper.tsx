"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/components/loading";

const ClientInvoicePage = dynamic(() => import("./ClientPage"), {
  loading: () => <Loading />,
  ssr: false,
});

export default function ClientWrapper({ invoiceId }: { invoiceId: string }) {
  return <ClientInvoicePage invoiceId={invoiceId} />;
}
