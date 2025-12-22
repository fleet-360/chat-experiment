import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Card } from "../../components/ui/card";
import { useExperiment } from "../../context/ExperimentContext";
import { toDate } from "../../lib/helpers/dateTime.helper";

const WaitPage = () => {
  const { data } = useExperiment();
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const startDate = useMemo(() => toDate(data?.settings.startDate), [
    data?.settings.startDate,
  ]);

  const formattedStart = useMemo(() => {
    if (!startDate) return null;
    return startDate.toLocaleString("en-GB");
  }, [i18n.language, startDate]);

  const checkStart =useCallback(()=>{
    if (startDate && startDate.getTime() <= Date.now()) {
      navigate("/user/welcome?PROLIFIC_PID=" + localStorage.getItem("userId"));
    }
  },[navigate, startDate])

  useEffect(() => {
    checkStart()
    const interval = setInterval(checkStart, 1000);

    return () => clearInterval(interval);
  }, [checkStart]);

  if (!startDate) {
    return (
      <div className="flex justify-center p-4">
        <Card className="w-full max-w-2xl p-6">
          <p className="text-sm text-muted-foreground text-start">
            {t("pages.experimentStartUnknown")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-2xl space-y-6 p-6">
        <p className="text-4xl font-semibold text-center leading-12">
          {t("pages.experimentStartsAt", { dateTime: formattedStart })}
        </p>
        <p className="text-xl text-muted-foreground text-center">
          {t("pages.waitForStart")}
        </p>
      </Card>
    </div>
  );
};

export default WaitPage;