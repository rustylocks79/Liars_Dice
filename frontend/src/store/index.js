import {createStore} from 'redux'

const initialState = {
    testStrings: [{id: 1, title: 'Test Post'}]
}

const reducer = (state = initialState, action) => {
    if (action.type === 'ADD_STRING') {
        return Object.assign({}, state, {
            testStrings: state.testStrings.concat(action.payload)
        })
    }

    return state
}

const store = createStore(reducer)

export default store