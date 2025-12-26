import React from 'react'
import { jwtDecode } from "jwt-decode"; 
import type { UserData } from './interfaces';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const handleLogin = () => {
     window.location.href = "http://localhost:8080/auth/google"; 
}

function Login() {
    const [user, setUser] = useState<UserData | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get('token');

        if (token) {
          localStorage.setItem('token', token);
          
          const decoded: UserData = jwtDecode(token);
          
          setUser(decoded);

          localStorage.setItem('user', JSON.stringify(decoded));
          
          console.log("User Data Saved:", decoded);
        }
    }, []);
    
    useEffect(() => {
        if(user) {
             navigate('/dashboard');
        }
    }, [user]);

    return (
        <div className='flex flex-col h-screen bg-green-400 items-center justify-center'>
            <button className='bg-white text-black px-5 py-2 rounded' onClick={handleLogin}>
              Login with Google
            </button>
        </div>
    )
}

export default Login