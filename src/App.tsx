import { useSessionStatus } from './hooks/useSessionStatus'
import './index.css';
import { Redirect, Route, Switch } from 'wouter'
import HomePage from './pages/HomePage'
import { LoginPage } from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';

export function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
         <Route path="/logout" component={LogoutPage} />
        {/* Default route in a switch */}
        <Route><div>404: No such page!</div></Route>
      </Switch>
    </>
  )
}

export default App
