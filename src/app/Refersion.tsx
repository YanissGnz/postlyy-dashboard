"use client";

import { env } from "@/env";
import Script from "next/script";

const Refersion = () => {
  return (
    <>
      <Script
        id="refersion-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
                  ! function(e, n, t, i, o, c, s, a) {
	                    e.TrackingSystemObject = "r", (s = n.createElement(t)).async = 1, s.src = "https://cdn.refersion.com/refersion.js", s.onload = function() {
                        r.pubKey = "${env.NEXT_PUBLIC_REFERSION_PUBLIC_KEY}", r.settings.fp_off = !1;
                        r.initializeXDLS().then(() => {
                          r.launchDefault()
                        })
                      }, (a = n.getElementsByTagName(t)[0]).parentNode.insertBefore(s, a)
                    }(window, document, "script");
                    `,
        }}
      />
    </>
  );
};

export default Refersion;
