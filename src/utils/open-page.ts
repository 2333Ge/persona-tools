import { useRouter } from "next/navigation";
import { useCallback } from "react";
import qs from "./qs";

const base_path = "";

const openPageBase = (params: {
  url: string;
  params?: Record<string, any>;
  newWindow?: boolean;
  router?: ReturnType<typeof useRouter>;
}) => {
  let url: string | null = params.url.trim();
  if (!url) return;

  if (url.startsWith("/")) {
    url = `${base_path}${url}`;
  }

  if (params.params) {
    url = `${url}${url.indexOf("?") === -1 ? "?" : "&"}${qs.stringify(
      params.params
    )}`;
  }

  if (params.newWindow) {
    window.open(url, "_blank");
  } else {
    if (params.router) {
      params.router.push(url);
    } else {
      window.open(url);
    }
  }
};

/**
 * 打开新页面，使用Next预加载
 */
export const useOpenPage = () => {
  const router = useRouter();
  return useCallback(
    (urlOut: string, params?: Record<string, any>, newWindow?: boolean) => {
      openPageBase({ url: urlOut, params, newWindow, router });
    },
    [router]
  );
};
