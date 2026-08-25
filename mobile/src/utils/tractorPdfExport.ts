import { Platform } from 'react-native';

export const exportTractorCustomerBill = (customerName: string, records: any[], user?: any) => {
  const familyName = user?.family?.name_gu || (user?.name ? `${user.name}નો પરિવાર` : 'PersonalInfo');
  const ownerName = user?.profile?.full_name_gu || user?.name || 'ખેડૂત મિત્ર';

  const totalAmount = records.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
  const paidAmount = records.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0);
  const remainingAmount = totalAmount - paidAmount;

  const rows = records.map((r, i) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: center;">${i + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">${r.work_date}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #1E3A8A;">${r.operation_type}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: center;">${r.trips_count} વાર</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: center;">${r.units_count} ${r.calc_basis === 'vigha' ? 'વીઘા' : 'કલાક'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: right;">₹${Number(r.rate_per_unit).toLocaleString('en-IN')}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: bold; color: #059669;">
        ₹${Number(r.total_amount).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8">
  <title>ટ્રેક્ટર કામ હિસાબ બિલ - ${customerName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rasa:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Rasa', serif; margin: 30px; color: #0F172A; }
    .bill-card { border: 2px solid #1E3A8A; border-radius: 12px; padding: 24px; }
    .header { text-align: center; border-bottom: 2px dashed #CBD5E1; padding-bottom: 16px; margin-bottom: 20px; }
    .title { color: #1E3A8A; font-size: 24px; margin: 0; font-weight: 800; }
    .sub { color: #D97706; font-size: 14px; margin-top: 4px; font-weight: bold; }
    .customer-banner { background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .cust-name { font-size: 18px; font-weight: 800; color: #1E3A8A; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background-color: #1E3A8A; color: #FFFFFF; padding: 10px; text-align: left; font-size: 13px; }
    .summary-box { margin-top: 24px; float: right; width: 300px; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; background-color: #F8FAFC; }
    .sum-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
    .sum-total { font-size: 16px; font-weight: 900; color: #059669; border-top: 1px solid #CBD5E1; padding-top: 6px; margin-top: 6px; }
    .footer { clear: both; text-align: center; font-size: 12px; color: #94A3B8; padding-top: 40px; }
  </style>
</head>
<body>
  <div class="bill-card">
    <div class="header">
      <h1 class="title">🚜 ${familyName} • ટ્રેક્ટર સર્વિસ હિસાબ</h1>
      <div class="sub">દાંતી, રાંપ, માઢ, સાવડા, રોટાવેટર & થ્રેસર કામની પહોંચ</div>
      <div style="font-size: 12px; color: #64748B; margin-top: 4px;">સંપર્ક / માલિક: ${ownerName}</div>
    </div>

    <div class="customer-banner">
      <div>
        <div style="font-size: 12px; color: #64748B;">ગ્રાહક / ખેડૂત મિત્રનું નામ:</div>
        <div class="cust-name">શ્રી ${customerName}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; color: #64748B;">બિલ તારીખ:</div>
        <div style="font-weight: bold; font-size: 14px;">${new Date().toLocaleDateString('gu-IN')}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">ક્રમ</th>
          <th>તારીખ</th>
          <th>કામની વિગત (ઓપરેશન)</th>
          <th style="text-align: center;">ફેરા (વાર)</th>
          <th style="text-align: center;">માપ (વીઘા/કલાક)</th>
          <th style="text-align: right;">ભાવ / એકમ</th>
          <th style="text-align: right;">કુલ રકમ</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="sum-row">
        <span>કુલ કામ રકમ:</span>
        <span style="font-weight: bold;">₹${totalAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="sum-row">
        <span>જમા કરેલ રકમ:</span>
        <span style="font-weight: bold; color: #059669;">₹${paidAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="sum-row sum-total">
        <span>બાકી લેણી રકમ:</span>
        <span style="color: ${remainingAmount > 0 ? '#DC2626' : '#059669'};">₹${remainingAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div class="footer">
      આ બિલ PersonalInfo એપ્લિકેશનમાંથી આપોઆપ જનરેટ થયેલ છે.
    </div>
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
