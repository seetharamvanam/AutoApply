import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import JobEntry from './pages/JobEntry';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<JobEntry />} />
          {/* <Route path="jobs" element={<MyJobs />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
