import './App.css';
import '@campus/styles/globals.css';
import { useUsers } from '@/features/user/hooks/user.hooks';
import { useSession } from './features/auth/hooks';
import { useGetClubs } from './features/club/hooks/club.hooks';
import { Button } from '@campus/styles/components/ui/button';

function App() {
  // const { getToken } = useAuth()
  const { data } = useGetClubs()
  const { data: sessionData } = useSession()

  // console.log(data)
  // console.log(getToken())

  return (
     <div>
      <pre>{JSON.stringify(sessionData, null, 2)}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button variant='destructive'>Click me</Button>
    </div>
  )
}

export default App
