import { Routes, Route } from 'react-router-dom'
import { ReactFlowProvider } from 'reactflow'
import * as Tooltip from '@radix-ui/react-tooltip'
import 'reactflow/dist/style.css'
import Layout from './components/Layout/Layout'
import SchemaViewer from './pages/SchemaViewer'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Tooltip.Provider>
        <ReactFlowProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<SchemaViewer />} />
            </Route>
          </Routes>
        </ReactFlowProvider>
      </Tooltip.Provider>
    </ErrorBoundary>
  )
}

export default App