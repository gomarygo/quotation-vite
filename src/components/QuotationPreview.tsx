import { useRef, useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DiscountItem {
  label: string;
  amount: number;
  type: 'percentage' | 'fixed';
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

  // 문서번호 자동 증가 (localStorage)
  const [docNumber, setDocNumber] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  useEffect(() => {
    const koreaNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const yyyy = koreaNow.getUTCFullYear();
    const mm = String(koreaNow.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(koreaNow.getUTCDate()).padStart(2, '0');
    const docDate = `${yyyy}`;
    const key = `quotation-docnum-${docDate}`;
    let nnn = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(nnn));
    setDocNumber(`${docDate}-${String(nnn).padStart(3, '0')}`);
    setCurrentDate(`${yyyy}년 ${mm}월 ${dd}일`);
  }, []);

  // 계산
  const monthsAndDays = (() => {
    const start = new Date(data.serviceStart);
    const end = new Date(data.serviceEnd);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return { months, days, totalDays: diffDays };
  })();
  const months = monthsAndDays.months;
  const days = monthsAndDays.days;
  const totalMonths = months;
  // 총 금액 = 인원 * 개월 * 1인당월단가
  const totalAmount = data.unitPrice * data.headcount * totalMonths;
  const calculateDiscountAmount = (discount: DiscountItem, totalAmount: number) => {
    if (discount.type === 'percentage') {
      return Math.round(totalAmount * (discount.amount / 100));
    }
    return discount.amount;
  };
  // 할인 합계
  const totalDiscount = data.discounts.reduce((sum, d) => sum + calculateDiscountAmount(d, totalAmount), 0);
  // 최종 견적가 = 총 금액 - 할인 합계
  const finalAmount = totalAmount - totalDiscount;

  // 한글 금액 변환 함수
  const convertToKoreanNumber = (num: number): string => {
    const units = ['', '만', '억', '조'];
    const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    const positions = ['', '십', '백', '천'];
    if (num === 0) return '금영원정';
    let result = '';
    let unitIndex = 0;
    while (num > 0) {
      let segment = num % 10000;
      let segmentStr = '';
      if (segment > 0) {
        let position = 0;
        while (segment > 0) {
          const digit = segment % 10;
          if (digit > 0) {
            segmentStr = digits[digit] + positions[position] + segmentStr;
          }
          segment = Math.floor(segment / 10);
          position++;
        }
        result = segmentStr + units[unitIndex] + result;
      }
      num = Math.floor(num / 10000);
      unitIndex++;
    }
    return '금' + result + '원정';
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, {
      scale: 2, // Higher quality
      useCORS: true, // Enable CORS for images
      logging: false,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 15; // Add margins
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);

    // 파일명: 작성일자 학교명 견적서.pdf (작성일자는 yymmdd 형식)
    const koreaNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const yy = String(koreaNow.getUTCFullYear()).slice(2, 4);
    const mm = String(koreaNow.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(koreaNow.getUTCDate()).padStart(2, '0');
    const yymmdd = `${yy}${mm}${dd}`;
    const cleanSchoolName = data.schoolName.replace(/[^가-힣a-zA-Z0-9]/g, '');
    const filename = `${yymmdd} ${cleanSchoolName} 견적서.pdf`;
    pdf.save(filename);
  };

  return (
    <div style={{ marginTop: 32, padding: '0 16px' }}>
      <div ref={printRef} style={{ 
        background: '#fff', 
        padding: 'clamp(16px, 5vw, 32px)', 
        width: '100%', 
        maxWidth: 800, 
        margin: '0 auto', 
        fontFamily: 'sans-serif', 
        color: '#222', 
        position: 'relative', 
        borderRadius: 8, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflowX: 'auto'
      }}>
        {/* 제목 */}
        <h2 style={{ textAlign: 'center', margin: '0 0 clamp(16px, 4vw, 32px) 0', fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, letterSpacing: 4 }}>견적서</h2>
        {/* 상단 정보 + 직인 */}
        <div style={{ fontSize: 'clamp(13px, 3vw, 15px)', lineHeight: 1.7, marginBottom: 16 }}>
          <div style={{ display: 'inline-block', position: 'relative', minWidth: 280, verticalAlign: 'top' }}>
            <div><b>작성일자:</b> {currentDate}</div>
            <div style={{ marginBottom: 12 }}><b>문서번호:</b> {docNumber}</div>
            <div>
              <div><b>상호:</b> (주)튜링 <b style={{ margin: '0 8px' }}>|</b> <b>대표:</b> 최민규</div>
              <div><b>사업자등록번호:</b> 254-87-01382</div>
              <div><b>업태 및 종목:</b> 정보통신업 / 응용소프트웨어 개발 및 공급</div>
              <div><b>주소:</b> 서울특별시 강남구 언주로 540, 5층 (역삼동)</div>
              <div><b>전화:</b> 070-4281-4869 <b style={{ margin: '0 8px' }}>|</b> <b>메일:</b> tax@teamturing.com</div>
            </div>
            {/* 직인 이미지 - PC에서는 글씨 끝에 맞춰 겹치게, 모바일에서는 아래쪽 */}
            <img
              src="stamp.png"
              alt="직인"
              style={{
                position: window.innerWidth > 600 ? 'absolute' : 'static',
                right: window.innerWidth > 600 ? 0 : 'auto',
                top: window.innerWidth > 600 ? '50%' : 'auto',
                transform: window.innerWidth > 600 ? 'translateY(-50%)' : 'none',
                width: 'clamp(60px, 15vw, 90px)',
                height: 'clamp(60px, 15vw, 90px)',
                objectFit: 'contain',
                opacity: 0.85,
                background: 'transparent',
                border: 'none',
                pointerEvents: 'none',
                zIndex: 2,
                margin: window.innerWidth > 600 ? 0 : '16px auto 0',
                display: window.innerWidth > 600 ? 'block' : 'block'
              }}
            />
          </div>
        </div>
        {/* 수신 정보 */}
        <div style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', marginBottom: 8 }}><b>수신:</b> {data.recipient}</div>
        {/* 안내문구 */}
        <div style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', marginBottom: 16 }}>
          항상 학교 운영에 노고가 많으십니다.<br />
          다음과 같이 견적서를 전달드리오니 검토 후 회신 부탁드립니다.
        </div>
        {/* 표 */}
        <style>
          {`
            @media (max-width: 600px) {
              table, thead, tbody, th, td, tr {
                display: block !important;
                width: 100% !important;
              }
              table {
                min-width: 0 !important;
              }
              thead tr {
                display: none !important;
              }
              tr {
                margin-bottom: 12px;
                border-bottom: 1px solid #eee;
              }
              td {
                text-align: left !important;
                padding-left: 8px !important;
                border: none !important;
                font-size: 15px !important;
                display: block !important;
                height: auto !important;
                min-height: auto !important;
              }
              td:before {
                content: attr(data-label);
                display: block;
                font-weight: bold;
                color: #888;
                margin-bottom: 2px;
              }
            }
            table th, table td {
              vertical-align: middle !important;
            }
          `}
        </style>
        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(14px, 3.5vw, 16px)', background: '#fff', tableLayout: 'auto', minWidth: 400 }}>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '70%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#f0f4f8' }}>
                <th style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>구분</th>
                <th style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>내용</th>
              </tr>
            </thead>
            <tbody>
              <tr><td data-label="구분" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>학교명</td><td data-label="내용" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>{data.schoolName}</td></tr>
              <tr><td data-label="구분" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>항목</td><td data-label="내용" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>{data.itemName} ({data.planType})</td></tr>
              <tr>
                <td data-label="구분" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>1인당 월 단가 / 인원</td>
                <td data-label="내용" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>{data.unitPrice.toLocaleString()}원 / {data.headcount}명</td>
              </tr>
              <tr><td data-label="구분" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>계약기간</td><td data-label="내용" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', height: 32, minHeight: 32 }}>{months}개월 {days}일 ({data.serviceStart}~{data.serviceEnd})</td></tr>
              <tr>
                <td data-label="구분" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', fontWeight: 550, height: 32, minHeight: 32 }}>총 금액</td>
                <td data-label="내용" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', fontWeight: 550, height: 32, minHeight: 32 }}>{totalAmount.toLocaleString()}원</td>
              </tr>
              {data.discounts.length > 0 && data.discounts.map((d, i) => (
                <tr key={i}>
                  <td data-label="구분" style={{ border: '1px solid #bbb', padding: 8, textAlign: 'center', color: 'red', height: 32, minHeight: 32 }}>{d.label}</td>
                  <td data-label="내용" style={{ border: '1px solid #bbb', padding: 8, color: 'red', textAlign: 'center', height: 32, minHeight: 32 }}>
                    -{calculateDiscountAmount(d, totalAmount).toLocaleString()}원
                    {d.type === 'percentage' && ` (${d.amount}% 할인)`}
                  </td>
                </tr>
              ))}
              {data.discounts.length > 0 && (
                <tr style={{ background: '#f8f8f8' }}>
                  <td data-label="구분" style={{ border: '1px solid #bbb', padding: 8, fontWeight: 700, textAlign: 'center', height: 32, minHeight: 32 }}>최종 견적가</td>
                  <td data-label="내용" style={{ border: '1px solid #bbb', padding: 8, fontWeight: 700, fontSize: 18, textAlign: 'center', color: '#000', height: 32, minHeight: 32 }}>
                    {finalAmount.toLocaleString()}원
                    <span style={{ marginLeft: 8, fontSize: 15, color: '#888' }}>({convertToKoreanNumber(Math.round(finalAmount))})</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 비고 */}
        <div style={{ marginBottom: 16 }}>
          <b>비고:</b><br />
          <pre style={{ 
            fontFamily: 'inherit', 
            background: 'none', 
            padding: 0, 
            fontSize: 'clamp(13px, 3vw, 15px)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>{data.note}</pre>
        </div>
        {/* 입금 계좌 안내 */}
        <div style={{ 
          fontSize: 'clamp(13px, 3vw, 15px)', 
          color: '#222', 
          marginBottom: 8, 
          background: '#f8f8f8', 
          padding: 'clamp(8px, 3vw, 12px)', 
          borderRadius: 6 
        }}>
          <b>입금 계좌 안내</b><br />
          - 은행명: 국민은행<br />
          - 계좌번호: 810137-04-015409<br />
          - 예금주: (주)튜링
        </div>
        <div style={{ fontSize: 'clamp(12px, 2.5vw, 13px)', color: '#555', marginTop: 8 }}>
          본 견적서의 유효기간은 작성일로부터 30일입니다.<br />
          상기 금액은 부가가치세가 포함된 금액입니다.
        </div>
      </div>
      <button onClick={handleDownloadPdf} style={{ 
        margin: '24px auto 0', 
        display: 'block',
        padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
        fontSize: 'clamp(14px, 3vw, 16px)',
        borderRadius: 4,
        border: '1px solid #ccc',
        background: '#fff',
        cursor: 'pointer'
      }}>PDF로 저장</button>
      {onBack && (
        <button onClick={onBack} style={{ 
          margin: '16px auto', 
          display: 'block', 
          background: '#eee', 
          color: '#222', 
          border: '1px solid #bbb', 
          borderRadius: 4, 
          padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 32px)', 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          fontWeight: 500, 
          cursor: 'pointer' 
        }}>
          입력으로 돌아가기
        </button>
      )}
    </div>
  );
};

export default QuotationPreview; 