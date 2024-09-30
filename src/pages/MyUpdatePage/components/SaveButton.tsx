import {
  MyProfileBe2FeAdpter,
  PutUserInfomationAdapter,
  put_user_information,
  useMyProfile,
} from '@/services/user'
import { useMyInfoFormContext } from '../hooks/useMyInfoForm'
import styles from './SaveButton.module.scss'
import { useFileContext } from '../hooks/useFileContext'
import { uploadFileS3 } from '@/utils/s3'
import useToast from '@/utils/useToast'
import { useNavigate } from 'react-router-dom'

export function SaveButton ({ onClick }: { onClick: () => void }) {
  const info = useMyInfoFormContext()
  const file = useFileContext()
  const { data } = useMyProfile()
  const myData = data ? new MyProfileBe2FeAdpter(data).adapt() : {}
  const navigate = useNavigate()

  const getUserNewInfo = async () => {
    const newInfo = {
      ...new PutUserInfomationAdapter(info).adapt(),
      profileImageUrl: file ? await uploadFileS3(file) : info.profileImageUrl,
    }
    const diff = getDiff(newInfo, myData)
    return diff
  }
  const toast = useToast()

  return (
    <button
      onClick={async () => {
        onClick?.()

        try {
          const userNewInfo = await getUserNewInfo()
          if (!isEmpty(userNewInfo)) await put_user_information(userNewInfo)
          toast.add({
            message: '프로필이 수정되었습니다.',
          })
          navigate(`/user/${data?.userId}`)
        } catch {
          toast.add({
            message: '프로필 수정에 실패하였습니다.',
          })
        }
      }}
      className={styles.Button}
    >
      저장
    </button>
  )
}

const getDiff = <T extends { [key: string]: string }>(obj1: T, obj2: T) => {
  const diff: Partial<T> = {}
  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) diff[key] = obj1[key]
  }
  return diff
}

const isEmpty = (obj: object) => {
  return Object.keys(obj).length === 0
}
