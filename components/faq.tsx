"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    q: "Expert প্ল্যাটফর্ম কী? What is Expert?",
    a: "Expert হলো একটি প্ল্যাটফর্ম যেখানে আপনি ভিডিও বা অডিও কলে আইনজীবী, স্টাডি অ্যাব্রড এক্সপার্ট, স্কলার ও ডাক্তারদের কাছ থেকে পরামর্শ নিতে পারবেন। Verified professionals-দের সাথে সহজে কানেক্ট হোন।",
  },
  {
    q: "কিভাবে সেশন বুক করব? How do I book a session?",
    a: "Experts পেজে গিয়ে ক্যাটাগরি বা সার্চ দিয়ে এক্সপার্ট বেছে নিন, তারপর আপনার সুবিধামতো সময় সিলেক্ট করে বুক করুন। পেমেন্ট দিলেই কনফার্ম হবে।",
  },
  {
    q: "পেমেন্ট কিভাবে দিতে হয়? How do I pay?",
    a: "বুকিং এর সময় আপনি কার্ড, মোবাইল ব্যাংকিং বা অন্যান্য সাপোর্টেড মেথড দিয়ে পেমেন্ট করতে পারবেন। পেমেন্ট সিকিউর এবং স্পষ্টভাবে দেখানো হয়।",
  },
  {
    q: "ভিডিও কলে কী লাগবে? What do I need for video call?",
    a: "স্মার্টফোন, ট্যাব বা ল্যাপটপ এবং স্টেবল ইন্টারনেট থাকলেই হবে। ব্রাউজার বা অ্যাপ দিয়ে নির্ধারিত সময়ে জয়েন করলেই এক্সপার্টের সাথে ভিডিও/অডিও কনসালটেশন পাবেন।",
  },
  {
    q: "কোন কোন ক্যাটাগরিতে এক্সপার্ট আছেন? What categories are available?",
    a: "আইন (Lawyer), স্টাডি অ্যাব্রড (Study Abroad), ইসলামিক স্কলার (Islamic Scholar), ডাক্তার (Doctor) সহ বিভিন্ন ক্যাটাগরিতে verified এক্সপার্ট রয়েছেন। নতুন ক্যাটাগরি যোগ হচ্ছে।",
  },
  {
    q: "এক্সপার্টরা verified কীভাবে? How are experts verified?",
    a: "আমরা প্রতিটি এক্সপার্টের qualification, experience এবং identity চেক করি। শুধুমাত্র trusted এবং qualified mentors আমাদের প্ল্যাটফর্মে থাকেন।",
  },
  {
    q: "বুকিং ক্যানসেল বা পরিবর্তন করা যাবে? Can I cancel or reschedule?",
    a: "হ্যাঁ। নির্দিষ্ট সময়ের আগে ক্যানসেল বা রি-শিডিউল করা যায়। পলিসি বুকিং পেজে দেখানো হয়। প্রয়োজনে সাপোর্টে যোগাযোগ করুন।",
  },
  {
    q: "রিফান্ড পাব কিনা? Will I get a refund?",
    a: "ক্যানসেল পলিসি অনুযায়ী রিফান্ড দেওয়া হয়। এক্সপার্ট ক্যানসেল করলে বা টেকনিক্যাল সমস্যা হলে ফুল রিফান্ডের ব্যবস্থা আছে। বিস্তারিত Terms-এ আছে।",
  },
  {
    q: "আমার ডেটা সিকিউর থাকবে? Is my data secure?",
    a: "হ্যাঁ। কনসালটেশন এবং পার্সোনাল ডেটা এনক্রিপ্টেড ও সিকিউর রাখা হয়। আমরা আপনার তথ্য তৃতীয় পক্ষকে বিক্রি করি না। বিস্তারিত Privacy Policy-তে দেখুন।",
  },
  {
    q: "এক্সপার্ট না এলে কী হবে? What if the expert doesn't show up?",
    a: "যদি এক্সপার্ট সেশনে না আসেন, সাপোর্টে জানান। আমরা বুকিং স্ট্যাটাস দেখে রিফান্ড বা নতুন স্লট সাজাতে সাহায্য করি। If the expert misses the call, contact us from the Contact page and we will help resolve it.",
  },
  {
    q: "ইন্টারনেট কেটে গেলে? What if my internet disconnects?",
    a: "একই মিটিং লিংক থেকে আবার জয়েন করুন — সেশন শেষ না হওয়া পর্যন্ত রুম খোলা থাকে। Rejoin from My Bookings if the call drops.",
  },
  {
    q: "সেশন রেকর্ড হয়? Are consultations recorded?",
    a: "ভিডিও সেশন প্রাইভেট। আমরা কনসালটেশন রেকর্ড করে পাবলিক করি না। Sessions are private 1-to-1 video calls and are not published as recordings.",
  },
  {
    q: "প্রাইভেসি কীভাবে রক্ষা হয়? How is my privacy protected?",
    a: "আপনার প্রোফাইল ও বুকিং ডেটা সার্ভিস চালাতে ব্যবহার হয়, তৃতীয় পক্ষকে বিক্রি করা হয় না। বিস্তারিত Privacy Policy দেখুন।",
  },
  {
    q: "সাহায্য পেতে কোথায় যোগাযোগ করব? Where do I contact for help?",
    a: "Contact পেজ থেকে মেসেজ পাঠান। আমরা দ্রুত রিপ্লাই দেব।",
  },
]

function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-sm font-medium text-primary">
          — Frequently Asked —
        </p>
        <h2 className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          FAQ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={cn(
                  "overflow-hidden rounded-xl border border-border bg-card transition-colors",
                  isOpen && "border-primary/30 bg-primary/5"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
                  aria-expanded={isOpen}
                >
                  <span className="flex-1">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQ
