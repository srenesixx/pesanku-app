import { ORDER_STATUS_FILTERS } from '../../constants/domain.js';
import Card from '../atoms/Card.jsx';
import Input from '../atoms/Input.jsx';
import Select from '../atoms/Select.jsx';
import FormField from '../molecules/FormField.jsx';

export default function ReportFilterBar({
  startDate = '',
  endDate = '',
  statusFilter = 'Semua',
  dateError = '',
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
}) {
  return (
    <Card padding="sm" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <FormField
        id="report-start-date"
        label="Dari Tanggal"
        labelClassName="block text-xs font-semibold text-[#6B5E54] mb-1"
      >
        <Input
          id="report-start-date"
          type="date"
          value={startDate}
          error={dateError}
          onChange={(e) => onStartDateChange?.(e.target.value)}
        />
      </FormField>

      <FormField
        id="report-end-date"
        label="Sampai Tanggal"
        labelClassName="block text-xs font-semibold text-[#6B5E54] mb-1"
        error={dateError}
      >
        <Input
          id="report-end-date"
          type="date"
          value={endDate}
          error={dateError}
          onChange={(e) => onEndDateChange?.(e.target.value)}
        />
      </FormField>

      <FormField
        id="report-status"
        label="Status"
        labelClassName="block text-xs font-semibold text-[#6B5E54] mb-1"
      >
        <Select
          id="report-status"
          value={statusFilter}
          onChange={(e) => onStatusChange?.(e.target.value)}
        >
          {ORDER_STATUS_FILTERS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </Select>
      </FormField>
    </Card>
  );
}
