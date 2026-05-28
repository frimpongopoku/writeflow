import type { Timestamp } from "firebase/firestore";

export interface WFFolder {
  id: string;
  name: string;
  createdAt: Timestamp;
  order: number;
}

export interface WFDocument {
  id: string;
  folderId: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  wordCount: number;
  isDeleted: boolean;
  deletedAt: Timestamp | null;
}

// Virtual folder IDs that are not real Firestore documents
export const VIRTUAL_FOLDER_ALL = "__all__";
export const VIRTUAL_FOLDER_TRASH = "__trash__";
