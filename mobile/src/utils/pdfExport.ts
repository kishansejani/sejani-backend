import { Platform } from 'react-native';
import { PersonalRecord, User } from '../types';

export const exportRecordToPdf = (record: PersonalRecord, user?: User | null) => {
  const userName = user?.profile?.full_name_gu || user?.name || 'સભ્ય';
  const familyName = user?.family?.name_gu || (user?.name ? `${user.name}નો પરિવાર` : 'Farm Connect');

  const htmlContent = `
<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8">
  <title>${record.title} - ${familyName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rasa:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Rasa', serif;
      margin: 40px;
      color: #0F172A;
      background-color: #FFFFFF;
      letter-spacing: 0.2px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1E3A8A;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .family-title {
      color: #1E3A8A;
      font-size: 28px;
      font-weight: 800;
      margin: 0;
    }
    .sub-title {
      color: #D97706;
      font-size: 16px;
      font-weight: 700;
      margin-top: 5px;
    }
    .badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: bold;
      background-color: #EFF6FF;
      color: #1E3A8A;
      margin-top: 10px;
    }
    .record-card {
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .record-title {
      font-size: 24px;
      color: #0F172A;
      margin-top: 0;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 12px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      font-size: 15px;
      color: #64748B;
    }
    .amount-box {
      background-color: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: 8px;
      padding: 12px 18px;
      font-size: 22px;
      font-weight: 800;
      color: #D97706;
      display: inline-block;
      margin-bottom: 20px;
    }
    .content-box {
      font-size: 17px;
      line-height: 1.8;
      color: #334155;
      background-color: #F8FAFC;
      padding: 18px;
      border-radius: 8px;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 13px;
      color: #94A3B8;
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="family-title">${familyName}</h1>
    <div class="sub-title">અંગત તિજોરી દસ્તાવેજ • ${userName}</div>
    <span class="badge">🔒 ખાનગી રેકોર્ડ (ID: ${record.id})</span>
  </div>

  <div class="record-card">
    <h2 class="record-title">${record.title}</h2>
    
    <div class="meta-row">
      <div><strong>પ્રકાર:</strong> ${record.record_type.toUpperCase()}</div>
      <div><strong>તારીખ:</strong> ${record.record_date}</div>
      <div><strong>કેટેગરી:</strong> ${record.category || 'સામાન્ય'}</div>
    </div>

    ${record.amount ? `<div class="amount-box">રકમ: ₹${Number(record.amount).toLocaleString('en-IN')}</div>` : ''}

    <div class="content-box">
      <strong>વિગતવાર નોંધ:</strong><br/>
      ${record.content || 'કોઈ વધારાની વિગત નથી.'}
    </div>
  </div>

  <div class="footer">
    આ દસ્તાવેજ Farm Connect એપ્લિકેશનમાંથી સુરક્ષિત રીતે જનરેટ કરવામાં આવ્યો છે.
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

export const exportAllRecordsToPdf = (records: PersonalRecord[], user?: User | null) => {
  const userName = user?.profile?.full_name_gu || user?.name || 'સભ્ય';
  const familyName = user?.family?.name_gu || (user?.name ? `${user.name}નો પરિવાર` : 'Farm Connect');
  
  const totalAmount = records
    .filter(r => r.record_type === 'expense' && r.amount)
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const rows = records.map((r, i) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: center;">${i + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight: bold;">${r.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">${r.record_type}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">${r.record_date}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: bold; color: ${r.amount ? '#D97706' : '#64748B'};">
        ${r.amount ? '₹' + Number(r.amount).toLocaleString('en-IN') : '-'}
      </td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8">
  <title>અંગત તિજોરી રિપોર્ટ - ${familyName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rasa:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Rasa', serif;
      margin: 40px;
      color: #0F172A;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1E3A8A;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .family-title {
      color: #1E3A8A;
      font-size: 28px;
      font-weight: 800;
      margin: 0;
    }
    .sub {
      color: #D97706;
      font-size: 16px;
      font-weight: 700;
      margin-top: 4px;
    }
    .summary-box {
      background-color: #EFF6FF;
      border: 1px solid #BFDBFE;
      padding: 14px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background-color: #1E3A8A;
      color: #FFFFFF;
      padding: 10px;
      text-align: left;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #94A3B8;
      margin-top: 30px;
      border-top: 1px solid #E2E8F0;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="family-title">${familyName}</h1>
    <div class="sub">મારી તમામ અંગત નોંધો અને ખર્ચ રિપોર્ટ • ${userName}</div>
  </div>

  <div class="summary-box">
    <div><strong>કુલ રેકોર્ડ્સ:</strong> ${records.length}</div>
    <div><strong>કુલ ખર્ચ:</strong> ₹${totalAmount.toLocaleString('en-IN')}</div>
    <div><strong>તારીખ:</strong> ${new Date().toLocaleDateString('gu-IN')}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px; text-align: center;">ક્રમ</th>
        <th>શીર્ષક</th>
        <th>પ્રકાર</th>
        <th>તારીખ</th>
        <th style="text-align: right;">રકમ</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="footer">
    આ દસ્તાવેજ Farm Connect એપ્લિકેશનમાંથી સુરક્ષિત રીતે જનરેટ કરવામાં આવ્યો છે.
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
