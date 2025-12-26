import React, { useEffect, useState } from 'react'
import type { User, Group } from './interfaces' 
import { useNavigate } from 'react-router-dom';
function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  
  const [myGroups, setMyGroups] = useState<Group[]>([]);

  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<User[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem('user');
    if (storedData) {
        const parsedUser = JSON.parse(storedData);
        setUser(parsedUser);

        if (parsedUser.userId) {
            fetchMyGroups(parsedUser.userId);
        }
    }
  }, []);

  const fetchMyGroups = async (userId: string) => {
      try {
          const response = await fetch(`http://localhost:8080/splitwise/groups/${userId}`);
          const data = await response.json();
          if (response.ok) {
              setMyGroups(data.groups);
          }
      } catch (error) {
          console.error("Failed to fetch groups", error);
      }
  }

  const handleSearchUser = async () => {
    if (!searchEmail) return;
    setLoading(true);
    setSearchResult(null);

    try {
        const response = await fetch('http://localhost:8080/splitwise/findUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailId: searchEmail })
        });
        const data = await response.json();
        if (response.ok) {
            setSearchResult(data.user);
        } else {
            alert(data.message || "User not found");
        }
    } catch (error) {
        console.error(error);
        alert("Connection failed");
    } finally {
        setLoading(false);
    }
  };

  const addUserToGroupList = () => {
      if (searchResult) {
          if (groupMembers.some(m => m.email === searchResult.email)) {
              alert("User already added!");
              return;
          }
          if (user && searchResult.email === user.email) {
              alert("You are automatically added to the group.");
              return;
          }
          
          setGroupMembers([...groupMembers, searchResult]);
          setSearchResult(null);
          setSearchEmail("");
      }
  }

  const handleCreateGroup = async () => {
    if (!groupName || !user?.userId) {
        alert("Please enter a group name");
        return;
    }

    try {
        const payload = JSON.stringify({
            name: groupName,
            userId: user.userId, 
            members: groupMembers.map(m => m.userId) 
        });

        const response = await fetch('http://localhost:8080/splitwise/createGroup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Group "${data.group.name}" Created!`);
            setGroupName("");
            setGroupMembers([]);
            
            fetchMyGroups(user.userId);
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Failed to create group");
    }
  }

  return (
    <div className='relative min-h-screen bg-gray-100 p-8'>
      
      <div className='flex flex-col md:flex-row gap-8 items-start justify-center max-w-6xl mx-auto'>

        <div className='bg-white p-6 rounded-xl shadow-md w-full md:w-1/3'>
            <h2 className='text-2xl font-bold mb-4 text-gray-800'>Create a Group</h2>
            
            <input 
                type="text" 
                placeholder="Group Name (e.g. Goa Trip)" 
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
            />

            <div className='flex gap-2 mb-4'>
                <input 
                    type="email" 
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Find friend by email..." 
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button 
                    onClick={handleSearchUser}
                    disabled={loading}
                    className='bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300'
                >
                    {loading ? "..." : "Find"}
                </button>
            </div>

            {searchResult && (
                <div className='flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100'>
                    <div className='flex items-center gap-2'>
                        <img src={searchResult.profilePicture || searchResult.picture} className='w-8 h-8 rounded-full' alt="Result"/>
                        <span className='font-semibold text-sm'>{searchResult.name}</span>
                    </div>
                    <button 
                        onClick={addUserToGroupList}
                        className='text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600'
                    >
                        Add
                    </button>
                </div>
            )}

            {groupMembers.length > 0 && (
                <div className='mb-4'>
                    <h3 className='text-xs font-semibold text-gray-500 mb-2'>Members to add:</h3>
                    <div className='flex flex-wrap gap-2'>
                        {groupMembers.map((member, idx) => (
                            <span key={idx} className='bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs flex items-center gap-2'>
                                {member.name}
                                <button onClick={() => setGroupMembers(groupMembers.filter((_, i) => i !== idx))} className='text-red-500 hover:text-red-700 font-bold'>&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <button 
                onClick={handleCreateGroup}
                className='w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition'
            >
                Create Group
            </button>
        </div>

        <div className='w-full md:w-2/3'>
            <h2 className='text-2xl font-bold mb-6 text-gray-800'>My Groups</h2>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {myGroups.length === 0 ? (
                    <div className='col-span-2 text-center p-10 bg-white rounded-xl shadow-sm border border-dashed border-gray-300'>
                        <p className='text-gray-500'>You are not part of any groups yet.</p>
                        <p className='text-sm text-gray-400'>Create one to get started!</p>
                    </div>
                ) : (
                    myGroups.map((group) => (
                        <div key={group._id}
                         className='bg-white p-5 rounded-xl shadow-sm 
                         border border-gray-200 hover:shadow-md transition
                          cursor-pointer'
                          onClick={() => navigate(`/group/${group._id}`)}
                          >
                            <div className='flex justify-between items-start mb-4'>
                                <h3 className='text-lg font-bold text-gray-800 truncate'>{group.name}</h3>
                                <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap'>
                                    {group.members.length} Members
                                </span>
                            </div>
                            
                            {/* Member Avatars Preview */}
                            <div className='flex -space-x-2 overflow-hidden py-1'>
                                {group.members.slice(0, 5).map((m, idx) => (
                                    <img 
                                        key={idx}
                                        src={m.profilePicture || m.picture || "https://via.placeholder.com/40"} 
                                        alt={m.name}
                                        title={m.name}
                                        className='inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-gray-200'
                                    />
                                ))}
                                {group.members.length > 5 && (
                                    <div className='h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-xs text-gray-500 font-bold'>
                                        +{group.members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>

      {user && (
          <div className='fixed bottom-5 right-5 flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg border border-gray-200 z-50'>
            <img 
                src={user.picture} 
                alt="Profile" 
                className='w-12 h-12 rounded-full border-2 border-green-100 object-cover'
            />
            <div className='flex flex-col items-start mr-2'>
                <span className='font-bold text-gray-800 text-sm'>{user.name}</span>
                <span className='text-xs text-gray-500'>{user.email}</span>
            </div>
          </div>
      )}

    </div>
  )
}

export default Dashboard