"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
// api
import {
  useChangeProfileImageMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/api/user/profile/apiSlice";
// types
import { profileSchema, type TProfile } from "@/types/TProfile";
// components
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
import { Spinner } from "@/components/ui/Spinner";
import { UploadAvatar } from "@/components/ui/upload";
import { useAuth } from "@/lib/auth/client";
import { fData } from "@/lib/formatNumber";
import { isString } from "lodash";
import { toast } from "sonner";

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

  const { data: session } = useAuth();

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

  async function onSubmit(values: TProfile) {
    updateProfile(values)
      .unwrap()
      .then(async () => {
        form.reset(values);
        toast.success("Profile updated successfully");
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      })
      .catch((err) => {
        toast.error("Something went wrong");
        console.log(err);
      });
  }

  const handleUpdateImage = async () => {
    if (profilePic !== null) {
      const data = new FormData();
      data.append("ProfilePicture", profilePic);
      changeProfileImage(data)
        .unwrap()
        .then(async () => {
          toast.success("Profile picture updated successfully");
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
        })
        .catch(() => {
          toast.error("Something went wrong");
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
          <div className="flex w-full flex-col items-center justify-center gap-1">
            <UploadAvatar
              file={profilePic!}
              maxSize={3145728}
              onDrop={handleDrop}
              accept={{
                image: ["image/jpeg", "image/jpg", "image/png"],
              }}
              helperText={
                <p className="mx-auto mb-6 mt-3 block flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
                  Allowed *.jpeg, *.jpg, *.png
                  <br /> max size of {fData(3145728)}
                </p>
              }
            />
            <Button
              onClick={handleUpdateImage}
              loading={isChangingProfileImageLoading}
              disabled={
                isChangingProfileImageLoading ||
                !profilePic ||
                isString(profilePic)
              }
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
