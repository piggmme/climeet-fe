import styles from './Notification.module.scss'
import * as Dialog from '@radix-ui/react-dialog'
import Icon from '@/components/Icon/Icon.tsx'
import { useEffect, useState } from 'react'
import TopBar from '@/components/NavBar/TopBar.tsx'
import Avatar from '@/components/Avatar.tsx'
import classNames from 'classnames'
import {
  GetNotificationResDTO,
  post_notification_mark_as_read_all,
  useNotification,
} from '@/services/notification.ts'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

export default function Notification () {
  const [open, onOpenChange] = useState(false)
  const { data } = useNotification()
  const isAlarmsExist = !!data?.some(el => !el.isRead)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger>
        <Icon icon={isAlarmsExist ? 'AlarmNew' : 'Alarm'} />
      </Dialog.Trigger>
      <Dialog.Overlay />
      <Dialog.Portal>
        <Content data={data ?? []} />
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Content ({ data }: { data: GetNotificationResDTO }) {
  useEffect(() => {
    return () => {
      post_notification_mark_as_read_all()
    }
  }, [])

  return (
    <Dialog.Content className={styles.Container}>
      <div className={styles.top}>
        <TopBar>
          <TopBar.Left asChild>
            <Dialog.Close asChild>
              <button className={styles.Left}>
                <Icon icon='ArrowLeft' size={24} />
              </button>
            </Dialog.Close>
          </TopBar.Left>
          <TopBar.Center title='알림' />
        </TopBar>
      </div>
      {data?.map(el => <NotificationCard notification={el} />)}
    </Dialog.Content>
  )
}

function NotificationCard ({ notification }: { notification: GetNotificationResDTO[number] }) {
  const navigate = useNavigate()

  const getRelativeTime = (dateString: string) => {
    const now = dayjs()
    const date = dayjs(dateString)
    const diffSeconds = now.diff(date, 'second')
    const diffMinutes = now.diff(date, 'minute')
    const diffHours = now.diff(date, 'hour')
    const diffDays = now.diff(date, 'day')

    if (diffSeconds < 60) {
      return `${diffSeconds}초 전`
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`
    }
    if (diffHours < 24) {
      return `${diffHours}시간 전`
    }
    return `${diffDays}일 전`
  }

  return (
    <div
      className={classNames(styles.NotificationCard, {
        [styles.IsRead]: notification.isRead,
      })}
      onClick={() => {
        if (notification.notificationType === 'PARTY') {
          navigate(`/party/${notification.referenceId}`)
          return
        }

        navigate(`/chat/${notification.referenceId}`)
      }}
    >
      <div className={styles.Left}>
        <div>
          <Avatar src={notification.thumbnail} alt='썸네일 이미지' className={styles.Avatar} />
        </div>
        <div>
          <div className={styles.PartyName}>{notification.notificationTitle}</div>
          <div className={styles.Message}>{notification.message}</div>
        </div>
      </div>
      <div className={styles.Right}>
        <div className={styles.NoticeTime}>{getRelativeTime(notification.createdAt)}</div>
      </div>
    </div>
  )
}
