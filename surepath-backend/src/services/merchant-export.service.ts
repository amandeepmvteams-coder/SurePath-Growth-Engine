import { Response } from "express";
import { MerchantExportFilters } from "../types/merchant-export.types";
import { merchantExportRepository } from "../repositories/merchant-export.repository";

class MerchantExportService {

    private escapeCsvValue(value: unknown): string {
        if (value === null || value === undefined) {
            return "";
        }

        const stringValue = String(value);

        /*
         * CSV escaping:
         *
         * "hello"       -> hello
         * "hello,world" -> "hello,world"
         * 'hello "x"'   -> "hello ""x"""
         */
        if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n") ||
            stringValue.includes("\r")
        ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
    }

    private formatRow(row: any): string {

        const values = [
            row.id,
            row.domain,
            row.store_name,
            row.country,
            row.industry,
            row.status,
            row.assigned_rep,
            row.fit_score,
            row.score_factors_assessed,
            row.score_factors_total,
            row.opportunity_value,
            row.platform_confidence,
            row.primary_contact_name,
            row.primary_contact_email,
            row.primary_contact_phone,
            row.detected_providers,
            row.source,
            row.created_at,
            row.updated_at,
        ];

        return values
            .map((value) => this.escapeCsvValue(value))
            .join(",") + "\r\n";
    }

    async exportMerchants(
        filters: MerchantExportFilters,
        response: Response
    ): Promise<void> {

        const stream =
            await merchantExportRepository.createExportStream(
                filters
            );

        /*
         * CSV header
         */
        response.write(
            [
                "id",
                "domain",
                "store_name",
                "country",
                "industry",
                "status",
                "assigned_rep",
                "fit_score",
                "score_factors_assessed",
                "score_factors_total",
                "opportunity_value",
                "platform_confidence",
                "primary_contact_name",
                "primary_contact_email",
                "primary_contact_phone",
                "detected_providers",
                "source",
                "created_at",
                "updated_at",
            ].join(",") + "\r\n"
        );

        /*
         * Stream every PostgreSQL row
         * directly into the HTTP response.
         */
        stream.on("data", (row) => {

            if (!response.writableEnded) {
                response.write(
                    this.formatRow(row)
                );
            }
        });

        stream.on("end", () => {

            if (!response.writableEnded) {
                response.end();
            }
        });

        stream.on("error", (error) => {

            console.error(
                "Merchant export stream error:",
                error
            );

            if (!response.headersSent) {

                response.status(500).json({
                    message: "Failed to export merchants",
                });

            } else {

                response.destroy(error);
            }
        });

        /*
         * If the client closes the connection,
         * stop the database stream.
         */
        response.on("close", () => {

            if (!response.writableEnded) {
                stream.destroy();
            }
        });
    }
}

export const merchantExportService =
    new MerchantExportService();