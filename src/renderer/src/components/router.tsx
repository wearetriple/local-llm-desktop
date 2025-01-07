import { HashRouter, Routes, Route } from 'react-router-dom';
import { routes } from '@renderer/routes';

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        {routes.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </HashRouter>
  );
}
