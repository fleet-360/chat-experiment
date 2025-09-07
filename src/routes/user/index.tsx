import { useTranslation } from "react-i18next";
import {  useNavigate } from "react-router";
import { Button } from "../../components/ui/button";


export default function UserIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const accept = () => navigate("/user/chat");
  const decline = () => navigate("/");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-xl border bg-background/60 backdrop-blur p-6 shadow-sm">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("consent.statement.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("consent.intro")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("consent.readConsent")}
          </p>
        </div>

        <div className="space-y-4">
          <section className="space-y-2">
            <h2 className="text-lg font-medium">
              {t("consent.statement.title")}
            </h2>
            <p className="leading-relaxed text-sm">
              {t("consent.statement.p1")}
            </p>
            <p className="leading-relaxed text-sm">
              {t("consent.statement.p2")}
            </p>
          </section>

          <hr className="my-2 border-border/60" />

          <section className="space-y-2">
            <h2 className="text-lg font-medium">
              {t("consent.about.title")}
            </h2>
            <p className="leading-relaxed text-sm">
              {t("consent.about.p1")}
            </p>
            <p className="leading-relaxed text-sm">
              {t("consent.about.p2")}
            </p>
            <p className="leading-relaxed text-sm">
              {t("consent.about.p3")}
            </p>
          </section>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={decline}>
            {t("consent.cta.decline")}
          </Button>
          <Button onClick={accept}>{t("consent.cta.accept")}</Button>
        </div>
      </div>
    </div>
  );
}
