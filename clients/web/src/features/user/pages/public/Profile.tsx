import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import type { UserProfile } from '@campus/api'


const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/accounts/auth/users/user/${username}/`)
      const data = await response.json()
      console.log(data)
      setUser(data);
    }
    
    fetchUser();
  }, [username]);

  console.log("user: ", user)


  return (
    <div>
      <div>{user?.username}</div>
      <div>{user?.email}</div>
      <div>{user?.avatar}</div>
    </div>
  )
}

export default Profile