import instance, { ApiResponse } from '../axiosClient';

export interface AssignmentDetailDto {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  maxScore: number;
  allowLateSubmission: boolean;
  latePenaltyPercent: number;
  maxAttempts: number;
  requireTextSubmission: boolean;
  allowFileSubmission: boolean;
  allowLinkSubmission: boolean;
  allowedFileTypes: string;
  maxFileSize: number;
  attachments: AttachmentDto[];
  createdAt: string;
  mySubmission?: AssignmentSubmissionDto;
  canSubmit: boolean;
  isOverdue: boolean;
  timeRemaining?: string;
}

export interface AssignmentSubmissionDto {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  textContent?: string;
  attachments: AttachmentDto[];
  links: LinkDto[];
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
  comments: SubmissionCommentDto[];
  attemptNumber: number;
}

export interface AttachmentDto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  createdAt: string;
}

export interface LinkDto {
  url: string;
  title?: string;
  description?: string;
}

export interface SubmissionCommentDto {
  id: string;
  submissionId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  attachments: AttachmentDto[];
  isPrivate: boolean;
  createdAt: string;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateSubmissionRequest {
  assignmentId: string;
  textContent?: string;
  files?: File[];
  links?: string[];
  saveAsDraft?: boolean;
}

export interface UpdateSubmissionRequest {
  textContent?: string;
  files?: File[];
  links?: string[];
  removeAttachmentIds?: string[];
  saveAsDraft?: boolean;
}

class AssignmentService {
  private readonly baseUrl = '/api/Assignment';

  async getAssignment(assignmentId: string): Promise<ApiResponse<AssignmentDetailDto>> {
    const response = await instance.get<ApiResponse<AssignmentDetailDto>>(`${this.baseUrl}/${assignmentId}`);
    return response.data;
  }

  async createSubmission(request: CreateSubmissionRequest): Promise<ApiResponse<AssignmentSubmissionDto>> {
    const formData = new FormData();
    formData.append('AssignmentId', request.assignmentId);
    
    if (request.textContent) {
      formData.append('TextContent', request.textContent);
    }
    
    if (request.files) {
      request.files.forEach((file) => {
        formData.append(`Files`, file);
      });
    }
    
    if (request.links) {
      request.links.forEach((link, index) => {
        formData.append(`Links[${index}]`, link);
      });
    }
    
    formData.append('SaveAsDraft', (request.saveAsDraft ?? false).toString());

    const response = await instance.post<ApiResponse<AssignmentSubmissionDto>>(`${this.baseUrl}/submissions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateSubmission(submissionId: string, request: UpdateSubmissionRequest): Promise<ApiResponse<AssignmentSubmissionDto>> {
    const formData = new FormData();
    
    if (request.textContent) {
      formData.append('textContent', request.textContent);
    }
    
    if (request.files) {
      request.files.forEach((file) => {
        formData.append(`files`, file);
      });
    }
    
    if (request.links) {
      request.links.forEach((link) => {
        formData.append(`links`, link);
      });
    }
    
    if (request.removeAttachmentIds) {
      request.removeAttachmentIds.forEach((id) => {
        formData.append(`removeAttachmentIds`, id);
      });
    }
    
    formData.append('saveAsDraft', (request.saveAsDraft ?? true).toString());

    const response = await instance.put<ApiResponse<AssignmentSubmissionDto>>(`${this.baseUrl}/submissions/${submissionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async submitAssignment(submissionId: string): Promise<ApiResponse<AssignmentSubmissionDto>> {
    const response = await instance.post<ApiResponse<AssignmentSubmissionDto>>(`${this.baseUrl}/submissions/${submissionId}/submit`);
    return response.data;
  }

  async getMySubmission(assignmentId: string): Promise<ApiResponse<AssignmentSubmissionDto>> {
    const response = await instance.get<ApiResponse<AssignmentSubmissionDto>>(`${this.baseUrl}/${assignmentId}/my-submission`);
    return response.data;
  }

  async getMySubmissionHistory(assignmentId: string): Promise<ApiResponse<AssignmentSubmissionDto[]>> {
    const response = await instance.get<ApiResponse<AssignmentSubmissionDto[]>>(`${this.baseUrl}/${assignmentId}/my-submission-history`);
    return response.data;
  }

  async unsubmitAssignment(submissionId: string): Promise<ApiResponse<AssignmentSubmissionDto>> {
    const response = await instance.post<ApiResponse<AssignmentSubmissionDto>>(`${this.baseUrl}/submissions/${submissionId}/unsubmit`);
    return response.data;
  }

  async deleteSubmission(submissionId: string): Promise<ApiResponse<boolean>> {
    const response = await instance.delete<ApiResponse<boolean>>(`${this.baseUrl}/submissions/${submissionId}`);
    return response.data;
  }
}

export const assignmentService = new AssignmentService();
export default assignmentService;