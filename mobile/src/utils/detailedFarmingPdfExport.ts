import { Platform } from 'react-native';

export const exportDetailedFarmingReport = (
  summary: any,
  productions: any[],
  expenses: any[],
  tractorWorks: any[],
  user?: any
) => {
  const familyName = user?.family?.name_gu || (user?.name ? `${user.name}નો પરિવાર` : 'Farm Connect');
  const ownerName = user?.profile?.full_name_gu || user?.name || 'ખેડૂત મિત્ર';

  // 1. Production Rows
  const prodRows = productions.map((p, i) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${i + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #065F46;">${p.crop_name_gu}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${p.quantity} ${p.unit?.toUpperCase()} (${p.equivalent_man || '-'} મણ / ${p.equivalent_kg ? Number(p.equivalent_kg).toLocaleString('en-IN') + ' KG' : '-'})</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">₹${Number(p.rate_per_unit).toLocaleString('en-IN')}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${p.sale_date}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${p.buyer_name || '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 800; color: #059669;">
        + ₹${Number(p.total_amount).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  // 2. Group & detail all expenses (Dava, Khatar, Majuri, Tractor)
  const expRows = expenses.map((e, i) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${i + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">${e.title_gu}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; color: #64748B;">${e.expense_type}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${e.expense_date}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${e.quantity_or_hours ? `${e.quantity_or_hours} × ₹${e.unit_rate}` : '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 800; color: #DC2626;">
        - ₹${Number(e.amount).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  // 3. Tractor works rows
  const tractorRows = tractorWorks.map((t, i) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${i + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #1E3A8A;">${t.customer_name} (${t.operation_type})</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${t.work_date}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${t.trips_count} વાર</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${t.units_count} ${t.calc_basis === 'vigha' ? 'વીઘા' : 'કલાક'} × ₹${t.rate_per_unit}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 800; color: ${t.work_category === 'customer' ? '#059669' : '#DC2626'};">
        ₹${Number(t.total_amount).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const totalRev = Number(summary?.total_revenue || 0);
  const totalExp = Number(summary?.total_expense || 0);
  const netProf = Number(summary?.net_profit || 0);

  const htmlContent = `
<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8">
  <title>સંપૂર્ણ ખેતીવાડી & ખર્ચ હિસાબ - ${familyName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rasa:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Rasa', serif; margin: 30px; color: #0F172A; }
    .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 20px; }
    .title { color: #065F46; font-size: 26px; margin: 0; font-weight: 800; }
    .sub { color: #D97706; font-size: 15px; margin-top: 4px; font-weight: bold; }
    .summary-grid { display: flex; justify-content: space-between; margin-bottom: 24px; gap: 12px; }
    .sum-box { flex: 1; padding: 14px; border-radius: 8px; text-align: center; border: 1px solid #E2E8F0; }
    .rev { background-color: #ECFDF5; border-color: #A7F3D0; }
    .exp { background-color: #FEF2F2; border-color: #FECACA; }
    .prof { background-color: #EFF6FF; border-color: #BFDBFE; }
    .sec-head { font-size: 17px; font-weight: 800; color: #065F46; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background-color: #065F46; color: #FFFFFF; padding: 8px 10px; font-size: 13px; text-align: left; }
    .footer { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">🌾 ${familyName} • સંપૂર્ણ ખેતીવાડી & ખર્ચ હિસાબ</h1>
    <div class="sub">પાક ઉત્પાદન (ખાંડી/મણ), દવા, ખાતર, મજૂરી & ટ્રેક્ટર હિસાબ રિપોર્ટ</div>
    <div style="font-size: 12px; color: #64748B; margin-top: 4px;">ખેડૂત / ઓનર: ${ownerName} • તારીખ: ${new Date().toLocaleDateString('gu-IN')}</div>
  </div>

  <div class="summary-grid">
    <div class="sum-box rev">
      <div style="font-size: 12px; color: #059669; font-weight: bold;">કુલ પાક વેચાણ આવક</div>
      <div style="font-size: 22px; font-weight: 900; color: #065F46; margin-top: 4px;">+ ₹${totalRev.toLocaleString('en-IN')}</div>
    </div>
    <div class="sum-box exp">
      <div style="font-size: 12px; color: #DC2626; font-weight: bold;">કુલ ખેતીવાડી ખર્ચ</div>
      <div style="font-size: 22px; font-weight: 900; color: #991B1B; margin-top: 4px;">- ₹${totalExp.toLocaleString('en-IN')}</div>
    </div>
    <div class="sum-box prof">
      <div style="font-size: 12px; color: #1E3A8A; font-weight: bold;">ચોખ્ખો ખેતી નફો (Net Profit)</div>
      <div style="font-size: 22px; font-weight: 900; color: #1E3A8A; margin-top: 4px;">₹${netProf.toLocaleString('en-IN')}</div>
    </div>
  </div>

  <div class="sec-head">૧. પાક ઉત્પાદન અને વેચાણ વિગત (મગફળી, કપાસ વગેરે)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 35px; text-align: center;">ક્રમ</th>
        <th>પાક</th>
        <th>જથ્થો (એકમ & મણ)</th>
        <th>ભાવ</th>
        <th>તારીખ</th>
        <th>વેપારી / યાર્ડ</th>
        <th style="text-align: right;">કુલ રકમ</th>
      </tr>
    </thead>
    <tbody>${prodRows || '<tr><td colspan="7" style="text-align: center; padding: 10px;">કોઈ પાક નોંધાયેલ નથી</td></tr>'}</tbody>
  </table>

  <div class="sec-head">૨. ખેતી ખર્ચ વિગતવાર હિસાબ (દવા, ખાતર, મજૂરી, બિયારણ)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 35px; text-align: center;">ક્રમ</th>
        <th>ખર્ચ વિગત / નામ</th>
        <th>પ્રકાર</th>
        <th>તારીખ</th>
        <th>ગણતરી (સંખ્યા × ભાવ)</th>
        <th style="text-align: right;">ખર્ચ રકમ</th>
      </tr>
    </thead>
    <tbody>${expRows || '<tr><td colspan="6" style="text-align: center; padding: 10px;">કોઈ ખર્ચ નોંધાયેલ નથી</td></tr>'}</tbody>
  </table>

  <div class="sec-head">૩. ટ્રેક્ટર કામ હિસાબ (દાંતી, રાંપ, માઢ, ગ્રાહક બિલ)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 35px; text-align: center;">ક્રમ</th>
        <th>ગ્રાહક / કામ</th>
        <th>તારીખ</th>
        <th style="text-align: center;">ફેરા (વાર)</th>
        <th style="text-align: center;">માપ × ભાવ</th>
        <th style="text-align: right;">રકમ</th>
      </tr>
    </thead>
    <tbody>${tractorRows || '<tr><td colspan="6" style="text-align: center; padding: 10px;">કોઈ ટ્રેક્ટર કામ નોંધાયેલ નથી</td></tr>'}</tbody>
  </table>

  <div class="footer">
    આ દસ્તાવેજ Farm Connect એપ્લિકેશનમાંથી આપોઆપ જનરેટ થયેલ છે.
  </div>
</body>
</html>
`;

  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    }
  }
};
