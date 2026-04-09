export const formatReminderTime = (value: Date) => {
    const hours = value.getHours().toString().padStart(2, "0");
    const minutes = value.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

export const formatReminderLabel = (value: Date) =>
    value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const formatTargetDateLabel = (value: Date) => {
    const dateLabel = value.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeLabel = value.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${dateLabel} at ${timeLabel}`;
  };

export function normalizeGoalTitle(value: string | string[] | undefined) {
  const title = Array.isArray(value) ? value[0] : value;

  if (!title) {
    return "";
  }

  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

export function parseMilestoneTarget(value: string) {
  return value.trim() === "" ? null : parseInt(value, 10);
}


export function getSavedDurationSummary(durationDate?: string) {
  if (!durationDate?.trim()) {
    return {
      durationText: "",
      targetDateLabel: "",
    };
  }

  const endDate = new Date(durationDate);
  const diff = endDate.getTime() - Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (Number.isNaN(endDate.getTime())) {
    return {
      durationText: "",
      targetDateLabel: "",
    };
  }

  const targetDateLabel = endDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const durationText =
    diff < 0
      ? `Overdue by ${(Math.abs(diff) / oneDay).toFixed(1)} days`
      : `${(diff / oneDay).toFixed(1)} days left`;

  return {
    durationText,
    targetDateLabel,
  };
}