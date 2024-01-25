import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { decode } from 'he'
import Question from './Question'

function App() {
  
  const [numQuestions, setNumQuestions] = useState(1)
  const [correctArray, setCorrectArray] = useState([])
  const [questions, setQuestions] = useState([])
  const [checkAnswers, setCheckAnswers] = useState(false)
  const [showSetup, setShowSetup] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(-1)
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [bigWinner, setBigWinner] = useState(false)
  const [sessionToken, setSessionToken] = useState("")

  // Call Open Trivia to populate categories. Store as <option> elements. Also grab session token. Only do once.
  useEffect ( () => {
    fetch(`https://opentdb.com/api_category.php`) 
    .then(response => response.json()) 
    .then(data => {
      data.trivia_categories.unshift({id: -1, name: "<All Categories>"})
      setCategories(data.trivia_categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>))   
    }) 
    .catch(error => console.error('Error:', error)); 

    fetch(`https://opentdb.com/api_token.php?command=request`) 
    .then(response => response.json()) 
    .then(data => {
      setSessionToken(data.token)   
    }) 
    .catch(error => console.error('Error:', error)); 

}, [])

  function setCorrect(id, isCorrect) {
    setCorrectArray( prevCorrect => {
          let newCorrect = [...prevCorrect]
          newCorrect[id] = isCorrect
          return newCorrect
    })
  }

  function getResultsText () {
    let totalCorrect = 0
    correctArray.forEach(element => { 
      if (element === true) totalCorrect++
    });
    return `${totalCorrect}/${correctArray.length}`
  }

  function handleCheckAnswers (){

    const numbers = getResultsText().split("/")
    console.log(numbers)
    if (numbers[0] === numbers[1]) {
      setBigWinner(true)
      const audio = new Audio('tada.mp3')
      audio.volume = 0.3 
      audio.play()
    }

    setCheckAnswers(true)
  }

  function handlePlayAgain () {    
    setCheckAnswers(false)
    setBigWinner(false) 
    setShowSetup(true) 
  }

  function startQuiz () {

    // Clear error text
    const el = document.getElementById('error-text')
    el.textContent = ""

    // Collect and store settings for quiz
    const inputNumQuestions = +document.getElementById('num-questions').value
    const inputSelectedCategory = document.getElementById('category').value
    const inputSelectedDifficulty = document.getElementById('difficulty').value
    const arr = new Array(inputNumQuestions).fill(false)

    setNumQuestions(inputNumQuestions)
    setSelectedCategory(inputSelectedCategory)
    setSelectedDifficulty(inputSelectedDifficulty)
    setCorrectArray(arr)
    
    // Set up and make the API call for the questions. 
    const cat = inputSelectedCategory >= 0 ? `&category=${inputSelectedCategory}` : ""
    const diff = inputSelectedDifficulty === 'all' ? "" : `&difficulty=${inputSelectedDifficulty}`
    const url = `https://opentdb.com/api.php?amount=${inputNumQuestions}&type=multiple${cat}${diff}&token=${sessionToken}`
    let success = true
    fetch(url) 
      .then(response => response.json()) 
      .then(data => {  switch (Number(data.response_code)) {
                          case 0:
                            setQuestions(data.results)
                            break
                          case 1:
                            el.textContent = "Not enough questions available."
                            success = false
                            break
                          case 2:
                            el.textContent = "Invalid parameter to Open Trivia DB API."
                            success = false
                            break
                          case 3:
                            el.textContent = "Session Token Does Not Exist."
                            success = false
                            break
                          case 4:
                            el.textContent = "You've seen all the questions for these options!"
                            success = false
                            break
                          case 5:
                            el.textContent = "Too many requests to Open Trivia DB Server."
                            success = false
                            break
                        } 
                        // Route to the questions page  
                        if (success) { 
                          setShowSetup(false)
                        }                      
                    }
            ) 
      .catch(error => { el.textContent = `Error: ${error}`
                        success = false})
  
  }

    const questionElements = questions.map( (question, index) => {
        const questionData = {  setCorrect: setCorrect, 
                            checkAnswers: checkAnswers, 
                            id: index, 
                            question: decode(question.question), 
                            answer: decode(question.correct_answer),
                            wrong: question.incorrect_answers.map( x => decode(x)),
                            key: index
                          }
      return <Question {...questionData}/>}) 

  // Render page
  return (
    <>
      <main>
        <div className="svg-container-upper">
            <img src="blob5.svg" alt="upper right decorative element" />
        </div>
        { showSetup &&
            <>
              <div className='setup-container'>
                  <div className='centered-display'>
                    <div className='title'>
                      <h2>
                        <span className='infinite'>N</span>
                        <span className='infinite'>F</span>
                        <span className='infinite'>I</span>
                        <span className='infinite'>N</span>
                        <span className='infinite'>I</span>
                        <span className='infinite'>T</span>
                        <span className='infinite'>E</span>
                        <span>T</span>
                        <span>R</span>
                        <span>I</span>
                        <span>V</span>
                        <span>I</span>
                        <span>A</span>
                        <span className='infinite'>I</span>
                      </h2>
                    </div>
                    <div className='quiz-options'>
                      <select id='num-questions' defaultValue={numQuestions}>
                        <option key="5" value="5">5 questions</option>
                        <option key="10" value="10">10 questions</option>
                        <option key="15" value="15">15 questions</option>
                        <option key="20" value="20">20 questions</option>
                      </select>                     
                      <select id='difficulty' defaultValue={selectedDifficulty}>
                        <option key="all" value="all">&lt;All Difficulties&gt;</option>
                        <option key="easy" value="easy">Easy</option>
                        <option key="medium" value="medium">Medium</option>
                        <option key="hard" value="hard">Hard</option>
                      </select>
                      <select id='category' defaultValue={selectedCategory}>
                        {categories}
                      </select>
                    </div>
                    <div id='error-text'></div>
                    <button className='start-button' onClick={startQuiz}>Start quiz</button>
                  </div>
              </div>
            </>
        }
        { !showSetup &&
            <>
              { bigWinner && <Confetti /> } 
              <div className='question-container'>
                {questionElements}
              </div>
              <div className='control-strip'>
                {!checkAnswers && <button className='checkAnswers' onClick={handleCheckAnswers}>Check answers</button>}
                {checkAnswers && <><h3>You scored { getResultsText()} correct answers</h3><button className='playAgain' onClick={handlePlayAgain}>Play again</button></>}
              </div>
            </>
        }
        <div className="svg-container-lower">
                  <img src="blob4.svg" alt="lower left decorative element" />
        </div>
      </main>
    </>
  )
}

export default App
