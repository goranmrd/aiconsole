import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// TODO: Fix this any type?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cn = (...args: any[]) => twMerge(clsx(...args));
