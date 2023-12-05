import Image from "next/image"
import Link from "next/link"
import { Chapter, Course, Unit } from "@prisma/client"

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[]
    })[]
  }
}

const GalleryCourseCard = async ({ course }: Props) => {
  course.image =
    "https://pixabay.com/get/g174f2690bf88230a2f74406929c3f30babc78220ad96c3600a2cf44972e3416bce87da95fb41c33d88c012d666a0d8fdd3e07550217fc68a5578b4ab6aba1a21_640.jpg"

  return (
    <>
      <div className='border rounded-lg border-secondary'>
        <div className='relative'>
          <Link
            href={`/course/${course.id}/0/0`}
            className='relative block w-fit'>
            <Image
              src={course.image || ""}
              className='object-cover w-full max-h-[300px] rounded-t-lg'
              width={300}
              height={300}
              alt='picture of the course'
            />
            <span className='absolute px-2 py-1 text-white rounded-md bg-black/60 w-fit bottom-2 left-2 right-2'>
              {course.name}
            </span>
          </Link>
        </div>

        <div className='p-4'>
          <h4 className='text-sm text-secondary-foreground/60'>Units</h4>
          <div className='space-y-1'>
            {course.units.map((unit, unitIndex) => {
              return (
                <Link
                  href={`/course/${course.id}/${unitIndex}/0`}
                  key={unit.id}
                  className='block underline w-fit'>
                  {unit.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default GalleryCourseCard
