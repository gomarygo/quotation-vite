import { useState, useRef, useEffect } from 'react';

interface DiscountItem {
  label: string;
  amount: number;
  type: 'percentage' | 'fixed';
}

interface QuotationFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

const planTypes = ['기본형', '환급형'];
const discountTypes = ['첫 도입 할인', '재계약 할인', '특별 할인', '장기 계약 할인'];

const QuotationForm: React.FC<QuotationFormProps> = ({ onSubmit, initialData }) => {
  const [schoolName, setSchoolName] = useState(initialData?.schoolName ?? '');
  const [recipient, setRecipient] = useState(initialData?.recipient ?? '');
  const [itemName, setItemName] = useState(initialData?.itemName ?? '수학대왕 AI코스웨어 이용권');
  const [planType, setPlanType] = useState(initialData?.planType ?? planTypes[0]);
  const [headcount, setHeadcount] = useState<number | ''>(initialData?.headcount ?? '');
  const [serviceStart, setServiceStart] = useState(initialData?.serviceStart ?? (() => {
    const today = new Date();
    const koreaTime = new Date(today.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime.toISOString().split('T')[0];
  })());
  const [serviceEnd, setServiceEnd] = useState(initialData?.serviceEnd ?? (() => {
    const koreaTime = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
    const lastDay = new Date(2025, 11, 31);
    lastDay.setHours(23, 59, 59, 999);
    return lastDay.toISOString().split('T')[0];
  })());
  const [serviceMonths, setServiceMonths] = useState(initialData?.serviceMonths ?? 3);
  const [unitPrice, setUnitPrice] = useState(initialData?.unitPrice ?? 9900);
  const [discounts, setDiscounts] = useState<DiscountItem[]>(initialData?.discounts ?? []);
  const [discountLabel, setDiscountLabel] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number | ''>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [note, setNote] = useState(initialData?.note ?? '* 선생님용 AI 수학 코스웨어 [수학 대왕 Class] 서비스 무료 지원\n* 선생님용 계정 무제한 제공\n* 1:1 담당자 케어 서비스 제공\n* 이용 기간 중 상시 소통 가능한 창구 및 A/S 제공');

  const schoolNameRef = useRef<HTMLInputElement>(null);
  const recipientRef = useRef<HTMLInputElement>(null);
  const itemNameRef = useRef<HTMLInputElement>(null);
  const planTypeRef = useRef<HTMLSelectElement>(null);
  const headcountRef = useRef<HTMLInputElement>(null);
  const serviceStartRef = useRef<HTMLInputElement>(null);
  const serviceEndRef = useRef<HTMLInputElement>(null);
  const unitPriceRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!initialData) return;
    setSchoolName(initialData.schoolName ?? '');
    setRecipient(initialData.recipient ?? '');
    setItemName(initialData.itemName ?? '수학대왕 AI코스웨어 이용권');
    setPlanType(initialData.planType ?? planTypes[0]);
    setHeadcount(initialData.headcount ?? '');
    setServiceStart(initialData.serviceStart ?? (() => {
      const today = new Date();
      const koreaTime = new Date(today.getTime() + (9 * 60 * 60 * 1000));
      return koreaTime.toISOString().split('T')[0];
    })());
    setServiceEnd(initialData.serviceEnd ?? (() => {
      const koreaTime = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
      const lastDay = new Date(2025, 11, 31);
      lastDay.setHours(23, 59, 59, 999);
      return lastDay.toISOString().split('T')[0];
    })());
    setServiceMonths(initialData.serviceMonths ?? 3);
    setUnitPrice(initialData.unitPrice ?? 9900);
    setDiscounts(initialData.discounts ?? []);
    setNote(initialData.note ?? '* 선생님용 AI 수학 코스웨어 [수학 대왕 Class] 서비스 무료 지원\n* 선생님용 계정 무제한 제공\n* 1:1 담당자 케어 서비스 제공\n* 이용 기간 중 상시 소통 가능한 창구 및 A/S 제공');
    setDiscountLabel('');
    setDiscountAmount('');
    setDiscountType('fixed');
  }, [initialData]);

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<any>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleSchoolNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSchoolName = e.target.value;
    setSchoolName(newSchoolName);
    setRecipient(newSchoolName ? `${newSchoolName} 행정실` : '');
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
  };

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

  const handleSubmit = () => {
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
    <form onSubmit={e => e.preventDefault()} className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-sm w-full max-w-3xl mx-auto">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center mb-4 sm:mb-6 md:mb-8">학교 견적서 생성기</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block mb-2">
            학교명:
            <input 
              ref={schoolNameRef}
              value={schoolName} 
              onChange={handleSchoolNameChange} 
              required 
              className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={e => handleKeyDown(e, recipientRef)}
              lang="ko"
              inputMode="text"
            />
          </label>
        </div>

        <div>
          <label className="block mb-2">
            수신자:
            <input 
              ref={recipientRef}
              value={recipient} 
              onChange={handleRecipientChange}
              required 
              className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={e => handleKeyDown(e, itemNameRef)}
              lang="ko"
              inputMode="text"
            />
          </label>
        </div>

        <div>
          <label className="block mb-2">
            항목명:
            <input 
              ref={itemNameRef}
              value={itemName} 
              onChange={e => setItemName(e.target.value)} 
              required 
              className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={e => handleKeyDown(e, planTypeRef)}
              placeholder="예) 수학대왕 AI코스웨어 이용권"
            />
          </label>
        </div>

        <div>
          <label className="block mb-2">
            플랜 유형:
            <select 
              ref={planTypeRef}
              value={planType} 
              onChange={e => setPlanType(e.target.value)}
              className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={e => handleKeyDown(e, headcountRef)}
            >
              {planTypes.map(type => <option key={type}>{type}</option>)}
            </select>
          </label>
        </div>

        <div>
          <label className="block mb-2">
            인원수:
            <input 
              ref={headcountRef}
              type="number" 
              value={headcount} 
              onChange={e => setHeadcount(e.target.value === '' ? '' : Number(e.target.value))} 
              required 
              className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={e => handleKeyDown(e, serviceStartRef)}
              lang="ko"
              inputMode="text"
            />
          </label>
        </div>

        <div>
          <label className="block mb-2">
            서비스 기간:
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                ref={serviceStartRef}
                type="date" 
                value={serviceStart} 
                onChange={e => setServiceStart(e.target.value)} 
                required 
                className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={e => handleKeyDown(e, serviceEndRef)}
              />
              <span className="hidden sm:inline">~</span>
              <input 
                ref={serviceEndRef}
                type="date" 
                value={serviceEnd} 
                onChange={e => setServiceEnd(e.target.value)} 
                required 
                className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={e => handleKeyDown(e, unitPriceRef)}
              />
            </div>
          </label>
        </div>

        <div>
          <label className="block mb-2">
            1인당 월 단가:
            <div className="flex items-center gap-2">
              <input 
                ref={unitPriceRef}
                type="text" 
                value={unitPrice.toLocaleString()} 
                onChange={e => setUnitPrice(Number(e.target.value.replace(/,/g, '')))} 
                required 
                className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                onKeyDown={e => handleKeyDown(e, noteRef)}
                placeholder="예) 9,900"
              />
              <span className="whitespace-nowrap">원</span>
            </div>
          </label>
        </div>

        <div>
          <label className="block mb-2">
            총 금액 (부가세 포함):
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={calculateTotalAmount().toLocaleString()} 
                readOnly 
                className="w-full p-2 sm:p-3 text-sm sm:text-base bg-gray-50 border rounded text-right"
              />
              <span className="whitespace-nowrap">원</span>
            </div>
          </label>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <label className="block mb-4 text-sm sm:text-base">할인 항목:</label>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select 
              value={discountLabel} 
              onChange={e => setDiscountLabel(e.target.value)}
              className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">할인 유형 선택</option>
              {discountTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select 
              value={discountType} 
              onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
              className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fixed">금액 할인</option>
              <option value="percentage">% 할인</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder={discountType === 'percentage' ? "할인율" : "금액"} 
                value={formatNumber(discountAmount)} 
                onChange={handleDiscountAmountChange}
                className="flex-1 p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!discountLabel || !discountAmount) return;
                    handleAddDiscount();
                  }
                }}
              />
              <span className="whitespace-nowrap text-sm sm:text-base">
                {discountType === 'percentage' ? '%' : '원'}
              </span>
            </div>

            <button 
              type="button" 
              onClick={handleAddDiscount}
              disabled={!discountLabel || !discountAmount}
              className={`w-full p-2 sm:p-3 text-sm sm:text-base text-white rounded transition-colors
                ${!discountLabel || !discountAmount 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              추가
            </button>
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {discounts.map((d, i) => {
            const totalAmount = calculateTotalAmount();
            return (
              <li key={i} className="flex flex-col gap-2">
                <span className="text-sm sm:text-base break-words">
                  {formatDiscountDisplay(d, totalAmount)}
                </span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveDiscount(i)}
                  className="px-3 py-1 text-xs sm:text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-fit"
                >
                  삭제
                </button>
              </li>
            );
          })}
        </ul>

        {discounts.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <label className="block mb-2 text-sm sm:text-base">최종 견적가 (부가세 포함):</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={calculateFinalAmount().toLocaleString()} 
                  readOnly 
                  className="w-full p-2 sm:p-3 text-sm sm:text-base bg-blue-50 border border-blue-500 rounded text-right font-semibold text-blue-600"
                />
                <span className="whitespace-nowrap text-sm sm:text-base font-semibold text-blue-600">원</span>
              </div>
              <div className="p-2 bg-blue-50 rounded text-center text-sm sm:text-base font-semibold text-blue-600 break-words">
                {convertToKoreanNumber(calculateFinalAmount())}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-8">
        <label className="block mb-2 text-sm sm:text-base">
          비고:
          <textarea 
            ref={noteRef}
            value={note} 
            onChange={e => setNote(e.target.value)} 
            rows={4} 
            className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
            onKeyDown={() => {}}
            placeholder="예) 특이사항, 요청사항 등"
          />
        </label>
      </div>

      <button 
        type="button"
        onClick={handleSubmit}
        className="w-full mt-6 sm:mt-8 p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"
      >
        견적서 미리보기
      </button>
    </form>
  );
};

export default QuotationForm; 