export function toCsv(rows: Array<Record<string, string | number | null | undefined>>) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const body = rows.map((row) =>
    headers
      .map((key) => {
        const value = row[key] ?? "";
        return `"${String(value).replaceAll('"', '""')}"`;
      })
      .join(","),
  );

  return ["\uFEFF" + headers.join(","), ...body].join("\n");
}

export function dateText(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
