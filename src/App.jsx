import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import chuwikiLogo from './img/chuwiki.png';
import KakaoLogin from './component/KakaoLogin';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <img src={chuwikiLogo} className="logo" alt="Chuwiki logo"  style={{ width: "500px", height: "auto" }}  />
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <KakaoLogin/>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Chuwiki project started in 2025. Co-developed by Seungjae Kim and Cheolseung Woo.
      </p>
    </>
  )
}

export default App
