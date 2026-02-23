export function formatTimestamp(timestamp: number) {   // formats the time/day/year
  if (!timestamp || isNaN(timestamp)) {
    return "";
  }
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();   // check is current date today

  const isSameYear = date.getFullYear() === now.getFullYear();   // checks whether the date is in current year

  if (isToday) {   // if today then only show time
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  if (isSameYear) {
    return new Intl.DateTimeFormat("en-US", {   // if current year then show day and month also
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {   // show year if not current year
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
