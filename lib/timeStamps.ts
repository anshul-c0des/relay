export function formatTimestamp(timestamp: number) {
  if (!timestamp || isNaN(timestamp)) {
    return "";
  }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "";
    }
    
    const now = new Date();
  
    const isToday =
      date.toDateString() === now.toDateString();
  
    const isSameYear =
      date.getFullYear() === now.getFullYear();
  
    if (isToday) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    }
  
    if (isSameYear) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    }
  
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }