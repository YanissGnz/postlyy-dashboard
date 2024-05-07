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

function TextToImageTourProvider({ children }: { children: React.ReactNode }) {
  const [didTextToImageTour, setDidPostTour] = useLocalStorage(
    "text-to-image-tour",
    false,
  );
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
            ? !didTextToImageTour && didAppTour
            : false,
        steps: [
          {
            title: "Text to image",
            content: (
              <div>
                <p className="text-sm">
                  In this page you can convert text to image.
                </p>
                <p className="text-sm">
                  You can use this feature to create images for your posts.
                </p>
              </div>
            ),
            disableBeacon: true,
            target: "body",
            placement: "center",
          },

          {
            title: "Text Editor",
            content: (
              <div>
                <p className="text-sm">
                  This is the text editor where you can write your content that
                  you want to convert to image.
                </p>
                <p className="text-sm">
                  You add text, images, list, code, quote, delimiter, table,
                  warning, and more, by clicking on the + icon.
                </p>
              </div>
            ),
            spotlightClicks: true,
            disableBeacon: true,
            target: "#editorjs",
            placement: "auto",
          },
          {
            title: "Text Editor",
            content: (
              <div>
                <p className="text-sm">
                  You can also change the text style, size, and color by
                  selecting the text and using the toolbar.
                </p>
              </div>
            ),
            spotlightClicks: true,
            disableBeacon: true,
            target: "#editorjs",
            placement: "auto",
          },
          {
            title: "Export to image",
            content: (
              <p className="text-sm">
                Once you are done writing, click on the "Export to png" button
                and the text will be downloaded as an image.
              </p>
            ),
            disableBeacon: true,
            target: "#export-image-button",
            placement: "auto",
          },
          {
            title: "All set! 🎉",
            content: (
              <p className="text-sm">
                Now you can start creating images for your posts.
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
  }, [mounted, didTextToImageTour, accounts]);

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

export default TextToImageTourProvider;
