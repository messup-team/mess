// store.ts
import { createStore } from 'vuex'

import mess, {
  Message,
  messages,
  utils,
  auth,
  MessageWithoutId,
  MessageStatus,
} from '../mess-api'

export interface State {
  login: string
  messages: Array<Message>
}

const timestampSort = (a: Message, b: Message) => a.timestamp - b.timestamp
const timestampSortInverse = (a: Message, b: Message) => b.timestamp - a.timestamp

export const store = createStore<State>({
  state: {
    login: '',
    messages: [],
  },

  getters: {
    auth: (state: State) => {
      return {
        isLogin: !!state.login,
        login: state.login,
      }
    },
    messages: (state: State) => {
      return {
        messages: state.messages.sort(timestampSort),
        messageUnread: state.messages
          .filter((message) => message.unread)
          .sort(timestampSort),
        chats: Array.from(
          new Set(
            state.messages
              .sort(timestampSortInverse)
              .map((message: Message) =>
                state.login === message.from ? message.to : message.from
              )
          )
        ),

        messagesFrom: (from: string): Array<Message> =>
          state.messages
            .filter((message: Message) => message.from === from)
            .sort(timestampSort),
        messagesTo: (to: string): Array<Message> =>
          state.messages
            .filter((message: Message) => message.to === to)
            .sort(timestampSort),
        messagesWith: (user: string): Array<Message> =>
          state.messages
            .filter((message: Message) => message.to === user || message.from === user)
            .sort(timestampSort),
      }
    },
  },

  mutations: {
    setLogin(state: State, login: string) {
      state.login = login
    },
    addMessage(state: State, message: Message) {
      if (!mess.messages.isInside(message, state.messages)) state.messages.push(message)
    },
    setMessageStatus(state: State, payload: { id: string; status: MessageStatus }) {
      state.messages = state.messages.map((message: Message) => {
        return {
          ...message,
          status: message.id === payload.id ? payload.status : message.status,
        }
      })
    },
    readMessage(state: State, payload: { id: string; from: string }) {
      state.messages = state.messages.map((message) => {
        return {
          ...message,
          unread:
            message.id === payload.id && message.from === payload.from
              ? false
              : message.unread,
        }
      })
    },
    readMessages(state: State, payload: { ids: Array<string>; from: string }) {
      state.messages = state.messages.map((message: Message) => {
        return {
          ...message,
          unread:
            payload.ids.includes(message.id) && message.from === payload.from
              ? false
              : message.unread,
        }
      })
    },
    readMessagesFrom(state: State, from: string) {
      state.messages = state.messages.map((message: Message) => {
        return {
          ...message,
          unread: message.from === from ? false : message.unread,
        }
      })
    },
    setMessages(state: State, messages: Array<Message>) {
      state.messages = messages
    },
  },

  actions: {
    async userLogin({ commit }, login: string) {
      const response = await mess.auth.validateLogin(login)
      if (response) {
        commit('setLogin', login)
        const messages = await mess.messages.getMessages(login)
        commit('setMessages', messages)
      } else throw new Error('Invalid login')
    },
    async userLogout({ commit }) {
      commit('setLogin', '')
      commit('setMessages', [])
    },

    async sendMessage({ commit, state }, payload: { message: string; to: string }) {
      const message: Message = messages.packMessage({
        from: state.login,
        to: payload.to,
        message: payload.message,
        timestamp: utils.now(),
        unread: true,
        status: 'PROCESS',
      })
      commit('addMessage', message)
      messages.sendMessage(message).then((response: boolean) => {
        commit('setMessageStatus', { id: message.id, status: response ? 'OK' : 'FAILED' })
      })
      console.log('new message', message)
    },

    async readMessagesFrom({ commit }, user) {
      await messages.readMessagesFrom(user)
      setTimeout(() => commit('readMessagesFrom', user), 1000)
    },
  },
})
