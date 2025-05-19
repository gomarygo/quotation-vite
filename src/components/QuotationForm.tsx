import { useState } from 'react';

interface DiscountItem {
  label: string;
  amount: number;
  type: 'percentage' | 'fixed';
}

interface QuotationFormProps {
  onSubmit: (data: any) => void;
}

const planTypes = ['기본형', '환급형'];
const discountTypes = ['첫 도입 할인', '재계약 할인', '특별 할인', '장기 계약 할인'];

const QuotationForm: React.FC<QuotationFormProps> = ({ onSubmit }) => {
  const [schoolName, setSchoolName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [itemName, setItemName] = useState('수학대왕 AI코스웨어 이용권');
  const [planType, setPlanType] = useState(planTypes[0]);
  const [headcount, setHeadcount] = useState<number | ''>('');
  const [serviceStart, setServiceStart] = useState(() => {
    const today = new Date();
    const koreaTime = new Date(today.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime.toISOString().split('T')[0];
  });
  const [serviceEnd, setServiceEnd] = useState(() => {
    const koreaTime = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
    const lastDay = new Date(2025, 11, 31);
    lastDay.setHours(23, 59, 59, 999);
    return lastDay.toISOString().split('T')[0];
  });
  const [serviceMonths, setServiceMonths] = useState(3);
  const [unitPrice, setUnitPrice] = useState(9900);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [discountLabel, setDiscountLabel] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number | ''>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [note, setNote] = useState(
    '* 선생님용 AI 수학 코스웨어 [수학 대왕 Class] 서비스 무료 지원\n* 선생님용 계정 무제한 제공\n* 1:1 담당자 케어 서비스 제공\n* 이용 기간 중 상시 소통 가능한 창구 및 A/S 제공'
  );

  // 서비스 기간 계산 (30일 = 1개월)
  const calculateServicePeriod = () => {
    const start = new Date(serviceStart);
    const end = new Date(serviceEnd);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return { months, days, totalDays: diffDays };
  };

  // 서비스 기간 업데이트
  const updateServicePeriod = (start: string, end: string) => {
    setServiceStart(start);
    setServiceEnd(end);
    const { months } = calculateServicePeriod();
    setServiceMonths(months);
  };

  // 개월 수로 서비스 기간 업데이트
  const updateServicePeriodByMonths = (months: number) => {
    const start = new Date(serviceStart);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    setServiceEnd(end.toISOString().split('T')[0]);
    setServiceMonths(months);
  };

  // 총 금액 계산 (부가세 포함)
  const calculateTotalAmount = () => {
    if (!headcount) return 0;
    const { months } = calculateServicePeriod();
    return unitPrice * headcount * months;
  };

  // 할인 금액 계산
  const calculateDiscountAmount = (discount: DiscountItem, totalAmount: number) => {
    if (discount.type === 'percentage') {
      return Math.round(totalAmount * (discount.amount / 100));
    }
    return discount.amount;
  };

  // 총 할인 금액 계산
  const calculateTotalDiscount = () => {
    const totalAmount = calculateTotalAmount();
    return discounts.reduce((sum, d) => sum + calculateDiscountAmount(d, totalAmount), 0);
  };

  // 최종 견적가 계산
  const calculateFinalAmount = () => {
    const totalAmount = calculateTotalAmount();
    const totalDiscount = calculateTotalDiscount();
    return totalAmount - totalDiscount;
  };

  // 할인 목록 표시 형식
  const formatDiscountDisplay = (discount: DiscountItem, totalAmount: number) => {
    const amount = calculateDiscountAmount(discount, totalAmount);
    return `${discount.label}: ${discount.type === 'percentage' ? `${discount.amount}% (${amount.toLocaleString()}원)` : `${amount.toLocaleString()}원`}`;
  };

  const handleAddDiscount = () => {
    if (discountLabel && discountAmount) {
      setDiscounts([...discounts, { label: discountLabel, amount: discountAmount, type: discountType }]);
      setDiscountLabel('');
      setDiscountAmount(0);
    }
  };

  const handleRemoveDiscount = (idx: number) => {
    setDiscounts(discounts.filter((_, i) => i !== idx));
  };

  const handleDiscountAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    setDiscountAmount(value === '' ? '' : Number(value));
  };

  const formatNumber = (value: number | '') => {
    if (value === '') return '';
    return value.toLocaleString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      schoolName,
      recipient,
      itemName,
      planType,
      headcount,
      serviceStart,
      serviceEnd,
      unitPrice,
      discounts,
      note,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      background: '#fff', 
      padding: '32px', 
      borderRadius: '8px', 
      maxWidth: '800px', 
      margin: '0 auto',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>학교 견적서 생성기</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>학교명:<br />
            <input 
              value={schoolName} 
              onChange={e => setSchoolName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px' }}
            />
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>수신자:<br />
            <input 
              value={recipient} 
              onChange={e => setRecipient(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px' }}
            />
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>항목명:<br />
            <input 
              value={itemName} 
              onChange={e => setItemName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px' }}
            />
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>플랜 유형:<br />
            <select 
              value={planType} 
              onChange={e => setPlanType(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              {planTypes.map(type => <option key={type}>{type}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>인원수:<br />
            <input 
              type="number" 
              value={headcount} 
              onChange={e => setHeadcount(e.target.value === '' ? '' : Number(e.target.value))} 
              required 
              style={{ width: '100%', padding: '8px' }}
            />
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>서비스 기간:</span>
              <span style={{ color: '#666', fontSize: '0.9em' }}>
                {(() => {
                  const { months, days } = calculateServicePeriod();
                  return `${months}개월 ${days}일`;
                })()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <input 
                type="date" 
                value={serviceStart} 
                onChange={e => setServiceStart(e.target.value)} 
                required 
                style={{ flex: 1, padding: '8px' }}
              />
              <span>~</span>
              <input 
                type="date" 
                value={serviceEnd} 
                onChange={e => setServiceEnd(e.target.value)} 
                required 
                style={{ flex: 1, padding: '8px' }}
              />
            </div>
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>1인당 월 단가:<br />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <input 
                type="text" 
                value={unitPrice.toLocaleString()} 
                onChange={e => setUnitPrice(Number(e.target.value.replace(/,/g, '')))} 
                required 
                style={{ width: '100%', textAlign: 'right', padding: '8px' }} 
              />
              <span>원</span>
            </div>
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>총 금액 (부가세 포함):<br />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <input 
                type="text" 
                value={calculateTotalAmount().toLocaleString()} 
                readOnly 
                style={{ 
                  width: '100%',
                  backgroundColor: '#f5f5f5', 
                  textAlign: 'right',
                  padding: '8px'
                }}
              />
              <span>원</span>
            </div>
          </label>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <label style={{ display: 'block', marginBottom: '16px', fontSize: '16px' }}>할인 항목:</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select 
              value={discountLabel} 
              onChange={e => setDiscountLabel(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            >
              <option value="">할인 유형 선택</option>
              {discountTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select 
              value={discountType} 
              onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
              style={{ width: '140px', padding: '8px' }}
            >
              <option value="fixed">금액 할인</option>
              <option value="percentage">% 할인</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="text" 
                placeholder={discountType === 'percentage' ? "할인율" : "금액"} 
                value={formatNumber(discountAmount)} 
                onChange={handleDiscountAmountChange}
                style={{ 
                  flex: 1, 
                  padding: '8px',
                  fontSize: '16px',
                  minWidth: '200px'
                }}
              />
              <span style={{ 
                whiteSpace: 'nowrap', 
                minWidth: '40px',
                fontSize: '16px'
              }}>
                {discountType === 'percentage' ? '%' : '원'}
              </span>
            </div>
            <button 
              type="button" 
              onClick={handleAddDiscount}
              disabled={!discountLabel || !discountAmount}
              style={{ 
                backgroundColor: !discountLabel || !discountAmount ? '#ccc' : '#1a73e8',
                cursor: !discountLabel || !discountAmount ? 'not-allowed' : 'pointer',
                padding: '8px 24px',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                minWidth: '100px',
                fontSize: '16px'
              }}
            >
              추가
            </button>
          </div>
        </div>
        <ul style={{ marginTop: '16px', paddingLeft: '20px' }}>
          {discounts.map((d, i) => {
            const totalAmount = calculateTotalAmount();
            return (
              <li key={i} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ flex: 1, fontSize: '16px' }}>
                  {formatDiscountDisplay(d, totalAmount)}
                </span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveDiscount(i)}
                  style={{ 
                    padding: '4px 12px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  삭제
                </button>
              </li>
            );
          })}
        </ul>
        {discounts.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>최종 견적가 (부가세 포함):</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
              <input 
                type="text" 
                value={calculateFinalAmount().toLocaleString()} 
                readOnly 
                style={{ 
                  backgroundColor: '#e8f0fe', 
                  textAlign: 'right',
                  padding: '8px',
                  width: '300px',
                  border: '1px solid #1a73e8',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1a73e8'
                }}
              />
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a73e8' }}>원</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '32px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>비고:<br />
          <textarea 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            rows={4} 
            style={{ 
              width: '100%', 
              padding: '8px',
              resize: 'vertical'
            }} 
          />
        </label>
      </div>

      <button 
        type="submit" 
        style={{ 
          marginTop: '32px', 
          width: '100%',
          padding: '12px',
          backgroundColor: '#1a73e8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        견적서 미리보기
      </button>
    </form>
  );
};

export default QuotationForm; 