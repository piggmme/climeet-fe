import { PartyListDto, UserPartyListQuery, useUserPartyList } from '@/services/user'
import { useLoadMore } from '@/utils/useLoadMore'
import React from 'react'
import styles from './PartyCardList.module.scss'
import dayjs from 'dayjs'
import Icon from '@/components/Icon/Icon'
import { Link, useNavigate } from 'react-router-dom'
import EmptyParty from '@/assets/empty_party.png'
import { PageData } from '@/pages/types/api'
import { InfiniteData } from '@tanstack/react-query'
import NotFound from '@/components/NotFound'
import { useDateRangeContext } from '../hook/useDateRangeContext'

export default function PartyCardList ({
  data,
  fetchNextPage,
}: {
  data: InfiniteData<PageData<PartyListDto>>
  fetchNextPage: () => void
}) {
  const ref = useLoadMore(fetchNextPage)
  const navigate = useNavigate()

  if (data.pages[0].totalElements === 0)
    return (
      <div className={styles.PartyEmpty}>
        <img src={EmptyParty} />
        <span>파티 이력이 없습니다.</span>
        <button
          onClick={() => {
            navigate('/')
          }}
        >
          파티 참가하기
        </button>
      </div>
    )

  return (
    <ul className={styles.PartyList}>
      {data.pages.map((parties, i) => (
        <React.Fragment key={i}>
          {parties.content.map(party => (
            <li key={party.id}>
              <Link to={`/party/${party.id}`}>
                <PartyCard party={party} />
              </Link>
            </li>
          ))}
        </React.Fragment>
      ))}
      <div ref={ref} />
    </ul>
  )
}

PartyCardList.Query = function PartyCardListQuery ({ userId }: { userId: number }) {
  const { startDate, endDate } = useDateRangeContext()
  const params = {
    userId,
    ...(startDate ? { startDate: startDate.tz('Asia/Seoul').format('YYYY-MM-DD') } : null),
    ...(endDate ? { endDate: endDate.tz('Asia/Seoul').format('YYYY-MM-DD') } : null),
  }
  const { data, fetchNextPage } = useUserPartyList(params)

  return <PartyCardList data={data} fetchNextPage={fetchNextPage} />
}

PartyCardList.Skeleton = function Skeleton () {
  return (
    <ul className={styles.PartyUl}>
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index}>
          로딩중
          {/* <PartyCard.Skeleton key={index} /> */}
        </li>
      ))}
    </ul>
  )
}

PartyCardList.Retry = function Retry ({ userId }: { userId: number }) {
  return <NotFound refresh={() => UserPartyListQuery.refetch({ userId })} />
}

function PartyCard ({ party }: { party: PartyListDto }) {
  return (
    <div className={styles.Card}>
      {party.partyImageUrl && (
        <div className={styles.Image}>
          <img src={party.partyImageUrl} alt='thumbnail' />
        </div>
      )}
      <div className={styles.Info}>
        <div className={styles.Time}>{dayjs(party.appointmentTime).format('YYYY.MM.DD')}</div>
        <div className={styles.Title}>{party.partyTitle}</div>
        <div className={styles.Address}>
          <Icon icon='LocationFill' size={16} />
          {party.gymName}
        </div>
      </div>
      <Icon className={styles.ArrowIcon} icon='ArrowRight' size={16} />
    </div>
  )
}