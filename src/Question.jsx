import { useState } from 'react'

function Question({setCorrect, checkAnswers, id, question, answer, wrong}) {

  // Props
  // function setCorrect :: tell App is the current answer correct?
  // boolean check :: check answer?
  // integer id :: unique id for question, will be the array index of the results array in App
  // string question :: trivia question
  // string answer :: correct answer
  // [string] wrong :: wrong options

  // What answer has the user selected. 
  const [userOption, setUserOption] = useState("")

  // choose what position to put the answer, then insert into
  const [answerIndex, setAnswerIndex] = useState(Math.floor(Math.random() * 4))
  let allOptions = [...wrong]
  allOptions.splice(answerIndex, 0, answer)

  // Helper function to determine which CSS class to apply to each button
  function buttonClass (option) {

      if (checkAnswers) {
        if (option === answer) return 'option check-answer-correct'
        if (option === userOption) return 'option check-answer-wrong'        
        return 'option check-answer-other'
      }  
      if (option === userOption) return 'option user-option'
      return 'option'
  }

  // Click changes whether the answer is correct, and which button to hilight
  function handleClick(option) {
      if (checkAnswers) return; 
      setUserOption(option)
      setCorrect(id, option === answer)
  }

  // Create button elements
  const optionElements = allOptions.map( option => ( <button key={option}
                                                      className={buttonClass(option)}
                                                      onClick={() => handleClick(option)}>
                                                      {option}
                                                      </button> ) ) 

  return (
    <>
      <h1 className='question'>{question}</h1>
      <div className='option-container'>
        {optionElements}
      </div>
      <hr />

    </>
  )
}

export default Question
