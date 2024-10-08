import TopBar from '@/components/NavBar/TopBar'
import styles from './HomePage.module.scss'
import BottomBar from '@/components/NavBar/BottomBar'
import FilterList from './components/FilterList'
// import Tabs from './components/Tabs'
import DatePickerContainer from '@/components/DatePicker.tsx'
import PartyList from './components/PartyList'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { FilterProvider } from './hooks/useFilterContext'
import { DateProvider } from './hooks/useDateContext'
import GymSearch from '@/pages/Home/components/GymSearch.tsx'
import { SearchContextProvider } from './hooks/useSearchContext'
import RefreshButton from './components/RefreshButton'
import RemoveFullButton from './components/RemoveFullButton'
import classNames from 'classnames'

export default function HomePage () {
  return (
    <SearchContextProvider>
      <FilterProvider>
        <DateProvider>
          <div className={styles.container}>
            <TopBar type='main' />
            <main className={styles.main}>
              <div className={styles.SearchForm}>
                {/* <Tabs tabs={['암장', '자연']} /> */}
                <div className={styles.Search}>
                  <GymSearch />
                </div>
                <DatePickerContainer />
              </div>

              <ErrorBoundary fallback={<PartyList.Retry />}>
                <div className={classNames(styles.Contents, styles.Sticky)}>
                  <div className={styles.ContentHeader}>
                    <h1 className={styles.Title}>오늘의 파티</h1>
                    <RemoveFullButton />
                  </div>
                  <div className={styles.Buttons}>
                    <RefreshButton />
                    <FilterList />
                  </div>
                </div>

                <Suspense fallback={<PartyList.Skeleton />}>
                  <PartyList />
                </Suspense>
              </ErrorBoundary>
            </main>

            <BottomBar />
          </div>
        </DateProvider>
      </FilterProvider>
    </SearchContextProvider>
  )
}
