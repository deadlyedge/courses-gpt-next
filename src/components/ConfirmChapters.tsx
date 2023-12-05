"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Chapter, Course, Unit } from "@prisma/client"

import ChapterCard, { ChapterCardHandler } from "@/components/ChapterCard"
import { Separator } from "@/components/ui/separator"
import { Button, buttonVariants } from "@/components/ui/button"

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[]
    })[]
  }
}

const ConfirmChapters = ({ course }: Props) => {
  const [loading, setLoading] = useState(false)
  const chapterRefs: Record<string, React.RefObject<ChapterCardHandler>> = {}
  course.units.forEach((unit) => {
    unit.chapters.forEach((chapter) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      chapterRefs[chapter.id] = useRef(null)
    })
  })
  const [completedChapters, setCompletedChapters] = useState<Set<String>>(
    new Set()
  )
  const totalChaptersCount = useMemo(() => {
    return course.units.reduce((acc, unit) => {
      return acc + unit.chapters.length
    }, 0)
  }, [course.units])
  console.log(totalChaptersCount, completedChapters.size)
  return (
    <div className='w-full mt-4'>
      {course.units.map((unit, unitIndex) => {
        return (
          <div key={unit.id} className='mt-5'>
            <h2 className='text-sm uppercase text-secondary-foreground/60'>
               第{unitIndex + 1}单元
            </h2>
            <h3 className='text-2xl font-bold'>{unit.name}</h3>
            <div className='mt-3'>
              {unit.chapters.map((chapter, chapterIndex) => {
                return (
                  <ChapterCard
                    completedChapters={completedChapters}
                    setCompletedChapters={setCompletedChapters}
                    ref={chapterRefs[chapter.id]}
                    key={chapter.id}
                    chapter={chapter}
                    chapterIndex={chapterIndex}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
      <div className='flex items-center justify-center mt-4'>
        <Separator className='flex-[1]' />
        <div className='flex items-center mx-4'>
          <Link
            href='/create'
            className={buttonVariants({
              variant: "secondary",
            })}>
            <ChevronLeft className='w-4 h-4 mr-2' strokeWidth={4} />
            返回
          </Link>
          {totalChaptersCount === completedChapters.size ? (
            <Link
              className={buttonVariants({
                className: "ml-4 font-semibold",
              })}
              href={`/course/${course.id}/0/0`}>
              保存并继续
              <ChevronRight className='w-4 h-4 ml-2' />
            </Link>
          ) : (
            <Button
              type='button'
              className='ml-4 font-semibold'
              disabled={loading}
              onClick={() => {
                setLoading(true)
                Object.values(chapterRefs).forEach((ref) => {
                  ref.current?.triggerLoad()
                })
              }}>
              生成
              <ChevronRight className='w-4 h-4 ml-2' strokeWidth={4} />
            </Button>
          )}
        </div>
        <Separator className='flex-[1]' />
      </div>
    </div>
  )
}

export default ConfirmChapters
