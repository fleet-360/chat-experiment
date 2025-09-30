// import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
// import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function UserIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const [consented, setConsented] = useLocalStorage<boolean>({
  //   key: "consentAccepted",
  //   initialValue: false,
  // });
  // const [step, setStep] = useState<"consent" | "about">("consent");

  // useEffect(() => {
  //   // if (consented) setStep("about");
  // }, [consented]);

  const accept = () => navigate("/user/chat");
  const decline = () => navigate("/user/thank-you");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* {step === "consent" ? */}
      <Card>
        <CardHeader>
          {/* <CardTitle>{t("consent.statement.title")}</CardTitle> */}
          <CardTitle>{t("consent.intro")}</CardTitle>
          <CardDescription>{t("consent.readConsent")}</CardDescription>
        </CardHeader>
        <h2
          style={{
            fontWeight: "bold",
            marginLeft: "1.5rem",
          }}
        >
          {t("consent.statement.title")}
        </h2>
        <CardContent className="space-y-2">
          <p className="leading-relaxed text-sm">{t("consent.statement.p1")}</p>
          <p className="leading-relaxed text-sm">{t("consent.statement.p2")}</p>
        </CardContent>
        <h2
          style={{
            fontWeight: "bold",
            marginLeft: "1.5rem",
          }}
        >
          {t("consent.about.title")}
        </h2>
        <CardContent className="space-y-2">
          <p className="leading-relaxed text-sm">{t("consent.about.p1")}</p>
          <p className="leading-relaxed text-sm">{t("consent.about.p2")}</p>
          <p className="leading-relaxed text-sm">{t("consent.about.p3")}</p>
          <p className="leading-relaxed text-sm">{t("consent.about.p4")}</p>
          <p className="leading-relaxed text-sm" style={{ color: "blue" }}>
            {t("consent.about.p5")}
          </p>
          <p className="leading-relaxed text-sm" style={{ color: "red" }}>
            {t("consent.about.p6")}
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={decline}>
            {t("consent.cta.decline")}
          </Button>
          <Button onClick={accept}>{t("consent.cta.accept")}</Button>
        </CardFooter>
      </Card>

      {/* // : (
      //   <Card>
      //     <CardHeader>
      //       <CardTitle>{t("consent.about.title")}</CardTitle>
      //     </CardHeader>
      //     <CardContent className="space-y-2">
      //       <p className="leading-relaxed text-sm">{t("consent.about.p1")}</p>
      //       <p className="leading-relaxed text-sm">{t("consent.about.p2")}</p>
      //       <p className="leading-relaxed text-sm">{t("consent.about.p3")}</p>
      //     </CardContent>
      //     <CardFooter className="justify-end">
      //       <Button onClick={accept}>{t("nav.chat")}</Button>
      //     </CardFooter>
      //   </Card>
      // )} */}
    </div>
  );
}
