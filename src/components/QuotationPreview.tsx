import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DiscountItem {
  label: string;
  amount: number;
}

interface QuotationPreviewProps {
  data: {
    schoolName: string;
    recipient: string;
    itemName: string;
    planType: string;
    headcount: number;
    serviceStart: string;
    serviceEnd: string;
    unitPrice: number;
    discounts: DiscountItem[];
    note: string;
  };
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  // 계산
  const months = (() => {
    const start = new Date(data.serviceStart);
    const end = new Date(data.serviceEnd);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  })();
  const subtotal = data.unitPrice * data.headcount * months;
  const totalDiscount = data.discounts.reduce((sum, d) => sum + d.amount, 0);
  const supplyAmount = subtotal - totalDiscount;
  const vat = Math.round(supplyAmount / 11);
  const total = supplyAmount + vat;

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('견적서.pdf');
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div ref={printRef} style={{ background: '#fff', padding: 32, width: 800, margin: '0 auto', fontFamily: 'sans-serif', color: '#222' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>견적서</h2>
        <div style={{ marginBottom: 16 }}>
          <b>작성일자:</b> {new Date().toISOString().slice(0, 10).replace(/-/g, '년 ').replace(/-(\d{2})$/, '월 $1일')}<br />
          <b>수신:</b> {data.recipient} 귀하<br />
          <b>학교명:</b> {data.schoolName}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }} border={1}>
          <tbody>
            <tr><th>항목명</th><td>{data.itemName}</td></tr>
            <tr><th>플랜 유형</th><td>{data.planType}</td></tr>
            <tr><th>1인당 월 단가</th><td>{data.unitPrice.toLocaleString()}원</td></tr>
            <tr><th>인원수</th><td>{data.headcount}명</td></tr>
            <tr><th>계약기간</th><td>{months}개월 ({data.serviceStart}~{data.serviceEnd})</td></tr>
            {data.discounts.map((d, i) => (
              <tr key={i}><th>{d.label}</th><td style={{ color: 'red' }}>-{d.amount.toLocaleString()}원</td></tr>
            ))}
            <tr><th>공급가액</th><td>{supplyAmount.toLocaleString()}원</td></tr>
            <tr><th>부가세</th><td>{vat.toLocaleString()}원</td></tr>
            <tr><th>총 금액</th><td><b>{total.toLocaleString()}원</b></td></tr>
          </tbody>
        </table>
        <div style={{ marginBottom: 16 }}>
          <b>비고:</b><br />
          <pre style={{ fontFamily: 'inherit', background: '#f8f8f8', padding: 8 }}>{data.note}</pre>
        </div>
        <div style={{ fontSize: 14, color: '#555' }}>
          <b>입금 계좌 안내</b><br />
          - 은행명: 국민은행<br />
          - 계좌번호: 810137-04-015409<br />
          - 예금주: (주)튜링
        </div>
      </div>
      <button onClick={handleDownloadPdf} style={{ margin: '24px auto', display: 'block' }}>PDF로 저장</button>
    </div>
  );
};

export default QuotationPreview; 