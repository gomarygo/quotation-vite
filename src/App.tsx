import React, { useState } from 'react';
import QuotationForm from './components/QuotationForm';
import QuotationPreview from './components/QuotationPreview';
import './App.css';

function App() {
  const [formData, setFormData] = useState<any>(null);

  return (
    <div className="App" style={{ background: '#eaf2fb', minHeight: '100vh', padding: 32 }}>
      {!formData && <QuotationForm onSubmit={setFormData} />}
      {formData && <QuotationPreview data={formData} />}
      {formData && <button style={{ marginTop: 24 }} onClick={() => setFormData(null)}>입력으로 돌아가기</button>}
    </div>
  );
}

export default App;
