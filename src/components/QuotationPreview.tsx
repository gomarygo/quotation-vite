import { useRef } from 'react';
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
  onBack?: () => void;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ data, onBack }) => {
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

  // 작성일자 및 문서번호 생성 (한국시간)
  const koreaNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const yyyy = koreaNow.getUTCFullYear();
  const mm = String(koreaNow.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(koreaNow.getUTCDate()).padStart(2, '0');
  const docDate = `${yyyy}${mm}${dd}`;
  const docNumber = `${docDate}-001`;
  const docDateStr = `${yyyy}년 ${mm}월 ${dd}일`;

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
      <div ref={printRef} style={{ background: '#fff', padding: 32, width: 800, margin: '0 auto', fontFamily: 'sans-serif', color: '#222', position: 'relative', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {/* 제목 */}
        <h2 style={{ textAlign: 'center', margin: '0 0 32px 0', fontSize: 32, fontWeight: 700, letterSpacing: 4 }}>견적서</h2>
        {/* 상단 정보 + 직인 */}
        <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
          <div><b>작성일자:</b> {docDateStr}</div>
          <div><b>문서번호:</b> {docNumber}</div>
          <div><b>상호:</b> (주)튜링</div>
          <div><b>대표:</b> 최민규</div>
          <div><b>사업자등록번호:</b> 254-87-01382</div>
          <div><b>업태 및 종목:</b> 정보통신업 / 응용소프트웨어 개발 및 공급</div>
          <div>
            <b>주소:</b> 서울특별시 강남구 언주로 540, 5층 (역삼동)
            <img src="/stamp.png" alt="직인" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 8, width: 60, height: 60, maxWidth: 60, maxHeight: 60, objectFit: 'contain', opacity: 0.8, background: 'transparent', border: 'none', zIndex: 10, position: 'relative', boxShadow: 'none', overflow: 'visible' }} />
          </div>
          <div><b>전화:</b> 070-4281-4869</div>
        </div>
        {/* 수신 정보 */}
        <div style={{ fontSize: 16, marginBottom: 8 }}><b>수신:</b> {data.recipient} 귀하</div>
        {/* 안내문구 */}
        <div style={{ fontSize: 16, marginBottom: 16 }}>
          귀사의 무궁한 발전을 기원합니다.<br />
          아래와 같이 견적드리오니 검토 부탁드립니다.
        </div>
        {/* 표 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 16, background: '#fff', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '30%' }} />
            <col style={{ width: '70%' }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#f0f4f8' }}>
              <th style={{ border: '1px solid #bbb', padding: 8, width: 90, textAlign: 'center' }}>구분</th>
              <th style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center' }}>내용</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ border: '1px solid #bbb', padding: 8 }}>학교명</td><td style={{ border: '1px solid #bbb', padding: 8 }}>{data.schoolName}</td></tr>
            <tr><td style={{ border: '1px solid #bbb', padding: 8 }}>항목</td><td style={{ border: '1px solid #bbb', padding: 8 }}>{data.itemName}</td></tr>
            <tr><td style={{ border: '1px solid #bbb', padding: 8 }}>플랜 유형</td><td style={{ border: '1px solid #bbb', padding: 8 }}>{data.planType}</td></tr>
            <tr><td style={{ border: '1px solid #bbb', padding: 8 }}>1인당 월 단가</td><td style={{ border: '1px solid #bbb', padding: 8, textAlign: 'right' }}>{data.unitPrice.toLocaleString()}원</td></tr>
            <tr><td style={{ border: '1px solid #bbb', padding: 8 }}>인원</td><td style={{ border: '1px solid #bbb', padding: 8 }}>{data.headcount}명</td></tr>
            <tr><td style={{ border: '1px solid #bbb', padding: 8 }}>계약기간</td><td style={{ border: '1px solid #bbb', padding: 8 }}>{months}개월 ({data.serviceStart}~{data.serviceEnd})</td></tr>
            {data.discounts.map((d, i) => (
              <tr key={i}><td style={{ border: '1px solid #bbb', padding: 8 }}>{d.label}</td><td style={{ border: '1px solid #bbb', padding: 8, color: 'red', textAlign: 'right' }}>-{d.amount.toLocaleString()}원</td></tr>
            ))}
            <tr><td style={{ border: '1px solid #bbb', padding: 8 }}>공급가액</td><td style={{ border: '1px solid #bbb', padding: 8, textAlign: 'right' }}>{supplyAmount.toLocaleString()}원</td></tr>
            <tr><td style={{ border: '1px solid #bbb', padding: 8 }}>부가세</td><td style={{ border: '1px solid #bbb', padding: 8, textAlign: 'right' }}>{vat.toLocaleString()}원</td></tr>
            <tr style={{ background: '#e8f0fe' }}><td style={{ border: '1px solid #1a73e8', padding: 8, fontWeight: 700 }}>총 금액</td><td style={{ border: '1px solid #1a73e8', padding: 8, fontWeight: 700, fontSize: 18, textAlign: 'right', color: '#1a73e8' }}>{total.toLocaleString()}원</td></tr>
          </tbody>
        </table>
        {/* 비고 */}
        <div style={{ marginBottom: 16 }}>
          <b>비고:</b><br />
          <pre style={{ fontFamily: 'inherit', background: '#f8f8f8', padding: 8, fontSize: 15 }}>{data.note}</pre>
        </div>
        {/* 입금 계좌 안내 */}
        <div style={{ fontSize: 15, color: '#222', marginBottom: 8, background: '#f8f8f8', padding: 12, borderRadius: 6 }}>
          <b>입금 계좌 안내</b><br />
          - 은행명: 국민은행<br />
          - 계좌번호: 810137-04-015409<br />
          - 예금주: (주)튜링
        </div>
        <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>
          본 견적서의 유효기간은 작성일로부터 30일입니다.<br />
          상기 금액은 부가가치세가 포함된 금액입니다.
        </div>
      </div>
      <button onClick={handleDownloadPdf} style={{ margin: '24px auto 0', display: 'block' }}>PDF로 저장</button>
      {onBack && (
        <button onClick={onBack} style={{ margin: '16px auto', display: 'block', background: '#eee', color: '#222', border: '1px solid #bbb', borderRadius: 4, padding: '10px 32px', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>
          입력으로 돌아가기
        </button>
      )}
    </div>
  );
};

export default QuotationPreview; 