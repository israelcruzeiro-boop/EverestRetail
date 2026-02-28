export function formatBRLFromCents(priceCents: number): string {
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDateBR(dateISO: string): string {
  if (!dateISO) return '-';
  const date = new Date(dateISO);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getSaoPauloDate(): string {
  // Retorna YYYY-MM-DD no fuso de São Paulo usando o local en-CA (que é YYYY-MM-DD)
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}
