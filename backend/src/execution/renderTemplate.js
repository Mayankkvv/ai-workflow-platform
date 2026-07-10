export const renderTemplate = (template, data) => {
  if (typeof template !== "string") {
    return template;
  }

  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
    const value = path
      .split(".")
      .reduce((current, key) => (current != null ? current[key] : undefined), data);

    if (value === undefined) {
      return match;
    }

    return typeof value === "object" ? JSON.stringify(value) : String(value);
  });
};