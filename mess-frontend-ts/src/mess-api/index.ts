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

export interface RawMessage {
  from: string
  to: string
  body: string
}

export interface Message {
  id: string
  from: string
  to: string
  body: string
  timestamp: number
  unread: boolean
  status: MessageStatus
}

export interface Chat {
  user: string
  inbox: number
}

export interface Response {
  message: Message
  wait: Promise<AxiosResponse<any, any>>
}

function isInside(newMessage: Message, messages: Array<Message>): boolean {
  return messages.some(
    (message: Message) => message.id === newMessage.id && message.from === newMessage.from
  )
}

async function validateLogin(login: string): Promise<boolean> {
  return true
}

// real api
async function getChats(user: string, offset = 0): Promise<Array<Chat>> {
  try {
    const response = await axios.get(host + '/chats/get', {
      params: {
        user,
        offset,
      },
    })
    return response.data as Array<Chat>
  } catch (error) {
    console.error(error)
    return new Promise((resolve, reject) => resolve([]))
  }
}

async function watchMessages(
  user: string,
  with_: string,
  offset = 0
): Promise<Array<Message>> {
  try {
    const response = await axios.get(host + '/messages/watch', {
      params: {
        user,
        with: with_,
        offset,
      },
    })
    if (response.data) return response.data as Array<Message>
    return []
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
    if (response.data) return response.data as Array<Message>
    return []
  } catch (error) {
    console.error(error)
    return new Promise((resolve, reject) => resolve([]))
  }
}

function sendMessage(rawMessage: RawMessage): Response {
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

  return {
    message: {
      ...message,
      status: 'PROCESS',
      unread: true,
    } as Message,
    wait: promise as Promise<AxiosResponse<any, any>>,
  }
}

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
  watchMessages,
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
