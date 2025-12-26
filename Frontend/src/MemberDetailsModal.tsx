import React from 'react';
import type { User } from './interfaces';

interface TransactionNode {
    user: string;
    moneyRelation: { user: string; amount: number }[];
}

interface MemberDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: User | null;
    transactions: TransactionNode[];
    allMembers: User[];
}

const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({ isOpen, onClose, member, transactions, allMembers }) => {
    if (!isOpen || !member) return null;

    const memberNode = transactions.find(t => t.user === member._id);

    const toPay: { name: string; amount: number }[] = [];
    const toCollect: { name: string; amount: number }[] = [];

    if (memberNode) {
        memberNode.moneyRelation.forEach(rel => {
            const otherMemberName = allMembers.find(m => m._id === rel.user)?.name || 'Unknown';
            
            if (rel.amount < 0) {
                toPay.push({ name: otherMemberName, amount: Math.abs(rel.amount) });
            } else if (rel.amount > 0) {
                toCollect.push({ name: otherMemberName, amount: rel.amount });
            }
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                
                <div className="bg-gray-800 p-6 text-white flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                        <img 
                            src={member.profilePicture || member.picture || "https://via.placeholder.com/50"} 
                            className="w-16 h-16 rounded-full border-2 border-white"
                            alt={member.name}
                        />
                        <div>
                            <h2 className="text-xl font-bold">{member.name}</h2>
                            <p className="text-sm opacity-75">{member.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="p-6">
                    {toPay.length === 0 && toCollect.length === 0 && (
                        <p className="text-center text-gray-400 italic py-4">No active debts.</p>
                    )}

                    {toPay.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-red-500 font-bold uppercase text-xs tracking-wider mb-2 border-b border-red-100 pb-1">
                                Needs to Pay
                            </h3>
                            <ul className="space-y-2">
                                {toPay.map((item, idx) => (
                                    <li key={idx} className="flex justify-between items-center text-gray-700 bg-red-50 p-2 rounded">
                                        <span>To <b>{item.name}</b></span>
                                        <span className="font-bold text-red-600">- ₹{item.amount.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {toCollect.length > 0 && (
                        <div>
                            <h3 className="text-green-600 font-bold uppercase text-xs tracking-wider mb-2 border-b border-green-100 pb-1">
                                Owed by Others
                            </h3>
                            <ul className="space-y-2">
                                {toCollect.map((item, idx) => (
                                    <li key={idx} className="flex justify-between items-center text-gray-700 bg-green-50 p-2 rounded">
                                        <span>From <b>{item.name}</b></span>
                                        <span className="font-bold text-green-600">+ ₹{item.amount.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-white border rounded hover:bg-gray-100">Close</button>
                </div>
            </div>
        </div>
    );
};

export default MemberDetailsModal;