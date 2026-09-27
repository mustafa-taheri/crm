import { AddCustomerForm } from "@/components/Customers/AddCustomerForm";
import { fetchTags, fetchSalespeople } from "@/lib/actions/customers";

export default async function AddCustomerPage() {
  const [tags, salespeople] = await Promise.all([
    fetchTags(),
    fetchSalespeople(),
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AddCustomerForm tags={tags} salespeople={salespeople} />
    </div>
  );
}
