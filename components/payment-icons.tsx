function SslCommerzIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="10" fill="#1A73E8" />
      <text
        x="24"
        y="22"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        SSL
      </text>
      <text
        x="24"
        y="34"
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        Commerz
      </text>
    </svg>
  )
}

export function PaymentMethodIcon({
  id,
  className = "size-10",
}: {
  id?: string
  className?: string
}) {
  void id
  return <SslCommerzIcon className={className} />
}
