import instance from './axiosClient';

export interface AcademicYearConfig {
  currentAcademicYear: string;
  currentSemester: string;
}

export interface FileUploadConfig {
  maxFileSizeMB: number;
  allowedFileTypes: string[];
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  emailSender: string;
  smtpPassword: string;
  enableSsl: boolean;
}

export interface BackupConfig {
  autoBackupEnabled: boolean;
  backupTime: string;
}

export interface SystemConfigResponse {
  academicYear: AcademicYearConfig;
  fileUpload: FileUploadConfig;
  email: EmailConfig;
  backup: BackupConfig;
}

export interface SystemConfigUpdateRequest {
  academicYear?: AcademicYearConfig;
  fileUpload?: FileUploadConfig;
  email?: EmailConfig;
  backup?: BackupConfig;
}

export interface SystemConfigDto {
  id: string;
  configKey: string;
  configValue: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AcademicYearDto {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface SemesterDto {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}


export async function getSystemConfigs(): Promise<SystemConfigResponse> {
  const response = await instance.get<ApiResponse<SystemConfigResponse>>('/api/admin/system-config');
  return response.data.data;
}

export async function getConfigByKey(key: string): Promise<SystemConfigDto> {
  const response = await instance.get<ApiResponse<SystemConfigDto>>(`/api/admin/system-config/${key}`);
  return response.data.data;
}

export async function updateSystemConfigs(request: SystemConfigUpdateRequest): Promise<boolean> {
  const response = await instance.put<ApiResponse<boolean>>('/api/admin/system-config', request);
  return response.data.data;
}


export async function getAcademicYears(): Promise<AcademicYearDto[]> {
  const response = await instance.get<ApiResponse<AcademicYearDto[]>>('/api/admin/system-config/academic-years');
  return response.data.data;
}


export async function getSemesters(): Promise<SemesterDto[]> {
  const response = await instance.get<ApiResponse<SemesterDto[]>>('/api/admin/system-config/semesters');
  return response.data.data;
}


export async function backupNow(): Promise<string> {
  const response = await instance.post<ApiResponse<string>>('/api/admin/system-config/backup');
  return response.data.data;
}


export async function testEmailConfig(): Promise<boolean> {
  const response = await instance.post<ApiResponse<boolean>>('/api/admin/system-config/test-email');
  return response.data.data;
}