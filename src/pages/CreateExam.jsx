import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import API_BASE_URL from '../utils/api';

export default function CreateExam() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    duration: '',
    description: '',
    questions: [
      {
        text: '',
        options: ['', '', '', ''],
        correctOption: 0
      }
    ]
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (e, index) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === index) {
          return { ...q, [name]: value };
        }
        return q;
      })
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          return { ...q, correctOption: optionIndex };
        }
        return q;
      })
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          options: ['', '', '', ''],
          correctOption: 0
        }
      ]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      if (userData.role !== 'teacher') {
        throw new Error('Only teachers can create exams');
      }

      console.log('Creating exam with data:', formData);
      
      const response = await fetch(`${API_BASE_URL}/api/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Exam creation response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create exam');
      }
      // Show success message
      //when i imedditly go to some pages they are not vibale the page becuase they will destoye the page thats why
      toast.success('Exam created successfully!');
      setTimeout(() => {
        window.location.href = '/teacher';
      }, 1000); // wait 1.5 seconds before navigating

      
      // Force a hard navigation to ensure the dashboard refreshes
      // window.location.href = '/teacher';
    } catch (err) {
      console.error('Error creating exam:', err);
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Failed to create exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <DocumentIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 mb-6">
            Create a new exam by filling out the form below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter exam title"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter subject"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter duration"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter exam description"
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Questions</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors duration-200"
                >
                  + Add Question
                </button>
              </div>

              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="p-6 border border-gray-200 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question {qIndex + 1}
                    </label>
                    <input
                      type="text"
                      name="text"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(e, qIndex)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctOption === oIndex}
                          onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          required
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/teacher')}
                className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 