import Link from "next/link"

import { getAuthSession } from "@/lib/auth"
import SigninButton from "@/components/SigninButton"
import UserAccountNav from "@/components/UserAccountNav"

type Props = {}

const Navbar = async (props: Props) => {
  const session = await getAuthSession()
  console.log(session)

  return (
    <nav className='fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-10 h-fit border-b border-zinc-300 py-2'>
      <div className='flex items-center justify-center h-full gap-2 px-8 mx-auto sm:justify-between max-w-7xl'>
        <Link href='/gallery' className='items-center hidden gap-2 sm:flex'>
          <p className='rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white'>
            CoursesGPT
          </p>
        </Link>
        <div className='flex items-center'>
          <Link href='/gallery' className='mr-3'>
            课程库
          </Link>
          {session?.user && (
            <>
              <Link href='/create' className='mr-3'>
                创建课程
              </Link>
              <Link href='/settings' className='mr-3'>
                设置
              </Link>
            </>
          )}
          <div className='flex items-center'>
            {session?.user ? (
              <UserAccountNav user={session.user} />
            ) : (
              <SigninButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
