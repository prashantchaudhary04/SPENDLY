import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/format.js';

// const money = useCurrency();  money(1500) -> "₹1,500.00" in the user's currency
export function useCurrency() {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  return (amount) => formatCurrency(amount, currency);
}
