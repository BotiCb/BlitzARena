import React from "react"
import BigCountdownTimer from "~/atoms/BigCountdownTimer"
import NeonText from "~/atoms/NeonText"

export const AreaWarningCountDown = ({ endsAt }: { endsAt: number }) => {
    return (
        <>
            <NeonText>
                Return to game Area!
            </NeonText>
            <BigCountdownTimer endsAt={endsAt}/>
        </>
    )
}