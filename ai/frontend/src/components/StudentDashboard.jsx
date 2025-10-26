function AssessmentComponent({ assessment, onBack }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Format answers for backend
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer: answer
      }))

      // Submit to backend for AI evaluation
      const response = await fetch('http://localhost:8000/api/assessments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessment_id: assessment.assessment_id,
          student_answers: formattedAnswers
        })
      })

      const result = await response.json()
      setResults(result.evaluation)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Error submitting assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted && results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Assessment Results</h2>
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700"
              >
                Back to Lessons
              </button>
            </div>

            {/* Scores */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Your Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{results.scores.mcq_score}</p>
                  <p className="text-sm text-green-600">MCQ</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{results.scores.short_answer_score}</p>
                  <p className="text-sm text-green-600">Short Answer</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{results.scores.long_answer_score}</p>
                  <p className="text-sm text-green-600">Long Answer</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{results.scores.percentage}</p>
                  <p className="text-sm text-green-600">Overall</p>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Detailed Feedback</h3>

                {/* MCQ Feedback */}
                {results.detailed_feedback.mcq_feedback && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Multiple Choice Questions:</h4>
                    {results.detailed_feedback.mcq_feedback.map((feedback, index) => (
                      <div key={index} className="border rounded-lg p-3 mb-2">
                        <p className="font-medium">{feedback.question}</p>
                        <p className="text-sm text-gray-600">Your answer: {feedback.student_answer}</p>
                        <p className="text-sm text-gray-600">Correct answer: {feedback.correct_answer}</p>
                        <p className={`text-sm ${feedback.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                          {feedback.is_correct ? '✓ Correct' : '✗ Incorrect'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{feedback.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Short Answer Feedback */}
                {results.detailed_feedback.short_answer_feedback && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Short Answer:</h4>
                    <div className="border rounded-lg p-3">
                      <p className="font-medium">{results.detailed_feedback.short_answer_feedback.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Score: {results.detailed_feedback.short_answer_feedback.score}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {results.detailed_feedback.short_answer_feedback.feedback}
                      </p>
                    </div>
                  </div>
                )}

                {/* Long Answer Feedback */}
                {results.detailed_feedback.long_answer_feedback && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Long Answer:</h4>
                    <div className="border rounded-lg p-3">
                      <p className="font-medium">{results.detailed_feedback.long_answer_feedback.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Score: {results.detailed_feedback.long_answer_feedback.score}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {results.detailed_feedback.long_answer_feedback.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Recommendations</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-2">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="text-blue-800">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onBack}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Lessons
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Assessment: {assessment.lesson_topic}</h2>
              <p className="text-gray-600">Subject: {assessment.subject}</p>
              {assessment.ai_enabled && (
                <p className="text-green-600 text-sm">🤖 AI-Powered Assessment</p>
              )}
            </div>
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to Lessons
            </button>
          </div>

          <div className="space-y-6">
            {/* MCQ Questions */}
            {assessment.questions.mcq.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="font-medium mb-3">{index + 1}. {question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`mcq-${question.question_id}`}
                        value={option}
                        onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
                        className="text-blue-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Short Answer Questions */}
            {assessment.questions.short_answer.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="font-medium mb-3">{assessment.questions.mcq.length + index + 1}. {question.question}</p>
                <textarea
                  rows="3"
                  onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your answer here (2-3 sentences)..."
                />
              </div>
            ))}

            {/* Long Answer Question */}
            <div className="border rounded-lg p-4">
              <p className="font-medium mb-3">
                {assessment.questions.mcq.length + assessment.questions.short_answer.length + 1}. {assessment.questions.long_answer.question}
              </p>
              <textarea
                rows="6"
                onChange={(e) => handleAnswerChange(assessment.questions.long_answer.question_id, e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your detailed answer here..."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || Object.keys(answers).length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}