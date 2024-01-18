"use client";

import React, { useCallback, useState } from "react";
// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// forms
import ProfileForm from "./profile-form";
import NotificationsForm from "./notifications-form";
import PasswordForm from "./password-form";
import LayoutForm from "./layout-form";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/routes";
import FeedbackForm from "./feedback-form";
import FinisherForm from "./finisher-form";

export default function Settings() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const [tab, setTab] = useState(currentTab ?? "profile");

  const { push } = useRouter();

  const handleTabChange = useCallback((value: string) => {
    push(ROUTES.settings + "?tab=" + value);
    setTab(value);
  }, []);

  return (
    <div>
      <Tabs
        defaultValue="profile"
        value={tab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="finisher">Finisher</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="password">
          <PasswordForm />
        </TabsContent>
        <TabsContent value="layout">
          <LayoutForm />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsForm />
        </TabsContent>
        <TabsContent value="finisher">
          <FinisherForm />
        </TabsContent>
        <TabsContent value="feedback">
          <FeedbackForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
