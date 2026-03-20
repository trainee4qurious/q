"use client"

import { Question } from "@/types/form-submission"
import { FormInput } from "./FormInput"
import { FormTextarea } from "./FormTextarea"
import { Dropdown } from "./Dropdown"
import { CheckboxGroup } from "./CheckboxGroup"
import { RadioGroup } from "./RadioGroup"
import { FileUploader } from "./FileUploader"

interface DynamicQuestionProps {
    question: Question
    hideLabel?: boolean
    hideDescription?: boolean
}

export function DynamicQuestion({ question, hideLabel, hideDescription }: DynamicQuestionProps) {
    const name = String(question.id)
    const imageUrl = question.imageUrl

    const renderImage = () => {
        if (!imageUrl) return null
        return (
            <div className="mb-4 rounded-lg overflow-hidden border border-border">
                <img
                    src={imageUrl}
                    alt={question.question}
                    className="w-full h-auto object-cover max-h-[300px]"
                />
            </div>
        )
    }

    const questionContent = () => {
        switch (question.questiontype) {
            case 'text':
            case 'input':
            case 'email':
            case 'mail':
            case 'number':
            case 'phone':
                let type = "text"
                if (question.questiontype === 'email' || question.questiontype === 'mail') type = "email"
                if (question.questiontype === 'number') type = "number"
                if (question.questiontype === 'phone') type = "tel"

                return (
                    <FormInput
                        name={name}
                        type={type}
                        label={!hideLabel ? question.question : ""}
                        description={!hideDescription ? question.description : ""}
                        placeholder={question.placeholder}
                        required={question.required}
                        minLength={question.minlength}
                        maxLength={question.maxlength}
                    />
                )
            case 'file':
                return (
                    <FileUploader
                        name={name}
                        label={!hideLabel ? question.question : ""}
                        description={!hideDescription ? question.description : ""}
                        required={question.required}
                    />
                )
            case 'textarea':
                return (
                    <FormTextarea
                        name={name}
                        label={!hideLabel ? question.question : ""}
                        description={!hideDescription ? question.description : ""}
                        placeholder={question.placeholder}
                        required={question.required}
                        minLength={question.minlength}
                        maxLength={question.maxlength}
                    />
                )
            case 'dropdown':
            case 'select':
                return (
                    <Dropdown
                        name={name}
                        label={!hideLabel ? question.question : ""}
                        description={!hideDescription ? question.description : ""}
                        options={question.options || []}
                        placeholder={question.placeholder}
                    />
                )
            case 'checkbox':
            case 'multi':
                return (
                    <CheckboxGroup
                        name={name}
                        label={!hideLabel ? question.question : ""}
                        description={!hideDescription ? question.description : ""}
                        options={question.options || []}
                    />
                )
            case 'radio':
            case 'choice':
                return (
                    <RadioGroup
                        name={name}
                        label={!hideLabel ? question.question : ""}
                        description={!hideDescription ? question.description : ""}
                        options={question.options || []}
                    />
                )
            default:
                console.warn('Unknown question type:', question.questiontype, question)
                return null
        }
    }

    return (
        <div className="space-y-4">
            {renderImage()}
            {questionContent()}
        </div>
    )
}
