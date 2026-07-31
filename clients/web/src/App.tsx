import './App.css'
import { useUsers } from '@/features/user/hooks/user.hooks';
import { useSession } from './features/auth/hooks';
import { useGetClubs } from './features/club/hooks/club.hooks';
import { Link } from 'react-router-dom';
import { paths } from './settings/routes';



function App() {
  // const { getToken } = useAuth()
  const { data: users } = useUsers()
  const { data: sessionData } = useSession()

  // console.log(data)
  // console.log(getToken())

  return (
     <div>
      <pre>{JSON.stringify(sessionData, null, 2)}</pre>
      <pre>{JSON.stringify(users?.data, null, 2)}</pre>
      {users?.data.map((user) => (
        <Link key={user?.id} to={paths.private.user.profile(user.username)}>{user.username}</Link>
      ))}
    </div>
  )
}

export default App
