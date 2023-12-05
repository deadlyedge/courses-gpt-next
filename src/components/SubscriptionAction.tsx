"use client"

import axios from "axios"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Zap } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

type Props = {}

const SubscriptionAction = (props: Props) => {
  const { data } = useSession()
  const [loading, setLoading] = useState(false)
  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await axios.get("/api/stripe")
      window.location.href = response.data.url
    } catch (error) {
      console.log("error", error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='flex flex-col items-center w-1/2 p-4 mx-auto mt-4 rounded-md bg-secondary'>
      {data?.user.credits} / 10 Free Generations
      <Progress
        className='mt-2'
        value={data?.user.credits ? (data.user.credits / 10) * 100 : 0}
      />
      <Button
        disabled={loading}
        onClick={handleSubscribe}
        className='mt-3 font-bold text-white transition bg-gradient-to-tr from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600'>
        Upgrade
        <Zap className='fill-white ml-2' />
      </Button>
    </div>
  )
}

export default SubscriptionAction