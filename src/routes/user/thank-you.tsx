import { useEffect } from "react";

export default function ThankYouPage() {
  useEffect(() => {
    window.location.replace(
      "https://app.prolific.com/submissions/complete?cc=C1L6WD6U"
    );
  }, []);

  // Legacy Thank You UI (kept for optional use):
  // import { useTranslation } from "react-i18next";
  // import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
  // import { Button } from "../../components/ui/button";
  // import { useNavigate } from "react-router";
  //
  // const { t } = useTranslation();
  // const navigate = useNavigate();
  //
  // return (
  //   <div className="container mx-auto max-w-2xl px-4 py-12">
  //     <Card>
  //       <CardHeader>
  //         <CardTitle>{t("survey.thankYouTitle")}</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <p className="text-sm text-muted-foreground">
  //           {t("survey.thankYouBody")}
  //         </p>
  //       </CardContent>
  //       <CardFooter>
  //         <Button className="ms-auto" onClick={() => navigate("/user")}>
  //           {t("app.finish")}
  //         </Button>
  //       </CardFooter>
  //     </Card>
  //   </div>
  // );

  return null;
}
