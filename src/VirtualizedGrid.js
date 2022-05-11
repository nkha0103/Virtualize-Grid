import './App.css';
import React, { useRef, useState, useReducer } from "react";
import DragSelect from 'dragselect';

const VirtualizedGrid = props => {

  const { numItems, itemHeight, windowHeight, data } = props;
  const [scrollTop, setScrollTop] = useState(0);
  const selectionBoxRef = useRef()
  const containerElementsRef = useRef()
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      mouseDown: false,
      startPoint: null,
      endPoint: null,
      selectionBox: null,
      selectedItems: {}
    }
  )
  const innerHeight = numItems * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    numItems - 1,
    Math.floor((scrollTop + windowHeight) / itemHeight)
  );

  const items = [];
  for (let i = startIndex; i <= endIndex; i++) {
    items.push({
      ...data[i],
      style: {
        position: "absolute",
        top: `${i * itemHeight}px`,
        width: "100%",
        height: itemHeight
      },
    })
  }

  const onScroll = e => setScrollTop(e.currentTarget.scrollTop);

  let dragSelect = null

  const handleMouseEnter = (e) => {
    e.preventDefault()
    dragSelect = new DragSelect({
      selectables: document.querySelectorAll('.item_data'),
      draggability: false
    })

    dragSelect.subscribe('elementselect', handleDrag)
  }

  const handleMouseLeave = () => {
    dragSelect = null
  }

  const handleDrag = (data) => {
    const selectedDataSets = []

    selectedDataSets.push({
      row: data.item.dataset.row,
      cell: data.item.dataset.cell
    })

    data.items.forEach(item => {
      selectedDataSets.push({
        row: item.dataset.row,
        cell: item.dataset.cell
      })
    })

    const selectedData = { ...state.selectedItems }
    selectedDataSets.forEach(item => {
      const selectedRowData = selectedData[`row-${item.row}`]
      if (!selectedRowData) {
        selectedData[`row-${item.row}`] = []
        selectedData[`row-${item.row}`].push(item.cell)
      } else {
        const selectedDataIndex = selectedData[`row-${item.row}`].indexOf(item.cell)
        selectedDataIndex < 0 && selectedData[`row-${item.row}`].push(item.cell)
      }
      setState({ selectedItems: selectedData })
    });
  }


  const renderCell = (rowData) => {
    delete rowData.style
    const rowDataValues = Object.values(rowData)
    return rowDataValues.map(data => {
      const isSelected = state.selectedItems && state.selectedItems[`row-${rowData.id}`] ? state.selectedItems[`row-${rowData.id}`].indexOf(data) : false
      return (
        <div
          key={rowData.id + data}
          className={`item_data cell-data ${isSelected && isSelected >= 0 ? 'selected' : ''}`}
          data-row={rowData.id}
          data-cell={data}
        >
          {data}
        </div>
      )
    })
  }

  const renderSelected = () => {
    const selectedRow = state.selectedItems ? Object.keys(state.selectedItems) : null
    const selectedRowCells = state.selectedItems ? Object.values(state.selectedItems) : null

    const renderCellSelected = (data) => {
      return data.map((item, index) => (
        <span key={`${item}-${index}`} className='cell_selected'>{item}</span>
      ))
    }

    const rows = selectedRow && selectedRow.map((row, index) => {
      return (
        <div key={`${row}-${index}`} className='row_selected'>{row}: {renderCellSelected(selectedRowCells[index])}</div>
      )
    })

    return (
      <>
        <h2>Selected: </h2>
        <div>
          {rows}
        </div>
      </>
    )
  }

  return (
    <div ref={selectionBoxRef}
      className='selection-box'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setState({ selectedItems: {} })}
    >
      <div className="scroll" style={{ overflowY: "scroll", height: windowHeight }} onScroll={onScroll}>
        <div
          ref={containerElementsRef}
          className="inner"
          id='dragContainer'
          style={{ position: "relative", height: `${innerHeight}px` }}
        >
          {items.map((item, index) => (
            <div key={index} className="item" style={item.style}>
              <div className='item__wrapper'>
                {renderCell({ ...item })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {renderSelected()}
    </div>
  );
};

export default VirtualizedGrid