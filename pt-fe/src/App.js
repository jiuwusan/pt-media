import './App.css';
import Torrents from './pages/Torrents';
import bg from './bg.jpg';

function App() {
  return (
    <>
      <img className='app-bg' src={bg} />
      <div className="app">
        <div className='app-content'>
          <Torrents></Torrents>
        </div>
      </div>
    </>
  );
}

export default App;
