import { useEffect } from 'react'

import { useNavActionStore } from '../model'

export const useRegisterNavAction = (action: () => void) => {
  const setOnAction = useNavActionStore((s) => s.setOnAction)

  useEffect(() => {
    setOnAction(() => action())
    return () => setOnAction(null)
  }, [setOnAction, action])
}
