import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from '@renderer/routes/home/home';
import { Main } from './layouts/main';
import Chat from '@renderer/routes/chat/chat';
import { Start } from './layouts/start';
import { OllamaInstall } from '@renderer/routes/ollama-install/ollama-install';
import { Configure } from '@renderer/routes/configure/configure';
import { Download } from '@renderer/routes/download/download';

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Start />}>
          <Route key="home" index path="/" element={<Home />} />
          <Route key="ollama-install" index path="/ollama/install" element={<OllamaInstall />} />
          <Route key="configure" index path="/configure" element={<Configure />} />
          <Route key="download" index path="/download" element={<Download />} />
        </Route>
        <Route element={<Main />}>
          <Route key="home" path="/chat" element={<Chat />} />
        </Route>
        <Route key="not-found" path="*" element={<div>{window.location.hash} Not Found</div>} />
      </Routes>
    </HashRouter>
  );
}
