import { Card, CardContent } from "@/components/ui/card";

export default function PoliciesTab() {
    return (
        <Card className="max-w-xl">
            <CardContent className="p-0">
                {/* Header */}
                <div className="border-b px-4 py-3">
                    <p className="text-sm font-semibold">
                        Policies
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-5 px-4 py-4">
                    {/* Shipping */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                            Shipping
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Not published by this merchant, or the page could not be read.
                        </p>
                    </div>

                    {/* Returns */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                            Returns
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Not published by this merchant, or the page could not be read.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}