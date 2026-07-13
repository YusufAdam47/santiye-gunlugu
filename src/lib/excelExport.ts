import * as XLSX from 'xlsx';
import { Entry } from './supabase';

export function exportEntriesToExcel(entries: Entry[]) {
  const rows = entries.map((e) => {
    const d = new Date(e.created_at);
    const extraStr = e.extra
      ? Object.entries(e.extra)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      : '';
    return {
      Tarih: d.toLocaleDateString('tr-TR'),
      Saat: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      Kod: e.entry_code || '',
      Firma: e.company || '',
      'Proje / Blok': e.project,
      'İmalat Kalemi': e.work,
      Ekstra: extraStr,
      Not: e.note || '',
      Enlem: e.gps_lat ?? '',
      Boylam: e.gps_lng ?? '',
      'Fotoğraf/Video Sayısı': e.media_urls?.length || 0,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 12 }, // Tarih
    { wch: 8 }, // Saat
    { wch: 10 }, // Kod
    { wch: 18 }, // Firma
    { wch: 14 }, // Proje/Blok
    { wch: 16 }, // İmalat Kalemi
    { wch: 24 }, // Ekstra
    { wch: 40 }, // Not
    { wch: 12 }, // Enlem
    { wch: 12 }, // Boylam
    { wch: 10 }, // Medya sayısı
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kayıtlar');

  const fileName = `santiye-gunlugu-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
