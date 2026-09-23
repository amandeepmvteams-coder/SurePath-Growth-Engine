"use client";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import type { Merchant } from "@/features/merchants/types/merchant.types";
import type { MerchantContact } from "@/features/contacts/types/contact.types";
import type { MerchantScore } from "@/features/scoring/types/scoring.types";
import type { MerchantDetection } from "@/features/detections/types/detection.types";

import OverviewTab from "./overview-tab";
import PoliciesTab from "./policies-tab";
import TasksTab from "./tasks-tab";
import NotesTab from "./notes-tab";
import ActivityTab from "./activity-tab";
import { useState } from "react";

interface MerchantTabsProps {
    merchant: Merchant;
    onMerchantRefresh: () => Promise<void>;
    contacts: MerchantContact[];
    scores: MerchantScore[];
    detections: MerchantDetection[];
    summaryLoading: boolean;
    onScoresUpdated: () => Promise<void>;
    onContactsUpdated: () => Promise<void>;
}

export default function MerchantTabs({
    merchant,
    onMerchantRefresh,
    contacts,
    scores,
    detections,
    summaryLoading,
    onScoresUpdated,
    onContactsUpdated,

}: MerchantTabsProps) {
    const [activityCount, setActivityCount] = useState(0);

    return (
        <Tabs defaultValue="overview" className="w-full gap-5">
            <TabsList
                variant="line"
                className="h-9! w-full max-w-full justify-start overflow-x-auto overflow-y-visible rounded-none border-b-2 p-0 sm:justify-between lg:w-1/2"
            >
                <TabsTrigger value="overview" className="min-w-22 flex-1">
                    Overview
                </TabsTrigger>

                <TabsTrigger value="policies" className="min-w-22 flex-1">
                    Policies
                </TabsTrigger>

                <TabsTrigger value="tasks" className="min-w-22 flex-1">
                    Tasks
                </TabsTrigger>

                <TabsTrigger value="notes" className="min-w-22 flex-1">
                    Notes
                </TabsTrigger>

                <TabsTrigger value="activity" className="min-w-22 flex-1">
                    Activity
                    <span className="ml-1">
                        {activityCount}
                    </span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <OverviewTab
                    onScoresUpdated={onScoresUpdated}
                    merchant={merchant}
                    contacts={contacts}
                    scores={scores}
                    detections={detections}
                    summaryLoading={summaryLoading}
                    onMerchantRefresh={onMerchantRefresh}
                    onContactsUpdated={onContactsUpdated}
                />
            </TabsContent>

            <TabsContent value="policies">
                <PoliciesTab merchantId={merchant.id} />
            </TabsContent>

            <TabsContent value="tasks">
                <TasksTab merchantId={merchant.id} />
            </TabsContent>

            <TabsContent value="notes">
                <NotesTab merchantId={merchant.id} />
            </TabsContent>

            <TabsContent value="activity">
                <ActivityTab merchantId={merchant.id} onActivityCountChange={setActivityCount} onMerchantRefresh={onMerchantRefresh} />
            </TabsContent>
        </Tabs>
    );
}
