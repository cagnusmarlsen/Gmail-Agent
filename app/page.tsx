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
import { Input } from "@/components/ui/input";
import { LangchainToolSet } from "composio-core";
import { v4 as uuidv4 } from "uuid";

export default function Component() {
  const [showDialog, setShowDialog] = useState(false);
  const [showLink, setShowLink] = useState({ connectedAccountId: "", url: "" });
  const [userQuery, setUserQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean>();

  useEffect(() => {
    if (!localStorage.getItem("entityId")) {
      let entityId = uuidv4();
      localStorage.setItem("entityId", entityId);
      setAuthenticated(false);
    } else {
      confirmAuth();
    }
  }, []);

  const toolset = new LangchainToolSet({
    apiKey: process.env.NEXT_PUBLIC_COMPOSIO_API_KEY,
  });

  async function confirmAuth() {
    try {
      const entityId = localStorage.getItem("entityId") ?? undefined;
      const entity = await toolset.client.getEntity(entityId);
      const connection = await entity.getConnection("gmail");
      if (connection && entityId) {
        setShowLink({
          connectedAccountId: entityId,
          url: "",
        });
        setAuthenticated(true);
        return connection;
      } else {
        console.log("something went wromg. Please Authenticate again");
      }
    } catch (error) {
      alert("Something went wrong!");
      console.log(error);
    }
  }

  async function setupUserConnection() {
    const entityId = localStorage.getItem("entityId") ?? undefined;
    const entity = await toolset.client.getEntity(entityId);
    const connection = await entity.getConnection("gmail");
    if (!connection) {
      const connection = await entity.initiateConnection("gmail");
      if (entityId && connection.redirectUrl) {
        setShowLink({
          connectedAccountId: entityId,
          url: connection.redirectUrl,
        });
      }
      setShowDialog(true);
      const connect = connection.waitUntilActive(60);
      if ((await connect).status === "ACTIVE") {
        setAuthenticated(true);
      }
    }
    return connection;
  }

  async function handleQuery() {
    try {
      setResult("");
      setLoading(true);
      const res = await fetch("/api/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery, showLink }),
      });

      const result = await res.json();
      setLoading(false);
      setResult(result);
    } catch (error) {
      setResult("There was an error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex pt-20 justify-center min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="flex flex-col items-center container px-4 md:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-8 leading-tight">
          Hi, I'm your Gmail Assistant
        </h1>

        {authenticated && (
          <p className="font-bold text-gray-700 text-lg md: text-md">
            I can send, fetch and draft emails and labels
          </p>
        )}
        {!authenticated && (
          <>
            <p className="text-black mb-4">
              Please make sure to authenticate before starting -
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Button aria-label="Gmail" onClick={setupUserConnection}>
                <MailIcon className="mr-2 h-5 w-5" />
                Authenticate
              </Button>
            </div>
          </>
        )}
        <div className="w-full max-w-2xl flex gap-4 mt-10">
          <div className="w-full max-w-xl">
            <Input
              placeholder="Send email, fetch emails, create label..."
              className="mt-8 min-h-10 max-h-10"
              onChange={(e) => setUserQuery(e.target.value)}
            />
          </div>
          <div className="mt-8">
            <Button onClick={handleQuery} disabled={loading}>
              Lets Go!
            </Button>
          </div>
        </div>

        {loading && (
          <div className=" flex items-center justify-center mt-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-300 border-t-transparent" />
          </div>
        )}

        {result.length > 0 && (
          <div className="w-full max-w-2xl">
            <Textarea
              placeholder="Result"
              className="resize-none mt-8 border-0 min-h-52 overflow-auto"
              value={result}
              readOnly={true}
            />
          </div>
        )}
        <div className="mt-auto mb-4">
          <p className="text-gray-600">
            Powered by{" "}
            <a href="https://composio.dev/" target="_blank">
              Composio
            </a>
          </p>
        </div>
      </div>
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect account</DialogTitle>
              <DialogDescription>
                Please complete authentication with Composio using this link -
              </DialogDescription>
            </DialogHeader>
            <div className="">
              <a
                href={`${showLink.url}`}
                target="_blank"
                className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-[350px]"
                onClick={() => setShowDialog(false)}
              >
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
