import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="text-center text-slate-100">
      <h1 className="text-2xl font-bold mb-2">{t("login.title")}</h1>
      <p className="text-sm text-slate-400 mb-6">
        {t("login.subtitle")}
      </p>
      <p className="text-slate-300 text-sm">
        {t("login.description")}
      </p>
    </div>
  );
}
