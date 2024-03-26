import { env } from "@/env";
import { ROUTES } from "@/routes";
import { getServerAuthSession } from "@/server/auth";
import { isArray } from "lodash";
import { redirect } from "next/navigation";

export default async function Payment() {
  const session = await getServerAuthSession();

  // if (session?.user.isTrial) redirect(ROUTES.home);

  if (session?.user.hasPaidSubscription) redirect(ROUTES.home);

  if (!session?.user.accessToken) redirect(ROUTES.login);

  const link = await fetch(
    `${env.NEXT_PUBLIC_API_BASE_URL}/api/Subscription/link`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    },
  )
    .then((res) => res.json())
    .then((data: { data: { link: string } } | string[]) => {
      if (data && isArray(data)) {
        return ROUTES.login;
      }
      return data.data.link;
    })
    .catch(() => ROUTES.login);

  if (link) redirect(link);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <h1 className="text-center text-xl">
        You will be redirected to the payment page{" "}
      </h1>
    </div>
  );
}
