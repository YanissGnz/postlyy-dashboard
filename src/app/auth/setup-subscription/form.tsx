"use client";

import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Iconify from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { env } from "@/env";
import { useSession } from "next-auth/react";
import { useBoolean } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { type TResponse } from "@/types/TResponse";

export default function SetupForm() {
  const { value: isLoading, setFalse, setTrue } = useBoolean(false);

  const { value: isYearly, setValue: setYearly } = useBoolean(false);

  const [seatsBought, setSeatsBought] = useState(2);

  const [currentStep, setCurrentStep] = useState(1);

  const session = useSession();

  const { push, refresh } = useRouter();

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
        .then((res: TResponse<{ url: string; hasToPay: boolean }>) => {
          if (res.data.hasToPay) {
            setCurrentStep(2);
            setTimeout(() => {
              push(res.data.url);
            }, 3000);
          }
        })
        .catch(() => {
          refresh();
        });
      setFalse();
    },
    [isYearly, seatsBought, session?.data?.user.accessToken],
  );

  const handleAddSeat = useCallback(() => {
    setSeatsBought((prev) => prev + 1);
  }, [seatsBought]);

  const handleRemoveSeat = useCallback(() => {
    if (seatsBought > 2) {
      setSeatsBought((prev) => prev - 1);
    }
  }, [seatsBought]);

  const handlePaymentModeChange = useCallback((e: boolean) => {
    setYearly(e);
  }, []);

  return (
    <div className="flex flex-col">
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
            <div className="flex items-center space-x-2">
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
          </div>
          <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2">
            <Card className="border shadow-none">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Small to medium businesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-semibold">
                    <span className="mr-1 text-2xl text-foreground/60"> $</span>
                    {isYearly
                      ? env.NEXT_PUBLIC_PRO_YEARLY_PRICE
                      : env.NEXT_PUBLIC_PRO_MONTHLY_PRICE}
                    <span className="ml-1 mr-1 text-xl text-foreground/60">
                      Per seat / {isYearly ? "year" : "month"}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleRemoveSeat}
                      disabled={seatsBought <= 2}
                    >
                      <Iconify
                        icon="solar:minus-circle-bold-duotone"
                        fontSize={22}
                      />
                    </Button>
                    <p className="rounded border p-2">
                      {seatsBought > 9 ? 9 : seatsBought} seats
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleAddSeat}
                      disabled={seatsBought >= 9}
                    >
                      <Iconify
                        icon="solar:add-circle-bold-duotone"
                        fontSize={22}
                      />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-4xl font-semibold">
                    <span className="mr-1 text-2xl text-foreground/60">=</span>
                    <span className="mr-1 text-2xl text-foreground/60"> $</span>
                    {Math.round(
                      (seatsBought > 9 ? 9 : seatsBought) *
                        (isYearly
                          ? env.NEXT_PUBLIC_PRO_YEARLY_PRICE
                          : env.NEXT_PUBLIC_PRO_MONTHLY_PRICE) *
                        100,
                    ) / 100}
                    <span className="ml-1 mr-1 text-xl text-foreground/60">
                      / {isYearly ? "year" : "month"}
                    </span>
                  </p>
                </div>
                <ul className="mt-5 flex flex-col gap-4 border-t p-3">
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    2-9 seats (includes a free manager seat)
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    Schedule LinkedIn & Twitter Posts
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    AI Post Generation
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    Analytics
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    Managerial Oversight
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    Enhanced Collaboration Tools
                  </li>
                </ul>
                <Button
                  className="mt-5 w-full"
                  onClick={handlePayment(1)}
                  disabled={isLoading || seatsBought > 9}
                >
                  Choose SMB (1 {isYearly ? "year" : "month"} free trail)
                </Button>
              </CardContent>
            </Card>
            <Card className="border shadow-none">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-semibold">
                    <span className="mr-1 text-2xl text-foreground/60"> $</span>
                    {isYearly
                      ? env.NEXT_PUBLIC_EXPERT_YEARLY_PRICE
                      : env.NEXT_PUBLIC_EXPERT_MONTHLY_PRICE}
                    <span className="ml-1 mr-1 text-xl text-foreground/60">
                      Per seat / {isYearly ? "year" : "month"}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleRemoveSeat}
                      disabled={seatsBought <= 2}
                    >
                      <Iconify
                        icon="solar:minus-circle-bold-duotone"
                        fontSize={22}
                      />
                    </Button>
                    <p className="rounded border p-2">{seatsBought} seats</p>
                    <Button size="icon" variant="ghost" onClick={handleAddSeat}>
                      <Iconify
                        icon="solar:add-circle-bold-duotone"
                        fontSize={22}
                      />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-4xl font-semibold">
                    <span className="mr-1 text-2xl text-foreground/60">=</span>
                    <span className="mr-1 text-2xl text-foreground/60"> $</span>
                    {Math.round(
                      seatsBought *
                        (isYearly
                          ? env.NEXT_PUBLIC_EXPERT_YEARLY_PRICE
                          : env.NEXT_PUBLIC_EXPERT_MONTHLY_PRICE) *
                        100,
                    ) / 100}
                    <span className="ml-1 mr-1 text-xl text-foreground/60">
                      / {isYearly ? "year" : "month"}
                    </span>
                  </p>
                </div>
                <ul className="mt-5 flex flex-col gap-4 border-t p-3">
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    10+ seats (includes 2 free managers seats)
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    Schedule LinkedIn & Twitter Posts
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    AI Post Generation
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    Analytics
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    Managerial Oversight
                  </li>
                  <li className="inline-flex">
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-primary"
                    />
                    Enhanced Collaboration Tools
                  </li>
                </ul>
                <Button
                  className="mt-5 w-full"
                  onClick={handlePayment(2)}
                  disabled={isLoading}
                >
                  Choose Enterprise
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      {currentStep === 2 && (
        <div>You will be redirected to the payment page</div>
      )}
    </div>
  );
}
