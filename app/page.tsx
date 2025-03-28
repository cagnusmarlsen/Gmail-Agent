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

export default function Component() {
  const [showDialog, setShowDialog] = useState(false);
  const [showLink, setShowLink] = useState({ connectedAccountId: "", url: "" });
  const [userQuery, setUserQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean>();

  useEffect(() => {
    async function initAuth() {
      if (!localStorage.getItem("entityId")) {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "init" }),
        });
        const data = await response.json();
        if (data.entityId) {
          localStorage.setItem("entityId", data.entityId);
          setAuthenticated(false);
        }
      } else {
        confirmAuth();
      }
    }
    initAuth();
  }, []);

  useEffect(() => {
    let pollTimer: NodeJS.Timeout;
    
    if (showDialog) {
      pollTimer = setInterval(async () => {
        const result = await confirmAuth();
        if (result?.status === "active") {
          setShowDialog(false);
          clearInterval(pollTimer);
        }
      }, 2000);
    }

    return () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [showDialog]);

  async function confirmAuth() {
    try {
      const entityId = localStorage.getItem("entityId");
      if (!entityId) return;

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", entityId }),
      });

      const data = await response.json();
      if (data.status === "active") {
        setShowLink({
          connectedAccountId: entityId,
          url: "",
        });
        setAuthenticated(true);
        return data;
      } else {
        setAuthenticated(false);
        return data;
      }
    } catch (error) {
      console.error("Auth error:", error);
      setAuthenticated(false);
    }
  }

  async function setupUserConnection() {
    try {
      const entityId = localStorage.getItem("entityId");
      if (!entityId) console.log("No entityId found");

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup", entityId }),
      });

      const data = await response.json();
      if (data.url) {
        setShowLink({
          connectedAccountId: data.connectedAccountId,
          url: data.url,
        });
        setShowDialog(true);
      }
      
      if (data.status === "active") {
        setAuthenticated(true);
      }
    } catch (error) {
      console.error("Setup error:", error);
      alert("Failed to setup connection");
    }
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
          Hi, I am your Gmail Assistant
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
