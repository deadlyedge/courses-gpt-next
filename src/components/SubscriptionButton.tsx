"use client"

import { useState } from "react"
import axios from "axios"

import { Button } from "@/components/ui/button"

type Props = { isPro: boolean }

const SubscriptionButton = ({ isPro }: Props) => {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await axios.get("/api/stripe")
      window.location.href = response.data.url
    } catch (error) {
      console.log("billing error")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button className='mt-4' disabled={loading} onClick={handleSubscribe}>
      {isPro ? "Manage Subscriptions" : "Upgrade"}
    </Button>
  )
}

export default SubscriptionButton
