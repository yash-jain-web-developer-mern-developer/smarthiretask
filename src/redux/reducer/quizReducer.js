// quizReducer.js

import { QUIZ_START, QUIZ_RESET, QUIZ_NEXT, QUIZ_SUBMIT, QUIZ_PREV, QUIZ_TIMEOUT } from '../constant/quizConstant';

// Function to load time from local storage
const loadTimeFromLocalStorage = () => {
  try {
    const savedTime = localStorage.getItem('quizTime');
    if (savedTime === null) {
      return 600; // Default time of 600 seconds (10 minutes) if not found in local storage
    }
    return parseInt(savedTime, 10);
  } catch (e) {
    console.warn('Could not load time', e);
    return 600; // Default to 600 seconds if loading fails
  }
};

// Function to save time to local storage
const saveTimeToLocalStorage = (time) => {
  try {
    localStorage.setItem('quizTime', time.toString());
  } catch (e) {
    console.warn('Could not save time', e);
  }
};

const initialState = {
  step: 1,
  activeQuestion: 0,
  answers: [],
  time: loadTimeFromLocalStorage(), // Initialize time from local storage
};

const quizReducer = (state = initialState, action) => {
  const { type, payload } = action;
  let newState;

  switch (type) {
    case QUIZ_START:
      newState = {
        ...state,
        step: 2,
        time: payload,
      };
      saveTimeToLocalStorage(newState.time); // Save updated time to local storage
      break;
    case QUIZ_NEXT:
      newState = {
        ...state,
        answers: [...payload],
        activeQuestion: state?.activeQuestion + 1,
      };
      break;
    case QUIZ_SUBMIT:
      newState = {
        ...state,
        step: 3,
        answers: [...payload?.answers],
        time: payload?.time,
      };
      saveTimeToLocalStorage(newState.time); // Save updated time to local storage
      break;
    case QUIZ_RESET:
      newState = {
        ...state,
        step: 1,
        activeQuestion: 0,
        answers: [],
        time: 600, // Reset time to 600 seconds (10 minutes)
      };
      saveTimeToLocalStorage(newState.time); // Save updated time to local storage
      break;
    case QUIZ_PREV:
      newState = {
        ...state,
        activeQuestion: state?.activeQuestion - 1,
      };
      break;
    case QUIZ_TIMEOUT:
      newState = {
        ...state,
        time: 0,
        step: 3,
      };
      saveTimeToLocalStorage(newState.time); // Save updated time to local storage
      break;
    default:
      newState = state;
  }

  return newState;
};

export default quizReducer;
