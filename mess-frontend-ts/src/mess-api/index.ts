import axios, { AxiosResponse } from 'axios'
// import hash from 'object-hash'
import { v4 as uuidv4 } from 'uuid'
import { mockMessages } from './mock'

// TODO: get rid of unread field
// i think it will cause a lot of problems
// seperate new message from read mb
// how to people will know that they have new messages
// maybe read message when ask from backend

// add success status

export type MessageStatus = 'OK' | 'FAILED' | 'PROCESS'

const host = 'http://localhost:8080'

export interface Message {
  id: string
  from: string
  to: string
  body: string
  timestamp: number
  unread: boolean
  status: MessageStatus
}

export interface RawMessage {
  from: string
  to: string
  body: string
}

function isInside(newMessage: Message, messages: Array<Message>): boolean {
  return messages.some(
    (message: Message) => message.id === newMessage.id && message.from === newMessage.from
  )
}

async function validateLogin(login: string): Promise<boolean> {
  return true
}

async function getMessages(login: string): Promise<Array<Message>> {
  return mockMessages(login)
}

async function readMessage(from: string, id: number): Promise<boolean> {
  return true
}

// async function readMessagesFrom(from: string): Promise<boolean> {
//   return true
// }

// async function readMessages(from: string, ids: Array<number>): Promise<boolean> {
//   return true
// }

// async function sendMessage(message: Message): Promise<boolean> {
//   return new Promise((resolve, reject) =>
//     setTimeout(() => {
//       resolve(true)
//     }, 2000)
//   )
// }

// real api
async function getChats(user: string, offset = 0): Promise<Array<string>> {
  try {
    const response = await axios.get(host + '/chats/get', {
      params: {
        user,
        offset,
      },
    })
    return response.data as Array<string>
  } catch (error) {
    console.error(error)
    return new Promise((resolve, reject) => resolve([]))
  }
}

async function readMessages(
  user: string,
  with_: string,
  offset = 0
): Promise<Array<Message>> {
  try {
    const response = await axios.get(host + '/messages/read', {
      params: {
        user,
        with: with_,
        offset,
      },
    })
    return response.data as Array<Message>
  } catch (error) {
    console.error(error)
    return new Promise((resolve, reject) => resolve([]))
  }
}

function sendMessage(
  rawMessage: RawMessage
): [Message, Promise<AxiosResponse<any, any>>] {
  const message = {
    ...rawMessage,
    id: uuidv4(),
    timestamp: now(),
  }
  console.log({ message })

  let promise
  try {
    promise = axios.post(host + '/messages/send', {
      ...message,
    })
  } catch (e) {
    console.error(e)
    promise = new Promise((resolve, reject) => resolve({ data: 'FAILED' }))
  }

  return [
    {
      ...message,
      status: 'PROCESS',
      unread: true,
    } as Message,
    promise as Promise<AxiosResponse<any, any>>,
  ]
}

// function hashSumMessage(message: MessageWithoutId): string {
//   // return hash(message)
//   return uuidv4()
// }

// function packMessage(message: MessageWithoutId): Message {
//   return {
//     ...message,
//     id: hashSumMessage(message),
//   }
// }

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('en-GB', { timeZone: 'UTC' })
}

function now(): number {
  return Math.floor(Date.now() / 1000)
}

export const auth = {
  validateLogin,
}

export const messages = {
  getMessages,
  readMessage,
  readMessages,
  sendMessage,
  isInside,
}

export const chats = {
  getChats,
}

export const utils = {
  formatTimestamp,
  now,
}

export default {
  auth,
  messages,
  chats,
  utils,
}
