"use client";

import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Iconify from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Input } from "@/components/ui/input";
import { addManager, addTeamMember } from "@/redux/slices/setupSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { teamMembersColumns } from "./team-members-columns";
import { TeamMembersDataTable } from "./team-member-data-table";
import { env } from "@/env";
import { useSession } from "next-auth/react";
import { useBoolean } from "usehooks-ts";
import { useRouter } from "next/navigation";

export const newMemberSchema = z.object({
  email: z.string().email(),
});

export default function SetupForm() {
  const { managers } = useAppSelector((state) => state.setup);
  const dispatch = useAppDispatch();

  const { value, setFalse, setTrue } = useBoolean(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const session = useSession();

  const { push } = useRouter();

  const [currentManagerEmail, setCurrentManagerEmail] =
    useState("current account");

  const managerForm = useForm<z.infer<typeof newMemberSchema>>({
    resolver: zodResolver(newMemberSchema),
    defaultValues: {
      email: "",
    },
  });

  const form = useForm<z.infer<typeof newMemberSchema>>({
    resolver: zodResolver(newMemberSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof newMemberSchema>) {
    const { email } = values;
    dispatch(
      addTeamMember({
        email,
        manager: currentManagerEmail,
      }),
    );
    form.reset();
  }

  async function onManagerSubmit(values: z.infer<typeof newMemberSchema>) {
    const { email } = values;
    dispatch(addManager(email));
    managerForm.reset();
  }

  const handleChooseTier = useCallback(
    (tier: number) => () => {
      setSelectedTier(tier);
      setCurrentStep(2);
    },
    [],
  );

  const handleBack = useCallback(() => {
    setCurrentStep(1);
    setSelectedTier(null);
  }, []);

  const handlePayment = useCallback(async () => {
    setTrue();
    await fetch(`${env.NEXT_PUBLIC_API_BASEURL}/api/Subscription/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session?.data?.user.token,
      },
      body: JSON.stringify({
        tier: selectedTier,
        managers: managers.map((manager) => {
          return {
            email: manager.email === "current account" ? "" : manager.email,
            teamMembers: manager.teamMembers,
          };
        }),
      }),
    })
      .then((res) => res.json())
      .then((res: { url: string; hasToPay: boolean }) => {
        console.log("🚀 ~ file: form.tsx:101 ~ handlePayment ~ res:", res);
        if (res.hasToPay) {
          push(res.url);
        }
      })
      .catch((err) => {
        console.log("🚀 ~ file: form.tsx:105 ~ .then ~ err:", err);
      });
    setFalse();
  }, [selectedTier, managers]);

  return (
    <div className="flex flex-col">
      <div className="mb-3 inline-flex w-full items-center justify-center gap-5">
        {[1, 2, 3].map((step) => (
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
                onClick={
                  currentStep === 2 && step === 1 ? handleBack : undefined
                }
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
                {step === 1
                  ? "Choose subscription"
                  : step === 2
                    ? "Setup seats"
                    : "Payment"}{" "}
              </p>
            </div>
            {step < 3 && <div className="h-0.5 w-10 rounded bg-gray-400"></div>}
          </>
        ))}
      </div>
      {currentStep === 1 && (
        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2">
          <Card className="border shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Small to medium businesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                <span className="mr-1 text-2xl text-foreground/60"> $</span>
                39.99
                <span className="ml-1 mr-1 text-xl text-foreground/60">
                  Per seat / month
                </span>
              </p>
              <ul className="mt-5 flex flex-col gap-4 border-t p-3">
                <li className="inline-flex">
                  <Iconify
                    icon="solar:check-circle-bold-duotone"
                    fontSize={22}
                    className="mr-2 text-primary"
                  />
                  2-9 seats (includes a manager seat)
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
              <Button className="mt-5 w-full" onClick={handleChooseTier(1)}>
                Choose SMB (1 month free trail)
              </Button>
            </CardContent>
          </Card>
          <Card className="border shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                <span className="mr-1 text-2xl text-foreground/60"> $</span>
                34.99
                <span className="ml-1 mr-1 text-xl text-foreground/60">
                  Per seat / month
                </span>
              </p>
              <ul className="mt-5 flex flex-col gap-4 border-t p-3">
                <li className="inline-flex">
                  <Iconify
                    icon="solar:check-circle-bold-duotone"
                    fontSize={22}
                    className="mr-2 text-primary"
                  />
                  10+ seats (includes a manager seat)
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
              <Button className="mt-5 w-full" onClick={handleChooseTier(2)}>
                Choose Enterprise
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {currentStep === 2 && (
        <>
          {selectedTier === 2 && (
            <div className="container mx-auto mb-2">
              <h1 className="mb-2 text-xl font-medium">
                Managers List{" "}
                <span className="text-sm"> (click to select a manager)</span>
              </h1>
              {managers.length < 2 && (
                <Form {...managerForm}>
                  <form
                    onSubmit={managerForm.handleSubmit(onManagerSubmit)}
                    className="mb-2 flex items-start gap-2"
                  >
                    <FormField
                      control={managerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter manager email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">Add</Button>
                  </form>
                </Form>
              )}
              <DataTable
                columns={columns}
                data={managers.map(({ email }) => ({ email }))}
                setCurrentManagerEmail={setCurrentManagerEmail}
              />
            </div>
          )}
          <div className="container mx-auto">
            <h1 className="mb-2 text-xl font-medium">Team members list</h1>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mb-2 flex items-start gap-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={`Enter member email for ${currentManagerEmail}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Add</Button>
              </form>
            </Form>
            <TeamMembersDataTable
              columns={teamMembersColumns}
              data={
                managers
                  .find(({ email }) => email === currentManagerEmail)
                  ?.teamMembers.map((email) => ({
                    email,
                    manager: currentManagerEmail,
                  })) ?? []
              }
            />
          </div>
          <div className="flex justify-end">
            <Button className="mt-5" onClick={handlePayment} disabled={value}>
              {value && (
                <Iconify
                  icon="ph:spinner-bold"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              )}
              Continue to payment
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
