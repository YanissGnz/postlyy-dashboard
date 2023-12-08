import React from "react";
// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// forms
import ProfileForm from "./profile-form";
import NotificationsForm from "./notifications-form";

export default function Settings() {
  return (
    <div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
