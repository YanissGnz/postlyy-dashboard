"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// api
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangeProfileImageMutation,
} from "@/redux/api/user/profile/apiSlice";
// types
import { profileSchema, type TProfile } from "@/types/TProfile";
// components
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
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
import { UploadAvatar } from "@/components/ui/upload";
import { fData } from "@/lib/formatNumber";
import { Card, CardContent } from "@/components/ui/card";

export default function profileForm() {
  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
  } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdateProfileLoading }] =
    useUpdateProfileMutation();
  const [changeProfileImage, { isLoading: isChangingProfileImageLoading }] =
    useChangeProfileImageMutation();

  const [profilePic, setProfilePic] = useState<
    (File & { preview: string }) | string | null
  >(profile?.data.photoUrl ? profile.data.photoUrl : null);

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
    if (profile) {
      form.reset(defaultValues);
      if (profile.data.photoUrl && profile.data.photoUrl !== "")
        setProfilePic(profile.data.photoUrl);
    }
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

  const handleUpdateImage = () => {
    if (profilePic !== null) {
      const data = new FormData();
      data.append("ProfilePicture", profilePic);
      changeProfileImage(data)
        .unwrap()
        .then(() => {
          toast.success("Profile picture updated successfully");
        })
        .catch((err) => {
          toast.error("Something went wrong");
          console.log(err);
        });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file) {
        setProfilePic(
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        );
      }
    },
    [setProfilePic],
  );

  return (
    <Card className="w-full">
      {isProfileLoading ? (
        <div className="flex h-56 w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <CardContent className="p-4">
          <div className="flex w-full flex-col items-center justify-center">
            <UploadAvatar
              file={profilePic!}
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <p className="mx-auto mb-6 mt-3 block flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </p>
              }
            />
            <Button
              onClick={handleUpdateImage}
              loading={isChangingProfileImageLoading}
              disabled={isChangingProfileImageLoading}
            >
              Update Profile Picture
            </Button>
          </div>

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
                Update Profile Details
              </Button>
            </form>
          </Form>
        </CardContent>
      )}
    </Card>
  );
}
