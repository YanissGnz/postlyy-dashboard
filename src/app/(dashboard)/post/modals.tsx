"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

export default function Modals() {
  const { list } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();

  return <></>;
}
