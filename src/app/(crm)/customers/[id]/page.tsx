import { notFound } from "next/navigation";
import { fetchCustomer360 } from "@/lib/actions/customer360";
import { CustomerHeader } from "@/components/Customer360/CustomerHeader";
import { Customer360Tabs } from "@/components/Customer360/Customer360Tabs";

interface Customer360PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Customer360Page({
  params,
}: Customer360PageProps) {
  const { id } = await params;

  try {
    const data = await fetchCustomer360(id);

    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <CustomerHeader
          customer={data.customer}
          conversationId={data.conversation?.id}
        />

        <Customer360Tabs
          customerId={id}
          customer={data.customer}
          conversation={data.conversation}
          activities={data.activities}
          notes={data.notes}
          followups={data.followups}
          campaignRecipients={data.campaignRecipients}
        />
      </div>
    );
  } catch {
    notFound();
  }
}
