import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api.js';
import { validateLoginInput } from '../utils/validation.js';
import { Button } from '../components/atoms/index.js';
import { LoginFormCard } from '../components/organisms/index.js';

export default function LoginPage({ onSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleEmailChange(value) {
    setEmail(value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: '' }));
    }
  }

  function handlePasswordChange(value) {
    setPassword(value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const validation = validateLoginInput({ email, password });
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setError(validation.message);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const session = await authApi.login(email, password);
      onSuccess(session);
    } catch (err) {
      if (err.errors) setFieldErrors(err.errors);
      setError(err.message || 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  function handleAutofill() {
    setEmail('pemilik@maknyus.id');
    setPassword('maknyus2026');
    setFieldErrors({});
    setError('');
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-md mx-auto">
        <Button
          variant="ghost"
          size="inline"
          onClick={onBack}
          className="-ml-2 mb-5 font-medium hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Kembali ke Halaman Pembeli
        </Button>

        <LoginFormCard
          email={email}
          password={password}
          fieldErrors={fieldErrors}
          error={error}
          loading={loading}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
          onSubmit={handleSubmit}
          onAutofill={handleAutofill}
        />
      </div>
    </main>
  );
}
