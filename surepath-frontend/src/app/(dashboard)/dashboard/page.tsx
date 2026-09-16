import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { merchants } from "@/data/merchants";
export default function Home() {
  const scoredMerchants = merchants.filter(
    (merchant) => merchant.enrichment === "Complete"
  );

  const awaitingResearch = merchants.filter(
    (merchant) => merchant.enrichment !== "Complete"
  );

  const stageCounts = merchants.reduce<Record<string, number>>(
    (acc, merchant) => {
      acc[merchant.status] = (acc[merchant.status] || 0) + 1;
      return acc;
    },
    {}
  );
  const bestProspects = [...scoredMerchants]
    .sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0))
    .slice(0, 5);
  return (
    <section className="w-full h-full">
      <div className="flex flex-col  gap-5">
        <PageHeader title="Dashboard" ></PageHeader>

        {/* Pipeline  */}
        <Card className="px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row">


            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Open Pipeline · All Stages
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {merchants.length}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {merchants.length} merchants tracked in total
              </p>
            </div>


            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-x-12 md:flex md:gap-16">

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Scored
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {scoredMerchants.length}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  have a fit score
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase whitespace-nowrap tracking-widest text-muted-foreground">
                  Awaiting Research
                </p>

                <h3 className="mt-2 text-xl font-bold text-red-500">
                  {awaitingResearch.length}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  never been through the pipeline
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-5 h-px w-full bg-border" />


          <p className="text-sm text-muted-foreground">
            <Link
              href="/pipeline"
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Run the pipeline
            </Link>{" "}
            to research them.
          </p>
        </Card>


        {/* Merchants  */}
        <Card>
          <CardHeader>
            <CardTitle>Merchants by stage</CardTitle>
            <CardDescription>
              Every stage of the sales pipeline
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Stages */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 lg:gap-0">

              <div className="px-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  New
                </div>
                <p className="mt-2 text-2xl font-semibold"> {stageCounts["New"] || 0}</p>
              </div>

              <div className="border-l border-border px-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  Qualified
                </div>
                <p className="mt-2 text-2xl font-semibold text-muted-foreground">{stageCounts["Qualified"] || 0}</p>
              </div>

              <div className="border-l border-border px-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                  Contacted
                </div>
                <p className="mt-2 text-2xl font-semibold text-muted-foreground"> {stageCounts["Contacted"] || 0}</p>
              </div>

              <div className="border-l border-border px-3">
                <div className="flex items-center gap-2 text-xs whitespace-nowrap text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full  bg-gray-400" />
                  Demo Scheduled
                </div>
                <p className="mt-2 text-2xl font-semibold text-muted-foreground">{stageCounts["Demo Scheduled"] || 0}</p>
              </div>

              <div className="border-l border-border px-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-black" />
                  Negotiating
                </div>
                <p className="mt-2 text-2xl font-semibold text-muted-foreground"> {stageCounts["Negotiating"] || 0}</p>
              </div>

              <div className="border-l border-border px-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                  Installed
                </div>
                <p className="mt-2 text-2xl font-semibold text-muted-foreground">{stageCounts["Installed"] || 0}</p>
              </div>

              <div className="border-l border-border px-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Live
                </div>
                <p className="mt-2 text-2xl font-semibold text-muted-foreground"> {stageCounts["Live"] || 0}</p>
              </div>

              <div className="border-l border-border px-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                  Lost
                </div>
                <p className="mt-2 text-2xl font-semibold text-muted-foreground">{stageCounts["Lost"] || 0}</p>
              </div>

            </div>
          </CardContent>
        </Card>


        {/* Best Prospectes  */}
        <Card className="py-6 overflow-auto">
          <CardHeader className="flex-row items-start  justify-between px-6 py-0">
            <div>
              <CardTitle className="text-base">
                Best prospects
              </CardTitle>

              <CardDescription className="text-xs">
                Highest fit score first
              </CardDescription>
            </div>

            <Link href="/merchants" className="text-sm underline">
              See all
            </Link>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-muted/0!">
                <TableHead className="px-6 py-3 text-xs font-semibold tracking-wider">
                  MERCHANT
                </TableHead>

                <TableHead className="px-6 py-3 text-xs font-semibold tracking-wider">
                  INDUSTRY
                </TableHead>

                <TableHead className="px-6 py-3 text-xs font-semibold tracking-wider">
                  STAGE
                </TableHead>

                <TableHead className="px-6 py-3 text-right text-xs font-semibold tracking-wider">
                  FIT
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bestProspects.map((merchant) => (
                <TableRow
                  key={merchant.id}
                  className="border-b transition-colors  last:border-b-0"
                >
                  <TableCell className="px-6 py-4 text-sm font-semibold">
                    {merchant.store}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {merchant.industry}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {merchant.status}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right text-sm font-semibold">
                    {merchant.fit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </section>
  );
}
