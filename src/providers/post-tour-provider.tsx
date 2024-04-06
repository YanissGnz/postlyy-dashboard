"use client";

import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Joyride, {
  ACTIONS,
  EVENTS,
  STATUS,
  type CallBackProps,
  type Step,
} from "react-joyride";
import { useIsMounted, useLocalStorage } from "usehooks-ts";

type State = {
  run: boolean;
  stepIndex: number;
  dialogOpen?: boolean;
  steps: Step[];
};

const stepStyles = {
  arrowColor: "hsl(var(--popover))",
  backgroundColor: "hsl(var(--popover))",
  textColor: "hsl(var(--popover-foreground))",
  primaryColor: "hsl(var(--primary))",
  zIndex: 1000000,
};

function PostTourProvider({ children }: { children: React.ReactNode }) {
  const [didPostTour, setDidPostTour] = useLocalStorage("post-tour", false);
  const [didAppTour] = useLocalStorage("app-tour", false);
  const session = useSession();

  const accounts = useMemo(() => {
    return session.data?.user.accounts;
  }, [session.data]);

  const [{ run, stepIndex, steps }, setState] = useState<State>({
    run: false,
    stepIndex: 0,
    steps: [],
  });

  const mounted = useIsMounted();

  useEffect(() => {
    if (mounted()) {
      setState({
        run:
          accounts?.length && accounts?.length > 0
            ? !didPostTour && didAppTour
            : false,
        steps: [
          {
            title: "The Post page",
            content: (
              <div>
                <p className="text-sm">
                  This is the Post page where you can create and schedule posts.
                </p>
              </div>
            ),
            disableBeacon: true,
            target: "body",
            placement: "center",
          },
          {
            title: "Selected socials",
            content: (
              <p className="text-sm">
                Those are the socials you have selected to post to.
              </p>
            ),
            disableBeacon: true,
            target: "#selected-socials",
            placement: "auto",
          },
          {
            title: "Post Settings",
            content: (
              <p className="text-sm">
                Here you can set the post settings and select the accounts you
                want to post to.
              </p>
            ),
            disableBeacon: true,
            target: "#post-settings",
            placement: "auto",
          },
          {
            title: "Best Posts",
            content: (
              <p className="text-sm">
                Here you can see the best posts from other Postlyy users and
                instantly import them and use them as your own.
              </p>
            ),
            disableBeacon: true,
            target: "#best-posts",
            placement: "auto",
          },
          {
            title: "Templates",
            content: (
              <p className="text-sm">
                Here you can see the templates you have created and use them to
                create posts.
              </p>
            ),
            disableBeacon: true,
            target: "#post-templates",
            placement: "auto",
          },
          {
            title: "Drafts",
            content: (
              <p className="text-sm">
                Here you can see the drafts you have created and use them to
                create posts.
              </p>
            ),
            disableBeacon: true,
            target: "#post-drafts",
            placement: "auto",
          },
          {
            title: "Notes",
            content: (
              <p className="text-sm">
                Here you can see the notes you have created, you can open them
                side by side with the post editor to see a note while creating
                posts.
              </p>
            ),
            disableBeacon: true,
            target: "#post-notes",
            placement: "auto",
          },
          {
            title: "Post Preview",
            content: (
              <p className="text-sm">
                Here you can see a preview of the post you are creating.
              </p>
            ),
            disableBeacon: true,
            target: "#post-preview",
            placement: "auto",
          },
          {
            title: "Adding a thread",
            content: (
              <p className="text-sm">
                By clicking on the "Add Thread" button you can add a thread to
                the post.
              </p>
            ),
            disableBeacon: true,
            target: "#add-thread",
            placement: "auto",
          },
          {
            title: "Upload Images",
            content: (
              <p className="text-sm">
                You can upload images to use in your post by clicking on the
                "Upload Images" button.
              </p>
            ),
            disableBeacon: true,
            target: "#upload-images",
            placement: "auto",
          },
          {
            title: "Upload Gif",
            content: (
              <p className="text-sm">
                You can upload gifs to use in your post by clicking on the
                "Upload Gif" button.
              </p>
            ),
            disableBeacon: true,
            target: "#upload-gif",
            placement: "auto",
          },
          {
            title: "Add Poll",
            content: (
              <p className="text-sm">
                By clicking on the "Add Poll" button you can add a poll to the
                post.
              </p>
            ),
            disableBeacon: true,
            target: "#add-poll",
            placement: "auto",
          },
          {
            title: "Add Emojis",
            content: (
              <p className="text-sm">
                You can also add emojis to your post from here.
              </p>
            ),
            disableBeacon: true,
            target: "#add-emoji",
            placement: "auto",
          },
          {
            title: "More Settings",
            content: (
              <p className="text-sm">
                Here you can manage more thread settings.
              </p>
            ),
            disableBeacon: true,
            target: "#thread-settings",
            placement: "auto",
          },
          {
            title: "Scheduling and posting",
            content: (
              <p className="text-sm">
                You can save the post as draft or template or you can post it
                now or schedule it for later.
              </p>
            ),
            disableBeacon: true,
            target: "#post-buttons",
            placement: "auto",
          },
          {
            title: "All set!",
            content: (
              <p className="text-sm">
                You are all set to create and schedule posts. If you need help
                you can always click on the help button on the bottom right
                corner.
              </p>
            ),
            disableBeacon: true,
            target: "body",
            placement: "center",
          },
        ],
        stepIndex: 0,
      });
    }
  }, [mounted, didPostTour, accounts]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setState((prev) => ({
        ...prev,
        run: false,
        stepIndex: 0,
      }));
      setDidPostTour(true);
    } else if (
      ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)
    ) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      // Update state to advance the tour
      setState((prev) => ({
        ...prev,
        stepIndex: nextStepIndex,
      }));
    }
  }, []);

  return (
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={run}
        scrollToFirstStep
        hideCloseButton
        disableOverlayClose
        showSkipButton
        stepIndex={stepIndex}
        steps={steps}
        styles={{
          options: { ...stepStyles },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip",
        }}
      />
      {children}
    </>
  );
}

export default PostTourProvider;
