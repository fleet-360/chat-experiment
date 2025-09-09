import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { loginWithPassword, isAdminConfigured } from "../../services/adminAuth";

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdminConfigured()) {
      setError(t("common.missingAdminConfig"));
      return;
    }

    // Prefer token if present
    const res = loginWithPassword(username.trim(), password);
    const ok = typeof res === "boolean" ? res : await res;
    
    if (ok) {
      navigate("/admin/chat");
    } else {
      setError(t("common.invalidCredentials"));
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-start">{t("nav.admin")} {t("common.login")}</h1>
          <p className="text-sm text-muted-foreground text-start">{t("app.title")}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="username" className="text-sm text-start">{t("common.username")}</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm text-start">{t("common.password")}</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* <div className="text-xs text-muted-foreground text-center">{t("common.or")}</div>

          <div className="grid gap-2">
            <label htmlFor="token" className="text-sm text-start">{t("common.token")}</label>
            <input
              id="token"
              type="text"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t("common.token")}
            />
          </div> */}

          {error && (
            <div role="alert" className="text-sm text-destructive text-start">{error}</div>
          )}

          <div className="flex items-center gap-2">
            <Button type="submit" className="min-w-28">{t("common.login")}</Button>
            <div className="ms-auto text-xs">
              <Link to="/user" className="underline">{t("common.goToUser")}</Link>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
