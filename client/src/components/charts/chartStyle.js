// Recharts tooltips are styled with inline objects, so we point them at our CSS variables
// (defined in index.css) to follow light/dark mode automatically.
export const tooltipStyle = {
  backgroundColor: 'var(--pop-bg)',
  border: '1px solid var(--pop-border)',
  borderRadius: 8,
  color: 'var(--pop-fg)',
  fontSize: 13,
};
