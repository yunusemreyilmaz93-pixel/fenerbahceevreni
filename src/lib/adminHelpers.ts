export const generateSlug = (text: string): string => {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
    'â': 'a', 'î': 'i', 'û': 'u'
  };
  let clean = text;
  Object.keys(trMap).forEach(key => {
    clean = clean.replace(new RegExp(key, 'g'), trMap[key]);
  });
  return clean
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const calculateReadingTime = (content: string): string => {
  if (!content) return "Yaklaşık okuma süresi: 1 dakika";
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `Yaklaşık okuma süresi: ${minutes} dakika`;
};

export const exportToCSV = (data: any[], fields: string[], filename: string) => {
  if (!data || data.length === 0) return;
  const csvRows = [];
  
  // Headers row
  csvRows.push(fields.map(f => `"${f.toUpperCase()}"`).join(','));
  
  // Data rows
  for (const row of data) {
    const values = fields.map(field => {
      const val = row[field] !== undefined && row[field] !== null ? row[field] : '';
      const stringified = typeof val === 'object' ? JSON.stringify(val) : String(val);
      const cleanVal = stringified.replace(/"/g, '""');
      return `"${cleanVal}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
};
