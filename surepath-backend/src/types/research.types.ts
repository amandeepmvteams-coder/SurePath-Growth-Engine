export interface ResearchPage {
  id: string;
  research_run_id: string;
  merchant_id: string;
  url: string;
  page_type: string | null;
  status: "found" | "missing" | "failed";
  status_code: number | null;
  content_type: string | null;
  title: string | null;
  content: string | null;
  fetched_at: Date;
  error: string | null;
  created_at: Date;
}

export interface CreateResearchPageData {
  research_run_id: string;
  merchant_id: string;
  url: string;
  page_type?: string | null;
  status: "found" | "missing" | "failed";
  status_code?: number | null;
  content_type?: string | null;
  title?: string | null;
  content?: string | null;
  error?: string | null;
}