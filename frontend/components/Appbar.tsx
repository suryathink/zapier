"use client";
import { useRouter } from "next/navigation";
import { LinkButton } from "./buttons/LinkBtn";
import { PrimaryButton } from "./buttons/PrimaryButton";

export const Appbar = () => {
  const router = useRouter();
  return (
    <div className="flex border-b justify-between p-4">
      <div className="flex flex-col justify-center">Zapier</div>
      <div>
        <div className="font-small">
          <div className="pr-4">
            <LinkButton onClick={() => {}}> Contact Sales</LinkButton>
          </div>
        </div>
        <div className="font-small">
          <div className="pr-4">
            <LinkButton
              onClick={() => {
                router.push("/login");
              }}
            >
              Login
            </LinkButton>
          </div>
          <PrimaryButton
            onClick={() => {
              router.push("/signup");
            }}
          >
            Signup
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
