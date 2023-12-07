const ROOT_PATH = "/";

const getPath = (path: string) => {
  return ROOT_PATH + path;
};

export const ROUTES = {
  root: ROOT_PATH,
  login: getPath("auth/login"),
  register: getPath("auth/register"),
  confirmEmail: getPath("auth/confirm-email"),
  setupSubscription: getPath("auth/setup-subscription"),
  payment: getPath("auth/payment"),
  home: getPath("home"),
  settings: getPath("settings"),
};
