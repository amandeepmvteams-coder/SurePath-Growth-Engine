import {
    industryRepository,
} from "../repositories/industry.repository";

import {
    IndustryListResponse,
} from "../types/industry.types";

class IndustryService {

    async getIndustries(): Promise<IndustryListResponse> {

        const industries =
            await industryRepository.findAllActive();

        return {
            industries:
                industries.map(
                    (industry) =>
                        industry.name
                ),

            fallback: "Other",
        };
    }
}

export const industryService =
    new IndustryService();