import { Lock, Mail } from 'lucide-react';
import AlertBanner from '../atoms/AlertBanner.jsx';
import BrandMark from '../atoms/BrandMark.jsx';
import Button from '../atoms/Button.jsx';
import Card from '../atoms/Card.jsx';
import Input from '../atoms/Input.jsx';
import FormField from '../molecules/FormField.jsx';

export default function LoginFormCard({
  email = '',
  password = '',
  fieldErrors = {},
  error = '',
  loading = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onAutofill,
}) {
  return (
    <Card padding="lg" className="shadow-xs">
      <div className="flex items-center gap-3 mb-6">
        <BrandMark size="lg" />
        <div>
          <h1 className="text-xl font-bold text-[#1F1915] leading-tight">Masuk Pemilik</h1>
          <p className="text-sm text-[#6B5E54]">Warung Nasi Ayam Mak Nyus (PesanKu)</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          id="login-email"
          label="Email Pemilik"
          labelClassName="block text-sm font-semibold text-[#1F1915] mb-1.5"
          error={fieldErrors.email}
        >
          <Input
            id="login-email"
            type="email"
            icon={Mail}
            value={email}
            error={fieldErrors.email}
            onChange={(e) => onEmailChange?.(e.target.value)}
            placeholder="pemilik@maknyus.id"
            className="py-2.5 bg-[#FAF7F2]/50"
          />
        </FormField>

        <FormField
          id="login-password"
          label="Kata Sandi"
          labelClassName="block text-sm font-semibold text-[#1F1915] mb-1.5"
          error={fieldErrors.password}
        >
          <Input
            id="login-password"
            type="password"
            icon={Lock}
            value={password}
            error={fieldErrors.password}
            onChange={(e) => onPasswordChange?.(e.target.value)}
            placeholder="Masukkan kata sandi"
            className="py-2.5 bg-[#FAF7F2]/50"
          />
        </FormField>

        {error && <AlertBanner message={error} size="sm" />}

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full font-semibold"
        >
          {loading ? 'Memeriksa akun...' : 'Masuk ke Dashboard'}
        </Button>
      </form>

      <div className="mt-5 pt-4 border-t border-[#E7DFD3] text-xs text-[#6B5E54] flex flex-wrap items-center justify-between gap-2">
        <span>Akun uji lokal:</span>
        <Button
          variant="link"
          size="inline"
          onClick={onAutofill}
          className="-mx-2"
        >
          Isi otomatis (pemilik@maknyus.id)
        </Button>
      </div>
    </Card>
  );
}
