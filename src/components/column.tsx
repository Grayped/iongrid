import React from 'react';
import {useDroppable} from '@dnd-kit/react';
import {CollisionPriority} from '@dnd-kit/abstract';

interface Props {
    children: any,
    id: string,
    clickAction: (id: string) => void;
}

export function Column(props: Props) {
  const {isDropTarget, ref} = useDroppable({
    id: props.id,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });
//   const style = isDropTarget ? {shadow: '#00000030'} : undefined;

  function handleClick () {
    props.clickAction(props.id);
  }

  return (

    <div onDoubleClick={handleClick} className={`Column p-1 flex flex-col cursor-pointer`} ref={ref}>
       {props.children}
    </div>
  );
}