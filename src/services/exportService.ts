import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import * as XLSX from "xlsx";
import { resources } from "../lib/i18n";
import { hasEmoji } from "../lib/helpers/strings.helpers";
import { getSurveyQuestionNames } from "../lib/surveyConfig";

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

export function createSheetsFromGroups(
  groups: { groupId: string; data: GroupDoc }[]
): ExportSheet[] {
  const groupsSheet: ExportSheet = {
    name: "Groups",
    headers: [
      "groupId",
      "name",
      "groupType",
      "createdAt",
      "users",
      "experimentId",
    ],
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
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
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
    console.log("snap", snap);
    full.push(snap as any);
  }
  const sheet = formatGroupsMessagesToSheet(full);
  const filename =
    opts?.filename ??
    `export-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  createXlsxFile([sheet], filename);
}

export function formatGroupsMessagesToSheet(groups: any) {
  const sheet: ExportSheet = {
    name: "Messages",
    headers: [
      "senderid",
      "groupname",
      "grouptype",
      "includesEmoji",
      "message",
      "timestamp",
    ],
    rows: [],
  };

  for (const d of groups) {
    const data = d.data() as GroupDoc | any;
    const groupType = data?.groupType ?? "";
    const msgs: any[] = Array.isArray(data?.messages) ? data.messages : [];
    for (const m of msgs) {
      sheet.rows.push([
        m?.senderId ?? "",
        data.name,
        groupType,
        hasEmoji(m?.text ?? ""),
        m?.text ?? "",
        toIso(m?.createdAt) ?? "",
      ]);
    }
  }

  return sheet;
}

// Build a single messages sheet across the whole experiment
export async function buildExperimentMessagesSheet(
  expId: string
): Promise<ExportSheet> {
  const q = query(collection(db, "groups"), where("experimentId", "==", expId));
  const snap = await getDocs(q);

  return formatGroupsMessagesToSheet(snap.docs);
}

// Build a survey sheet where each question key is a column
export async function buildExperimentSurveySheet(
  expId: string
): Promise<ExportSheet> {
  const expSnap = await getDoc(doc(db, "experiments", expId));
  const data = (expSnap.data() as any) || {};
  const entries: any[] = Array.isArray(data?.surveyAnswers)
    ? data.surveyAnswers
    : [];

  // Build a map from userId -> { groupName, groupType }
  const gq = query(
    collection(db, "groups"),
    where("experimentId", "==", expId)
  );
  const gsnap = await getDocs(gq);
  const userToGroup: Record<string, { groupName: string; groupType: string }> =
    {};
  for (const d of gsnap.docs) {
    const g = d.data() as any;
    const groupName = g?.name ?? "";
    const groupType = g?.groupType ?? "";
    const users: string[] = Array.isArray(g?.users) ? g.users : [];
    for (const uid of users) userToGroup[uid] = { groupName, groupType };
  }

  // Use the predefined order from surveyConfig
  const orderedKeys = getSurveyQuestionNames();

  const headers = [
    "userid",
    "groupname",
    "grouptype",
    ...mapSurveyKeysToEnglish(orderedKeys),
  ];

  const sheet: ExportSheet = {
    name: "Survey",
    headers,
    rows: [],
  };

  for (const e of entries) {
    const ans = (e?.answers ?? {}) as Record<string, unknown>;
    const uid = e?.userId ?? "";
    const groupInfo = userToGroup[uid] ?? { groupName: "", groupType: "" };
    const row: (string | number | boolean | null | undefined)[] = [
      uid,
      groupInfo.groupName,
      groupInfo.groupType,
    ];
    for (const k of orderedKeys) {
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
  const filename =
    opts?.filename ??
    `export-${expId}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  createXlsxFile([messages, survey], filename);
}

// Helper: return mapping of survey question keys (q1..qN) to their English labels from i18n resources
export function getEnglishSurveyQuestionsMap(): Record<string, string> {
  const survey = ((resources as any)?.en?.translation?.survey ?? {}) as Record<
    string,
    unknown
  >;
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(survey)) {
    if (/^q\d+$/i.test(k) && typeof v === "string") map[k] = v as string;
  }
  return map;
}

// Helper: map a list of survey keys to English labels when available; leaves non-question keys intact
export function mapSurveyKeysToEnglish(keys: string[]): string[] {
  const m = getEnglishSurveyQuestionsMap();
  return keys.map((k) => m[k] ?? k);
}
