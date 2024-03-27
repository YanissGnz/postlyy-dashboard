import { env } from "@/env";
import { getServerAuthSession } from "@/server/auth";
import { type TNewAccount } from "@/types/TNewAccount";

export async function POST(request: Request) {
  const body = (await request.json()) as TNewAccount;
  const session = await getServerAuthSession();

  if (!session) {
    return new Response(null, { status: 401 });
  }

  const token = session?.user.accessToken;

  const response = await fetch(
    env.NEXT_PUBLIC_API_BASE_URL + "/api/UserSettings/Connect",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as { message: string } | string[];

    if (Array.isArray(error)) {
      return new Response(JSON.stringify({ message: error.join(", ") }), {
        status: response.status,
      });
    }

    return new Response(JSON.stringify({ message: error.message }), {
      status: response.status,
    });
  }

  return response;
}
