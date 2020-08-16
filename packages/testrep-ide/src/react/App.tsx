import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';

import { channels } from '../shared/constants';
const { ipcRenderer  } = window as any;


const App: React.FC = () => {

  const [appInfo, setAppInfo] = useState({name: '', version: ''})

  useEffect(() => {
    ipcRenderer.on(channels.APP_INFO, (event: any, arg: any) => {
      ipcRenderer.removeAllListeners(channels.APP_INFO);
      const { appName, appVersion } = arg;
      console.log({ appName, appVersion });
      setAppInfo({name: appName, version: appVersion})
  
    });
    ipcRenderer.send(channels.APP_INFO);
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>
          App Name: {appInfo.name}, Version: {appInfo.version}
        </p>
      </header>
      <webview id="aut" style={{height: 500, width: '100%'}}></webview>
    </div>
  );
}

export default App;
