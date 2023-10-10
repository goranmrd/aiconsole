import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// TODO: Fix this any type?
export const cn = (...args: any[]) => twMerge(clsx(...args));
