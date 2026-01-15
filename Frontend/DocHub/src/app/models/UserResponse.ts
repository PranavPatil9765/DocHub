export interface UserResponse {
  success: boolean;
  message: string;
  data: UserRes;
}
// Per file-type breakdown
export interface UserRes {
    email:string,
    user_name:string
}
