"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Iconify from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";

import SignOutButton from "@/components/sign-out-button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { env } from "@/env";
import { ROUTES } from "@/routes";
import { ETiers } from "@/types/ETiers";
import { type TResponse } from "@/types/TResponse";
import { isArray, round } from "lodash";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBoolean } from "usehooks-ts";

const PLANS = [
  {
    title: "Basic",
    features: [
      "Schedule X (Twitter) / Linkedin Posts",
      "Create Recurring & Evergreen LinkedIn & Twitter Posts",
      "Calendar Management",
      "Custom Dashboard and Content Analytics",
      "Complimentary Manager Overview with 5+ seats",
    ],
    tier: ETiers.Basic,
    price: env.NEXT_PUBLIC_BASIC_MONTHLY_PRICE,
  },
  {
    title: "Pro",
    features: [
      "Schedule X (Twitter) / Linkedin Posts",
      "Create Recurring & Evergreen LinkedIn & Twitter Posts",
      "Calendar Management",
      "Custom Dashboard and Content Analytics",
      "Complimentary Manager Overview with 5+ seats",
      "Text to Image Converter",
    ],
    tier: ETiers.Pro,
    price: env.NEXT_PUBLIC_PRO_MONTHLY_PRICE,
  },
  {
    title: "Expert",
    features: [
      "Schedule X (Twitter) / Linkedin Posts",
      "Create Recurring & Evergreen LinkedIn & Twitter Posts",
      "Calendar Management",
      "Custom Dashboard and Content Analytics",
      "Complimentary Manager Overview with 5+ seats",
      "Text to Image Converter",
      "AI Content Generation",
    ],
    tier: ETiers.Expert,
    price: env.NEXT_PUBLIC_EXPERT_MONTHLY_PRICE,
  },
];

export default function SetupForm() {
  const { value: isLoading, setFalse, setTrue } = useBoolean(false);

  const { value: isYearly, setValue: setYearly } = useBoolean(false);

  const [seatsBought, setSeatsBought] = useState(1);

  const [currentStep, setCurrentStep] = useState(1);

  const session = useSession();

  const { replace } = useRouter();

  const handlePayment = useCallback(
    (tier: number) => async () => {
      setTrue();

      await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/Subscription/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session?.data?.user.accessToken,
        },
        body: JSON.stringify({
          tier,
          seatsBought,
          yearly: isYearly,
        }),
      })
        .then((res) => res.json())
        .then(async (res: TResponse<{ link: string; hasToPay: boolean }>) => {
          if (res.data.hasToPay) {
            setCurrentStep(2);
            setTimeout(() => {
              replace(res.data.link);
            }, 3000);
          } else {
            await session.update();
            replace(ROUTES.home);
          }
        })
        .catch(async (error: string[]) => {
          if (isArray(error)) {
            toast.error(error[0]);
            if (error.includes("Subscription Already Setup")) {
              replace(ROUTES.payment);
            }
            await session.update();
          }
        });
      setFalse();
    },
    [isYearly, seatsBought, session?.data?.user.accessToken],
  );

  const handleAddSeat = useCallback(() => {
    setSeatsBought((prev) => prev + 1);
  }, [seatsBought]);

  const handleRemoveSeat = useCallback(() => {
    setSeatsBought((prev) => Math.max(1, prev - 1));
  }, [seatsBought]);

  const handlePaymentModeChange = useCallback((e: boolean) => {
    setYearly(e);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="fixed left-2 top-2 z-50 md:left-10 md:top-10 ">
        <SignOutButton />
      </div>
      <div className="mb-3 inline-flex w-full items-center justify-center gap-5">
        {[1, 2].map((step) => (
          <>
            <div className="flex items-center justify-center gap-4">
              <div
                className={cn(
                  "rounded-full",
                  step === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "border-2 text-muted-foreground",
                  step < currentStep && "bg-green-500",
                  "flex h-12 w-12 items-center justify-center",
                  currentStep === 2 && step === 1 && "cursor-pointer",
                )}
              >
                {step < currentStep ? (
                  <Iconify icon="ic:round-check" className="text-white" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <p
                className={cn(
                  "hidden font-medium md:block",
                  step === currentStep
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step === 1 ? "Choose subscription" : "Payment"}{" "}
              </p>
            </div>
            {step < 2 && <div className="h-0.5 w-10 rounded bg-gray-400"></div>}
          </>
        ))}
      </div>
      {currentStep === 1 && (
        <>
          <div className="mb-4 flex items-center justify-center">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="payment-mode"
                  className={cn(isYearly && "text-muted-foreground")}
                >
                  Monthly
                </Label>
                <Switch
                  id="payment-mode"
                  onCheckedChange={handlePaymentModeChange}
                />
                <Label
                  htmlFor="payment-mode"
                  className={cn(!isYearly && "text-muted-foreground")}
                >
                  Yearly
                </Label>
              </div>
              <div className=" flex items-center justify-center gap-2">
                <Button size="icon" variant="ghost" onClick={handleRemoveSeat}>
                  <Iconify
                    icon="solar:minus-circle-bold-duotone"
                    fontSize={22}
                  />
                </Button>
                <p className="rounded border p-2">{seatsBought} seats</p>
                <Button size="icon" variant="ghost" onClick={handleAddSeat}>
                  <Iconify icon="solar:add-circle-bold-duotone" fontSize={22} />
                </Button>
              </div>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-3">
            {" "}
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.title}
                isYearly={isYearly}
                seatsBought={seatsBought}
                isLoading={isLoading}
                handlePayment={handlePayment}
                title={plan.title}
                features={plan.features}
                tier={plan.tier}
                price={plan.price}
              />
            ))}
          </div>
        </>
      )}
      {currentStep === 2 && (
        <div className="flex h-56 items-center justify-center text-center">
          You will be redirected to the payment page
        </div>
      )}
    </div>
  );
}

type PlanCardProps = {
  isYearly: boolean;
  seatsBought: number;
  isLoading: boolean;
  handlePayment: (tier: number) => () => void;
  title: string;
  features: string[];
  tier: ETiers;
  price: number;
};

const PlanCard = ({
  isYearly,
  seatsBought,
  isLoading,
  handlePayment,
  title,
  features,
  tier,
  price,
}: PlanCardProps) => {
  const percentage = useMemo(() => {
    if (seatsBought === 1) return 1;
    if (seatsBought <= 9) return 0.95;
    if (seatsBought <= 20) return 0.925;

    return 0.9;
  }, [seatsBought, isYearly]);

  const calculatedPrice = useMemo(() => {
    const monthlyPrice = round(price * percentage);

    if (isYearly) {
      return round(monthlyPrice * 12 * 0.85);
    }

    return monthlyPrice;
  }, [isYearly, percentage]);

  return (
    <Card className="flex h-full flex-col border shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 grow flex-col">
        <div className="flex items-center justify-between">
          <p className="text-4xl font-semibold">
            <span className="mr-1 text-2xl text-foreground/60"> $</span>
            {calculatedPrice}
            <span className="ml-1 mr-1 text-xl text-foreground/60">
              Per seat / {isYearly ? "year" : "month"}
            </span>
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-4xl font-semibold">
            <span className="mr-1 text-2xl text-foreground/60">=</span>
            <span className="mr-1 text-2xl text-foreground/60"> $</span>
            {calculatedPrice * seatsBought}
            <span className="ml-1 mr-1 text-xl text-foreground/60">
              / {isYearly ? "year" : "month"}
            </span>
          </p>
        </div>
        <ul className="mt-5 flex flex-1 grow flex-col gap-4 border-t p-3">
          {features.map((feature, i) => (
            <li className="flex items-center gap-2 text-foreground" key={i}>
              <div className="p-1">
                <Iconify
                  icon="ph:check-circle-fill"
                  height={20}
                  width={20}
                  className="text-primary"
                />
              </div>{" "}
              {feature}
            </li>
          ))}
        </ul>
        <Button
          className="mt-5 w-full"
          onClick={handlePayment(tier)}
          disabled={isLoading}
        >
          Choose {title}
        </Button>
      </CardContent>
    </Card>
  );
};
