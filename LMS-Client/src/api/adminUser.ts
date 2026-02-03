import instance, { ApiResponse } from './axiosClient';

export type UserListItemDto = {
    id: string,
    fullName: string,
    email: string,
    role: string,
    department: string | null,
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
    const response = await instance.get<PagedResultDto<UserListItemDto>>('/api/admin/users', {params});
    return response.data;
}

export async function getUserById(userId:string){
    const response = await instance.get<ApiResponse<UserDetailDto>>(`/api/admin/users/${userId}`);
    return response.data.data;
}

export async function createUser(data:CreateUserDto){
    const response = await instance.post<ApiResponse<UserDetailDto>>('/api/admin/users', data);
    return response.data.data;
}

export async function updateUser(userId:string, data:UpdateUserDto){
    const response = await instance.put<ApiResponse<UserDetailDto>>(`/api/admin/users/${userId}`, data);
    return response.data.data;
}

export async function deleteUser(userId:string){
    const response = await instance.delete<ApiResponse<boolean>>(`/api/admin/users/${userId}`);
    return response.data.data;
}

export async function toggleUserStatus(userId:string, isActive:boolean){
    const payload: ToggleUserStatusDto = {userId, isActive};
    const response = await instance.patch<ApiResponse<boolean>>(`/api/admin/users/${userId}/toggle-status`, payload);
    return response.data.data;
}

export async function resetUserPassword(userId:string){
    const response = await instance.post<ApiResponse<string>>(`/api/admin/users/${userId}/reset-password`);
    return response.data.data;
}