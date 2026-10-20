function cell(value) {
  let s = String(value ?? '');
  // Stop spreadsheet formula injection (a note like "=HYPERLINK(...)")
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function toCsv(rows) {
  // \uFEFF (BOM) makes Excel read the file as UTF-8
  return '\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n');
}
