import instance from './axiosClient';

export type UserListItemDto = {
    id: string,
    fullName: string,
    email: string,
    isActive: boolean,
    roles: string,
    department: string,
    status: "active" | "inactive";
};

export type PagedResultDto<T> = {
    items: T[];
    totalCount: number;
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
    const {data} = await instance.get<PagedResultDto<UserListItemDto>>('/api/admin/users', {params});
    return data;
}