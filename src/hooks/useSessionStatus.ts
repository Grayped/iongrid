import { useEffect, useState } from 'react'

export function useSessionStatus() {
  const [isActive, setIsActive] = useState(true)

  //   useEffect(() => {
  //     const checkMiddleware = async () => {
  //     const res = await fetch('/api/middleware')
  //     const resObj = await res.json()
  //     console.log('resObj', resObj);
  //     setIsActive(resObj.valid === true); 
  //     return isActive;
  //   }
  //   checkMiddleware()
  // }, [])

  // useEffect(() => {
  //   if (active) setIsActive(active)
  // }, [active])

  return isActive;
}
