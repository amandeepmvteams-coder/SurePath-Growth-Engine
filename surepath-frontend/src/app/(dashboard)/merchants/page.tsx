"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, Plus, Search, SearchX } from "lucide-react";
import AddMerchantDialog from "./_components/AddMerchantDialog";
import { Input } from "@/components/ui/input";
import { getMerchants, createMerchant, deleteMerchant, exportMerchants, } from "@/features/merchants/api/merchants.api";
import type { Merchant } from "@/features/merchants/types/merchant.types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { countries, industries, merchantOwners, merchantStatuses } from "@/data/filter-options";
import { Country, CountryFilter, Industry, IndustryFilter, OwnerFilter, StatusFilter } from "@/types/merchant-types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import DeleteMerchantDialog from "./_components/DeleteMerchantDialog";
import { useRouter } from "next/navigation";


export default function Page() {
    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [merchantData, setMerchantData] = useState<Merchant[]>([]);
    const [totalMerchants, setTotalMerchants] = useState(0);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalMerchants / itemsPerPage);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
    const [openDeleteDialogId, setOpenDeleteDialogId] =
        useState<string | null>(null);

    const [filters, setFilters] = useState({
        status: "all" as StatusFilter,
        owner: "all" as OwnerFilter,
        industry: "all" as IndustryFilter,
        country: "all" as CountryFilter,
    });

    const [appliedFilters, setAppliedFilters] = useState(filters);

    // Handle Add Merchants Function 
    useEffect(() => {
        const loadMerchants = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const result = await getMerchants({
                    limit: itemsPerPage,
                    offset: (currentPage - 1) * itemsPerPage,
                    q: appliedSearchTerm || undefined,
                    status:
                        appliedFilters.status !== "all"
                            ? appliedFilters.status
                            : undefined,
                    country:
                        appliedFilters.country !== "all"
                            ? appliedFilters.country
                            : undefined,
                    industry:
                        appliedFilters.industry !== "all"
                            ? appliedFilters.industry
                            : undefined,
                });

                setMerchantData(result.data);
                setTotalMerchants(result.pagination.total);
            } catch (error) {
                console.error("Failed to load merchants:", error);
                setError("Failed to load merchants");
            } finally {
                setIsLoading(false);
            }
        };

        void loadMerchants();
    }, [currentPage, appliedFilters, appliedSearchTerm]);

    const handleAddMerchant = async (newMerchant: {
        domain: string;
        store: string;
        country: Country;
        industry: Industry;
    }) => {
        try {
            setIsLoading(true);

            await createMerchant({
                domain: newMerchant.domain,
                store_name: newMerchant.store,
                country: newMerchant.country,
                industry: newMerchant.industry,
            });

            toast.success("Merchant added successfully");

            setOpen(false);
            setCurrentPage(1);

            // Reload the first page so the new backend record appears.
            const result = await getMerchants({
                limit: itemsPerPage,
                offset: 0,
                q: appliedSearchTerm || undefined,
                status:
                    appliedFilters.status !== "all"
                        ? appliedFilters.status
                        : undefined,
                country:
                    appliedFilters.country !== "all"
                        ? appliedFilters.country
                        : undefined,
                industry:
                    appliedFilters.industry !== "all"
                        ? appliedFilters.industry
                        : undefined,
            });

            setMerchantData(result.data);
            setTotalMerchants(result.pagination.total);
        } catch (error) {
            console.error("Failed to add merchant:", error);
            toast.error("Failed to add merchant");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Delete Merchant Function 

    const handleDeleteMerchant = async (id: string) => {
        try {
            setIsLoading(true);

            await deleteMerchant(id);

            toast.success("Merchant deleted successfully");

            setMerchantData((prev) =>
                prev.filter((merchant) => merchant.id !== id)
            );

            setOpenDeleteDialogId(null);
        } catch (error) {
            console.error("Failed to delete merchant:", error);
            toast.error("Failed to delete merchant");
        } finally {
            setIsLoading(false);
        }
    };


    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        setAppliedSearchTerm(searchTerm);
        setAppliedFilters(filters);
    };

const handleExportMerchants = async () => {
  try {
    const blob = await exportMerchants();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "merchants.csv";

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Merchants exported successfully");
  } catch (error) {
    console.error("Failed to export merchants:", error);
    toast.error("Failed to export merchants");
  }
};


    return (
        <section className="w-full h-full space-y-4">
            {/* Headers and actions buttons */}

            <PageHeader
                title="Merchants"
                subtitle={`${totalMerchants} in the pipeline`}
            >
                <Button
                    onClick={() => setOpen(true)}
                    className="w-full sm:w-auto"
                >
                    <Plus className="size-4 text-white" />
                    Add merchant
                </Button>

                <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleExportMerchants}
                >
                    <Download className="size-4 text-foreground" />
                    Export CSV
                </Button>
            </PageHeader>


            {/* Search and Filters  */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:flex-1">
                    <Search
                        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b95a1]"
                        strokeWidth={1.8}
                    />
                    <Input
                        id="search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search domain or store name"
                        className="h-9 rounded-sm  border-[#cfd2d6] bg-[#f7f7f7] pl-10 shadow-sm 
                                 focus-visible:ring-1"

                    />
                </div>
                <div className="grid grid-cols-2 gap-3 lg:flex lg:shrink-0">

                    {/* Status Filter */}
                    <Select
                        value={filters.status}
                        onValueChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                status: value as StatusFilter,
                            }))
                        }
                    >
                        <SelectTrigger className="h-9! w-full lg:w-37.5">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                All statuses
                            </SelectItem>

                            {merchantStatuses.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Owners Filter */}
                    <Select
                        value={filters.owner}
                        onValueChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                owner: value as OwnerFilter,
                            }))
                        }
                    >
                        <SelectTrigger className="h-9! w-full lg:w-37.5">
                            <SelectValue placeholder="Anyone" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">Anyone</SelectItem>

                            {merchantOwners.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Industry Filter */}
                    <Select
                        value={filters.industry}
                        onValueChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                industry: value as IndustryFilter,
                            }))
                        }
                    >
                        <SelectTrigger className="w-full lg:w-45 h-9! ">
                            <SelectValue placeholder="All industries" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                All industries
                            </SelectItem>

                            {industries.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>


                    {/* Country Filter */}
                    <Select
                        value={filters.country}
                        onValueChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                country: value as CountryFilter,
                            }))
                        }
                    >
                        <SelectTrigger className="h-9! w-full lg:w-37.5">
                            <SelectValue placeholder="All countries" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                All countries
                            </SelectItem>

                            {countries.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                </div>
                <Button onClick={handleApplyFilters} className="h-9 w-full lg:w-20">
                    Apply
                </Button>
            </div>

            {/* Merchants Tables  */}
            <Card className="overflow-hidden">
                <div className="w-full overflow-x-auto ">
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            Loading merchants...
                        </div>
                    ) : error ? (
                        <div className="flex h-40 items-center justify-center">
                            {error}
                        </div>
                    ) : (
                        <Table className="min-w-275">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[12%] px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Domain
                                    </TableHead>

                                    <TableHead className="w-[11%] px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Store
                                    </TableHead>

                                    <TableHead className="w-[7%] px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Country
                                    </TableHead>

                                    <TableHead className="w-[12%] px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Industry
                                    </TableHead>

                                    <TableHead className="w-[7%] px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Status
                                    </TableHead>

                                    <TableHead className="w-[6%] px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Owner
                                    </TableHead>

                                    <TableHead className="w-[10%] px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Last Activity
                                    </TableHead>

                                    <TableHead className="w-[8%] px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Shopify
                                    </TableHead>

                                    <TableHead className="w-[7%] px-3 text-[10px] font-semibold text-center uppercase tracking-wider text-muted-foreground">
                                        Fit
                                    </TableHead>

                                    <TableHead className="w-[7%] px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Source
                                    </TableHead>

                                    <TableHead className="w-[13%] px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {merchantData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={11}
                                            className="h-52 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <SearchX className="size-8 text-muted-foreground" />

                                                <p className="font-medium text-foreground">
                                                    No merchants found
                                                </p>

                                                <p className="text-sm text-muted-foreground">
                                                    No merchants match your current search or filters.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    merchantData.map((merchant) => (
                                        <TableRow
                                            key={merchant.id}
                                            className="h-13.5 hover:bg-muted/60 cursor-pointer"
                                            onClick={() => {
                                                if (openDeleteDialogId !== null) return;

                                                router.push(`/merchants/${merchant.id}`);
                                            }}
                                        >
                                            <TableCell className="truncate px-3 py-2 text-xs font-semibold">
                                                {merchant.domain}
                                            </TableCell>

                                            <TableCell className="truncate px-3 py-2 text-xs">
                                                {merchant.store_name || "—"}
                                            </TableCell>

                                            <TableCell className="px-2 py-2 text-center text-xs">
                                                {merchant.country}
                                            </TableCell>

                                            <TableCell className="truncate px-3 py-2 text-xs">
                                                {merchant.industry || "—"}
                                            </TableCell>

                                            <TableCell className="px-3 py-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-full px-2 py-0 text-[10px] font-medium text-muted-foreground"
                                                >
                                                    {merchant.status}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="truncate px-2 py-2 text-xs text-muted-foreground">
                                                {merchant.assigned_rep?.display_name || "—"}
                                            </TableCell>

                                            <TableCell className="px-3 py-2 text-xs">
                                                {merchant.last_activity_at
                                                    ? new Date(merchant.last_activity_at).toLocaleString()
                                                    : "—"}
                                            </TableCell>

                                            <TableCell className="px-3 py-2 text-xs">
                                                —
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap px-3 py-2 text-center text-muted-foreground">
                                                —
                                            </TableCell>

                                            <TableCell className="px-2 py-2">
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-sm px-1.5 py-0 text-[9px] font-normal text-muted-foreground"
                                                >
                                                    {merchant.source}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap px-3 py-2">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-6 bg-[#202124] px-2 text-[10px] text-white"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        ▶ Run
                                                    </Button>

                                                    <DeleteMerchantDialog
                                                        merchantName={merchant.store_name || merchant.domain}
                                                        onDelete={() => handleDeleteMerchant(merchant.id)}
                                                        onDialogOpenChange={(open) => {
                                                            if (open) {
                                                                setOpenDeleteDialogId(merchant.id);
                                                            } else {
                                                                setTimeout(() => {
                                                                    setOpenDeleteDialogId(null);
                                                                }, 100);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>)}
                </div>
                <div className="flex items-center justify-between border-t px-3 py-2">
                    {/* Results count */}
                    <div className="text-xs text-muted-foreground">
                        {totalMerchants === 0
                            ? "0 results"
                            : `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(
                                currentPage * itemsPerPage,
                                totalMerchants
                            )} of ${totalMerchants}`}
                    </div>

                    {/* Pagination controls */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            ‹ Prev
                        </Button>

                        {Array.from({ length: totalPages }, (_, index) => {
                            const page = index + 1;

                            return (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            );
                        })}

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className=""
                        >
                            Next ›
                        </Button>
                    </div>
                </div>
            </Card>

            <AddMerchantDialog open={open} onOpenChange={setOpen}
                onAddMerchant={handleAddMerchant}
            />
        </section>
    )
}