import React from "react";
// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// forms
import TeamForm from "./team-form";
import ProfileForm from "./profile-form";
import NotificationsForm from "./notifications-form";
import SubscriptionForm from "./subscription-form";

export default function Settings() {
  return (
    <div className="">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="powerups">Powerups</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="team">
          <TeamForm />
        </TabsContent>
        <TabsContent value="subscription">
          <SubscriptionForm />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
