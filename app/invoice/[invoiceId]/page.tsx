import { Suspense } from 'react';
import ClientWrapper from './ClientWrapper';
import Loading from '@/app/components/loading';

// ✅ Solution : Next.js 15 App Router exige une fonction async ici !
export default async function Page(props: Promise<{ params: { invoiceId: string } }>) {
  const { params } = await props;

  return (
    <Suspense fallback={<Loading />}>
      <ClientWrapper invoiceId={params.invoiceId} />
    </Suspense>
  );
}
