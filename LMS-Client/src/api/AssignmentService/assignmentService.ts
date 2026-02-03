import axiosClient from '../axiosClient';

export interface AssignmentDetailDto {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  maxScore: number;
  allowLateSubmission: boolean;
  latePenaltyPercent?: number;
  maxAttempts?: number;
  requireTextSubmission: boolean;
  allowFileSubmission: boolean;
  allowLinkSubmission: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
  createdAt: string;
  isOverdue: boolean;
  timeRemaining?: number;
  canSubmit: boolean;
  mySubmission?: AssignmentSubmissionDto;
}

export interface AssignmentSubmissionDto {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  textContent?: string;
  type: string;
  status: string;
  submittedAt?: string;
  gradedAt?: string;
  score?: number;
  feedback?: string;
  graderName?: string;
  isLate: boolean;
  createdAt: string;
  updatedAt?: string;
  attemptNumber: number;
  attachments: AttachmentDto[];
  links: LinkDto[];
  comments: SubmissionCommentDto[];
}

export interface AttachmentDto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
}

export interface LinkDto {
  url: string;
  title?: string;
}

export interface SubmissionCommentDto {
  id: string;
  submissionId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  canEdit: boolean;
  canDelete: boolean;
  attachments: AttachmentDto[];
}

export interface CreateSubmissionDto {
  assignmentId: string;
  textContent?: string;
  files?: File[];
  links?: string[];
  saveAsDraft: boolean;
}

export interface UpdateSubmissionDto {
  textContent?: string;
  files?: File[];
  links?: string[];
  removeAttachmentIds?: string[];
  saveAsDraft: boolean;
}

export interface CreateCommentDto {
  submissionId: string;
  content: string;
  isPrivate: boolean;
  files?: File[];
}

export interface UpdateCommentDto {
  content: string;
  isPrivate: boolean;
}

export interface GradeSubmissionDto {
  submissionId: string;
  score: number;
  feedback?: string;
}

class AssignmentService {
  // Get assignment details
  async getAssignment(assignmentId: string): Promise<AssignmentDetailDto> {
    const response = await axiosClient.get(`/assignment/${assignmentId}`);
    return response.data.data;
  }

  // Create new submission
  async createSubmission(createDto: CreateSubmissionDto): Promise<AssignmentSubmissionDto> {
    const formData = new FormData();
    formData.append('assignmentId', createDto.assignmentId);
    formData.append('saveAsDraft', createDto.saveAsDraft.toString());
    
    if (createDto.textContent) {
      formData.append('textContent', createDto.textContent);
    }
    
    if (createDto.files) {
      createDto.files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    if (createDto.links) {
      createDto.links.forEach(link => {
        formData.append('links', link);
      });
    }

    const response = await axiosClient.post('/assignment/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Update submission
  async updateSubmission(submissionId: string, updateDto: UpdateSubmissionDto): Promise<AssignmentSubmissionDto> {
    const formData = new FormData();
    formData.append('saveAsDraft', updateDto.saveAsDraft.toString());
    
    if (updateDto.textContent) {
      formData.append('textContent', updateDto.textContent);
    }
    
    if (updateDto.files) {
      updateDto.files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    if (updateDto.links) {
      updateDto.links.forEach(link => {
        formData.append('links', link);
      });
    }
    
    if (updateDto.removeAttachmentIds) {
      updateDto.removeAttachmentIds.forEach(id => {
        formData.append('removeAttachmentIds', id);
      });
    }

    const response = await axiosClient.put(`/assignment/submissions/${submissionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Delete submission
  async deleteSubmission(submissionId: string): Promise<boolean> {
    const response = await axiosClient.delete(`/assignment/submissions/${submissionId}`);
    return response.data.data;
  }

  // Get submission details
  async getSubmission(submissionId: string): Promise<AssignmentSubmissionDto> {
    const response = await axiosClient.get(`/assignment/submissions/${submissionId}`);
    return response.data.data;
  }

  // Submit assignment (change from draft to submitted)
  async submitAssignment(submissionId: string): Promise<AssignmentSubmissionDto> {
    const response = await axiosClient.post(`/assignment/submissions/${submissionId}/submit`);
    return response.data.data;
  }

  // Unsubmit assignment (change from submitted back to draft)
  async unsubmitAssignment(submissionId: string): Promise<AssignmentSubmissionDto> {
    const response = await axiosClient.post(`/assignment/submissions/${submissionId}/unsubmit`);
    return response.data.data;
  }

  // Get my submission for assignment
  async getMySubmission(assignmentId: string): Promise<AssignmentSubmissionDto> {
    const response = await axiosClient.get(`/assignment/${assignmentId}/my-submission`);
    return response.data.data;
  }

  // Get my submission history
  async getMySubmissionHistory(assignmentId: string): Promise<AssignmentSubmissionDto[]> {
    const response = await axiosClient.get(`/assignment/${assignmentId}/my-submission-history`);
    return response.data.data;
  }

  // Grade submission (for lecturers/admin)
  async gradeSubmission(gradeDto: GradeSubmissionDto): Promise<AssignmentSubmissionDto> {
    const response = await axiosClient.post(`/assignment/submissions/${gradeDto.submissionId}/grade`, {
      score: gradeDto.score,
      feedback: gradeDto.feedback,
    });
    return response.data.data;
  }

  // Create comment
  async createComment(createDto: CreateCommentDto): Promise<SubmissionCommentDto> {
    const formData = new FormData();
    formData.append('content', createDto.content);
    formData.append('isPrivate', createDto.isPrivate.toString());
    
    if (createDto.files) {
      createDto.files.forEach(file => {
        formData.append('files', file);
      });
    }

    const response = await axiosClient.post(`/assignment/submissions/${createDto.submissionId}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Update comment
  async updateComment(commentId: string, updateDto: UpdateCommentDto): Promise<SubmissionCommentDto> {
    const formData = new FormData();
    formData.append('content', updateDto.content);
    formData.append('isPrivate', updateDto.isPrivate.toString());

    const response = await axiosClient.put(`/assignment/comments/${commentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Delete comment
  async deleteComment(commentId: string): Promise<boolean> {
    const response = await axiosClient.delete(`/assignment/comments/${commentId}`);
    return response.data.data;
  }

  // Get submission comments
  async getSubmissionComments(submissionId: string): Promise<SubmissionCommentDto[]> {
    const response = await axiosClient.get(`/assignment/submissions/${submissionId}/comments`);
    return response.data.data;
  }

  // Get all submissions for assignment (for lecturers/admin)
  async getAssignmentSubmissions(assignmentId: string): Promise<any[]> {
    const response = await axiosClient.get(`/assignment/${assignmentId}/submissions`);
    return response.data.data;
  }

  // Get specific student's submission (for lecturers/admin)
  async getStudentSubmission(assignmentId: string, studentId: string): Promise<AssignmentSubmissionDto> {
    const response = await axiosClient.get(`/assignment/${assignmentId}/students/${studentId}/submission`);
    return response.data.data;
  }
}

export const assignmentService = new AssignmentService();
export default assignmentService;