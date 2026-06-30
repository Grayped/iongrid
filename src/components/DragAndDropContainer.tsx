import React, { useEffect, useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import { Column } from './column.js'
import { Item } from './item.js'
import Modal from './Modal.js'

export interface DragAndDropContainerArrayStorage {
  A: []
  B: []
  C: []
  D: []
  E: []
  F: []
  G: []
  H: []
  I: []
}

interface DragAndDropContainerProps {
  loadSet?: DragAndDropContainerArrayStorage
  onSave: (items: DragAndDropContainerArrayStorage) => void
}

// TODO: Proper labeling - Low Effort // High Impact etc etc
const GRID_LABELS: Record<string, { effort: string; impact: string }> = {
  A: { effort: 'Low', impact: 'High' },
  B: { effort: 'Low', impact: 'Medium' },
  C: { effort: 'Low', impact: 'Low' },
  D: { effort: 'Medium', impact: 'High' },
  E: { effort: 'Medium', impact: 'Medium' },
  F: { effort: 'Medium', impact: 'Low' },
  G: { effort: 'High', impact: 'High' },
  H: { effort: 'High', impact: 'Medium' },
  I: { effort: 'High', impact: 'Low' },
}

export default function DragAndDropContainer(props: DragAndDropContainerProps) {
  const start = {
    A: [] as any[],
    B: [] as any[],
    C: [] as any[],
    D: [] as any[],
    E: [] as any[],
    F: [] as any[],
    G: [] as any[],
    H: [] as any[],
    I: [] as any[],
  } as DragAndDropContainerArrayStorage

  const [items, setItems] = useState<DragAndDropContainerArrayStorage>(start)
  const [showModal, setShowModal] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState('')

  // Tracks which card is primed for deletion (e.g., "A-0")
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

  const [activeMobileEffort, setActiveMobileEffort] = useState<
    'Low' | 'Medium' | 'High'
  >('Low')

  useEffect(() => {
    setItems(start)
    if (props.loadSet && Object.keys(props.loadSet).length > 0)
      setItems(props.loadSet)
  }, [props.loadSet])

  function onClickHandler(column: string) {
    setSelectedColumn(column)
    setShowModal(true)
  }

  function addToColumn(cardTitle: string) {
    setShowModal(false)
    const column = selectedColumn

    setItems((prev) => {
      const updatedColumn = [
        ...(prev[column as keyof DragAndDropContainerArrayStorage] || []),
        cardTitle,
      ]
      const newItems = {
        ...prev,
        [column]: updatedColumn,
      }
      props.onSave(newItems)
      return newItems
    })
  }

  function deleteFromColumn(
    column: keyof DragAndDropContainerArrayStorage,
    indexToDelete: number
  ) {
    setItems((prev) => {
      const currentColumnItems = prev[column] || []
      const updatedColumn = currentColumnItems.filter(
        (_, index) => index !== indexToDelete
      )

      const newItems = {
        ...prev,
        [column]: updatedColumn,
      }

      props.onSave(newItems)
      return newItems as DragAndDropContainerArrayStorage
    })
    // Reset deletion confirmation layout state
    setDeletingItemId(null)
  }

  return (
    <DragDropProvider
      onDragOver={(event) => {
        setItems((currentItems) => move(currentItems, event))
      }}
      onDragEnd={(event) => {
        setItems((currentItems) => {
          props.onSave(currentItems)
          return currentItems
        })
      }}
    >
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onSubmit={(value) => addToColumn(value)}
      />

      <div className="w-full flex flex-col gap-4">
        {/* Mobile Filter Tabs */}
        <div className="flex md:hidden bg-slate-900 border border-slate-800 p-1 rounded-xl w-full">
          {(['Low', 'Medium', 'High'] as const).map((effort) => (
            <button
              key={effort}
              type="button"
              onClick={() => setActiveMobileEffort(effort)}
              className={`flex-1 text-center py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-all duration-200 ${
                activeMobileEffort === effort
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {effort} Effort
            </button>
          ))}
        </div>

        {/* The Matrix Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          {Object.entries(items).map(([column, columnItems]) => {
            const labelInfo = GRID_LABELS[column]
            const isVisibleOnMobile = labelInfo?.effort === activeMobileEffort

            return (
              <div
                key={column}
                className={`${
                  isVisibleOnMobile ? 'block' : 'hidden md:block'
                } bg-slate-900/60 border border-slate-800/80 rounded-xl p-2 transition-all hover:border-slate-700/60 flex flex-col min-h-[160px] md:min-h-[200px] group`}
              >
                <div className="flex justify-between items-center mb-3 border-b border-slate-800/50 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono">
                    Zone {column}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono flex gap-1">
                    {`${labelInfo?.effort} EFFORT`}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 text-purple-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                      />
                    </svg>
                    {`${labelInfo?.impact} IMPACT`}
                  </span>

                  <button
                    type="button"
                    onClick={() => onClickHandler(column)}
                    className="p-1 px-2 text-xs font-semibold bg-slate-800 hover:bg-purple-600 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white rounded-md transition-all duration-150 cursor-pointer flex items-center gap-1 opacity-80 group-hover:opacity-100"
                  >
                    <span>+</span> Add
                  </button>
                </div>

                <div className="flex-1 rounded-lg bg-slate-950/30 p-2 min-h-[70%]">
                  <Column clickAction={onClickHandler} id={column}>
                    <div className="flex flex-col gap-2">
                      {columnItems.map((id, index) => {
                        const itemKey = `${column}-${index}`
                        const isConfirmingDelete = deletingItemId === itemKey

                        return (
                          <Item key={id} id={id} index={index} column={column}>
                            <div className="group/actions w-full bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-200 text-xs p-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing flex items-center justify-between select-none min-w-0">
                              <span className="truncate pr-1 font-medium">
                                {id}
                              </span>
                              <div className="flex gap-3 justify-items-center align-middle">
                                {isConfirmingDelete ? (
                                  /* Stage 2: Green Tick Confirmation Action */
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1}
                                    stroke="currentColor"
                                    className="size-5 text-green-400 cursor-pointer animate-scaleIn"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteFromColumn(
                                        column as keyof DragAndDropContainerArrayStorage,
                                        index
                                      )
                                    }}
                                    onMouseLeave={() => setDeletingItemId(null)} // Resets if cursor strays away
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m4.5 12.75 6 6 9-13.5"
                                    />
                                  </svg>
                                ) : (
                                  /* Stage 1: Standard Trash Icon Initial Call */
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1}
                                    stroke="currentColor"
                                    className="size-5 mt-0.5 hidden group-hover/actions:block hover:cursor-pointer hover:text-red-400"
                                    onClick={(e) => {
                                      e.stopPropagation() // Prevents dnd conflicts
                                      setDeletingItemId(itemKey)
                                    }}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                    />
                                  </svg>
                                )}

                                <span className="text-[16px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">
                                  ≡
                                </span>
                              </div>
                            </div>
                          </Item>
                        )
                      })}
                    </div>
                  </Column>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DragDropProvider>
  )
}
