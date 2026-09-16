import { researchPageRepository } from "../repositories/research-page.repository";
import { merchantProfileRepository } from "../repositories/merchant-profile.repository";
import { merchantContactRepository } from "../repositories/merchant-contact.repository";

interface ExtractedProfile {
    company_name: string | null;
    description: string | null;
    shipping_policy: string | null;
    return_policy: string | null;
    contact_email: string | null;
    contact_phone: string | null;
}

class ProfileGenerationService {

    async buildProfile(merchantId: string) {

        // 1. Get latest completed research
        const pages =
            await researchPageRepository
                .findLatestCompletedByMerchantId(
                    merchantId
                );

        // 2. No research available
        const foundPages = pages.filter(
            page => page.status === "found"
        );

        if (foundPages.length === 0) {
            return {
                built: false,
                skipped: true,
                contacts_found: 0,
            };
        }

        // 3. Extract profile information
        const profile =
            this.extractProfile(foundPages);

        // 4. Save profile
        await merchantProfileRepository
            .upsertFromResearch({
                merchant_id: merchantId,
                company_name:
                    profile.company_name,
                description:
                    profile.description,
                shipping_policy:
                    profile.shipping_policy,
                return_policy:
                    profile.return_policy,
                contact_email:
                    profile.contact_email,
                contact_phone:
                    profile.contact_phone,
                research_summary:
                    this.buildResearchSummary(profile),
            });

        // 5. Save contact if found
        let contactsFound = 0;

        if (
            profile.contact_email ||
            profile.contact_phone
        ) {

            const existingContact =
                await merchantContactRepository
                    .findResearchContact(
                        merchantId,
                        profile.contact_email,
                        profile.contact_phone
                    );

            if (!existingContact) {

                await merchantContactRepository
                    .createFromResearch(
                        merchantId,
                        {
                            name:
                                profile.company_name ??
                                "Unknown",
                            email:
                                profile.contact_email,
                            phone:
                                profile.contact_phone,
                            is_primary: true,
                            source: "research",
                            confidence: 0.8,
                        }
                    );

                contactsFound = 1;
            } else {
                contactsFound = 1;
            }
        }

        return {
            built: true,
            skipped: false,
            contacts_found: contactsFound,
        };
    }


    private extractProfile(
        pages: any[]
    ): ExtractedProfile {

        const homepage =
            this.findPage(pages, "homepage");

        const about =
            this.findPage(pages, "about");

        const shipping =
            this.findPage(pages, "shipping");

        const returns =
            this.findPage(pages, "returns");

        const contact =
            this.findPage(pages, "contact");


        const homepageContent =
            this.cleanContent(
                homepage?.content
            );

        const aboutContent =
            this.cleanContent(
                about?.content
            );

        const shippingContent =
            this.cleanContent(
                shipping?.content
            );

        const returnsContent =
            this.cleanContent(
                returns?.content
            );

        const contactContent =
            this.cleanContent(
                contact?.content
            );


        const companyName =
            this.extractCompanyName(
                homepage?.title,
                about?.title
            );


        const description =
            aboutContent ||
            homepageContent ||
            null;


        const contactInfo =
            this.extractContactInfo(
                contactContent,
                homepageContent
            );


        return {
            company_name: companyName,

            description:
                description
                    ? description.substring(0, 2000)
                    : null,

            shipping_policy:
                shippingContent,

            return_policy:
                returnsContent,

            contact_email:
                contactInfo.email,

            contact_phone:
                contactInfo.phone,
        };
    }


    private findPage(
        pages: any[],
        pageType: string
    ) {

        return pages.find(
            page =>
                page.page_type === pageType &&
                page.status === "found"
        );
    }


    private cleanContent(
        content: string | null | undefined
    ): string | null {

        if (!content) {
            return null;
        }

        return content
            .replace(
                /<script[\s\S]*?<\/script>/gi,
                ""
            )
            .replace(
                /<style[\s\S]*?<\/style>/gi,
                ""
            )
            .replace(
                /<[^>]+>/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();
    }


    private extractCompanyName(
        homepageTitle?: string | null,
        aboutTitle?: string | null
    ): string | null {

        const title =
            homepageTitle ||
            aboutTitle;

        if (!title) {
            return null;
        }

        return title
            .trim()
            .substring(0, 255);
    }


    private extractContactInfo(
        contactContent: string | null,
        homepageContent: string | null
    ) {
        const content = [
            contactContent,
            homepageContent,
        ]
            .filter(Boolean)
            .join(" ");

        const emailMatch = content.match(
            /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
        );

        const phoneMatch = content.match(
            /(?:\+?\d[\d\s().-]{7,}\d)/
        );

        return {
            email: emailMatch?.[0] ?? null,
            phone: phoneMatch?.[0] ?? null,
        };
    }


    private buildResearchSummary(
        profile: ExtractedProfile
    ): string | null {

        const parts: string[] = [];

        if (profile.company_name) {
            parts.push(
                `Company: ${profile.company_name}`
            );
        }

        if (profile.description) {
            parts.push(
                `Description: ${profile.description}`
            );
        }

        if (profile.shipping_policy) {
            parts.push(
                "Shipping policy information found."
            );
        }

        if (profile.return_policy) {
            parts.push(
                "Return policy information found."
            );
        }

        return parts.length > 0
            ? parts.join(" ")
            : null;
    }
}

export const profileGenerationService =
    new ProfileGenerationService();