function BkashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="10" fill="#E2136E" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        bKash
      </text>
    </svg>
  )
}

function SslIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="10" fill="#0B6EFD" />
      <path
        d="M24 12c-5.2 0-8 3.1-8 7.2 0 3.6 2.1 5.3 5.4 6.6l.9.4c2.2.9 3.1 1.5 3.1 2.8 0 1.4-1.2 2.4-3.2 2.4-2.2 0-3.6-1-4.5-2.6L14 31.2C15.6 34.2 19 36 23.4 36c5.4 0 8.6-3 8.6-7.4 0-3.5-2-5.3-5.6-6.7l-.9-.4c-2-.8-2.8-1.4-2.8-2.7 0-1.3 1.1-2.2 2.9-2.2 1.8 0 3.1.8 3.9 2.3l3.5-2.1C31.3 13.8 28.2 12 24 12Z"
        fill="white"
      />
    </svg>
  )
}

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="10" fill="#635BFF" />
      <path
        d="M20.1 20.6c0-.9.8-1.3 2.1-1.3 1.9 0 4.3.6 6.2 1.6V16c-2-.8-4-.1-6.2-1.2-3.4-1.2-6.3.1-6.3 4.2 0 6.5 9 3.9 9 6.3 0 1-.9 1.4-2.3 1.4-2 0-4.6-.8-6.6-1.9v5c2.2 1 4.4 1.5 6.6 1.5 3.6 0 6.5-1.4 6.5-4.4 0-6.6-9-4-9-6.3Z"
        fill="white"
      />
    </svg>
  )
}

export function PaymentMethodIcon({
  id,
  className = "size-10",
}: {
  id: "bkash" | "ssl" | "stripe"
  className?: string
}) {
  if (id === "bkash") return <BkashIcon className={className} />
  if (id === "ssl") return <SslIcon className={className} />
  return <StripeIcon className={className} />
}
