import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import * as XLSX from "xlsx";
import { hasEmoji } from "../lib/helpers/strings.helpers";

export type ExportSheet = {
  name: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
};

export type GroupDoc = {
  id?: string; // internal group field
  name?: string;
  groupType?: string;
  users?: string[];
  createdAt?: any;
  experimentId?: string;
  messages?: any[];
};

function toIso(d: any): string | undefined {
  try {
    if (!d) return undefined;
    // Firestore Timestamp has toDate
    const date = typeof d?.toDate === "function" ? d.toDate() : new Date(d);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  } catch {
    return undefined;
  }
}

export function createSheetsFromGroups(groups: { groupId: string; data: GroupDoc }[]): ExportSheet[] {
  const groupsSheet: ExportSheet = {
    name: "Groups",
    headers: ["groupId", "name", "groupType", "createdAt", "users", "experimentId"],
    rows: [],
  };

  const messagesSheet: ExportSheet = {
    name: "Messages",
    headers: [
      "groupId",
      "senderId",
      "senderName",
      "isAdmin",
      "createdAt",
      "text",
    ],
    rows: [],
  };

  for (const g of groups) {
    const d = g.data || {};
    groupsSheet.rows.push([
      g.groupId,
      d.name ?? "",
      d.groupType ?? "",
      toIso(d.createdAt) ?? "",
      Array.isArray(d.users) ? d.users.join(",") : "",
      d.experimentId ?? "",
    ]);

    const msgs = Array.isArray(d.messages) ? d.messages : [];
    for (const m of msgs) {
      messagesSheet.rows.push([
        g.groupId,
        m?.senderId ?? "",
        m?.senderName ?? "",
        !!m?.isAdmin,
        toIso(m?.createdAt) ?? "",
        m?.text ?? "",
      ]);
    }
  }

  return [groupsSheet, messagesSheet];
}

export function createXlsxFile(sheets: ExportSheet[], filename: string): void {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const aoa = [s.headers, ...s.rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, s.name.substring(0, 31));
  }
  const data = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportGroupsToXlsx(
  groups: { groupId: string }[],
  opts?: { filename?: string }
): Promise<void> {
  const full: { groupId: string; data: GroupDoc }[] = [];
  for (const g of groups) {
    const snap = await getDoc(doc(db, "groups", g.groupId));
    full.push({ groupId: g.groupId, data: (snap.data() as GroupDoc) || {} });
  }
  const sheets = createSheetsFromGroups(full);
  const filename = opts?.filename ?? `export-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  createXlsxFile(sheets, filename);
}

// Build a single messages sheet across the whole experiment
export async function buildExperimentMessagesSheet(expId: string): Promise<ExportSheet> {
  const q = query(collection(db, "groups"), where("experimentId", "==", expId));
  const snap = await getDocs(q);
  const sheet: ExportSheet = {
    name: "Messages",
    headers: ["senderid", "groupid", "grouptype","includesEmojy", "message", "timestamp"],
    rows: [],
  };
  for (const d of snap.docs) {
    const data = d.data() as GroupDoc | any;
    const groupType = data?.groupType ?? "";
    const msgs: any[] = Array.isArray(data?.messages) ? data.messages : [];
    for (const m of msgs) {
      sheet.rows.push([
        m?.senderId ?? "",
        d.id,
        groupType,
        hasEmoji(m?.text ?? ""),
        m?.text ?? "",
        toIso(m?.createdAt) ?? "",
      ]);
    }
  }
  return sheet;
}

// Build a survey sheet where each question key is a column
export async function buildExperimentSurveySheet(expId: string): Promise<ExportSheet> {
  const expSnap = await getDoc(doc(db, "experiments", expId));
  const data = (expSnap.data() as any) || {};
  const entries: any[] = Array.isArray(data?.surveyAnswers) ? data.surveyAnswers : [];

  // Collect all keys used across answers
  const keysSet = new Set<string>();
  for (const e of entries) {
    const ans = (e?.answers ?? {}) as Record<string, unknown>;
    Object.keys(ans).forEach((k) => keysSet.add(k));
  }
  const keys = Array.from(keysSet);
  const headers = ["userid", ...keys];

  const sheet: ExportSheet = {
    name: "Survey",
    headers,
    rows: [],
  };

  for (const e of entries) {
    const ans = (e?.answers ?? {}) as Record<string, unknown>;
    const row: (string | number | boolean | null | undefined)[] = [e?.userId ?? ""];
    for (const k of keys) {
      const v = ans[k];
      // Normalize objects to JSON strings; primitives as-is
      if (v == null) row.push("");
      else if (typeof v === "object") row.push(JSON.stringify(v));
      else row.push(v as any);
    }
    sheet.rows.push(row);
  }

  return sheet;
}

export async function exportExperimentToXlsx(
  expId: string,
  opts?: { filename?: string }
): Promise<void> {
  const [messages, survey] = await Promise.all([
    buildExperimentMessagesSheet(expId),
    buildExperimentSurveySheet(expId),
  ]);
  const filename = opts?.filename ?? `export-${expId}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  createXlsxFile([messages, survey], filename);
}
