import Login from './Login'
import { useState } from 'react';

function App() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  return (
    <div>
      <Login 
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
    </div>
  );
}

export default App;
