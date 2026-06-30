import { useEffect, useState } from 'react'
import DragAndDropContainer, {
  type DragAndDropContainerArrayStorage,
} from '@/components/DragAndDropContainer'
import Modal from '@/components/Modal'
import logo from '@/iongridlogo.png'

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)
  const [name, setName] = useState('Guest')
  const [arrayId, setArrayId] = useState('')
  const [arrayName, setArrayName] = useState('')
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [arrayValues, setArrayValues] = useState<
    DragAndDropContainerArrayStorage | undefined
  >(undefined)
  const [userArrays, setUserArrays] = useState<
    { id: string; name: string; items: [] }[] | undefined
  >()

  // Sidebar visibility state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Tracks which board shelf row is primed for deletion
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null)

  const getName = async () => {
    const res = await fetch('/api/name')
    const resObj = await res.json()
    setName(resObj.name)
  }

  const getArrays = async () => {
    const res = await fetch('/api/array-storage')
    const resObj = await res.json()
    setUserArrays(resObj.collection)
    if (resObj.collection?.length > 0) setArrayId(resObj.collection[0].id)
  }

  useEffect(() => {
    const checkMiddleware = async () => {
      const res = await fetch('/api/middleware')
      const resObj = await res.json()
      if (!resObj.valid) return window.location.assign('/login')
      setIsMounted(true)
      getName()
      getArrays()
    }
    checkMiddleware()
  }, [])

  useEffect(() => {
    if (!arrayId) return
    setArrayValues(undefined)
    const getArray = async () => {
      const res = await fetch('api/array-storage/' + arrayId)
      const resObj = await res.json()
      if (res.status === 200) {
        setArrayName(resObj.name || 'unknown')
        setArrayValues(resObj.items)
      } else {
        console.log('Error fetching array set: ', res.status)
      }
    }
    getArray()
  }, [arrayId])

  function getCsrfToken(cookieName = 'csrftoken') {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${cookieName}=`))
      ?.split('=')[1]

    return cookieValue ? decodeURIComponent(cookieValue) : null
  }

  function onSubmitArrayName(value: string) {
    setArrayName(value)
    setShowNamePrompt(false)
    createSet(value)
  }

  function goToLogout() {
    window.location.replace('/api/logout')
  }

  async function createSet(name: string) {
    setArrayValues(undefined)
    const newSet = {} as DragAndDropContainerArrayStorage
    const formData = new FormData()
    formData.append('name', name)
    formData.append('items', JSON.stringify(newSet))
    const res = await fetch('api/array-storage', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': getCsrfToken() || '',
      },
      body: formData,
    })
    if (res.status === 200) {
      const data = await res.json()
      if (data.success) {
        await getArrays()
        return
      }
    }
    console.log('Error creating new set: ', res.status)
  }

  async function saveSet(items: DragAndDropContainerArrayStorage) {
    if (arrayId && items) {
      try {
        const formData = new FormData()
        formData.append('arrayId', arrayId)
        formData.append('name', arrayName)
        formData.append('items', JSON.stringify(items))
        await fetch('api/array-storage', {
          method: 'PUT',
          headers: {
            'X-CSRF-Token': getCsrfToken() || '',
          },
          body: formData,
        })
      } catch {
        console.log(`Error saving changes.`)
      }
    } else {
      console.log(
        `Cannot save set: missing arrayId: ${arrayId} or arrayValues: ${items} or arrayName: ${arrayName}`
      )
    }
  }

  async function deleteBoard(id: string) {
    setDeletingBoardId(null)
    const formData = new FormData()
    formData.append('arrayId', id)
    const res = await fetch('api/array-storage', {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': getCsrfToken() || '',
      },
      body: formData,
    })
    if (res.status === 200) {
      return await getArrays()
    }
    console.log('Error deleting new set: ', res.status)
  }

  if (!isMounted) return <div></div>

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col md:flex-row gap-6 antialiased relative overflow-x-hidden">
      <Modal
        open={showNamePrompt}
        prompt={'Enter name of collection:'}
        onSubmit={onSubmitArrayName}
        onCancel={() => setShowNamePrompt(false)}
      />

      {/* Sidebar Section with collapsible layout animation logic */}
      <div
        className={`shrink-0 flex flex-col gap-6 transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? 'w-full md:w-64 opacity-100'
            : 'w-0 h-0 md:h-auto md:w-0 opacity-0 pointer-events-none overflow-hidden gap-0'
        }`}
      >
        {/* Profile Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl backdrop-blur-sm min-w-[256px]">
          <div className="mb-2 flex items-center gap-5">
            <img
              src={logo}
              className="border rounded-xl border-purple-500"
              width={65}
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                Home
              </h1>
              <p className="text-sm text-slate-400">
                Welcome back,{' '}
                <span className="text-purple-400 font-medium">{name}</span>!
              </p>
            </div>
          </div>
          <button
            className="mt-5 w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-medium rounded-lg shadow-lg shadow-purple-600/10 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            onClick={() => setShowNamePrompt(true)}
          >
            <span>+</span> Create Board
          </button>
        </div>

        {/* Collections Shelf */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl backdrop-blur-sm flex flex-col gap-3 w-full min-w-[256px]">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Saved Collections
          </h2>

          <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-3 w-full">
            {userArrays?.map((array, index) => {
              const isActive = array.id === arrayId
              const isConfirmingDelete = deletingBoardId === array.id

              return (
                <button
                  key={'btn-' + array.id}
                  onClick={() => setArrayId(array.id)}
                  className={`relative w-full text-left pl-3 pr-8 py-2 rounded-lg text-xs font-medium transition-all duration-200 capitalize cursor-pointer border shrink-0 block min-w-0 truncate group/btn ${
                    isActive
                      ? 'bg-purple-600/10 border-purple-500/50 text-purple-300 shadow-inner'
                      : 'bg-slate-900 border-transparent hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                  }`}
                  title={array.name || `Array-${index}`}
                >
                  <span className="block truncate">
                    {array.name || `Array-${index}`}
                  </span>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center z-10">
                    {isConfirmingDelete ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                        className="size-4.5 text-green-400 cursor-pointer transition-all duration-150 transform scale-110"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteBoard(array.id)
                        }}
                        onMouseLeave={() => setDeletingBoardId(null)}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                        className="size-4 text-slate-500 hover:text-red-400 hidden group-hover/btn:block transition-all duration-150"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingBoardId(array.id)
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Logout Placement Wrapper */}
        <div className="mt-auto min-w-[256px]">
          <button
            onClick={goToLogout}
            className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-medium rounded-lg shadow-lg shadow-purple-600/10 transition-all duration-200 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 min-w-0 bg-slate-900/40 border border-slate-850 rounded-2xl p-4 md:p-5 backdrop-blur-sm flex flex-col items-stretch transition-all duration-300">
        {/* Active Grid Header with Collapse Controller Button */}
        <div className="w-full mb-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-3 gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            {/* Toggle Switch Controller Trigger */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              type="button"
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-purple-400 transition-colors cursor-pointer shrink-0"
              title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            >
              {isSidebarOpen && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
                </svg>
              )}
              {!isSidebarOpen && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
                  />
                </svg>
              )}
            </button>

            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-400 block">
                Active Board
              </span>
              <h2 className="text-xl md:text-2xl font-semibold text-white capitalize mt-0.5">
                {arrayName || (
                  <span className="text-slate-500 italic text-lg">
                    Select or create a board to begin
                  </span>
                )}
              </h2>
            </div>
          </div>
        </div>

        {/* Prioritization Grid Workspace Area */}
        <div className="w-full min-w-0 flex-1">
          <DragAndDropContainer loadSet={arrayValues} onSave={saveSet} />
        </div>
      </div>
    </div>
  )
}
