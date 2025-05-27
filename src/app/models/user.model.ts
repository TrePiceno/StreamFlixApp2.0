export interface User {
    userId: number;
    username: string;
}

export interface LoginSuccessResponse {
    message: string;
    userId: number;
    username: string;
}