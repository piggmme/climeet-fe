import { PageData, Party, PartyDetail } from '@/pages/types/api'
import api from '../utils/api'
import { stringify } from '@/utils/query'
import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query'
import { queryClient } from '@/utils/tanstack'
import {
  ClimbingTypeEn,
  ClimbingTypeKo,
  GenderEn,
  GenderKo,
} from '@/pages/PartySurveyForm/components/PartyConditionForm.tsx'
import dayjs from 'dayjs'
import { PartySurveyFormData } from '@/pages/PartySurveyForm/PartySurveyFormPage.tsx'

/**
 * GET /v1/party/list?${queryString}
 */
export type GetPartyListParams = {
  page?: number
  size?: number
  sortColumn?: 'CREATED_AT'
  sortOrder?: 'DESC' | 'ASC'
  isNatural?: boolean
  climbingType?: 'BOULDERING' | 'LEAD' | 'ENDURANCE' | 'ANY'
  constraints?: 'BOTH' | 'MALE_ONLY' | 'FEMALE_ONLY'
  appointmentDate?: string
  address1List?: string[]
  locationId?: number
}

export const get_party_list = async (params?: GetPartyListParams) => {
  const queryString = params ? `?${stringify(params)}` : ''

  try {
    const result = await api.get<PageData<Party>>(`/v1/party/list?${queryString}`)
    return result
  } catch (e) {
    console.error(e)
    throw new Error('로그인이 실패하였습니다. post v1/oauth/login')
  }
}

export const PARTY_LIST_KEY = ['party', 'list']

export const usePartyList = (params?: GetPartyListParams) => {
  return useSuspenseInfiniteQuery({
    queryKey: [PARTY_LIST_KEY, params && stringify(params)],
    queryFn: ({ pageParam }) => get_party_list({ ...params, page: pageParam ?? 0 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.totalPages <= lastPage.pageable.pageNumber ? null : lastPage.pageable.pageNumber + 1,
    // 마운트시에 요청 보내지 않음
    retryOnMount: false,
    // 윈도우 포커스시에 새로고침하지 않음
    refetchOnWindowFocus: false,
  })
}

export const PartyListQuery = {
  invalidate: async () =>
    await queryClient.invalidateQueries({
      queryKey: PARTY_LIST_KEY,
      refetchType: 'all',
    }),

  refetch: async () =>
    await queryClient.refetchQueries({
      queryKey: PARTY_LIST_KEY,
    }),
}

export class PartyItem {
  private value: Party

  constructor(value: Party) {
    this.value = value
  }

  get appointmentTime() {
    return dayjs(this.value.appointmentTime).format('A h:mm')
  }

  get constraints() {
    switch (this.value.constraints) {
      case 'BOTH':
        return '남녀 모두'
      case 'MALE_ONLY':
        return '남자'
      case 'FEMALE_ONLY':
        return '여자'
      default:
        return '남녀 모두'
    }
  }

  get climbingType() {
    switch (this.value.climbingType) {
      case 'BOULDERING':
        return '볼더링'
      case 'LEAD':
        return '리드'
      case 'ENDURANCE':
        return '지구력'
      case 'ANY':
        return '상관없음'
      default:
        return '상관없음'
    }
  }

  adapt() {
    return {
      ...this.value,
      constraints: this.constraints,
      climbingType: this.climbingType,
      appointmentTime: this.appointmentTime,
    }
  }
}

export class SurveyFormAdapter {
  constructor(private value: GetPartyDetailRes) {}

  get cragName() {
    return this.value.gymName
  }

  get locationId() {
    return this.value.locationId
  }

  get maximumParticipationNumber() {
    return this.value.maxParticipants
  }

  get gender(): GenderKo {
    switch (this.value.constraints) {
      case 'MALE_ONLY':
        return '남자만'
      case 'FEMALE_ONLY':
        return '여자만'
      case 'BOTH':
        return '남녀 모두'
      default:
        return '남녀 모두'
    }
  }

  get climbingType(): ClimbingTypeKo {
    switch (this.value.climbingType) {
      case 'BOULDERING':
        return '볼더링'
      case 'LEAD':
        return '리드'
      case 'ENDURANCE':
        return '지구력'
      case 'ANY':
        return '상관없음'
      default:
        return '상관없음'
    }
  }

  get partyName() {
    return this.value.partyName
  }

  get partyDescription() {
    return this.value.partyDescription
  }

  get partyDate() {
    /**
     * @desc "2024-06-17T18:00:00.000Z" -> "2024-06-17"
     */
    return this.value.appointmentTime.substring(0, 10)
  }

  get partyTime() {
    /**
     * @desc "2024-06-17T18:00:00.000Z" -> "18:00"
     */
    return this.value.appointmentTime.substring(11, 16)
  }

  get minSkillLevel() {
    return this.value.minimumSkillLevel
  }

  get maxSkillLevel() {
    return this.value.maximumSkillLevel
  }

  get isNatural() {
    return this.value.isNatural
  }

  get approachDescription() {
    return this.value.approachDescription
  }

  adapt(): PartySurveyFormData {
    return {
      cragName: this.cragName,
      locationId: this.locationId,
      maximumParticipationNumber: this.maximumParticipationNumber,
      gender: this.gender,
      climbingType: this.climbingType,
      partyName: this.partyName,
      partyDescription: this.partyDescription,
      partyDate: this.partyDate,
      partyTime: this.partyTime,
      minSkillLevel: this.minSkillLevel,
      maxSkillLevel: this.maxSkillLevel,
      isNatural: this.isNatural,
      approachDescription: this.approachDescription,
    }
  }
}

/**
 * POST /v1/party/new
 */
export type PostPartyNewReq = {
  constraints: GenderEn
  climbingType: ClimbingTypeEn
  maximumParticipationNumber: number
  partyTitle: string
  isNatural: boolean
  minSkillLevel: number
  maxSkillLevel: number
  locationId: number
  participationDeadline: string
  approacheDescription: string
  partyDescription: string
  appointmentTime: string
}

export type PostPartyNewRes = {
  partyId: number
}

export const post_party_new = async (reqBody: PostPartyNewReq) => {
  try {
    const result = await api.post<PostPartyNewRes>('/v1/party/new', reqBody)
    return result
  } catch (e) {
    console.error(e)
    throw new Error('파티 생성에 실패하였습니다. post v1/party/new')
  }
}

/**
 * GET /v1/party/${partyId}/detail
 */
export const get_party_$partyId_detail = async (partyId: number) => {
  try {
    const result = await api.get<PartyDetail>(`/v1/party/${partyId}/detail`)
    return result
  } catch (e) {
    console.error(e)
    throw new Error('파티 상세 조회에 실패하였습니다. get v1/party/${partyId}/detail')
  }
}

export const PARTY_DETAIL_KEY = ['party', 'detail']

export const usePartyDetail = (partyId: number) => {
  return useSuspenseQuery({
    queryKey: [...PARTY_DETAIL_KEY, partyId],
    queryFn: () => get_party_$partyId_detail(partyId),
    retryOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => new PartyDetailAdapter(data).adapt(),
  })
}

export type PartyDetailType = ReturnType<PartyDetailAdapter['adapt']>

export class PartyDetailAdapter {
  private value: PartyDetail

  constructor(value: PartyDetail) {
    this.value = value
  }

  get appointmentTime() {
    return dayjs(this.value.appointmentTime).format('M월 DD일 (dd) A h:mm')
  }

  get climbingType() {
    switch (this.value.climbingType) {
      case 'BOULDERING':
        return '볼더링'
      case 'LEAD':
        return '리드'
      case 'ENDURANCE':
        return '지구력'
      case 'ANY':
        return '상관없음'
      default:
        return '상관없음'
    }
  }

  get constraints() {
    switch (this.value.constraints) {
      case 'BOTH':
        return '남녀 모두'
      case 'MALE_ONLY':
        return '남자'
      case 'FEMALE_ONLY':
        return '여자'
      default:
        return '남녀 모두'
    }
  }

  adapt() {
    return {
      ...this.value,
      appointmentTime: this.appointmentTime,
      climbingType: this.climbingType,
      constraints: this.climbingType,
    }
  }
}
export class PostPartyNewReqAdapter {
  private value: PartySurveyFormData

  constructor(value: PartySurveyFormData) {
    this.value = value
  }

  get constraints(): GenderEn {
    switch (this.value.gender) {
      case '남녀 모두':
        return 'BOTH'
      case '남자만':
        return 'MALE_ONLY'
      case '여자만':
        return 'FEMALE_ONLY'
      default:
        return 'BOTH'
    }
  }

  get climbingType(): ClimbingTypeEn {
    switch (this.value.climbingType) {
      case '볼더링':
        return 'BOULDERING'
      case '리드':
        return 'LEAD'
      case '지구력':
        return 'ENDURANCE'
      case '상관없음':
        return 'ANY'
      default:
        return 'ANY'
    }
  }

  get maximumParticipationNumber(): number {
    return this.value.maximumParticipationNumber
  }

  get partyTitle(): string {
    return this.value.partyName
  }

  get isNatural(): boolean {
    return this.value.isNatural
  }

  get minSkillLevel(): number {
    return this.value.minSkillLevel
  }

  get maxSkillLevel(): number {
    return this.value.maxSkillLevel
  }

  get locationId(): number {
    return this.value.locationId
  }

  // @todo 임시로 설정
  get participationDeadline(): string {
    return this.appointmentTime
  }

  get approachDescription(): string {
    return this.value.approachDescription
  }

  get partyDescription(): string {
    return this.value.partyDescription
  }

  get appointmentTime(): string {
    const date = this.value.partyDate
    const time = this.value.partyTime
    // @desc ss, ms는 입력받을 수 없으니 임의로 설정
    const dummyTime = ':00.000Z'

    return `${date}T${time}${dummyTime}`
  }

  adapt(): PostPartyNewReq {
    return {
      constraints: this.constraints,
      climbingType: this.climbingType,
      maximumParticipationNumber: this.maximumParticipationNumber,
      partyTitle: this.partyTitle,
      isNatural: this.isNatural,
      minSkillLevel: this.minSkillLevel,
      maxSkillLevel: this.maxSkillLevel,
      locationId: this.locationId,
      participationDeadline: this.participationDeadline,
      approacheDescription: this.approachDescription,
      partyDescription: this.partyDescription,
      appointmentTime: this.appointmentTime,
    }
  }
}

/************* PUT Party New **************/
export type PutPartyEditReq = {
  constraints: GenderEn
  minSkillLevel: number
  maxSkillLevel: number
  locationId: number
  participationDeadline: string
  userLimitCount: number
  approacheDescription: string
  isNatural: boolean
  description: string
  appointmentTime: string
  climbingType: ClimbingTypeEn
  partyTitle: string
}

export const put_party_edit = async (partyId: number | string, reqBody: PutPartyEditReq) => {
  try {
    const result = await api.put<PostPartyNewRes>(`/v1/party/${partyId}`, reqBody)
    return result
  } catch (e) {
    console.error(e)
    throw new Error(`파티 수정에 실패하였습니다. put v1/party/${partyId}`)
  }
}

export class PutPartyReqAdapter {
  private value: PartySurveyFormData

  constructor(value: PartySurveyFormData) {
    this.value = value
  }

  get constraints(): GenderEn {
    switch (this.value.gender) {
      case '남녀 모두':
        return 'BOTH'
      case '남자만':
        return 'MALE_ONLY'
      case '여자만':
        return 'FEMALE_ONLY'
      default:
        return 'BOTH'
    }
  }

  get climbingType(): ClimbingTypeEn {
    switch (this.value.climbingType) {
      case '볼더링':
        return 'BOULDERING'
      case '리드':
        return 'LEAD'
      case '지구력':
        return 'ENDURANCE'
      case '상관없음':
        return 'ANY'
      default:
        return 'ANY'
    }
  }

  get maximumParticipationNumber(): number {
    return this.value.maximumParticipationNumber
  }

  get partyTitle(): string {
    return this.value.partyName
  }

  get isNatural(): boolean {
    return this.value.isNatural
  }

  get minSkillLevel(): number {
    return this.value.minSkillLevel
  }

  get maxSkillLevel(): number {
    return this.value.maxSkillLevel
  }

  get locationId(): number {
    return this.value.locationId
  }

  get participationDeadline(): string {
    return this.appointmentTime
  }

  get approachDescription(): string {
    return this.value.approachDescription
  }

  get partyDescription(): string {
    return this.value.partyDescription
  }

  get appointmentTime(): string {
    const date = this.value.partyDate
    const time = this.value.partyTime
    const dummyTime = ':00.000Z'

    return `${date}T${time}${dummyTime}`
  }

  adapt(): PutPartyEditReq {
    return {
      constraints: this.constraints,
      climbingType: this.climbingType,
      userLimitCount: this.maximumParticipationNumber,
      partyTitle: this.partyTitle,
      isNatural: this.isNatural,
      minSkillLevel: this.minSkillLevel,
      maxSkillLevel: this.maxSkillLevel,
      locationId: this.locationId,
      participationDeadline: this.participationDeadline,
      approacheDescription: this.approachDescription,
      description: this.partyDescription,
      appointmentTime: this.appointmentTime,
    }
  }
}
