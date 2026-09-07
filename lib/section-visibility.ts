import dbConnect from "@/lib/mongodb";
import { Setting } from "@/lib/models";

export const CSR_PROJECTS_ENABLED_KEY = "csrProjectsEnabled";

/**
 * Whether the public CSR projects section (Adopt a Project page + nav link)
 * is enabled. Defaults to true when the setting is absent.
 */
export async function isCsrSectionEnabled(): Promise<boolean> {
  await dbConnect();
  const setting = await Setting.findOne({ key: CSR_PROJECTS_ENABLED_KEY }).lean();
  if (!setting) return true;
  return String((setting as { value?: unknown }).value).toLowerCase() === "true";
}
