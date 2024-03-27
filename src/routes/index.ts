import { type EProviders } from "@/types/EProviders";

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
  recoverPassword: getPath("auth/recover-password"),
  resetPassword: getPath("auth/reset-password"),
  payment: getPath("auth/payment"),
  home: getPath("home"),
  settings: getPath("settings"),
  team: getPath("team"),
  billing: getPath("billing"),
  accounts: {
    root: getPath("accounts"),
    connect: (provider: EProviders) => getPath(`connect?provider=${provider}`),
  },
  support: getPath("support"),
  notes: {
    root: getPath("notes"),
    create: getPath("notes/create"),
    edit: (id: string) => getPath(`notes/edit/${id}`),
    view: (id: string) => getPath(`notes/${id}`),
  },
  templates: {
    root: getPath("templates"),
    create: getPath("templates/create"),
    edit: (id: string) => getPath(`templates/edit/${id}`),
    view: (id: string) => getPath(`templates/${id}`),
  },
  drafts: {
    root: getPath("drafts"),
    create: getPath("drafts/create"),
    edit: (id: string) => getPath(`drafts/edit/${id}`),
    view: (id: string) => getPath(`drafts/${id}`),
  },
  post: {
    create: getPath("post"),
    edit: (id: string) => getPath(`post/edit/${id}`),
  },
};
