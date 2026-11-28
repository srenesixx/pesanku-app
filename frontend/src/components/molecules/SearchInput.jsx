import { Search } from 'lucide-react';
import Input from '../atoms/Input.jsx';

export default function SearchInput({
  id,
  label,
  value,
  placeholder,
  onChange,
  containerClassName = 'relative max-w-sm',
  inputClassName = '',
}) {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Input
        id={id}
        type="text"
        icon={Search}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClassName}
      />
    </div>
  );
}
