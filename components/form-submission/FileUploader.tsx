"use client"

import { useFormContext } from "react-hook-form"
import { motion } from "framer-motion"
import { Upload, X, FileText } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { uploadFile } from "@/app/actions/upload-actions"
import { Loader2 } from "lucide-react"

interface FileUploaderProps {
    name: string
    label: string
    description?: string
    required?: boolean
}

export function FileUploader({ name, label, description, required }: FileUploaderProps) {
    const { setValue, watch, formState: { errors } } = useFormContext()
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const file = watch(name)
    const error = errors[name]

    const handleUpload = async (selectedFile: File) => {
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const result = await uploadFile(formData)
            if (result.success && result.url) {
                setValue(name, result.url, { shouldValidate: true })
            } else {
                console.error('Upload failed:', result.error)
            }
        } catch (err) {
            console.error('Upload error:', err)
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            handleUpload(selectedFile)
        }
    }

    const removeFile = () => {
        setValue(name, null, { shouldValidate: true })
    }

    return (
        <div className="space-y-4 w-full">
            <label className="text-sm font-semibold text-slate-700 block ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
                <p className="text-xs text-slate-500 ml-1 -mt-1 mb-2">
                    {description}
                </p>
            )}

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const droppedFile = e.dataTransfer.files?.[0]
                    if (droppedFile) handleUpload(droppedFile)
                }}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center",
                    isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-white hover:border-slate-300",
                    file ? "border-green-500 bg-green-50/20" : "",
                    isUploading ? "opacity-50 pointer-events-none" : ""
                )}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                        <p className="text-sm font-medium text-slate-900">Uploading file...</p>
                    </div>
                ) : file ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-3">
                            <FileText className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                            {file.split('/').pop()}
                        </p>
                        <button
                            type="button"
                            onClick={removeFile}
                            className="mt-3 text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Remove File
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                            <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            PDF, PNG, JPG up to 10MB
                        </p>
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                    </>
                )}
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    role="alert"
                    className="text-xs font-medium text-red-500 mt-2 ml-1"
                >
                    {error.message as string}
                </motion.p>
            )}
        </div>
    )
}
