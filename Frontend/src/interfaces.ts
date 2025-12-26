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
export interface MoneyRelation {
    user: string;
    amount: number;
}

export interface TransactionNode {
    user: string;
    moneyRelation: MoneyRelation[];
}

export interface GroupDetails extends Group {
    totalAmount?: number;
    balances: { user: string; amount: number }[];
    transactions: TransactionNode[];
}
