"use client"

import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"

type Props = {}

const SigninButton = (props: Props) => {
  return (
    <Button
      variant='ghost'
      onClick={() => {
        signIn("google")
      }}>
      登入
    </Button>
  )
}

export default SigninButton
