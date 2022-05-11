import './App.css';
import React from "react";
import VirtualizedGrid from './VirtualizedGrid';
import mockData from './MOCK_DATA.json'

const App = () => {

  return (
    <div className="App">
      <VirtualizedGrid
        numItems={mockData.length}
        itemHeight={40}
        windowHeight={400}
        data={mockData}
      />
    </div>
  );
}

export default App;