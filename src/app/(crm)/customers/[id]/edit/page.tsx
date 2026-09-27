import { notFound } from "next/navigation";
import { EditCustomerForm } from "@/components/Customers/EditCustomerForm";
import {
  fetchCustomer,
  fetchTags,
  fetchSalespeople,
} from "@/lib/actions/customers";

interface EditCustomerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;

  try {
    const [customer, tags, salespeople] = await Promise.all([
      fetchCustomer(id),
      fetchTags(),
      fetchSalespeople(),
    ]);

    if (!customer) {
      notFound();
    }

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EditCustomerForm
          customer={customer}
          tags={tags}
          salespeople={salespeople}
        />
      </div>
    );
  } catch {
    notFound();
  }
}
