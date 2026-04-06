import './styles/design-system.css'
import { Dashboard } from './components/Dashboard'
import { CurrencyProvider } from './hooks/useCurrency'

function App() {
  return (
    <CurrencyProvider>
      <div className="App">
        <Dashboard />
      </div>
    </CurrencyProvider>
  )
}

export default App
