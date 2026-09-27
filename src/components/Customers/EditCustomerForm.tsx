"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CUSTOMER_STATUSES } from "@/lib/constants/ui";
import { CUSTOMER_STATUS_LABELS } from "@/lib/helpers/status";
import { updateCustomer, archiveCustomer } from "@/lib/actions/customers";
import { Plus, Trash2, ArrowLeft, Archive } from "lucide-react";
import Link from "next/link";

interface EditCustomerFormProps {
  customer: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    city: string | null;
    industry: string | null;
    source: string | null;
    status: string;
    primary_owner_id: string | null;
    marketing_opt_out: boolean;
    archived_at: string | null;
    phones?:
      | {
          id: string;
          phone_number: string;
          country_code: string;
          is_primary: boolean;
        }[]
      | null;
    tags?: { tag: { id: string; name: string } }[] | null;
  };
  tags: { id: string; name: string }[];
  salespeople: { id: string; full_name: string }[];
}

export function EditCustomerForm({
  customer,
  tags,
  salespeople,
}: EditCustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [archiving, setArchiving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [name, setName] = React.useState(customer.name);
  const [company, setCompany] = React.useState(customer.company || "");
  const [email, setEmail] = React.useState(customer.email || "");
  const [city, setCity] = React.useState(customer.city || "");
  const [industry, setIndustry] = React.useState(customer.industry || "");
  const [source, setSource] = React.useState(customer.source || "");
  const [status, setStatus] = React.useState<string>(customer.status);
  const [primaryOwnerId, setPrimaryOwnerId] = React.useState<string>(
    customer.primary_owner_id || "none",
  );
  const [marketingOptOut, setMarketingOptOut] = React.useState(
    customer.marketing_opt_out,
  );

  const initialPhones =
    customer.phones && customer.phones.length > 0
      ? customer.phones.map((p) => ({
          phone_number: p.phone_number,
          country_code: p.country_code,
          is_primary: p.is_primary,
        }))
      : [{ phone_number: "", country_code: "+91", is_primary: true }];

  const [phones, setPhones] = React.useState(initialPhones);

  const initialTagIds = customer.tags ? customer.tags.map((t) => t.tag.id) : [];
  const [selectedTagIds, setSelectedTagIds] =
    React.useState<string[]>(initialTagIds);

  const addPhone = () => {
    setPhones([
      ...phones,
      { phone_number: "", country_code: "+91", is_primary: false },
    ]);
  };

  const removePhone = (index: number) => {
    if (phones.length === 1) return;
    const updated = phones.filter((_, i) => i !== index);
    if (phones[index].is_primary && updated.length > 0) {
      updated[0].is_primary = true;
    }
    setPhones(updated);
  };

  const updatePhone = (
    index: number,
    field: "phone_number" | "country_code" | "is_primary",
    value: string | boolean,
  ) => {
    const updated = [...phones];
    if (field === "is_primary" && value === true) {
      updated.forEach((p, i) => (p.is_primary = i === index));
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPhones(updated);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const validPhones = phones.filter((p) => p.phone_number.trim().length > 0);
    if (validPhones.length === 0) {
      setErrorMsg("Please provide at least one valid phone number.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("company", company);
    formData.append("email", email);
    formData.append("city", city);
    formData.append("industry", industry);
    formData.append("source", source);
    formData.append("status", status);
    if (primaryOwnerId && primaryOwnerId !== "none") {
      formData.append("primary_owner_id", primaryOwnerId);
    }
    formData.append("marketing_opt_out", String(marketingOptOut));
    formData.append("phones", JSON.stringify(validPhones));
    formData.append("tag_ids", JSON.stringify(selectedTagIds));

    try {
      const res = await updateCustomer(customer.id, formData);
      if (res.error) {
        setErrorMsg(
          typeof res.error === "object"
            ? Object.values(res.error).flat().join(", ")
            : "Failed to update customer",
        );
      } else {
        router.push(`/customers/${customer.id}`);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this customer?")) return;
    setArchiving(true);
    try {
      await archiveCustomer(customer.id);
      router.push("/customers");
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to archive");
      setArchiving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/customers/${customer.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleArchive}
          disabled={archiving}
          className="text-error hover:text-error hover:bg-error/10 border-error/20"
        >
          <Archive className="mr-1.5 h-4 w-4" />
          {archiving ? "Archiving..." : "Archive Customer"}
        </Button>
      </div>

      {errorMsg && (
        <div className="rounded-md bg-error/10 border border-error/20 p-4 text-sm text-error font-medium">
          {errorMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company / Business Name</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Lead Source</Label>
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Phone Numbers</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPhone}
            className="text-xs"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Number
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {phones.map((phone, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-24 shrink-0">
                <Input
                  value={phone.country_code}
                  onChange={(e) =>
                    updatePhone(index, "country_code", e.target.value)
                  }
                />
              </div>
              <div className="flex-1">
                <Input
                  value={phone.phone_number}
                  onChange={(e) =>
                    updatePhone(index, "phone_number", e.target.value)
                  }
                  required={index === 0}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                  <input
                    type="radio"
                    name="primary_phone"
                    checked={phone.is_primary}
                    onChange={() => updatePhone(index, "is_primary", true)}
                    className="accent-primary"
                  />
                  Primary
                </label>
                {phones.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePhone(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline & Assignment</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Lead Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMER_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {CUSTOMER_STATUS_LABELS[st]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Assigned Salesperson</Label>
            <Select value={primaryOwnerId} onValueChange={setPrimaryOwnerId}>
              <SelectTrigger id="owner">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {salespeople.map((sp) => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 pt-2">
            <Label className="block mb-2">Customer Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-span-2 flex items-center space-x-2 pt-2">
            <Checkbox
              id="opt_out"
              checked={marketingOptOut}
              onCheckedChange={(checked) => setMarketingOptOut(!!checked)}
            />
            <Label
              htmlFor="opt_out"
              className="text-sm font-normal text-muted-foreground cursor-pointer"
            >
              Opt out from WhatsApp broadcast marketing campaigns
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Link href={`/customers/${customer.id}`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
