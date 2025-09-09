import { Link } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Settings } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export type AdminSidebarGroup = {
  groupId: string;
  groupName: string;
  users?: string[];
};

export interface AdminSidebarProps {
  groups: AdminSidebarGroup[];
  value?: string;
  onChange?: (groupId: string) => void;
  onExportAll?: () => void;
  className?: string;
  experimentName:string;
}

export default function AdminSidebar({
  groups,
  value,
  onChange,
  onExportAll,
  className,
  experimentName,
}: AdminSidebarProps) {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  return (
    <aside
      className={
        "flex h-full flex-col border rounded-md bg-background " +
        (className || "")
      }
    >
      <div className="flex items-center gap-2 p-3 border-b bg-muted/50">
        <div className="px-2 py-1 text-xs font-semibold rounded bg-muted text-foreground">
          {experimentName}
        </div>
        <Link
          to="/admin/settings"
          className="p-2 rounded hover:bg-muted"
          aria-label={t("nav.settings")}
        >
          <Settings className="size-4" />
        </Link>
        <button
          type="button"
          onClick={onExportAll}
          className="ms-auto inline-flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-muted"
        >
          <span>{t("pages.adminExportAll")}</span>
          <Download className="size-4" />
        </button>
      </div>

      <Command className="rounded-none border-0 flex-1 flex flex-col">
        <CommandInput
          placeholder={t("pages.adminSearchPlaceholder")}
          value={search}
          onValueChange={setSearch}
          className="h-12"
        />
        <CommandList className="max-h-none h-auto flex-1">
          <CommandEmpty>
            {t("pages.adminNoGroups")}
          </CommandEmpty>
          <CommandGroup heading={t("pages.adminGroups")}>
            {groups.map((g) => {
              const searchValue = `${g.groupName ?? ""} ${(g.users || []).join(
                " "
              )}`;
              return (
                <CommandItem
                  key={g.groupId}
                  value={searchValue}
                  onSelect={() => onChange?.(g.groupId)}
                  className={
                    (value === g.groupId ? "bg-muted " : "") + "border-b"
                  }
                >
                  <div className="w-full">
                    <div className="font-medium text-sm">
                      {g.groupName || g.groupId}
                    </div>
                    {g.users && g.users.length > 0 ? (
                      <div className="mt-1 text-[11px] text-muted-foreground truncate">
                        {g.users.map((id) => `${t("chat.prolificIdPrefix")}${id}`).join(", ")}
                      </div>
                    ) : null}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </aside>
  );
}
