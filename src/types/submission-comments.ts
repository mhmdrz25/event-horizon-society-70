
export interface SubmissionComment {
  id: string;
  submission_id: string;
  admin_id: string;
  comment: string;
  created_at: string;
  admin?: {
    name: string;
  };
}

export interface SubmissionCommentInsert {
  submission_id: string;
  admin_id: string;
  comment: string;
}
