import instance, { ApiResponse } from './axiosClient';

export type UserListItemDto = {
    id: string,
    fullName: string,
    email: string,
    role: string,
    departmentName: string | null,
    status: "active" | "inactive";
};

export type PagedResultDto<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export type CreateUserDto = {
    email: string;
    fullName: string;
    phone?: string|null;
    dateOfBirth?: string | null;
    roleName:string;
    departmentId?:string | null;
    studentCode?:string | null;
    password?: string | null; 
}
export type UpdateUserDto = {
    userId: string;
    email: string;
    fullName: string;
    phone?: string|null;
    dateOfBirth?: string | null;
    roleName:string;
    departmentId?:string | null;
    studentCode?:string | null;
    isActive: boolean;
}
export type UserDetailDto = {
    id: string;
    email: string;
    fullName: string;
    phone?: string|null;
    dateOfBirth?: string | null;
    avatarUrl?: string|null;
    studentCode?:string | null;
    roleName:string;
    roleId?:string | null;
    departmentId?:string | null;
    dpartmentName?: string | null;
    isActive: boolean;
    isFirstLogin: boolean;
    createdAt: string;
    updatedAt?: string;
}
export type ToggleUserStatusDto = {
    userId: string;
    isActive: boolean;
};

export type ImportUserResultDto = {
    createdCount: number;
    updatedCount: number;
    errors: string[];
};

export type GetUsersParams = {
    page: number;
    pageSize: number;
    search?: string;
    role?: string;
};
export async function getAdminUsers(params:{
    page:number,
    pageSize:number,
    search?:string,
    role?:string
}){
    const response = await instance.get<ApiResponse<PagedResultDto<UserListItemDto>>>('/api/admin/users', { params });
    const data = response.data.data;
    if (!data) return data;
    // normalize department/role fields (backend may return 'department' or 'departmentName')
    data.items = data.items.map((it: any) => ({
        ...it,
        departmentName: it.departmentName ?? it.department ?? null,
        role: it.role ?? it.roleName ?? it.Role ?? null,
        status: it.status ?? it.Status ?? null
    }));

    return data;
}

export async function getUserById(userId:string){
    const response = await instance.get<ApiResponse<UserDetailDto>>(`/api/admin/${userId}`);
    const d = response.data.data as any;
    if (!d) return d;
    // normalize department name property
    d.departmentName = d.departmentName ?? d.department ?? d.DepartmentName ?? null;
    return d;
}

export async function createUser(data:CreateUserDto){
    const response = await instance.post<ApiResponse<UserDetailDto>>('/api/admin', data);
    const d = response.data.data as any;
    if (d) d.departmentName = d.departmentName ?? d.department ?? d.DepartmentName ?? null;
    return d;
}

export async function updateUser(userId:string, data:UpdateUserDto){
    const response = await instance.put<ApiResponse<UserDetailDto>>(`/api/admin/${userId}`, data);
    const d = response.data.data as any;
    if (d) d.departmentName = d.departmentName ?? d.department ?? d.DepartmentName ?? null;
    return d;
}

export async function deleteUser(userId:string){
    const response = await instance.delete<ApiResponse<boolean>>(`/api/admin/${userId}`);
    return response.data.data;
}

export async function toggleUserStatus(userId:string, isActive:boolean){
    const payload: ToggleUserStatusDto = {userId, isActive};
    const response = await instance.patch<ApiResponse<boolean>>(`/api/admin/${userId}/toggle-status`, payload);
    return response.data.data;
}

export async function resetUserPassword(userId:string){
    const response = await instance.post<ApiResponse<string>>(`/api/admin/${userId}/reset-password`);
    return response.data.data;
}

export async function importUsers(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const response = await instance.post<ApiResponse<ImportUserResultDto>>('/api/admin/users/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
}