import { useState } from 'react';
import QuotationForm from './components/QuotationForm';
import QuotationPreview from './components/QuotationPreview';
import './App.css';

function App() {
  const [formData, setFormData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="App" style={{ background: '#eaf2fb', minHeight: '100vh', padding: 32 }}>
      {!showPreview && (
        <QuotationForm 
          key={JSON.stringify(formData) || 'empty'}
          onSubmit={data => { setFormData(data); setShowPreview(true); }}
          initialData={formData}
        />
      )}
      {showPreview && formData && (
        <QuotationPreview 
          data={formData} 
          onBack={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

export default App;
