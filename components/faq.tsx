"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown, LifeBuoy, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/section-heading"
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

const INITIAL_VISIBLE = 7

function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)
  const [showAll, setShowAll] = React.useState(false)
  const visible = showAll ? faqs : faqs.slice(0, INITIAL_VISIBLE)

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            eyebrow="Frequently asked"
            title="Questions? We've got answers."
            description="সাধারণ প্রশ্নের উত্তর এখানে। আর কিছু জানতে চাইলে সরাসরি যোগাযোগ করুন।"
          />
          <div className="mt-8 rounded-3xl border border-border bg-muted/40 p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LifeBuoy className="size-5" />
            </span>
            <p className="mt-4 font-semibold text-foreground">Still have questions?</p>
            <p className="mt-1 text-sm text-muted-foreground">Our support team usually replies within a few hours.</p>
            <Button className="mt-4 rounded-full" asChild>
              <Link href="/contact">
                Contact support <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div>
          <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {visible.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div key={faq.q} className={cn("transition-colors", isOpen && "bg-primary/3")}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground outline-none focus-visible:bg-muted sm:px-6 sm:text-base"
                    aria-expanded={isOpen}
                  >
                    <span className="flex-1">{faq.q}</span>
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-200",
                        isOpen && "rotate-45 border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6">{faq.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {faqs.length > INITIAL_VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {showAll ? "Show fewer questions" : `Show all ${faqs.length} questions`}
              <ChevronDown className={cn("size-4 transition-transform", showAll && "rotate-180")} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default FAQ
