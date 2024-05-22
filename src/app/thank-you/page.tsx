"use client";

import { redirect, useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

export default function ThankYou() {
  const searchParams = useSearchParams();
  const stripeCustomerId = searchParams.get("customer-id");
  const replace = useRouter().replace;

  useEffect(() => {
    setTimeout(() => {
      replace("/");
    }, 5000);
  }, []);

  if (!stripeCustomerId) redirect("/");

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-10 text-center">
        <h1 className="text-5xl">Thank you for subscribing!</h1>
        <p>You will be redirected to the home page in 5 seconds.</p>
      </div>
      <Script
        id="refersion-checkout"
        dangerouslySetInnerHTML={{
          __html: `
            const rfsn = {
              cart: ${stripeCustomerId},
              id: localStorage.getItem("rfsn_v4_id"),
              url: window.location.href,
              aid: localStorage.getItem("rfsn_v4_aid"),
              cs: localStorage.getItem("rfsn_v4_cs")
            };
            r.sendCheckoutEvent(rfsn.cart, rfsn.id, rfsn.url, rfsn.aid, rfsn.cs);
          `,
        }}
      />
    </>
  );
}
