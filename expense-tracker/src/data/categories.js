export const CATEGORIES = [
  {
    label:  'Food & Dining',
    value:  'Food',
    color:  '#F97316',
    lightBg: '#FFF7ED',
    border:  '#FFEDD5',
  },
  {
    label:  'Travel',
    value:  'Travel',
    color:  '#3B82F6',
    lightBg: '#EFF6FF',
    border:  '#DBEAFE',
  },
  {
    label:  'Marketing',
    value:  'Marketing',
    color:  '#8B5CF6',
    lightBg: '#F5F3FF',
    border:  '#EDE9FE',
  },
  {
    label:  'Utilities',
    value:  'Utilities',
    color:  '#EAB308',
    lightBg: '#FEFCE8',
    border:  '#FEF9C3',
  },
  {
    label:  'Other',
    value:  'Other',
    color:  '#10B981',
    lightBg: '#ECFDF5',
    border:  '#D1FAE5',
  },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar',     flag: '🇺🇸' },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee',  flag: '🇮🇳' },
  { code: 'EUR', symbol: '€',  name: 'Euro',          flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',  name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',  flag: '🇯🇵' },
];

export const EXPENSE_TYPES = [
  { value: 'Recurring', label: 'Recurring Expense' },
  { value: 'Regular', label: 'Regular Expense' },
  { value: 'Personal', label: 'Personal Expense' }
];

export const getCategoryConfig = (value) =>
  CATEGORIES.find(c => c.value === value) ?? CATEGORIES[4];
