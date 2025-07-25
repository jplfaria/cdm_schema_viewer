import { Routes, Route } from 'react-router-dom'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import Layout from './components/Layout/Layout'
import SchemaViewer from './pages/SchemaViewer'

function App() {
  return (
    <ReactFlowProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SchemaViewer />} />
        </Route>
      </Routes>
    </ReactFlowProvider>
  )
}

export default App