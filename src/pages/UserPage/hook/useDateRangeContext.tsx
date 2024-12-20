import dayjs from 'dayjs'
import { createContext, useContext, useState } from 'react'

type DateRangeContextType = {
  startDate: dayjs.Dayjs | null
  endDate: dayjs.Dayjs | null
}

type DateRangeAction = {
  start: {
    update: (date: dayjs.Dayjs | null) => void
    init: () => void
    reset: () => void
  }
  end: {
    update: (date: dayjs.Dayjs | null) => void
    init: () => void
    reset: () => void
  }
}

export const defaultDateRange = {
  startDate: dayjs(),
  endDate: dayjs().add(1, 'day'),
}

const DateRangeContext = createContext<DateRangeContextType>(defaultDateRange)

const DateRangeAction = createContext<DateRangeAction>({
  start: {
    update: () => {},
    init: () => {},
    reset: () => {},
  },
  end: {
    update: () => {},
    init: () => {},
    reset: () => {},
  },
})

export function useDateRangeHook () {
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null)
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null)

  const updateStartDate = (date: dayjs.Dayjs | null) => {
    if (!date) {
      setStartDate(date)
      return
    }
    setStartDate(date)
    if (date.isAfter(endDate)) setEndDate(date.add(1, 'day'))
  }

  const updateEndDate = (date: dayjs.Dayjs | null) => {
    if (!date) {
      setEndDate(date)
      return
    }
    setEndDate(date)
    if (date.isBefore(startDate)) setStartDate(date.subtract(1, 'day'))
  }

  const initStartDate = () => {
    const date = dayjs()
    console.log(endDate)
    if (endDate) setStartDate(endDate!.subtract(1, 'day'))
    else setStartDate(date)
  }

  const initEndDate = () => {
    const date = dayjs()
    console.log(startDate)
    if (startDate) setEndDate(startDate!.add(1, 'day'))
    else setEndDate(date)
  }

  const state = {
    startDate,
    endDate,
  }

  const actions = {
    start: {
      update: updateStartDate,
      init: initStartDate,
      reset: () => setStartDate(null),
    },
    end: {
      update: updateEndDate,
      init: initEndDate,
      reset: () => setEndDate(null),
    },
  }

  return { state, actions }
}

export function DateRangeProvider ({ children }: { children: React.ReactNode }) {
  const { state, actions } = useDateRangeHook()

  return (
    <DateRangeContext.Provider value={state}>
      <DateRangeAction.Provider
        value={actions}
      >
        {children}
      </DateRangeAction.Provider>
    </DateRangeContext.Provider>
  )
}

export function useDateRangeContext () {
  return useContext(DateRangeContext)
}

export function useDateRangeAction () {
  return useContext(DateRangeAction)
}
