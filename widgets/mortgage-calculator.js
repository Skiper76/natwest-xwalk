function monthlyRepayment(amount, ratePercent, years) {
  const monthlyRate = ratePercent / 100 / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return amount / numPayments;
  return (amount * monthlyRate) / (1 - (1 + monthlyRate) ** -numPayments);
}

export default function decorate(widget) {
  const form = widget.querySelector('.mortgage-calculator-form');
  const result = widget.querySelector('.mortgage-calculator-result');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const amount = parseFloat(data.get('amount'));
    const rate = parseFloat(data.get('rate'));
    const term = parseFloat(data.get('term'));
    const monthly = monthlyRepayment(amount, rate, term);
    result.textContent = `Estimated monthly repayment: £${monthly.toFixed(2)}`;
  });
}
