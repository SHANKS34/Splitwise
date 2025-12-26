import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Group as GroupInterface } from './interfaces'; // Reuse your interface
import AddExpenseModal from './AddExpenseModal';
// Extend interface locally if needed for extra props like totalAmount
interface GroupDetails extends GroupInterface {
    totalAmount?: number;
}

function Group() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [loading, setLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8080/splitwise/group/${groupId}`);
                const data = await response.json();
                
                if (response.ok) {
                    // Combine the group data with the calculated amount from backend
                    setGroup({ ...data.group, totalAmount: data.totalAmount });
                } else {
                    alert("Group not found");
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error("Error fetching group:", error);
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            fetchGroupDetails();
        }
    }, [groupId, navigate]);

    const handleCreateExpense = async (expenseData: any) => {
        try {
            // We need to map the 'paidBy' UUID back to a MongoDB ID for the backend
            // Or ensure the backend handles UUID lookups for 'paidBy'
            // For now, let's assume we send the data as prepared by the modal.
            
            const payload = {
                ...expenseData,
                group: group?._id, // Add Group ID
                // Map the paidBy UUID to the actual Mongo object (found in group members)
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
                // Reload page or re-fetch group details
                window.location.reload(); 
            } else {
                const err = await response.json();
                alert("Error: " + err.message);
            }

        } catch (error) {
            console.error("Expense Error", error);
            alert("Failed to save expense");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!group) return null;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Header / Back Button */}
            <button 
                onClick={() => navigate('/dashboard')} 
                className="mb-6 text-gray-600 hover:text-black flex items-center gap-2"
            >
                ← Back to Dashboard
            </button>

            {/* Main Group Card */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-4xl mx-auto">
                
                {/* Banner / Header */}
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

                {/* Content Area */}
                <div className="p-8">
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end mb-8">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2"
                        >
                            <span>+</span> Add Expense
                        </button>
                    </div>

                    {/* Members List */}
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Group Members</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.members.map((member) => (
                            <div key={member._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <img 
                                    src={member.profilePicture || member.picture || "https://via.placeholder.com/40"} 
                                    alt={member.name} 
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                />
                                <div>
                                    <p className="font-bold text-gray-800">{member.name}</p>
                                    <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                            </div>
                        ))}
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
        </div>
    );
}

export default Group;