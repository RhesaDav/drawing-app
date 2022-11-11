import { useLayoutEffect, useState } from "react";
import "./App.css";
import rough from "roughjs/bundled/rough.esm";

const generator = rough.generator();

const createElement = (id, x1, y1, x2, y2, type) => {
  const roughElement = type === "line" ? generator.line(x1, y1, x2, y2) : generator.rectangle(x1, y1, x2 - x1, y2 - y1)
  return { id, x1, y1, x2, y2, roughElement };
};

const isWithinElement = (x,y,element) => {
  const {type,x1,x2,y1,y2} = element
  if (type === 'rectangle') {
    const minX = Math.min(x1,x2)
    const maxX = Math.min(x1,x2)
    const minY = Math.min(y1,y2)
    const maxY = Math.min(y1,y2)
    return x >= minX && x <= maxX && y>=minY && y <= maxY
  } else {
    const a = {x:x1, y:y1}
    const b = {x:x2, y:y2}
    const c = {x,y}
    const offset = distance(a,b) - (distance(a,c) + distance(b,c));
    return Math.abs(offset) <1
  }
}

const distance = (a,b) => Math.sqrt(Math.pow(a.x -b.x, 2) + Math.pow(a.y+b.y,2))

const getElementAtPosition = (x,y,elements) => {
  return elements.find(element => isWithinElement(x,y,element))
}

function App() {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState('none');
  const [tool, setTool] = useState("line");
  const [selectedElement, setSelectedElement] = useState(null)

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas-id");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
  }, [elements]);

  const updateElement = (id,x1,x2,y1,y2,type) => {
    const updatedElement = createElement(id,x1,x2,y1,y2,type);
    
    const elementCopy = [...elements];
    elementCopy[id] = updatedElement;
    setElements(elementCopy);
  }

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    if (tool==="selection") {
      const element = getElementAtPosition(clientX,clientY,elements)
      if (element) {
        setSelectedElement(element)
        setAction('moving')
      }
    } else {
      const id  =elements.length
      const element = createElement(id, clientX, clientY, clientX, clientY, tool);
      setElements((prevState) => [...prevState, element]);
      setAction('drawing');
    }
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === 'moving') {
      const {id, x1,x2,y1,y2, type} = selectedElement
      const width =x2-x1
      const height = y2-y1
      updateElement(id, clientX, clientY, clientX+width, clientY+height, type)
    }
  };

  const handleMouseUp = () => {
    setAction('none');
    setSelectedElement('null')
  };

  return (
    <div className="App">
      <div style={{ position: "fixed", top: "10px", left: "10px" }}>
        <input
          type="radio"
          id="line"
          checked={tool === "line"}
          onChange={() => setTool("line")}
        />
        <label>Line</label>
        <input
          type="radio"
          id="rectangle"
          checked={tool === "rectangle"}
          onChange={() => setTool("rectangle")}
        />
        <label>Rectangle</label>
        <input
          type="radio"
          id="selection"
          checked={tool === "selection"}
          onChange={() => setTool("selection")}
        />
        <label>Selection</label>
      </div>
      <canvas
        id="canvas-id"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        canvas
      </canvas>
    </div>
  );
}

export default App;
