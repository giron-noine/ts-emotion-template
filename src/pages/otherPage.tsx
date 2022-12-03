import { Link } from "react-router-dom";

const OtherPage: React.FunctionComponent = () => {
  return (
    <div className="App">
      <p>This is abc Page</p>
      <Link to="/">
        <p>To Top Page</p>
      </Link>
    </div>
  );
};

export default OtherPage;
