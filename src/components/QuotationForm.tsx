import { useState } from 'react';

interface DiscountItem {
  label: string;
  amount: number;
}

interface QuotationFormProps {
  onSubmit: (data: any) => void;
}

const planTypes = ['기본형', '프리미엄', '커스텀'];

const QuotationForm: React.FC<QuotationFormProps> = ({ onSubmit }) => {
  const [schoolName, setSchoolName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [itemName, setItemName] = useState('수학대왕 AI코스웨어 이용권');
  const [planType, setPlanType] = useState(planTypes[0]);
  const [headcount, setHeadcount] = useState(50);
  const [serviceStart, setServiceStart] = useState('2025-05-01');
  const [serviceEnd, setServiceEnd] = useState('2025-07-31');
  const [unitPrice, setUnitPrice] = useState(9900);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [discountLabel, setDiscountLabel] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [note, setNote] = useState(
    '* 선생님용 AI 수학 코스웨어 [수학 대왕 Class] 서비스 무료 지원\n* 선생님용 계정 무제한 제공\n* 1:1 담당자 케어 서비스 제공\n* 이용 기간 중 상시 소통 가능한 창구 및 A/S 제공'
  );

  const handleAddDiscount = () => {
    if (discountLabel && discountAmount) {
      setDiscounts([...discounts, { label: discountLabel, amount: discountAmount }]);
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
        <label>인원수:<br /><input type="number" value={headcount} onChange={e => setHeadcount(Number(e.target.value))} required /></label>
      </div>
      <div>
        <label>서비스 기간:<br />
          <input type="date" value={serviceStart} onChange={e => setServiceStart(e.target.value)} required /> ~
          <input type="date" value={serviceEnd} onChange={e => setServiceEnd(e.target.value)} required />
        </label>
      </div>
      <div>
        <label>1인당 월 단가:<br /><input type="number" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} required />원</label>
      </div>
      <div>
        <label>할인 항목:<br /></label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="할인명" value={discountLabel} onChange={e => setDiscountLabel(e.target.value)} />
          <input type="number" placeholder="금액" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} />
          <button type="button" onClick={handleAddDiscount}>추가</button>
        </div>
        <ul>
          {discounts.map((d, i) => (
            <li key={i}>{d.label}: {d.amount.toLocaleString()}원 <button type="button" onClick={() => handleRemoveDiscount(i)}>삭제</button></li>
          ))}
        </ul>
      </div>
      <div>
        <label>비고:<br /><textarea value={note} onChange={e => setNote(e.target.value)} rows={4} style={{ width: '100%' }} /></label>
      </div>
      <button type="submit" style={{ marginTop: 16, width: '100%' }}>견적서 미리보기</button>
    </form>
  );
};

export default QuotationForm; 