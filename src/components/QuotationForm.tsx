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

const QuotationForm: React.FC<QuotationFormProps> = ({ onSubmit }) => {
  const [schoolName, setSchoolName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [itemName, setItemName] = useState('수학대왕 AI코스웨어 이용권');
  const [planType, setPlanType] = useState(planTypes[0]);
  const [headcount, setHeadcount] = useState<number | ''>('');
  const [serviceStart, setServiceStart] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return nextMonth.toISOString().split('T')[0];
  });
  const [serviceEnd, setServiceEnd] = useState(() => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), 11, 31);
    return lastDay.toISOString().split('T')[0];
  });
  const [serviceMonths, setServiceMonths] = useState(3);
  const [unitPrice, setUnitPrice] = useState(9900);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [discountLabel, setDiscountLabel] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
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
    const { totalDays } = calculateServicePeriod();
    const months = Math.ceil(totalDays / 30);
    const subtotal = unitPrice * headcount * months;
    const totalDiscount = discounts.reduce((sum, d) => {
      if (d.type === 'percentage') {
        return sum + (subtotal * (d.amount / 100));
      }
      return sum + d.amount;
    }, 0);
    const supplyAmount = subtotal - totalDiscount;
    const vat = Math.round(supplyAmount / 11);
    return supplyAmount + vat;
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
    <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 600, margin: '0 auto' }}>
      <h2>학교 견적서 생성기</h2>
      <div>
        <label>학교명:<br /><input value={schoolName} onChange={e => setSchoolName(e.target.value)} required /></label>
      </div>
      <div>
        <label>수신자:<br /><input value={recipient} onChange={e => setRecipient(e.target.value)} required /></label>
      </div>
      <div>
        <label>항목명:<br /><input value={itemName} onChange={e => setItemName(e.target.value)} required /></label>
      </div>
      <div>
        <label>플랜 유형:<br />
          <select value={planType} onChange={e => setPlanType(e.target.value)}>
            {planTypes.map(type => <option key={type}>{type}</option>)}
          </select>
        </label>
      </div>
      <div>
        <label>인원수:<br /><input type="number" value={headcount} onChange={e => setHeadcount(e.target.value === '' ? '' : Number(e.target.value))} required /></label>
      </div>
      <div>
        <label>서비스 기간:<br />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="date" 
              value={serviceStart} 
              onChange={e => setServiceStart(e.target.value)} 
              required 
            />
            <span>~</span>
            <input 
              type="date" 
              value={serviceEnd} 
              onChange={e => setServiceEnd(e.target.value)} 
              required 
            />
          </div>
          <div style={{ marginTop: '4px', color: '#666', fontSize: '0.9em' }}>
            {(() => {
              const { months, days } = calculateServicePeriod();
              return `${months}개월 ${days}일`;
            })()}
          </div>
        </label>
      </div>
      <div>
        <label>1인당 월 단가:<br />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            <input 
              type="text" 
              value={unitPrice.toLocaleString()} 
              onChange={e => setUnitPrice(Number(e.target.value.replace(/,/g, '')))} 
              required 
              style={{ textAlign: 'right' }} 
            />
            <span>원</span>
          </div>
        </label>
      </div>
      <div>
        <label>총 금액 (부가세 포함):<br />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            <input 
              type="text" 
              value={calculateTotalAmount().toLocaleString()} 
              readOnly 
              style={{ backgroundColor: '#f5f5f5', textAlign: 'right' }}
            />
            <span>원</span>
          </div>
        </label>
      </div>
      <div>
        <label>할인 항목:<br /></label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="할인명" value={discountLabel} onChange={e => setDiscountLabel(e.target.value)} />
          <select value={discountType} onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}>
            <option value="fixed">금액 할인</option>
            <option value="percentage">% 할인</option>
          </select>
          <input 
            type="number" 
            placeholder={discountType === 'percentage' ? "할인율" : "금액"} 
            value={discountAmount} 
            onChange={e => setDiscountAmount(Number(e.target.value))} 
          />
          <button type="button" onClick={handleAddDiscount}>추가</button>
        </div>
        <ul>
          {discounts.map((d, i) => (
            <li key={i}>
              {d.label}: {d.type === 'percentage' ? `${d.amount}%` : `${d.amount.toLocaleString()}원`} 
              <button type="button" onClick={() => handleRemoveDiscount(i)}>삭제</button>
            </li>
          ))}
        </ul>
        {discounts.length > 0 && (
          <div>
            <label>최종 금액 (부가세 포함):<br />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <input 
                  type="text" 
                  value={calculateTotalAmount().toLocaleString()} 
                  readOnly 
                  style={{ backgroundColor: '#f5f5f5', textAlign: 'right' }}
                />
                <span>원</span>
              </div>
            </label>
          </div>
        )}
      </div>
      <div>
        <label>비고:<br /><textarea value={note} onChange={e => setNote(e.target.value)} rows={4} style={{ width: '100%' }} /></label>
      </div>
      <button type="submit" style={{ marginTop: 16, width: '100%' }}>견적서 미리보기</button>
    </form>
  );
};

export default QuotationForm; 