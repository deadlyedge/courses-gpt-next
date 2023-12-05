import { redirect } from "next/navigation"
import { InfoIcon } from "lucide-react"

import CreateCourseForm from "@/components/CreateCourseForm"
import { getAuthSession } from "@/lib/auth"

const CreatePage = async () => {
  const session = await getAuthSession()

  if (!session) return redirect("/gallery")

  return (
    <div className='flex flex-col items-start max-w-xl px-8 mx-auto my-16 sm:px-0'>
      <h1 className='self-center text-2xl font-bold text-center sm:text-5xl'>
        创建课程
      </h1>
      <div className='flex p-4 mt-5 border-none bg-secondary'>
        <InfoIcon className='w-12 h-12 mr-3 text-blue-400' />
        <div>
          请输入一个课程的标题，或者你想开始学习的一个主题，然后添加一些特定的学习单元。我们的AI将会为您生成课程。
        </div>
      </div>

      <CreateCourseForm />
    </div>
  )
}

export default CreatePage
