import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerTable } from "@/components/Customers/CustomerTable";
import { CustomerFilters } from "@/components/Customers/CustomerFilters";
import { CustomerSearch } from "@/components/Customers/CustomerSearch";
import {
  fetchCustomers,
  fetchTags,
  fetchSalespeople,
} from "@/lib/actions/customers";
import { Plus, Upload, Users } from "lucide-react";
import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    tag_id?: string;
    city?: string;
    owner_id?: string;
    archived?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const perPage = 50;
  const archived = params.archived === "true";

  const [{ data: customers, count }, tags, salespeople] = await Promise.all([
    fetchCustomers({
      search: params.search,
      status:
        params.status && params.status !== "all"
          ? (params.status as CustomerStatus)
          : undefined,
      tag_id:
        params.tag_id && params.tag_id !== "all" ? params.tag_id : undefined,
      city: params.city,
      owner_id:
        params.owner_id && params.owner_id !== "all"
          ? params.owner_id
          : undefined,
      archived,
      page,
      per_page: perPage,
    }),
    fetchTags(),
    fetchSalespeople(),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your customer database, communication history, and sales
            pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/customers/import">
            <Button variant="outline" size="sm" className="h-9">
              <Upload className="mr-1.5 h-4 w-4" />
              Import
            </Button>
          </Link>
          <Link href="/customers/add">
            <Button size="sm" className="h-9">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-lg border">
        <Suspense
          fallback={<div className="h-9 w-64 bg-muted animate-pulse rounded" />}
        >
          <CustomerSearch />
        </Suspense>
        <Suspense
          fallback={<div className="h-9 w-80 bg-muted animate-pulse rounded" />}
        >
          <CustomerFilters tags={tags} salespeople={salespeople} />
        </Suspense>
      </div>

      {/* Customer List */}
      <CustomerTable
        customers={customers}
        count={count}
        page={page}
        perPage={perPage}
      />
    </div>
  );
}
