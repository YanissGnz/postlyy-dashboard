"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// api
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/api/user/profile/apiSlice";
// types
import { profileSchema, type TProfile } from "@/types/TProfile";
// components
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function profileForm() {
  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
  } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdateProfileLoading }] =
    useUpdateProfileMutation();

  const defaultValues = useMemo(() => {
    if (profile) return profile.data;
    return {
      fullName: "",
      phoneNumber: "",
      photoUrl: "",
      email: "",
    };
  }, [profile, isProfileFetching, isProfileLoading]);

  const form = useForm<TProfile>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  useEffect(() => {
    if (profile) form.reset(defaultValues);
  }, [profile, isProfileLoading, isProfileFetching]);

  function onSubmit(values: TProfile) {
    updateProfile(values)
      .unwrap()
      .then(() => {
        form.reset(values);
        toast.success("Profile updated successfully");
      })
      .catch((err) => {
        toast.error("Something went wrong");
        console.log(err);
      });
  }

  return (
    <Card className="w-full">
      {isProfileLoading ? (
        <div className="flex h-56 w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Email" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />{" "}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />{" "}
              <Button
                type="submit"
                disabled={isUpdateProfileLoading}
                loading={isUpdateProfileLoading}
              >
                Update
              </Button>
            </form>
          </Form>
        </CardContent>
      )}
    </Card>
  );
}
