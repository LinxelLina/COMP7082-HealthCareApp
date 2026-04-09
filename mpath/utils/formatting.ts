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