import './App.css'
import { useOutletContext } from "react-router-dom";
import type { MainLayoutContext } from './layouts/main-layout';

function App() {
  const {user, setUser} = useOutletContext<MainLayoutContext>();

  const updateName = () => {
    setUser({ ...user, name: "Sam" });
  };

  return (
     <div>
      <h2>User Profile</h2>
      <p>Current Name: {user.name}</p>
      <button onClick={updateName}>Change Name to Sam</button>
    </div>
  )
}

export default App
