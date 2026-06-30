// components/item.tsx
import React, { type PropsWithChildren } from 'react';
import { useSortable } from '@dnd-kit/react/sortable';

type ItemProps = PropsWithChildren<{
  id: string;
  index: number;
  column: string;
}>;

export function Item({ id, index, column, children }: ItemProps) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: 'item',
    accept: 'item',
    group: column
  });

  return (
    <div 
      ref={ref} 
      data-dragging={isDragging}
      className={`w-full block transition-opacity duration-150 ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
}