//Test status styling to be used in other files

export function getStatusStyle(stepStatus: string): React.CSSProperties {
    const upper = stepStatus.toUpperCase();
    if (upper === "PASS") {
      return { color: "green", fontWeight: "bold" };
    } else if (upper === "FAIL") {
      return { color: "red", fontWeight: "bold" };
    } else {
      return {};
    }
  }
