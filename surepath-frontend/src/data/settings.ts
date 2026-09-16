import type {
    TeamMember,
    WeightItem,
    OpportunityAssumption,
    AiTask,
} from "@/types/settings-types";

export const TEAM_MEMBERS: TeamMember[] = [
    {
        id: 1,
        name: "Abhishek",
        email: "abhishek@gmail.com",
        lastSignedIn: "never signed in",
        role: "sales",
    },
    {
        id: 2,
        name: "admin",
        email: "admin@gmail.com",
        lastSignedIn: "last signed in 9/4/2026",
        role: "admin",
    },
    {
        id: 3,
        name: "Rohit",
        email: "rohit@gmail.com",
        lastSignedIn: "never signed in",
        role: "sales",
    },
];

export const WEIGHTS: WeightItem[] = [
    {
        id: "contactable",
        label: "Contactable",
        value: 15,
    },
    {
        id: "target-country",
        label: "Target Country",
        config: "US, CA, GB, AU",
        value: 10,
    },
    {
        id: "target-industry",
        label: "Target Industry",
        config: "Apparel, Footwear, Jewellery & Accessories, Beauty & Skincare, Health & Supplements, Home & Furniture, Electronics, Sports & Outdoors, Pets",
        value: 10,
    },
    {
        id: "platform-confirmed",
        label: "Platform Confirmed",
        value: 25,
    },
    {
        id: "no-existing-provider",
        label: "No Existing Provider",
        value: 30,
    },
    {
        id: "weak-returns-coverage",
        label: "Weak Returns Coverage",
        value: 10,
    },
];

export const OPPORTUNITY_ASSUMPTIONS: OpportunityAssumption[] = [
    {
        id: "attach-rate",
        label: "Attach rate",
        value: "0.6",
        description: "Share of orders buying protection",
    },
    {
        id: "revenue-per-order",
        label: "Revenue per order",
        value: "1.5",
        description: "What SurePath earns on each",
    },
    {
        id: "attach-rate-2",
        label: "Attach rate",
        value: "0.6",
        description: "Share of orders buying protection",
    },
    {
        id: "revenue-per-order-2",
        label: "Revenue per order",
        value: "1.5",
        description: "What SurePath earns on each",
    },
];

export const AI_TASKS: AiTask[] = [
    {
        id: 1,
        name: "Industry Classify",
        model: "claude-haiku-4-5",
        version: "v1",
    },
    {
        id: 2,
        name: "Policy Summary",
        model: "claude-sonnet-5",
        version: "v1",
    },
    {
        id: 3,
        name: "Research Summary",
        model: "claude-opus-5",
        version: "v3",
    },
];