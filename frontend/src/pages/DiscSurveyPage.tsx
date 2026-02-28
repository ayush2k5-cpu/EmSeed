import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { surveyQuestions } from '../data/mockData'

export default function DiscSurveyPage() {
    const navigate = useNavigate()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)

    const handleOptionClick = (index: number) => {
        setSelectedOption(index)

        setTimeout(() => {
            setSelectedOption(null)
            if (currentQuestion < surveyQuestions.length - 1) {
                setCurrentQuestion(prev => prev + 1)
            } else {
                navigate('/profile')
            }
        }, 300)
    }

    const question = surveyQuestions[currentQuestion]
    const progressPercent = ((currentQuestion + 1) / 7) * 100

    return (
        <div className="bg-lemon min-h-screen w-full relative selection:bg-violet selection:text-lemon">
            {/* Background element */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-ember/10 rounded-full blur-3xl pointer-events-none" />
            {/* Progress Bar */}
            <div className="w-full">
                <div className="w-full h-[3px] bg-violet/20">
                    <div
                        className="h-full bg-violet transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <p className="text-right text-[12px] font-sans text-violet pr-4 pt-2">
                    Step {currentQuestion + 1} of 7
                </p>
            </div>

            {/* Centre Card */}
            <div className="max-w-[640px] mx-auto mt-20 md:mt-32 rounded-[32px] bg-violet p-10 md:p-16 shadow-2xl shadow-void/10 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-lemon/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                <h2 className="font-serif text-[28px] md:text-[36px] text-lemon text-center mb-12 relative z-10 leading-tight">
                    {question.q}
                </h2>

                <div className="flex flex-col gap-3">
                    {question.options.map((option, idx) => {
                        const isSelected = selectedOption === idx

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(idx)}
                                className={`
                  w-full py-5 px-6 rounded-[16px] font-sans text-[16px] md:text-[18px] text-left transition-all duration-300 transform
                  ${isSelected
                                        ? 'bg-lemon text-violet font-semibold scale-[1.02] shadow-xl shadow-void/20 border border-transparent'
                                        : 'bg-transparent border border-lemon/30 text-lemon/90 hover:border-lemon hover:bg-lemon/10 hover:-translate-y-1'
                                    }
                `}
                            >
                                {option}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
