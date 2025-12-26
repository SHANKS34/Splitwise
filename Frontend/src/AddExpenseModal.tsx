import React, { useState, useEffect } from 'react';
import type { User } from './interfaces';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupMembers: User[];
    onSubmit: (expenseData: any) => void;
    currentUserId: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, groupMembers, onSubmit, currentUserId }) => {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState<number | ''>('');
    const [paidBy, setPaidBy] = useState(currentUserId);
    const [splitType, setSplitType] = useState<'EQUAL' | 'EXACT' | 'PERCENTAGE'>('EQUAL');

    const [splits, setSplits] = useState<Record<string, number>>({});

    useEffect(() => {
        if (isOpen) {
            const initialSplits: Record<string, number> = {};
            groupMembers.forEach(m => initialSplits[m.userId || m._id] = 1); // 1 = Checked/True
            setSplits(initialSplits);
        }
    }, [isOpen, groupMembers]);

    const validateSplit = () => {
        const total = Number(amount) || 0;
        const currentSum = Object.values(splits).reduce((a, b) => a + b, 0);

        if (total <= 0) return "Enter a valid amount";
        if (!description) return "Enter a description";

        if (splitType === 'EXACT') {
            if (Math.abs(currentSum - total) > 0.01) return `Total mismatch: ₹${currentSum} / ₹${total}`;
        }
        if (splitType === 'PERCENTAGE') {
            if (Math.abs(currentSum - 100) > 0.01) return `Total percentage: ${currentSum}% (must be 100%)`;
        }
        return null; 
    };

    const handleSave = () => {
        const error = validateSplit();
        if (error) {
            alert(error);
            return;
        }

        const finalSplits = groupMembers.map(member => {
            const id = member.userId || member._id;
            let memberAmount = 0;
            let memberPercentage = 0;
            const value = splits[id] || 0;

            if (splitType === 'EQUAL') {
                const selectedCount = Object.values(splits).filter(v => v === 1).length;
                if (value === 1) memberAmount = Number(amount) / selectedCount;
            } else if (splitType === 'EXACT') {
                memberAmount = value;
            } else if (splitType === 'PERCENTAGE') {
                memberPercentage = value;
                memberAmount = (Number(amount) * value) / 100;
            }

            return {
                user: member._id, 
                amount: Number(memberAmount.toFixed(2)),
                percentage: memberPercentage
            };
        }).filter(s => s.amount > 0);

        onSubmit({
            description,
            amount: Number(amount),
            paidBy,
            splitType,
            splits: finalSplits
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                
                <div className="bg-green-500 p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold" 
                    onClick={()=>{

                    }}
                    >Add Expense</h2>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded" 
                            placeholder="e.g. Dinner at Taj"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
                            <input 
                                type="number" 
                                className="w-full border p-2 rounded" 
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Paid By</label>
                            <select 
                                className="w-full border p-2 rounded"
                                value={paidBy}
                                onChange={e => setPaidBy(e.target.value)}
                            >
                                {groupMembers.map(m => (
                                    <option key={m.userId || m._id} value={m.userId || m._id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                        {['EQUAL', 'EXACT', 'PERCENTAGE'].map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    setSplitType(type as any);
                                 
                                    const reset: any = {};
                                    groupMembers.forEach(m => reset[m.userId || m._id] = type === 'EQUAL' ? 1 : 0);
                                    setSplits(reset);
                                }}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${
                                    splitType === type ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {type.charAt(0) + type.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                
                    <div className="space-y-3">
                        {groupMembers.map(member => {
                            const id = member.userId || member._id;
                            const isIncluded = splits[id] === 1; 
                            const val = splits[id] || 0; 

                            return (
                                <div key={id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                    <div className="flex items-center gap-3">
                                        <img src={member.profilePicture || member.picture} className="w-8 h-8 rounded-full" />
                                        <span className="text-sm font-medium">{member.name}</span>
                                    </div>

                                    {splitType === 'EQUAL' && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">
                                                {isIncluded && amount ? `₹${(Number(amount) / Object.values(splits).filter(v=>v===1).length).toFixed(2)}` : '-'}
                                            </span>
                                            <input 
                                                type="checkbox" 
                                                checked={isIncluded}
                                                onChange={(e) => setSplits({...splits, [id]: e.target.checked ? 1 : 0})}
                                                className="w-5 h-5 accent-green-500"
                                            />
                                        </div>
                                    )}

                                    {splitType === 'EXACT' && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-400">₹</span>
                                            <input 
                                                type="number"
                                                className="w-20 border rounded p-1 text-right"
                                                value={val === 0 ? '' : val}
                                                onChange={(e) => setSplits({...splits, [id]: parseFloat(e.target.value) || 0})}
                                            />
                                        </div>
                                    )}

                                    {splitType === 'PERCENTAGE' && (
                                        <div className="flex items-center gap-1">
                                            <input 
                                                type="number"
                                                className="w-16 border rounded p-1 text-right"
                                                value={val === 0 ? '' : val}
                                                onChange={(e) => setSplits({...splits, [id]: parseFloat(e.target.value) || 0})}
                                            />
                                            <span className="text-gray-400">%</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

        
                <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 shadow-lg"
                    >
                        Save Expense
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;