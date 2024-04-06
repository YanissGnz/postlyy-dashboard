import { useGetAccountsQuery } from "@/redux/api/user/account/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { ROUTES } from "@/routes";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
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

const accountPopoverStepIndex = 2;

function AppTourProvider({ children }: { children: React.ReactNode }) {
  const { isAccountPopoverOpen } = useAppSelector((state) => state.layout);
  const { data: accounts } = useGetAccountsQuery();
  const [didAppTour, setDidAppTour] = useLocalStorage("app-tour", false);

  const pathname = usePathname();
  const { push } = useRouter();

  const [{ run, stepIndex, steps }, setState] = useState<State>({
    run: false,
    stepIndex: 0,
    steps: [],
  });

  const mounted = useIsMounted();

  useEffect(() => {
    if (mounted()) {
      setState({
        run: !didAppTour,
        steps: [
          {
            title: "Welcome to Postlyy",
            content: (
              <div>
                <p className="text-sm">Let's take a quick tour of the app.</p>
              </div>
            ),
            disableBeacon: true,
            target: "body",
            placement: "center",
          },
          {
            title: "The Menu",
            content: (
              <p className="text-sm">
                This is the navigation menu. You can access all the features of
                the app from here.
              </p>
            ),
            disableBeacon: true,
            target: ".menu",
            placement: "auto",
          },
          {
            title: "Account Menu",
            content: (
              <div>
                <p className="text-sm">
                  This is the account menu. You can access your settings, and
                  log out from here.
                </p>
                <p className="mt-2 font-bold">
                  Click on the account menu to open it.
                </p>
              </div>
            ),
            spotlightClicks: true,
            hideFooter: true,
            disableBeacon: true,
            event: "hover",
            target: "#account-popover",
            placement: "top",
          },
          {
            title: "Accounts",
            content: (
              <div>
                <p className="text-sm">
                  You can manage your accounts from here.
                </p>
                <p className="mt-2 font-bold">
                  Hover over " Accounts " and click " Manage accounts "
                </p>
              </div>
            ),
            disableBeacon: true,
            spotlightClicks: true,
            hideFooter: true,
            disableOverlay: true,
            styles: {
              spotlight: {
                width: "400",
              },
            },
            target: "#accounts-button",
            placement: "top",
          },
          {
            title: "Managing your accounts",
            content: (
              <div>
                <p className="text-sm">
                  You can connect your accounts by clicking on the "Connect"
                  button, or delete them by clicking on the "Delete" button.
                </p>
              </div>
            ),
            hideBackButton: true,
            disableBeacon: true,
            target: "body",
            placement: "center",
          },
          ...(accounts?.data.length && accounts?.data.length > 0
            ? [
                {
                  title: "Your first Post",
                  content: (
                    <div>
                      <p className="text-sm">
                        Now that you connect your account you can't create your
                        first post
                      </p>
                    </div>
                  ),
                  hideBackButton: true,
                  disableBeacon: true,
                  target: "body",
                  locale: {
                    last: "Start posting!",
                  },
                  placement: "center" as const,
                },
              ]
            : [
                {
                  title: "No accounts connected",
                  content: (
                    <div>
                      <p className="text-sm">
                        You don't have any accounts connected yet.
                      </p>
                      <p className="mt-2 font-bold">
                        Click on the "Connect" button to get started.
                      </p>
                    </div>
                  ),
                  hideBackButton: true,
                  disableBeacon: true,
                  target: "body",

                  locale: {
                    last: "Got it!",
                  },
                  placement: "center" as const,
                },
              ]),
        ],
        stepIndex: 0,
      });
    }
  }, [mounted, accounts, didAppTour]);

  useEffect(() => {
    if (pathname === ROUTES.accounts.root) {
      setState((prev) => ({
        ...prev,
        stepIndex: accountPopoverStepIndex + 2,
      }));
    } else if (isAccountPopoverOpen) {
      setState((prev) => ({
        ...prev,
        stepIndex: accountPopoverStepIndex + 1,
      }));
    }
  }, [isAccountPopoverOpen, pathname, accounts]);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;

      if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
        if (accounts?.data.length && accounts?.data.length > 0) {
          push(ROUTES.post.create);
        }

        setState((prev) => ({
          ...prev,
          run: false,
          stepIndex: 0,
        }));
        setDidAppTour(true);
      } else if (
        ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(
          type,
        )
      ) {
        const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

        // Update state to advance the tour
        setState((prev) => ({
          ...prev,
          stepIndex: nextStepIndex,
        }));
      }
    },
    [accounts],
  );

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

export default AppTourProvider;
