"use client";

import { useParams } from "next/navigation";
import { Editor } from "@/components/editor/Editor";

export default function EditorPage() {
  const params = useParams();
  const docId = params.docId as string;
  const folderId = params.folderId as string;

  return <Editor key={docId} docId={docId} folderId={folderId} />;
}
