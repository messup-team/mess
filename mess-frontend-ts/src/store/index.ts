// store.ts
import { createStore } from 'vuex'

import mess, {
  Message,
  messages,
  utils,
  auth,
  RawMessage,
  MessageStatus,
} from '../mess-api'

export interface State {
  login: string
  messages: Array<Message>
  chats: Array<string>
}

const timestampSort = (a: Message, b: Message) => a.timestamp - b.timestamp
const timestampSortInverse = (a: Message, b: Message) => b.timestamp - a.timestamp

export const store = createStore<State>({
  state: {
    login: '',
    messages: [],
    chats: [],
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
    chats: (state: State) => {
      return {
        chats: state.chats,
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
    // TODO: update status and unread fields
    addMessages(state: State, messages: Array<Message>) {
      const ids = new Set(state.messages.map((message: Message) => message.id))
      const filteredMessages = messages.filter((message: Message) => !ids.has(message.id))
      state.messages = state.messages.concat(filteredMessages)
    },
    setMessages(state: State, messages: Array<Message>) {
      state.messages = messages
    },
    setChats(state: State, chats: Array<string>) {
      state.chats = chats
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
  },

  actions: {
    async userLogin({ commit }, login: string) {
      const response = await mess.auth.validateLogin(login)
      if (response) {
        commit('setLogin', login)
        // const messages = await mess.messages.getMessages(login)
        // commit('setMessages', messages)
        const chats = await mess.chats.getChats(login)
        commit('setChats', chats)
      } else throw new Error('Invalid login')
    },
    async userLogout({ commit }) {
      commit('setLogin', '')
      commit('setMessages', [])
    },

    async sendMessage({ commit, state }, payload: { message: string; to: string }) {
      const rawMessage: RawMessage = {
        from: state.login,
        to: payload.to,
        body: payload.message,
      }

      const [message, promise] = mess.messages.sendMessage(rawMessage)
      // messages.sendMessage(message).then((response: boolean) => {
      //   commit('setMessageStatus', { id: message.id, status: response ? 'OK' : 'FAILED' })
      // })
      commit('addMessage', message)
      console.log('new message', message)
      promise.then((val) =>
        commit('setMessageStatus', { id: message.id, status: val.data })
      )
    },

    async readMessages({ commit, state }, user) {
      const messages = await mess.messages.readMessages(state.login, user)
      commit('addMessages', messages)
    },
  },
})
