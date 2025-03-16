export default interface Device {
  id: number
  name: string
  uniqueId: string
  status: string
  disabled: boolean
  lastUpdate: string
  positionId: number
  groupId: number
  phone: string
  model: string
  contact: string
  category: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: Record<string, any>
}
