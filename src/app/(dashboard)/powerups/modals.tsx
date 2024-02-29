import SelfRetweetDialog from "./self-retweet-dialog";
import TwitterAutoRetweetDialog from "./twitter-auto-retweet-dialog";
import TwitterAutoplugDialog from "./twitter-autoplug-dialog";

export default function Modals() {
  return (
    <>
      <TwitterAutoplugDialog />
      <TwitterAutoRetweetDialog />
      <SelfRetweetDialog />
    </>
  );
}
