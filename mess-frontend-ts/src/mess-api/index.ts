import axios from 'axios'
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

export interface Message {
  id: string
  from: string
  to: string
  message: string
  timestamp: number
  unread: boolean
  status: MessageStatus
}

export interface MessageWithoutId {
  from: string
  to: string
  message: string
  timestamp: number
  unread: boolean
  status: MessageStatus
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

async function readMessagesFrom(from: string): Promise<boolean> {
  return true
}

async function readMessages(from: string, ids: Array<number>): Promise<boolean> {
  return true
}

async function sendMessage(message: Message): Promise<boolean> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(true)
    }, 2000)
  )
}

function hashSumMessage(message: MessageWithoutId): string {
  // return hash(message)
  return uuidv4()
}

function packMessage(message: MessageWithoutId): Message {
  return {
    ...message,
    id: hashSumMessage(message),
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
  getMessages,
  readMessage,
  readMessages,
  readMessagesFrom,
  sendMessage,
  isInside,
  packMessage,
}

export const utils = {
  formatTimestamp,
  now,
}

export default {
  auth,
  messages,
  utils,
}
