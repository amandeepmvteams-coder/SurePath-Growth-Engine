"use client";

import { useState } from "react";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import type { Merchant } from "@/types/merchant-types";
import type { Activity } from "@/types/activity-types";
import { initialActivities } from "@/data/activities";

import OverviewTab from "./overview-tab";
import PoliciesTab from "./policies-tab";
import TasksTab from "./tasks-tab";
import NotesTab from "./notes-tab";
import ActivityTab from "./activity-tab";

interface MerchantTabsProps {
    merchant: Merchant;
}

export default function MerchantTabs({
    merchant,
}: MerchantTabsProps) {
    const [activities, setActivities] = useState<Activity[]>(
        initialActivities
    );

    return (
        <Tabs defaultValue="overview" className="w-full gap-5">
            <TabsList
                variant="line"
                className="h-9! w-1/2 justify-between rounded-none border-b-2 p-0"
            >
                <TabsTrigger value="overview" className="flex-1">
                    Overview
                </TabsTrigger>

                <TabsTrigger value="policies" className="flex-1">
                    Policies
                </TabsTrigger>

                <TabsTrigger value="tasks" className="flex-1">
                    Tasks
                </TabsTrigger>

                <TabsTrigger value="notes" className="flex-1">
                    Notes
                </TabsTrigger>

                <TabsTrigger value="activity" className="flex-1">
                    Activity
                    <span className="ml-1">
                        {activities.length}
                    </span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <OverviewTab merchant={merchant} />
            </TabsContent>

            <TabsContent value="policies">
                <PoliciesTab />
            </TabsContent>

            <TabsContent value="tasks">
                <TasksTab />
            </TabsContent>

            <TabsContent value="notes">
                <NotesTab merchantId={merchant.id} />
            </TabsContent>

            <TabsContent value="activity">
                <ActivityTab
                    activities={activities}
                    setActivities={setActivities}
                />
            </TabsContent>
        </Tabs>
    );
}