import instance from './axiosClient';

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

export async function getAdminUsers(params:{
    page:number,
    pageSize:number,
    search?:string,
    role?:string
}){
    const response = await instance.get<PagedResultDto<UserListItemDto>>('/api/admin/users', {params});
    return response.data;
}