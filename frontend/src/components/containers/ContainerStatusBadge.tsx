import { useTranslation } from "react-i18next";

type Props = {
  status: string; // из Docker: running, exited, paused, etc.
};

export default function ContainerStatusBadge({ status }: Props) {
  const { t } = useTranslation();

  const normalized = status.toLowerCase();

  let labelKey: string;
  let colorClasses: string;
  let dotColor: string;

  if (normalized === "running") {
    labelKey = "containers.status.running";
    colorClasses =
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
    dotColor = "bg-emerald-400";
  } else if (normalized === "paused") {
    labelKey = "containers.status.paused";
    colorClasses = "bg-amber-500/10 text-amber-300 border-amber-500/40";
    dotColor = "bg-amber-400";
  } else {
    labelKey = "containers.status.exited";
    colorClasses = "bg-rose-500/10 text-rose-300 border-rose-500/40";
    dotColor = "bg-rose-400";
  }

  return (
    <span
      className={
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs " +
        colorClasses
      }
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {t(labelKey)}
    </span>
  );
}
