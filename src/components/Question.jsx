// Question.js

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  nextQuiz,
  prevQuiz,
  submitQuiz,
  timeOut,
} from "../redux/action/quizAction";
import quizData from "../data/quiz.json";

// Import your constants from the correct path
import { QUIZ_START } from "../redux/constant/quizConstant";

const Question = () => {
  const dispatch = useDispatch();
  const { activeQuestion, answers, time } = useSelector((state) => state.quizReducer);
  const [data, setData] = useState(quizData?.data[activeQuestion]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [timer, setTimer] = useState(time); // Initialize timer state with Redux time
  const [fullscreenEnabled, setFullscreenEnabled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const radiosWrapper = useRef();

  useEffect(() => {
    setData(quizData?.data[activeQuestion]);
    if (answers[activeQuestion] !== undefined) {
      setSelected(answers[activeQuestion].a);
    }
  }, [activeQuestion]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          dispatch(timeOut()); // Dispatch timeout action when timer reaches 0
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timerId); // Cleanup interval on component unmount
  }, []);

  useEffect(() => {
    // Save timer state to Redux and local storage whenever it changes
    dispatch({ type: QUIZ_START, payload: timer });
  }, [timer, dispatch]);

  useEffect(() => {
    const fullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement ||
        false;
      setFullscreenEnabled(isFullscreen);

      if (!isFullscreen) {
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    };

    document.addEventListener("fullscreenchange", fullscreenChange);
    document.addEventListener("webkitfullscreenchange", fullscreenChange);
    document.addEventListener("msfullscreenchange", fullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChange);
      document.removeEventListener("webkitfullscreenchange", fullscreenChange);
      document.removeEventListener("msfullscreenchange", fullscreenChange);
    };
  }, []);

  const enterFullScreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  const handleNext = () => {
   
    let updatedAnswers = [...answers];
    updatedAnswers[activeQuestion] = {
      q: data.question,
      a: selected,
    };
    dispatch(nextQuiz({ answers: updatedAnswers }));
    setSelected("");
    const findCheckedInput =
      radiosWrapper.current.querySelector("input:checked");
    if (findCheckedInput) {
      findCheckedInput.checked = false;
    }
  };

  const handlePrev = () => {
    setError("");
    dispatch(prevQuiz());
  };

  const handleSubmit = () => {
  
    dispatch(
      submitQuiz({
        answers: [
          ...answers,
          {
            q: data.question,
            a: selected,
          },
        ],
        time: timer,
      })
    );
  };

  useEffect(() => {
    if (!fullscreenEnabled) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [fullscreenEnabled]);

  return (
    <div className="questionBox">
      <section className="questionHead">
        <h3>
          Question {activeQuestion + 1}/{quizData?.data.length}
        </h3>
        <h5>{timer} seconds remaining</h5>
      </section>
      <section className="middleBox">
        <div className="question">
          <p>{data?.question}</p>
          {error && <div>{error}</div>}
        </div>
        <div className="option" ref={radiosWrapper}>
          {data?.choices.map((choice, i) => (
            <label
              className={`${choice === selected ? "selected" : "text"}`}
              key={i}
            >
              <input
                type="radio"
                name="answer"
                value={choice}
                onChange={(e) => setSelected(e.target.value)}
                checked={choice === selected}
              />
              {choice}
            </label>
          ))}
        </div>
      </section>
      <section className="questionBottom">
        {activeQuestion > 0 && (
          <button
            className="button"
            onClick={handlePrev}
            disabled={showPopup}
          >
            Prev
          </button>
        )}
        {activeQuestion + 1 >= quizData?.data.length ? (
          <button
            className="button nextBtn"
            onClick={handleSubmit}
            disabled={showPopup}
          >
            Submit
          </button>
        ) : (
          <button
            className="button nextBtn"
            onClick={handleNext}
            disabled={showPopup}
          >
            Next
          </button>
        )}
      </section>

      {showPopup && (
        <div className="fullscreenPopup">
          <div className="popupContent">
            <p>Please enter fullscreen mode to continue taking the quiz.</p>
            <button onClick={enterFullScreen}>Enter Fullscreen</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;
