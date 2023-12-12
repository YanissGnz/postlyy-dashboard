import React from "react";
// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// forms
import ProfileForm from "./profile-form";
import NotificationsForm from "./notifications-form";
import PasswordForm from "./password-form";
import LayoutForm from "./layout-form";

export default function Settings() {
  return (
    <div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
