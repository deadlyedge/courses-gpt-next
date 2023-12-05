import { redirect } from "next/navigation"
import { Info } from "lucide-react"

import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import ConfirmChapters from "@/components/ConfirmChapters"

type Props = {
  params: {
    courseId: string
  }
}

const CreateChaptersPage = async ({ params: { courseId } }: Props) => {
  const session = await getAuthSession()
  if (!session?.user) return redirect("/gallery")

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      units: {
        include: {
          chapters: true,
        },
      },
    },
  })

  if (!course) return redirect("/create")

  return (
    <div className='flex flex-col items-start max-w-xl mx-auto my-16'>
      <h5 className='text-sm uppercase text-seconday-foreground/60'>
        课程名称
      </h5>
      <h1 className='text-5xl font-bold'>{course.name}</h1>

      <div className='flex p-4 mt-5 border-none bg-secondary'>
        <Info className='w-12 h-12 mr-3 text-blue-400' />
        <div>
          我们为您的每个单元生成了章节。看看它们，然后单击按钮确认并继续
        </div>
      </div>
      <ConfirmChapters course={course} />
    </div>
  )
}

export default CreateChaptersPage
