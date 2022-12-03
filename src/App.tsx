import { useState } from "react";
import reactLogo from "./assets/react.svg";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";

const WrapDiv = styled("div")`
  color: red;
`;

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <WrapDiv>
          <p>this is emotion css</p>
        </WrapDiv>
      </div>
      <Link to="other">
        <p>To Other page</p>
      </Link>
    </div>
  );
}

export default App;
