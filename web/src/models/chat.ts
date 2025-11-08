export interface Message {
  sid?: string // outgoing messages don't have an SID yet
  tempId?: string // client-side temp ID
  isOutbound: boolean
  phoneNumber: string
  text: string
  timestamp: number
  // status: MessageStatus
}
