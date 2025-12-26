import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Group as GroupInterface, GroupDetails, User } from './interfaces';
import AddExpenseModal from './AddExpenseModal';
import MemberDetailsModal from './MemberDetailsModal';


function Group() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [selectedMember, setSelectedMember] = useState<User | null>(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchGroupDetails = async () => {
        try {
            const response = await fetch(`http://localhost:8080/splitwise/group/${groupId}`);
            const data = await response.json();
            
            if (response.ok) {
                setGroup({ 
                    ...data.group, 
                    totalAmount: data.totalAmount 
                });
            } else {
                alert("Group not found");
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error fetching group:", error);
        }
    };

    useEffect(() => {
        if (groupId) fetchGroupDetails();
    }, [groupId, navigate]);

    const handleCreateExpense = async (expenseData: any) => {
        try {
            const payload = {
                ...expenseData,
                group: group?._id, 
                paidBy: group?.members.find(m => (m.userId === expenseData.paidBy || m._id === expenseData.paidBy))?._id
            };

            const response = await fetch('http://localhost:8080/splitwise/addExpense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Expense Added!");
                setIsModalOpen(false);
                fetchGroupDetails(); 
            } else {
                const err = await response.json();
                alert("Error: " + err.message);
            }
        } catch (error) {
            console.error("Expense Error", error);
            alert("Failed to save expense");
        }
    };

    const getUserBalance = (userId: string) => {
        if (!group || !group.balances) return 0;
        const balanceObj = group.balances.find(b => b.user === userId);
        return balanceObj ? balanceObj.amount : 0;
    };

    const getDebtsList = () => {
        if (!group || !group.transactions) return [];

        const debts: string[] = [];
        group.transactions.forEach(node => {
            const lenderId = node.user;
            node.moneyRelation.forEach(relation => {
                if (relation.amount > 0) {
                    const borrowerId = relation.user;
                    const lender = group.members.find(m => m._id === lenderId)?.name || 'Unknown';
                    const borrower = group.members.find(m => m._id === borrowerId)?.name || 'Unknown';
                    debts.push(`${borrower} owes ${lender} ₹${relation.amount.toFixed(2)}`);
                }
            });
        });
        return debts;
    };

    if (!group) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <button onClick={() => navigate('/dashboard')} className="mb-6 text-gray-600 hover:text-black flex items-center gap-2">
                ← Back to Dashboard
            </button>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-4xl mx-auto">
                
                <div className="bg-green-500 p-8 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">{group.name}</h1>
                        <p className="opacity-90 mt-1">{group.members.length} Members</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm opacity-80 uppercase tracking-wider">Total Expenses</p>
                        <p className="text-4xl font-bold">₹{group.totalAmount || 0}</p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex justify-end mb-8">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition flex items-center gap-2"
                        >
                            <span>+</span> Add Expense
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Group Balances</h2>
                            <div className="flex flex-col gap-3">
                                {group.members.map((member) => {
                                    const balance = getUserBalance(member._id);
                                    
                                    return (
                                        <div key={member._id} className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100 gap-3">
                                            
                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={member.profilePicture || member.picture || "https://via.placeholder.com/40"} 
                                                        alt={member.name} 
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-800">{member.name}</p>
                                                        {balance > 0 ? (
                                                            <p className="text-green-600 font-bold text-xs">gets ₹{balance.toFixed(2)}</p>
                                                        ) : balance < 0 ? (
                                                            <p className="text-red-500 font-bold text-xs">owes ₹{Math.abs(balance).toFixed(2)}</p>
                                                        ) : (
                                                            <p className="text-gray-400 font-bold text-xs">settled</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 3. DETAILS BUTTON */}
                                                <button 
                                                    onClick={() => setSelectedMember(member)}
                                                    className="px-3 py-1 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

    
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">All Debts</h2>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[200px]">
                                {getDebtsList().length > 0 ? (
                                    <ul className="space-y-3">
                                        {getDebtsList().map((debt, index) => (
                                            <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                                                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                                {debt}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                                        <p>No debts yet!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <AddExpenseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                groupMembers={group.members}
                currentUserId={currentUser.userId || currentUser._id}
                onSubmit={handleCreateExpense}
            />

            <MemberDetailsModal 
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                member={selectedMember}
                transactions={group.transactions || []}
                allMembers={group.members}
            />
        </div>
    );
}

export default Group;