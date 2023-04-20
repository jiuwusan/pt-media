import './App.css';
import Torrents from './pages/Torrents';
import bg from './bg.jpg';

function App() {
  return <div>
    <img className='app-bg' src={bg} alt='背景图片'/>
      <div className="app">
        <div className='app-content'>
          <Torrents></Torrents>
        </div>
      </div>
  </div>;
}

export default App;
