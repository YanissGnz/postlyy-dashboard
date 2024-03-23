import { env } from "@/env";
import { ROUTES } from "@/routes";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Payment() {
  const session = await getServerAuthSession();

  if (session?.user.isTrial) redirect(ROUTES.home);

  if (session?.user.hasPaidSubscription) redirect(ROUTES.home);

  if (
    session?.user.accessToken &&
    !session?.user.isTrial &&
    !session?.user.hasPaidSubscription
  )
    await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/Subscription/link`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data: { data: { link: string } } | string[]) => {
        if ((data as { data: { link: string } })?.data?.link)
          redirect((data as { data: { link: string } })?.data?.link);
        else if ((data as string[]).includes("SUBSCRIPTION_PAID")) {
          redirect(ROUTES.home);
        }
      })
      .catch((err: string[]) => {
        if (err.includes("SUBSCRIPTION_PAID")) {
          redirect(ROUTES.home);
        }
      });

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <h1 className="text-center text-xl">
        You will be redirected to the payment page{" "}
      </h1>
    </div>
  );
}
