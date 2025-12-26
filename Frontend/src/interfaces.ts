export interface UserData {
  name: string;
  email: string;
  picture: string;
  userId: string;
}
export interface User {
    _id: string; 
    userId?: string; 
    name: string;
    email: string;
    picture: string;
    profilePicture?: string; 
}

export interface Group {
    _id: string;
    name: string;
    members: User[];
}