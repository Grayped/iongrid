// components/Modal.tsx
'use client'

import { useEffect, useState, type SetStateAction } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

interface Props {
  prompt?: string;
  open: boolean;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}

export default function Modal(props: Props) {
  const [open, setOpen] = useState(props.open)
  const [title, setTitle] = useState('');

  useEffect(() => {
    setOpen(props.open);
  }, [props.open])

  function handleChangeTitle(e: { target: { value: SetStateAction<string> } }) {
    setTitle(e.target.value);
  }

  return (
    <Dialog open={open} onClose={props.onCancel} className="relative z-50 antialiased">
      {/* Darkened backdrop overlay matching layout specifications */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-xl bg-slate-900 border border-slate-800 text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="p-6">
              <div className="flex flex-col gap-4">
                <DialogTitle as="h3" className="text-lg font-semibold text-white tracking-tight">
                  {props.prompt || 'New Item Details'}
                </DialogTitle>
                
                <div className="w-full">
                  <textarea 
                    name='card-title' 
                    className='w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-3 min-h-[90px] text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-150 resize-none' 
                    placeholder='Describe your task or idea...' 
                    onChange={handleChangeTitle} 
                    required 
                    autoFocus
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Footer Control Block */}
            <div className="bg-slate-950/40 border-t border-slate-800/60 px-6 py-4 flex flex-col sm:flex-row-reverse gap-2">
              <button
                type="button"
                onClick={() => props.onSubmit(title)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg shadow-lg shadow-purple-600/10 transition-all duration-150 cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => props.onCancel()}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-lg transition-all duration-150 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}