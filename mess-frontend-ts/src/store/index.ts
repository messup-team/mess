// store.ts
import { createStore, Dispatch } from 'vuex'

import mess, { Message, RawMessage, MessageStatus, Chat } from '../mess-api'

async function update(dispatch: Dispatch) {
  dispatch('getChats')
  setTimeout(async () => await update(dispatch), 1000)
}

export interface State {
  login: string
  messages: Array<Message>
  chats: Array<Chat>
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
        inbox: (from: string): number => 1,
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
        chats: state.chats as Array<Chat>,
      }
    },
  },

  mutations: {
    setLogin(state: State, login: string) {
      state.login = login
    },
    setMessages(state: State, messages: Array<Message>) {
      state.messages = messages
    },
    addMessage(state: State, message: Message) {
      if (!mess.messages.isInside(message, state.messages)) state.messages.push(message)
    },
    addMessages(state: State, messages: Array<Message>) {
      const newIds = new Set(messages.map((message: Message) => message.id))
      const filteredStateMessages = state.messages.filter(
        (message: Message) => !newIds.has(message.id)
      )
      state.messages = filteredStateMessages.concat(messages)
    },
    setChats(state: State, chats: Array<Chat>) {
      state.chats = chats
    },
    addChats(state: State, chats: Array<Chat>) {
      const newChats = new Set(chats.map(({ user }) => user))
      const filteredChats = state.chats.filter(({ user }) => !newChats.has(user))
      state.chats = filteredChats.concat(chats)
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
    async userLogin({ commit, dispatch }, login: string) {
      const response = await mess.auth.validateLogin(login.toLowerCase())
      if (response) {
        commit('setLogin', login.toLowerCase())
        dispatch('getChats')
      } else throw new Error('Invalid login')
      setTimeout(async () => await update(dispatch), 1000)
    },

    async userLogout({ commit }) {
      commit('setLogin', '')
      commit('setMessages', [])
      commit('setChats', [])
    },

    async getChats({ commit, state }) {
      if (state.login === '') return
      const chats = await mess.chats.getChats(state.login)
      commit('setChats', chats)
    },

    async watchMessages({ commit, state }, user) {
      if (state.login === '') return
      const messages = await mess.messages.watchMessages(state.login, user)
      commit('addMessages', messages)
    },

    async readMessages({ commit, state, dispatch }, user) {
      if (state.login === '') return
      const messages = await mess.messages.readMessages(state.login, user)
      commit('addMessages', messages)
      dispatch('getChats')
    },

    async sendMessage({ commit, state }, payload: { message: string; to: string }) {
      if (state.login === '') return
      const rawMessage: RawMessage = {
        from: state.login,
        to: payload.to,
        body: payload.message,
      }

      const response = mess.messages.sendMessage(rawMessage)

      commit('addMessage', response.message)
      response.wait.then((status) =>
        commit('setMessageStatus', { id: response.message.id, status: status.data })
      )
    },
  },
})
