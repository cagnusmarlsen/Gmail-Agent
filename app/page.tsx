"use client"

import { JSX, SVGProps, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { LangchainToolSet } from "composio-core";


export default function Component() {

  const [showDialog, setShowDialog] = useState(false);
  const [showLink, setShowLink] = useState({connectedAccountId: "", url: ""});
  const [userQuery, setUserQuery] = useState("");
  const [result, setResult] = useState("");
  const [triggerData, setTriggerData] = useState({from: "", message: "", id: ""});

  useEffect(() => {
    const toolset = new LangchainToolSet({ apiKey: "9u96ly6pioqfmne0zvildp"});
    toolset.client.triggers.subscribe(async (data) => {
      if(data.originalPayload.labelIds[0] === "UNREAD") {
        const from = data.originalPayload.payload.headers[16].value;
        const message = data.originalPayload.snippet;
        const id = data.originalPayload.threadId;

        console.log("THIS IS THE ID", id);
        setTriggerData(prevData => {
          if (!prevData || prevData.from !== from || prevData.message !== message) {
            return { from, message, id };
          }
          return prevData;
        });
        const res = await fetch('/api/newMessage', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({from, message, id}),
        })

        const result = await res.json();
        setResult(result);
      }
      console.log("DATA FOR ME", data);
    }, {entityId: "default", integrationId: "41a1e382-37a3-4671-893a-4a0c30545dc0"})
  },[])

  async function handleClick() {
    try {
      const res = await fetch('/authenticate', {
        method: 'POST'})
      const info = await res.json();
      setShowLink({connectedAccountId: info.connectedAccountId, url: info.redirectUrl});
      setShowDialog(true);

    } catch (error) {
        console.log(error)
    }
  }

  async function handleQuery() {
    try {
      const res = await fetch('/api/result', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userQuery}),
      })

      const result = await res.json();
      setResult(result);
    } catch (error) {
        console.log(error)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="flex flex-col items-center container px-4 md:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-8 leading-tight">
          Streamline Your Workflow
        </h1>
        <p className="text-black mb-8">Please log in to Gmail to start</p>
        <div className="flex justify-center gap-4 mt-4">
          <Button aria-label="Gmail" onClick={handleClick} >
            <MailIcon className="mr-2 h-5 w-5" />
            Gmail
          </Button>
        </div>
        <div className="w-full max-w-sm">
          <Textarea placeholder="What do you want to do?" className="mt-8 resize-none" onChange={(e) => setUserQuery(e.target.value)}/> 
        </div>
        <div className="mt-8">
          <Button onClick={handleQuery}>Do It</Button>
        </div>
        {result.length > 0 && <div className="w-full max-w-md">
          <Textarea placeholder="Result" className="mt-8 border-0" value={result}/>
        </div>}
      </div>
      {showDialog && (
        <Dialog open = {showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect account</DialogTitle>
          <DialogDescription>
            Please complete authentication with the app using this link -;
          </DialogDescription>
        </DialogHeader>
        <div className=""><Link href={`${showLink.url}`}>{showLink.url}</Link></div>
        </DialogContent>
        </Dialog>
          
      )}
    </main>
  )
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
  )
}


function SlackIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <rect width="3" height="8" x="13" y="2" rx="1.5" />
      <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" />
      <rect width="3" height="8" x="8" y="14" rx="1.5" />
      <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" />
      <rect width="8" height="3" x="14" y="13" rx="1.5" />
      <path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5" />
      <rect width="8" height="3" x="2" y="8" rx="1.5" />
      <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />
    </svg>
  )
}


function TrelloIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <rect width="3" height="9" x="7" y="7" />
      <rect width="3" height="5" x="14" y="7" />
    </svg>
  )
}