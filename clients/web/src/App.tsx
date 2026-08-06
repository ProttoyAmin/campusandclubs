
import { useUsers } from '@/features/user/hooks/user.hooks';
import { useSession } from './features/auth/hooks';
import { Link } from 'react-router-dom';
import { paths } from './settings/routes';
import { Button } from 'design/components/ui/button';
import { ModeToggle } from './shared/components/mode-toggle';

function App() {
  const { data: users } = useUsers()
  const { data: sessionData } = useSession()

  return (
     <div>
      <pre>{JSON.stringify(sessionData, null, 2)}</pre>
      <pre>{JSON.stringify(users?.data, null, 2)}</pre>
      {users?.data.map((user) => (
        <Link key={user?.id} to={paths.private.user.profile(user.username)}>{user.username}</Link>
      ))}
      <Button>Click me</Button>
    </div>
  )
}

export default App
