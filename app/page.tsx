"use client";

import { JSX, SVGProps, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LangchainToolSet } from "composio-core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Component() {
  const [showDialog, setShowDialog] = useState(false);
  const [showLink, setShowLink] = useState({ connectedAccountId: "", url: "" });
  const [userQuery, setUserQuery] = useState("");
  const [result, setResult] = useState("");
  const [triggerDetails, setTriggerDetails] = useState("");
  const [triggerData, setTriggerData] = useState({
    from: "",
    message: "",
    id: "",
  });
  const isSubscribed = useRef(false);
  const lastMessage = useRef(null);

  const handleTrigger = async () => {
    if (isSubscribed.current) {
      return;
    }

    const toolset = new LangchainToolSet({ apiKey: process.env.NEXT_PUBLIC_COMPOSIO_API_KEY });
    toolset.client.triggers.subscribe(
      async (data) => {
        if (data.originalPayload.labelIds[0] === "UNREAD") {
          const from = data.originalPayload.payload.headers[16].value;
          const message = data.originalPayload.snippet;
          const id = data.originalPayload.threadId;

          setTriggerData((prevData) => {
            if (
              !prevData ||
              prevData.from !== from ||
              prevData.message !== message
            ) {
              return { from, message, id };
            }
            return prevData;
          });

          if (from === triggerDetails && lastMessage.current !== message) {
            lastMessage.current = message;
            const res = await fetch("/api/newMessage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ from, message, id, triggerDetails }),
            });
            const result = await res.json();
            setResult(result);
          }
        }
      },
      { entityId: "default" }
    );
    isSubscribed.current = true;
  };

  async function handleClick() {
    try {
      const res = await fetch("/authenticate", {
        method: "POST",
      });
      const info = await res.json();
      setShowLink({
        connectedAccountId: info.connectedAccountId,
        url: info.redirectUrl,
      });
      setShowDialog(true);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleQuery() {
    try {
      const res = await fetch("/api/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery }),
      });

      const result = await res.json();
      setResult(result);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="flex flex-col items-center container px-4 md:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-8 leading-tight">
          Hi. I am your Gmail Assistant.
        </h1>
        <p className="text-black mb-4">
          Please make sure to authenticate before starting
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Button aria-label="Gmail" onClick={handleClick}>
            <MailIcon className="mr-2 h-5 w-5" />
            Authenticate
          </Button>
        </div>

        <div className="w-full max-w-sm">
          <Textarea
            placeholder="What do you want to do?"
            className="mt-8 resize-none"
            onChange={(e) => setUserQuery(e.target.value)}
          />
        </div>
        <div className="mt-8">
          <Button onClick={handleQuery}>Lets Go!</Button>
        </div>

        <div className="mt-10 flex flex-col">
          <Label
            htmlFor="triggerInput"
            className="self-start mb-2 pl-2 text-sm"
          >
            Subscribe to triggers-
          </Label>
          <div className="flex justify-center gap-2">
            <Input
              placeholder="Enter name and Email"
              id="triggerInput"
              className="w-[300px]"
              onChange={(e) => setTriggerDetails(e.target.value)}
            ></Input>
            <Button onClick={handleTrigger}>Subscribe</Button>
          </div>
        </div>

        {result.length > 0 && (
          <div className="w-full max-w-md">
            <Textarea
              placeholder="Result"
              className="mt-8 border-0 min-h-52 overflow-auto"
              value={result}
              readOnly
            />
          </div>
        )}
      </div>
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect account</DialogTitle>
              <DialogDescription>
                Please complete authentication with Composio using this link -;
              </DialogDescription>
            </DialogHeader>
            <div className="">
              <a href={`${showLink.url}`} target="_blank">
                {showLink.url}
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}

function MailIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
